import { fail, group } from "k6";

import { Right } from "../../../../clients/authentication/types.js";
import { uuidv4 } from "../../../../common-imports.js";
import { getItemFromList } from "../../../../helpers.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-imports.js";
import { PaginationDomainChecks } from "../../../domain-checks/common/pagination.js";
import { arrangeApprovedSystemUser, cleanupArranged, getClients, getVendorTokenOpts, pickVendor, REDIRECT_URL, resource } from "./commons.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * The rights the system user starts with.
 *
 * @type {Right[]}
 */
const GRANTED_RIGHTS = [resource("k6-instancedelegation-test")];

/**
 * The rights the change request asks for, which the system user does not have.
 *
 * @type {Right[]}
 */
const REQUESTED_RIGHTS = [resource("ttd-dialogporten-dummy")];

/**
 * How many change requests the test asks for before listing them.
 *
 * More than one, so the listing is read on a system that actually holds a list. A
 * change request is idempotent on the correlation id rather than on its contents,
 * so the same rights sent with a fresh correlation id gives another one.
 */
const CHANGE_REQUESTS = 3;

/**
 * Name the checks report under.
 */
const OPERATION = "ChangeRequestSystemUserVendorGetBySystem";

/**
 * k6 setup stage. Arranges the system user the change requests are made for.
 *
 * @returns The system user to change, as a single item list.
 */
export function setup() {
    const vendorOrgNo = pickVendor();

    return arrangeApprovedSystemUser({
        systemNamePrefix: "changerequestlist",
        vendorOrgNo,
        grantedRights: GRANTED_RIGHTS,
        registeredRights: [...GRANTED_RIGHTS, ...REQUESTED_RIGHTS],
    });
}

/**
 * Test: a vendor can list the change requests it has on one of its systems.
 *
 * The listing is read on a system this run registered itself rather than on an
 * existing one, so the vendor knows exactly which change requests have to come
 * back. The equivalent listing for system user requests is read on a system that
 * already holds enough of them to page through, and is covered in
 * system-user-request/get-system-user-requests-by-system-id.js. There is no system
 * with that many change requests, so this one asks for a handful, which fits on one
 * page, and checks that the page says so rather than following next links. #460
 * covers the seeded system that would let a test page through them.
 *
 * The premise is checked before the listing is: the test only reads a list because
 * it asked more than once, and a change request is idempotent on the correlation id
 * rather than on its contents. Were that not so, all three asks would answer with
 * the same change request and the listing would quietly become a list of one.
 *
 * The change requests are withdrawn at the end, and the listing is read once more to
 * see that they are gone, which is the same endpoint answering for a change it has
 * to reflect. The teardown withdraws whatever is left pending if an iteration stops
 * before that.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = getItemFromList(data, randomize);
    const [clients, , vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));

    // The arrange hands back a system user id only when every step of it worked,
    // rather than failing the run, so that its teardown gets to remove what it did
    // create. Nothing below says anything without one.
    if (!ChangeRequestSystemUserDomainChecks.CheckSystemUserToChange(systemUser.systemUserId)) {
        fail("cannot make a change request: the setup produced no system user");
    }

    group("As a vendor, I can list the change requests on a system I own", function () {
        const changeRequestIds = group("Ask for a right the system user does not have, more than once", function () {
            /** @type {string[]} */
            const created = [];

            for (let i = 0; i < CHANGE_REQUESTS; i++) {
                const request = new ChangeRequestSystemUserBuilder()
                    .withRequiredRights(REQUESTED_RIGHTS)
                    .withRedirectUrl(REDIRECT_URL)
                    .build();

                const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorCreate(
                    clients.vendor.changeRequestClient,
                    request,
                    uuidv4(),
                    systemUser.systemUserId,
                    201,
                );

                if (changeRequest?.id !== undefined) {
                    created.push(changeRequest.id);
                }
            }

            return created;
        });

        // Everything below rests on there being three separate change requests to
        // find, so the creates answer for themselves before the listing is read.
        if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestsCreated(changeRequestIds, CHANGE_REQUESTS)) {
            fail(`cannot read the listing: the ${CHANGE_REQUESTS} change requests it looks for were not created`);
        }

        group("List the change requests for the system", function () {
            const listed = ChangeRequestSystemUserBuildingBlocks.VendorGetBySystem(
                clients.vendor.changeRequestClient,
                systemUser.systemId,
            );

            // The checks below all read off the page, so one that is missing or shaped
            // wrong would fail every one of them on the same cause.
            if (!PaginationDomainChecks.CheckPaginatedShape(listed, OPERATION)) {
                fail("cannot read the listed change requests: the response is not a paginated response");
            }

            PaginationDomainChecks.CheckItemsBelongToSystem(listed, systemUser.systemId, "change request");
            ChangeRequestSystemUserDomainChecks.CheckChangeRequestsListed(listed, changeRequestIds);

            // A handful of change requests fits on one page, so a next link here
            // would point at a page that cannot exist.
            PaginationDomainChecks.CheckNoNextLink(listed, OPERATION);
        });

        group("Withdraw the change requests", function () {
            for (const changeRequestId of changeRequestIds) {
                const deleted = ChangeRequestSystemUserBuildingBlocks.VendorDelete(clients.vendor.changeRequestClient, changeRequestId);

                ChangeRequestSystemUserDomainChecks.CheckChangeRequestDeleted(deleted);
            }
        });

        group("The withdrawn change requests are gone from the listing", function () {
            const listed = ChangeRequestSystemUserBuildingBlocks.VendorGetBySystem(
                clients.vendor.changeRequestClient,
                systemUser.systemId,
            );

            ChangeRequestSystemUserDomainChecks.CheckChangeRequestsGone(listed, changeRequestIds);
        });
    });
}

/**
 * k6 teardown stage. Deletes the system user this test made change requests for
 * and the system it belongs to.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArranged(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
