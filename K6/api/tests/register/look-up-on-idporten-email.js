import { check, group, fail } from "k6";
import { PlatformTokenGenerator } from "../../../common-imports.js";
import { RegisterLookupClient } from "../../../clients/authentication/index.js";
import { LookupPartiesInRegister } from "../../building-blocks/register/index.js";
import { getOptions } from "../../../helpers.js";

const label = "test-lookup-on-idporten-email";

export const options = getOptions([label]);

function isNonEmptyString(v) {
    return typeof v === "string" && v.length > 0;
}

function isNumber(v) {
    return typeof v === "number" && Number.isFinite(v);
}

function isUuid(v) {
    return (
        typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
    );
}

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

                const data = body.data;
                const okShape = check(data, {
                    "Register lookup response has data array with 1 item": (d) =>
                        Array.isArray(d) && d.length === 1,
                });
                if (!okShape) {
                    console.log(response.body);
                }

                const party = data[0];
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
                    "partyUuid is a UUID": (p) => isUuid(p.partyUuid),
                    "urn is non-empty and contains partyUuid": (p) =>
                        isUuid(p.partyUuid) &&
            isNonEmptyString(p.urn) &&
            p.urn.includes(p.partyUuid),
                    "partyId is a number": (p) => isNumber(p.partyId),
                    "versionId is a number": (p) => isNumber(p.versionId),
                    "createdAt is a date string": (p) => isDateString(p.createdAt),
                    "modifiedAt is a date string": (p) => isDateString(p.modifiedAt),
                });

                const okUserTypes = check(user, {
                    "user.userId is a number": (u) => isNumber(u?.userId),
                    "user.userIds is array of numbers and contains userId": (u) =>
                        isNumber(u?.userId) &&
            Array.isArray(u?.userIds) &&
            u.userIds.every(isNumber) &&
            u.userIds.includes(u.userId),
                });

                if (!okHard || !userFound || !okTypes || !okUserTypes) {
                    console.log(response.body);
                }
            },
        );
    });
}
