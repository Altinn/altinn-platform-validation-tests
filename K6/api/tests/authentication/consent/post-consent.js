import { fail, group } from "k6";

import { ApproveConsentContextBuilder } from "../../../../clients/access-management-bff/consent/index.js";
import { randomItem, uuidv4 } from "../../../../common-imports.js";
import { getOptions, requireEnv } from "../../../../helpers.js";
import { EnterpriseCreateConsentRequest, EnterpriseGetConsentRequest } from "../../../building-blocks/access-management/consent-enterprise/index.js";
import { LookupConsent } from "../../../building-blocks/access-management/resource-owner/maskinporten/index.js";
import { ApproveConsentRequest, GetConsentLog } from "../../../building-blocks/access-management-bff/consent/index.js";
import { ConsentDomainChecks } from "../../../domain-checks/access-management/consent.js";
import {
    CONSENT_RESOURCE,
    createConsentLookupRequest,
    createConsentRequest,
    getClients,
    getConsenteeOrgs,
    getConsenteeTokenOpts,
    getConsenterPersons,
    getConsenterTokenOpts,
    getLookupClient,
    organizationUrn,
    personUrn,
} from "./commons.js";

// Labels for the steps of the consent lifecycle, so each one gets its own numbers
// in the summary.
const requestConsentLabel = { step: "Request Consent" };
const approveConsentLabel = { step: "Approve Consent" };
const getConsentRequestLabel = { step: "Get Consent Request" };
const getConsentLogLabel = { step: "Get Consent Log" };
const lookupConsentLabel = { step: "Lookup Consent" };

export const options = getOptions([
    requestConsentLabel,
    approveConsentLabel,
    getConsentRequestLabel,
    getConsentLogLabel,
    lookupConsentLabel,
]);

export function setup() {
    requireEnv(["ENVIRONMENT", "AM_UI_BASE_URL", "BASE_URL"]);

    const env = __ENV.ENVIRONMENT;

    return {
        orgs: getConsenteeOrgs(env),
        persons: getConsenterPersons(env),
    };
}

/**
 * Test: the consent lifecycle, from an organization asking for a consent to
 * Maskinporten looking the granted consent up.
 *
 * The organization and the person are drawn per iteration, so the consents spread
 * across the whole test data set rather than piling up on one pair.
 *
 * @param {{orgs: object[], persons: object[]}} data Consentee organizations and consenter persons.
 */
export default function (data) {
    const [clients, consenteeTokenGenerator, consenterTokenGenerator] = getClients();
    const lookupClient = getLookupClient();

    const org = randomItem(data.orgs);
    const person = randomItem(data.persons);

    consenteeTokenGenerator.setTokenGeneratorOptions(getConsenteeTokenOpts(org.orgNo));
    consenterTokenGenerator.setTokenGeneratorOptions(getConsenterTokenOpts(person.partyUuid));

    const consentId = uuidv4();
    const from = personUrn(person.ssn);
    const to = organizationUrn(org.orgNo);

    group("As an organization, I can ask a person for a consent and use it once it is granted", function () {
        let consentRequestId;

        group("Request the consent", function () {
            const consentRequest = createConsentRequest({ consentId, from, to });

            const createdRequest = EnterpriseCreateConsentRequest(
                clients.consentee.enterpriseClient,
                consentRequest,
                requestConsentLabel,
            );

            ConsentDomainChecks.CheckConsentRequestCreated(createdRequest, { id: consentId, from, to });
            ConsentDomainChecks.CheckConsentRights(createdRequest, [CONSENT_RESOURCE]);

            consentRequestId = createdRequest?.id;
        });

        group("Approve the consent as the person it was asked of", function () {
            if (!ConsentDomainChecks.CheckConsentRequestId(consentRequestId)) {
                fail("Cannot approve: creating the consent request returned no id");
            }

            const context = new ApproveConsentContextBuilder()
                .withLanguage("nb")
                .build();

            const approved = ApproveConsentRequest(
                clients.consenter.consentClient,
                consentRequestId,
                context,
                approveConsentLabel,
            );

            ConsentDomainChecks.CheckConsentApproved(approved);
        });

        group("The approved consent request is accepted", function () {
            if (!ConsentDomainChecks.CheckConsentRequestId(consentRequestId)) {
                fail("Cannot check the status: creating the consent request returned no id");
            }

            const consentRequest = EnterpriseGetConsentRequest(
                clients.consentee.enterpriseClient,
                consentRequestId,
                getConsentRequestLabel,
            );

            ConsentDomainChecks.CheckConsentRequestStatus(consentRequest, "Accepted");
        });

        group("The consent shows up in the log of the person who gave it", function () {
            const log = GetConsentLog(
                clients.consenter.consentClient,
                person.partyUuid,
                getConsentLogLabel,
            );

            ConsentDomainChecks.CheckConsentResponse(log, "GetConsentLog");
        });

        group("Maskinporten can look the granted consent up", function () {
            const lookupRequest = createConsentLookupRequest({ consentId, from, to });

            const consent = LookupConsent(lookupClient, lookupRequest, lookupConsentLabel);

            ConsentDomainChecks.CheckConsentResponse(consent, "LookupConsent");
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
