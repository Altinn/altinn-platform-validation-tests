import { fail, group } from "k6";

import { OpenidBuildingBlocks, OpenidDomainChecks } from "../../../authentication-imports.js";
import { getClient } from "./commons.js";

export { setup } from "./commons.js";

/**
 * Test: the OpenID metadata, which is what a relying party reads before it can
 * validate an Altinn token.
 *
 * The two endpoints are covered in one test on purpose. They are one story: the
 * discovery document is only useful if the `jwks_uri` it advertises actually serves
 * keys, and reading the key set from a URL this repo built instead of from the one
 * the document names would leave the interesting half of the contract untested. So
 * the test walks the same path a relying party does, document first, then whatever
 * URL the document points at.
 *
 * Both endpoints are anonymous, so there is nothing here about who is asking.
 *
 * What is asserted is kept to what holds in every environment: the issuer belongs
 * to the environment under test, the endpoints named are absolute URLs, the
 * supported-values lists are non-empty, and the key set holds a usable RSA signing
 * key. The concrete algorithms, key ids and endpoint paths are deployment details
 * that may legitimately differ, so they are not pinned down. Fields the OpenID
 * Connect spec allows but Altinn leaves out, `introspection_endpoint` and
 * `userinfo_endpoint` among them, are not required either: Altinn does not claim to
 * be a full OpenID provider, and the document is what it promises.
 */
export default function () {
    const openidClient = getClient();

    group("As a relying party, I can discover how to validate an Altinn token", function () {
        group("The discovery document describes this environment", function () {
            const discovery = OpenidBuildingBlocks.GetDiscoveryDocument(openidClient);

            // Reporting every field as missing on top of a call that already failed
            // says the same thing many times and points at the wrong check.
            if (discovery === null) {
                fail("cannot read the metadata: the discovery document call did not return one");
            }

            OpenidDomainChecks.CheckIssuerIsThisEnvironment(discovery, __ENV.BASE_URL);
            OpenidDomainChecks.CheckEndpointsAreAbsolute(discovery);
            OpenidDomainChecks.CheckSupportedValuesAreListed(discovery);
        });

        group("The advertised key set holds a key tokens can be verified with", function () {
            // Read again rather than carried over from the group above: groups are
            // meant to be readable on their own, and the call is cheap and anonymous.
            const discovery = OpenidBuildingBlocks.GetDiscoveryDocument(openidClient);

            // Following a URL that is not there would fall back to the path this
            // client builds, which would quietly pass a document that never named one.
            if (discovery === null || !discovery.jwks_uri) {
                fail("cannot follow jwks_uri: the discovery document did not advertise one");
            }

            const keySet = OpenidBuildingBlocks.GetKeySet(openidClient, discovery.jwks_uri);

            if (keySet === null) {
                fail("cannot read the keys: the key set call did not return one");
            }

            OpenidDomainChecks.CheckKeySetCanVerifySignatures(keySet);
        });
    });
}

// add the custom reporting for this test to the default summary
export { handleSummary } from "../../../../common-imports.js";
