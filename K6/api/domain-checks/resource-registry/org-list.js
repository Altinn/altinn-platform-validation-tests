import { check } from "k6";

import { OrgList } from "../../../clients/resource-registry/types.js";

/**
 * The org list is keyed by org code, so an org that is expected to be there is
 * checked by looking up its key. A missing key means the registry handed us a
 * list that is not the one the CDN publishes.
 *
 * @param {OrgList|null} orgList - The org list returned by the API.
 * @param {Array<string>} expectedOrgCodes - Org codes the list has to contain.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every expected org code is present, false otherwise.
 */
function CheckOrgsPresent(orgList, expectedOrgCodes, operation) {
    const orgs = orgList?.orgs ?? {};
    const missing = expectedOrgCodes.filter((orgCode) => orgs[orgCode] === undefined);

    const success = check(orgList, {
        [`CheckOrgsPresent - ${operation} returns every expected org code`]: () =>
            missing.length === 0,
    });

    if (!success) {
        console.error(`CheckOrgsPresent - org codes missing from ${operation}: ${JSON.stringify(missing)}`);
        console.error(`CheckOrgsPresent - org codes returned: ${JSON.stringify(Object.keys(orgs))}`);
    }

    return success;
}

/**
 * Every org in the list carries a name in all three languages. Logo, homepage,
 * organization number and environments are all optional and missing for a good
 * share of the orgs, so the name is the only field worth holding the whole list
 * to.
 *
 * @param {OrgList|null} orgList - The org list returned by the API.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every org is named in nb, nn and en, false otherwise.
 */
function CheckOrgsNamedInAllLanguages(orgList, operation) {
    const orgs = orgList?.orgs ?? {};
    const unnamed = Object.entries(orgs)
        .filter(([, org]) => !["nb", "nn", "en"].every((language) => org?.name?.[language]))
        .map(([orgCode]) => orgCode);

    const success = check(orgList, {
        [`CheckOrgsNamedInAllLanguages - Every org from ${operation} is named in nb, nn and en`]: () =>
            Object.keys(orgs).length > 0 && unnamed.length === 0,
    });

    if (!success) {
        console.error(`CheckOrgsNamedInAllLanguages - orgs from ${operation} missing a name: ${JSON.stringify(unnamed)}`);
    }

    return success;
}

/**
 * The registry reads the list from the CDN and passes it on, so checking a
 * couple of organization numbers against what the CDN publishes is what tells us
 * the forwarding is intact and not just that it answered.
 *
 * @param {OrgList|null} orgList - The org list returned by the API.
 * @param {{[orgCode: string]: string}} expectedOrgNumbers - Org code to organization number.
 * @param {string} operation - Name of the operation, used in the check name and logs.
 * @returns {boolean} True if every organization number matches, false otherwise.
 */
function CheckOrgNumbers(orgList, expectedOrgNumbers, operation) {
    const orgs = orgList?.orgs ?? {};
    const wrong = Object.entries(expectedOrgNumbers)
        .filter(([orgCode, orgNumber]) => orgs[orgCode]?.orgnr !== orgNumber)
        .map(([orgCode, orgNumber]) => `${orgCode}: expected ${orgNumber}, got ${orgs[orgCode]?.orgnr}`);

    const success = check(orgList, {
        [`CheckOrgNumbers - ${operation} reports the expected organization numbers`]: () =>
            wrong.length === 0,
    });

    if (!success) {
        console.error(`CheckOrgNumbers - organization numbers from ${operation} that did not match: ${JSON.stringify(wrong)}`);
    }

    return success;
}

export const OrgListDomainChecks = {
    CheckOrgsPresent,
    CheckOrgsNamedInAllLanguages,
    CheckOrgNumbers,
};
