import { ResourceOwnerClient } from "../../../clients/resource-registry/index.js";
import { lazy, requireEnv } from "../../../helpers.js";
import { ResourceOwnerGetOrgs } from "../../building-blocks/resource-registry/resource-owner/index.js";
import { OrgListDomainChecks } from "../../domain-checks/resource-registry/org-list.js";

// The registry reads the org list from Altinn's CDN, so the same list is served
// in every environment. These three are picked because they are the ones we
// depend on elsewhere: ttd owns the resources our tests create, and digdir and
// skd are real service owners with stable organization numbers.
const EXPECTED_ORG_CODES = ["ttd", "digdir", "skd"];

const EXPECTED_ORG_NUMBERS = {
    digdir: "991825827",
    skd: "974761076",
};

/**
 * The endpoint is public, so the client is built without a token generator.
 * Built once per VU, on the first iteration that asks for it.
 *
 * @returns {ResourceOwnerClient} The client.
 */
const getResourceOwnerClient = lazy(function () {
    return new ResourceOwnerClient(__ENV.BASE_URL);
});

export function setup() {
    requireEnv(["BASE_URL"]);
    return;
}

/**
 * Test: the registry hands out the org list it reads from the CDN.
 *
 * The endpoint is public, so the client is built without a token generator and
 * the test can run as a healthcheck all the way to prod. Since the content comes
 * from the CDN, this checks the forwarding as much as the content: a registry
 * that cannot reach the CDN, or that hands on a truncated list, fails here.
 */
export default function () {
    const resourceOwnerClient = getResourceOwnerClient();

    const orgList = ResourceOwnerGetOrgs(resourceOwnerClient);

    OrgListDomainChecks.CheckOrgsPresent(orgList, EXPECTED_ORG_CODES, "ResourceOwnerGetOrgs");
    OrgListDomainChecks.CheckOrgsNamedInAllLanguages(orgList, "ResourceOwnerGetOrgs");
    OrgListDomainChecks.CheckOrgNumbers(orgList, EXPECTED_ORG_NUMBERS, "ResourceOwnerGetOrgs");
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../common-imports.js";
