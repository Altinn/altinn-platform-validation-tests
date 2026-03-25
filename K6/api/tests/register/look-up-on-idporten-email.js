import { check, group, fail } from "k6";
import { PlatformTokenGenerator } from "../../../common-imports.js";
import { RegisterLookupClient } from "../../../clients/authentication/index.js";
import { LookupPartiesInRegister } from "../../building-blocks/register/index.js";

const label = "test-lookup-on-idporten-email";

function isDateString(v) {
    return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

function tryParseJson(str) {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

export default function () {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);

    const token = new PlatformTokenGenerator(tokenOpts);
    const registerLookupClient = new RegisterLookupClient(__ENV.BASE_URL, token);

    group("Register: Look up party by idporten email", () => {
        const email = "test@mailinator.com";
        const fields = "party,user";

        const requestBody = {
            data: [`urn:altinn:person:idporten-email:${email}`],
        };

        const response = LookupPartiesInRegister(
            registerLookupClient,
            fields,
            requestBody,
            label,
        );

        group(
            "Register: Look up party by idporten email - verify response body",
            () => {
                const body = tryParseJson(response.body);
                if (body === null) {
                    fail("Register lookup response is not valid JSON");
                }

                const party = body?.data?.[0];
                if (!party) {
                    check(null, {
                        "Register lookup response contains a party in data[0]": () => false,
                    });
                    console.log(response.body);
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
                    console.log(response.body);
                }
            },
        );
    });
}
