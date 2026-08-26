import { fail, group } from "k6";

import { IntrospectionBuildingBlocks, IntrospectionDomainChecks } from "../../../authentication-imports.js";
import { getClient } from "./commons.js";

export { setup } from "./commons.js";

/**
 * What a refusal of an empty token says. Loose on purpose: the endpoint spells it
 * "Token canot be empty." today, and the point is to tell its own refusal apart from
 * any other response carrying the same status, such as one from APIM in front of it,
 * not to freeze the typo.
 */
const EMPTY_TOKEN_REFUSAL = /token/i;

/**
 * Test: the introspection endpoint, which says whether a token is valid.
 *
 * What the test asserts is the contract: the endpoint wants a bearer of its own and
 * answers 401 without one, a token that is empty or left out is refused with 400 and
 * says why, and anything it can be handed comes back as an answer rather than as a
 * 500.
 *
 * It deliberately does not assert that a valid token comes back active. No token
 * this repo can mint does, not even one whose `iss` is the environment's own
 * authentication service, so what makes a token active is an open question for the
 * authentication team rather than something to pin down in a check. See #463.
 *
 * That gap is worth knowing when reading the groups below. Until it is closed,
 * nothing here separates an endpoint that read the token and found it invalid from
 * one that never read it at all, so the groups are named for what they do verify
 * rather than for what a reader would expect them to.
 */
export default function () {
    const introspectionClient = getClient();

    group("As a caller, I can ask whether a token is valid", function () {
        group("Introspecting a token answers whether it is active", function () {
            // The hint is what a caller that knows what it holds sends along.
            const introspection = IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { tokenTypeHint: "access_token" });

            // Reporting the answer as missing on top of a call that already failed
            // says the same thing twice and points at the wrong check.
            if (introspection === null) {
                fail("cannot read the answer: the introspection call did not return one");
            }

            IntrospectionDomainChecks.CheckIntrospectionAnswered(introspection);
        });

        group("A token the endpoint cannot read still gets an answer", function () {
            const introspection = IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { token: "not-a-jwt" });

            IntrospectionDomainChecks.CheckTokenInactive(introspection);
        });

        group("An empty token is refused", function () {
            IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { token: "" }, 400, EMPTY_TOKEN_REFUSAL);
        });

        // The endpoint treats a missing token as an empty one, down to the same
        // message. The two are covered apart so a change to either is noticed.
        group("A body without a token is refused", function () {
            IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { token: null }, 400, EMPTY_TOKEN_REFUSAL);
        });

        // The token stays in the body while the header is dropped, so a regression
        // where the endpoint accepts the introspected token as the caller's own
        // authentication would answer 200 and turn this group red.
        group("A request without a bearer is refused", function () {
            IntrospectionBuildingBlocks.IntrospectToken(introspectionClient, { bearer: null }, 401);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
