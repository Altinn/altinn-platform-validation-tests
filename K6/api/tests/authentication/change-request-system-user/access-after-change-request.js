import { check, fail, group, sleep } from "k6";

import { uuidv4 } from "../../../../common-imports.js";
import { requireEnv } from "../../../../helpers.js";
import { ChangeRequestSystemUserBuilder, ChangeRequestSystemUserBuildingBlocks, ChangeRequestSystemUserDomainChecks } from "../../../authentication-imports.js";
import { ApproveChangeRequest } from "../../../building-blocks/access-management-bff/system-user-change-request/index.js";
import { AuthorizePost } from "../../../building-blocks/authorization/authorize/post.js";
import { accessPackage, arrangeSystemUserWithAccessPackageResource, askForDecision, buildSystemUserDecisionRequest, cleanupArrangedWithResource, getApproverTokenOpts, getAuthorizeClient, getClients, getVendorTokenOpts, REDIRECT_URL } from "./commons.js";

/**
 * The access package the resource requires, and the one the system user is
 * granted up front.
 *
 * Named rather than searched for, since the bug report this test comes from is
 * about these two packages.
 *
 * @see https://github.com/Altinn/altinn-authorization-tmp/issues/3933
 */
const REQUIRED_PACKAGE = "urn:altinn:accesspackage:lonn";

/**
 * The access package the change request adds on top. It opens nothing on the
 * resource, so nothing about the decision should change when it is added.
 */
const ADDED_PACKAGE = "urn:altinn:accesspackage:a-ordning";

const SYSTEM_NAME_PREFIX = "changerequestaccess";

/**
 * How long after the change request the decisions are watched, and how often.
 *
 * In the bug report the wrong decision came back a little over two minutes after
 * the change request, and the right one half a minute after that, so a single
 * decision asked for the moment the change is approved walks straight past the
 * window the bug lives in. The numbers here cover that window with room on either
 * side.
 */
const PROBE_WINDOW_SECONDS = 240;
const PROBE_INTERVAL_SECONDS = 5;

/**
 * k6 setup stage. Arranges the resource and the system user this test changes.
 *
 * @returns The system user to change, as a single item list, carrying the resource its access package opens.
 */
export function setup() {
    requireEnv([
        "ENVIRONMENT",
        "BASE_URL",
        "AM_UI_BASE_URL",
        "AUTHORIZATION_SUBSCRIPTION_KEY",
        "TOKEN_GENERATOR_USERNAME",
        "TOKEN_GENERATOR_PASSWORD",
    ]);

    return arrangeSystemUserWithAccessPackageResource({
        systemNamePrefix: SYSTEM_NAME_PREFIX,
        identifierPrefix: "k6-changerequest-access-",
        grantedAccessPackage: REQUIRED_PACKAGE,
        registeredAccessPackage: ADDED_PACKAGE,
    });
}

/**
 * Test: a change request that adds an access package does not take away the
 * access the system user already had.
 *
 * This is the flow from the bug report, where a system user was refused a service
 * right after a change request, because the rights cached on the system user were
 * not the ones it had been left with. The decision is watched for a few minutes
 * rather than asked for once, since the wrong ones in the report came back a
 * couple of minutes in and were gone half a minute later.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export default function (data) {
    const systemUser = data[0];
    const [clients, approverTokenGenerator, vendorTokenGenerator] = getClients();

    vendorTokenGenerator.setTokenGeneratorOptions(getVendorTokenOpts(systemUser.vendorOrgNo));
    approverTokenGenerator.setTokenGeneratorOptions(getApproverTokenOpts(systemUser.customer));

    // The arrange hands back a system user id only when every step of it worked,
    // rather than failing the run, so that its teardown gets to remove what it did
    // create. Nothing below says anything without one.
    if (!ChangeRequestSystemUserDomainChecks.CheckSystemUserToChange(systemUser.systemUserId)) {
        fail("cannot ask for a decision: the setup produced no system user");
    }

    const request = buildSystemUserDecisionRequest(systemUser);

    group("Before the change, the access package the system user was granted opens the resource", function () {
        AuthorizePost(getAuthorizeClient(), request, "Permit", { step: "Decision before the change" });
    });

    group("The vendor adds another access package the system user does not have", function () {
        const changeRequest = ChangeRequestSystemUserBuildingBlocks.VendorCreate(
            clients.vendor.changeRequestClient,
            new ChangeRequestSystemUserBuilder()
                .withRequiredAccessPackages([accessPackage(ADDED_PACKAGE)])
                .withRedirectUrl(REDIRECT_URL)
                .build(),
            uuidv4(),
            systemUser.systemUserId,
            201,
        );

        if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestId(changeRequest?.id)) {
            fail("cannot approve: no change request was created to approve");
        }

        const approved = ApproveChangeRequest(
            clients.approver.bffChangeRequestClient,
            systemUser.customer.orgPartyId,
            changeRequest.id,
        );

        if (!ChangeRequestSystemUserDomainChecks.CheckChangeRequestApproved(approved)) {
            fail("cannot watch the decisions: approving the change request failed");
        }
    });

    group("Every decision in the minutes after the change is the right one", function () {
        /** @type {{elapsed: number, decision: string}[]} */
        const timeline = [];

        for (let elapsed = 0; elapsed <= PROBE_WINDOW_SECONDS; elapsed += PROBE_INTERVAL_SECONDS) {
            timeline.push({
                elapsed,
                decision: askForDecision(request, { step: "Decision after the change" }),
            });

            if (elapsed + PROBE_INTERVAL_SECONDS <= PROBE_WINDOW_SECONDS) {
                sleep(PROBE_INTERVAL_SECONDS);
            }
        }

        const wrong = timeline.filter((probe) => probe.decision !== "Permit");

        const succeeded = check(timeline, {
            "The system user keeps the access it had before the change": () => wrong.length === 0,
        });

        // The point of the test is which seconds the wrong decisions land in, and
        // that is gone by the time the summary counts them, so the whole window is
        // written out when there is something to write.
        if (!succeeded) {
            console.log(`Wrong decisions for system user ${systemUser.systemUserId} on ${systemUser.customer.orgNo}`);
            console.log(`  ${systemUser.resourceIdentifier} is opened by ${REQUIRED_PACKAGE}, which the change request left alone`);

            for (const probe of timeline) {
                console.log(`  +${probe.elapsed}s ${probe.decision}`);
            }
        }
    });
}

/**
 * k6 teardown stage. Deletes the system user this test changed, the system it
 * belongs to and the resource the setup created.
 *
 * @param {any[]} data The arranged system users from setup.
 */
export function teardown(data) {
    cleanupArrangedWithResource(data);
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
