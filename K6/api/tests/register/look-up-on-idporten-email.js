import { check, group } from "k6";

import { RegisterClient } from "../../../clients/register/index.js";
import { PlatformTokenBuilder, PlatformTokenGenerator } from "../../../common-imports.js";
import { requireEnv } from "../../../helpers.js";
import { RegisterBuildingBlocks } from "../../building-blocks/register/index.js";

const label = { step: "test-lookup-on-idporten-email" };

function isDateString(v) {
    return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "REGISTER_SUBSCRIPTION_KEY"]);
    return;
}

export default function () {
    const tokenOpts = new PlatformTokenBuilder()
        .withEnvironment(__ENV.ENVIRONMENT)
        .withTtl(3600)
        .build();

    const token = new PlatformTokenGenerator(tokenOpts);
    const registerClient = new RegisterClient(
        __ENV.BASE_URL,
        token,
        __ENV.REGISTER_SUBSCRIPTION_KEY,
    );

    group("Register: Look up party by idporten email", () => {
        const email = "test@mailinator.com";
        const fields = ["party", "user"];

        const parties = RegisterBuildingBlocks.AccessManagementPartiesQuery(
            registerClient,
            [`urn:altinn:person:idporten-email:${email}`],
            fields,
            label,
        );

        group(
            "Register: Look up party by idporten email - verify response body",
            () => {
                const party = parties?.[0];
                if (!party) {
                    check(null, {
                        "Register lookup found a party for the email": () => false,
                    });
                    return;
                }

                const user = party.user;

                // Hard asserts (common across envs)
                const okHard = check(party, {
                    "partyType is self-identified-user": (p) =>
                        p.partyType === "self-identified-user",
                    "email matches request": (p) => p.email === email,
                    "externalUrn matches email URN": (p) =>
                        p.externalUrn === `urn:altinn:person:idporten-email:${email}`,
                    "displayName equals email": (p) => p.displayName === email,
                    "isDeleted is false": (p) => p.isDeleted === false,
                    "deletedAt is null": (p) => p.deletedAt === null,
                });

                const userFound = check(user, {
                    "user.username is epost:<email>": (u) =>
                        u?.username === `epost:${email}`,
                });

                const okTypes = check(party, {
                    "partyUuid is a string": (p) => typeof p.partyUuid === "string",
                    "urn looks like an Altinn party URN": (p) =>
                        typeof p.urn === "string" && p.urn.startsWith("urn:altinn:party:"),
                    "partyId is a number": (p) => typeof p.partyId === "number",
                    "versionId is a number": (p) => typeof p.versionId === "number",
                    "createdAt is a date string": (p) => isDateString(p.createdAt),
                    "modifiedAt is a date string": (p) => isDateString(p.modifiedAt),
                });

                const okUserTypes = check(user, {
                    "user is present": (u) => typeof u === "object" && u !== null,
                    "user.userId is a number": (u) => typeof u?.userId === "number",
                });

                if (!okHard || !userFound || !okTypes || !okUserTypes) {
                    console.log(JSON.stringify(party));
                }
            },
        );
    });
}
