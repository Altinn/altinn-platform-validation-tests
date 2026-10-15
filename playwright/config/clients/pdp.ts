import { getPersonalToken } from "./token-generator";

/**
 * Portert fra K6/clients/authorization/builders.js og
 * K6/api/tests/authorization/pdp-authorize/common-functions.js. Bygger det
 * samme XACML JSON-spørsmålet mot Policy Decision Point-et: "får denne
 * personen gjøre denne handlingen på denne ressursen, for denne virksomheten".
 */

type XacmlAttribute = {
    attributeId: string;
    value: string;
    dataType: string;
    includeInResult: boolean;
};

type XacmlCategory = {
    attribute: XacmlAttribute[];
};

export type Decision = "Permit" | "Deny" | "NotApplicable" | "Indeterminate";

function attribute(attributeId: string, value: string): XacmlAttribute {
    return {
        attributeId,
        value,
        dataType: "http://www.w3.org/2001/XMLSchema#string",
        includeInResult: false,
    };
}

function category(attributes: XacmlAttribute[]): XacmlCategory {
    return { attribute: attributes };
}

function buildAuthorizeRequest(action: string, subjectAttributes: XacmlAttribute[], resourceAttributes: XacmlAttribute[]) {
    return {
        request: {
            returnPolicyIdList: false,
            combinedDecision: false,
            xPathVersion: null,
            category: [],
            resource: [category(resourceAttributes)],
            action: [category([attribute("urn:oasis:names:tc:xacml:1.0:action:action-id", action)])],
            accessSubject: [category(subjectAttributes)],
            recipientSubject: [],
            intermediarySubject: [],
            requestingMachine: [],
            multiRequests: null,
        },
    };
}

/**
 * Spørsmålet "får denne personen gjøre denne handlingen på denne ressursen, på
 * vegne av denne virksomheten". Dette er spørsmålet person B blir spurt om i
 * Brukermønster test-H: ikke om personen har tilgang til ressursen for seg
 * selv (det ville truffet PRIV-rollen i brukermonster-test-app sin policy og
 * alltid svart Permit, uavhengig av delegeringen testen gjør), men om
 * personen har fått tilgang via virksomheten.
 *
 * Portert fra K6/api/tests/authorization/pdp-authorize/common-functions.js
 * sin `buildDaglRequest`.
 */
export function buildOrgRequest(pid: string, orgNo: string, resourceId: string, action: string) {
    return buildAuthorizeRequest(
        action,
        [attribute("urn:altinn:person:identifier-no", pid)],
        [
            attribute("urn:altinn:resource", resourceId),
            attribute("urn:altinn:organization:identifier-no", orgNo),
        ],
    );
}

/**
 * Spørrer PDP-et direkte, som k6-testene gjør: ett token på
 * altinn:authorization/authorize.admin-scopet, som gjør at svaret handler om
 * subjektet i requesten og ikke om hvem tokenet tilhører. Krever
 * AUTHORIZATION_SUBSCRIPTION_KEY siden /authorization/api/v1 ligger bak API
 * management og svarer 401 uten den.
 *
 * @param platformUrl `urler.platform` fra miljøets project i playwright.config.ts.
 * @param miljo Miljønavnet testverktøyets token-generator skal utstede tokenet for, f.eks. "at23".
 */
export async function authorize(platformUrl: string, miljo: string, pid: string, orgNo: string, resourceId: string, action: string): Promise<Decision> {
    const token = await getPersonalToken({
        env: miljo,
        scopes: "altinn:authorization/authorize.admin",
    });

    const subscriptionKey = process.env.AUTHORIZATION_SUBSCRIPTION_KEY;

    const response = await fetch(`${platformUrl}/authorization/api/v1/authorize`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(subscriptionKey ? { "Ocp-Apim-Subscription-Key": subscriptionKey } : {}),
        },
        body: JSON.stringify(buildOrgRequest(pid, orgNo, resourceId, action)),
    });

    if (!response.ok) {
        throw new Error(`PDP-kallet feilet: ${response.status} ${await response.text()}`);
    }

    const body = await response.json() as { response?: { decision?: string }[] };
    const decision = body.response?.[0]?.decision;

    if (!decision) {
        throw new Error(`PDP-svaret manglet en decision: ${JSON.stringify(body)}`);
    }

    return decision as Decision;
}
