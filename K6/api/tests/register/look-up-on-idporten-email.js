import { check, group } from "k6";

import { PartyUrnQueryBuilder } from "../../../clients/register/index.js";
import { requireEnv } from "../../../helpers.js";
import { RegisterBuildingBlocks } from "../../building-blocks/register/index.js";
import { getLookupClient } from "./commons.js";

const label = { step: "test-lookup-on-idporten-email" };

function isDateString(v) {
    return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

export function setup() {
    requireEnv(["BASE_URL", "ENVIRONMENT", "REGISTER_SUBSCRIPTION_KEY"]);
    return;
}

export default function () {
    const registerClient = getLookupClient();

    group("Register: Look up party by idporten email", () => {
        const email = "test@mailinator.com";
        const fields = ["party", "user"];

        const parties = RegisterBuildingBlocks.AccessManagementPartiesQuery(
            registerClient,
            new PartyUrnQueryBuilder().withIdportenEmail(email).build(),
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

                // The username is not asserted here. It comes from the A2 profile,
                // so an email user created in A3 has none, and look-up-on-username.js
                // covers usernames against a legacy self-identified user anyway.
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

                if (!okHard || !okTypes || !okUserTypes) {
                    console.log(JSON.stringify(party));
                }
            },
        );
    });
}
