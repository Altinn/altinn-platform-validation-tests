import { group, check, fail } from "k6";
import { EnterpriseTokenGenerator, PlatformTokenGenerator } from "../../../../common-imports.js";
import { AuthorizedPartiesClient, RegisterApiClient, RegisterLookupClient } from "../../../../clients/authentication/index.js";
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { SubmitErData } from "../../../building-blocks/register/index.js";
import { retry } from "../../../../helpers.js";

for (const key of ["ENVIRONMENT", "BASE_URL", "SOAP_ER_USERNAME", "SOAP_ER_PASSWORD"]) {
    if (!__ENV[key]) throw new Error(`Missing required env var: ${key}`);
}

export function buildErSoapEnvelope(batchXml) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
    <soapenv:Header/>
    <soapenv:Body>
        <ns:SubmitERDataBasic>
        <ns:systemUserName>${__ENV.SOAP_ER_USERNAME}</ns:systemUserName>
        <ns:systemPassword>${__ENV.SOAP_ER_PASSWORD}</ns:systemPassword>
            <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        ${batchXml}]]></ns:ERData>
        </ns:SubmitERDataBasic>
    </soapenv:Body>
</soapenv:Envelope>`;
}

export function createAuthorizedPartiesClient() {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);
    tokenOpts.set("scopes", "altinn:accessmanagement/authorizedparties.resourceowner");
    return new AuthorizedPartiesClient(__ENV.BASE_URL, new EnterpriseTokenGenerator(tokenOpts));
}

export function retryUntilHasAccess(apClient, fnr, orgNr, scenario) {
    let result = null;
    retry(
        () => {
            const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
            if (!Array.isArray(parties)) return false;
            const hasAccess = parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
            if (hasAccess) result = parties;
            return hasAccess;
        },
        { retries: 15, intervalSeconds: 20, testscenario: scenario },
    );
    return result;
}

export function retryUntilNoAccess(apClient, fnr, orgNr, scenario) {
    let result = null;
    retry(
        () => {
            const parties = GetAuthorizedParties(apClient, "urn:altinn:person:identifier-no", fnr, { includeAltinn2: false, includePartiesViaKeyRoles: true });
            if (!Array.isArray(parties)) return false;
            const noAccess = !parties.some((p) => p.organizationNumber === orgNr || p.orgNumber === orgNr);
            if (noAccess) result = parties;
            return noAccess;
        },
        { retries: 15, intervalSeconds: 20, testscenario: scenario },
    );
    return result;
}

function pollOrganization(lookupClient, orgNr) {
    const res = lookupClient.LookupParties("party,person,org,user,si,sysuser", { data: [`urn:altinn:organization:identifier-no:${orgNr}`] });
    if (res.status !== 200) return null;
    const body = JSON.parse(res.body);
    return body.data[0] || null;
}

export function runErSyncTestcase(scenarioName, prepXml, changeXml, orgNr, verifyChecks = {}, { stopAfterPrep = false } = {}) {
    const tokenOpts = new Map();
    tokenOpts.set("env", __ENV.ENVIRONMENT);
    tokenOpts.set("ttl", 3600);

    const apiClient = new RegisterApiClient(__ENV.BASE_URL, null);
    const lookupClient = new RegisterLookupClient(__ENV.BASE_URL, new PlatformTokenGenerator(tokenOpts));

    group(scenarioName, () => {
        group("Prep - submit organization to ER", () => {
            const res = SubmitErData(apiClient, prepXml, "Prep");
            if (res.status !== 200) fail(`[${scenarioName}] Prep failed with status ${res.status} — aborting test`);
        });

        group("Prep - verify organization is visible in Register", () => {
            let prepParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party) return false;
                    prepParty = party;
                    return true;
                },
                { retries: 15, intervalSeconds: 20, testscenario: `${scenarioName} - prep` },
            );
            if (prepParty) {
                check(prepParty, { "Prep - org is visible in Register": (p) => p.organizationIdentifier === orgNr });
            }
        });

        if (stopAfterPrep || __ENV.STOP_AFTER_PREP === "true") return;

        group("Change - submit ER update", () => {
            SubmitErData(apiClient, changeXml, "Change");
        });

        group("Verify - Register reflects change", () => {
            let verifiedParty = null;
            retry(
                () => {
                    const party = pollOrganization(lookupClient, orgNr);
                    if (!party || !Object.values(verifyChecks).every((fn) => fn(party))) return false;
                    verifiedParty = party;
                    return true;
                },
                { retries: 15, intervalSeconds: 20, testscenario: `${scenarioName} - verify` },
            );
            if (verifiedParty) {
                check(verifiedParty, verifyChecks);
            }
        });

    });
}
