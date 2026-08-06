import { CorrespondenceClient } from "../../../clients/correspondence/index.js";
import { EnterpriseTokenBuilder, EnterpriseTokenGenerator } from "../../../common-imports.js";
import { AltinnScopes, CreateScopeString } from "../../../scopes.js";

// Import relevant types
// import {} from "../../"

/**
 * The organisation the correspondences are sent as.
 *
 * Correspondence works out the sender from the enterprise token rather than
 * from the payload, so the organisation number is not token trivia, it is the
 * sender identity. It has to be an organisation that is allowed to send on the
 * resource the test initializes against, otherwise initialization is rejected
 * before any of the assertions get a chance to run.
 */
const SENDER_ORG_NO = "313154599";

/**
 * Creates the client that sends correspondences as the vendor.
 *
 * Given `altinn:correspondence.write`, which covers initializing, purging and
 * the read-side calls the tests make afterwards on their own correspondences.
 *
 * @returns {[CorrespondenceClient]} The correspondence client, as a single item
 * list so callers keep destructuring as more clients are added.
 */
export function getClients() {
    const scopes = CreateScopeString( [AltinnScopes.CORRESPONDENCE.WRITE]);

    const vendorTokenGenerator = new EnterpriseTokenGenerator(
        new EnterpriseTokenBuilder()
            .withEnvironment(__ENV.ENVIRONMENT)
            .withTtl(3600)
            .withScopes(scopes)
            .withOrganizationNumber(SENDER_ORG_NO)
            .build(),
    );

    const correspondenceClient = new CorrespondenceClient(__ENV.ENVIRONMENT, vendorTokenGenerator);

    return [correspondenceClient];
}
