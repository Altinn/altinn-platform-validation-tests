/**
 * Test data for the v2 client delegation resource tests, per environment.
 *
 * The shape follows the Bruno scenario that covers the same endpoints,
 * `test/Bruno/AccessMgmt/test/EnduserAPI/ClientDelegationsV2/06_ResourceDelegationToAgent`
 * in the AccessManagement repo, so the two suites describe the same actors in
 * the same terms. Three parties are involved and it is easy to mix them up.
 *
 * `facilitator` is the organisation in the middle. Its uuid goes in the `party`
 * query parameter of every request.
 *
 * `facilitator.user` is a person who administers that organisation, a
 * dagligleder in the Bruno fixtures. The token identifies this person, never the
 * organisation. A token carrying only the organisation's own party uuid is
 * answered 403 by `/clients` and `/agents`, whichever organisation the request
 * names.
 *
 * `client` is the organisation the resource is delegated from, and `agent` is
 * the person it is delegated to.
 *
 * Every value is environment specific and none survives being guessed. Leave a
 * field blank rather than filling it with something plausible: setup checks the
 * required ones and names whichever are still empty.
 *
 * @typedef {object} ClientDelegationV2TestData
 * @property {{partyUuid: string, user: {userId: string, partyUuid: string}}} facilitator
 * The organisation in the middle, and the person who acts for it.
 * @property {{partyUuid: string}} client
 * The organisation the resource is delegated from. Discovered at runtime when blank.
 * @property {{partyUuid: string}} agent
 * The person the resource is delegated to. Discovered at runtime when blank.
 * @property {string} roleCode
 * The role the delegation goes through, `rettighetshaver` in the Bruno fixtures.
 * Discovered at runtime when blank.
 * @property {string} resource
 * The resource that gets delegated and then removed. It has to be one the
 * client's role may delegate onwards, which the API decides, so it cannot be
 * discovered from the outside.
 */

/**
 * The fields setup insists on. The rest are optional: leave them blank and the
 * test discovers them through the v1 API, fill them in to pin the test to a
 * known client, agent and role instead.
 *
 * @type {string[]}
 */
export const REQUIRED_FIELDS = [
    "facilitator.partyUuid",
    "facilitator.user.userId",
    "facilitator.user.partyUuid",
    "resource",
];

/**
 * Blank entries to fill in. Add an environment here before enabling the test
 * for it.
 *
 * Bruno also pins a `pid` and a `partyId` on each person. Neither is needed
 * here: the endpoints accept a token carrying only `userId` and `partyUuid`,
 * and an unsupplied `pid` is filled in by the token generator with a fresh
 * synthetic number, which is safer than one that contradicts the `userId`.
 *
 * @type {{[environment: string]: ClientDelegationV2TestData}}
 */
export const TEST_DATA = {
    at22: {
        facilitator: {
            partyUuid: "",
            user: {
                userId: "",
                partyUuid: "",
            },
        },
        client: {
            partyUuid: "",
        },
        agent: {
            partyUuid: "",
        },
        roleCode: "",
        resource: "",
    },

    yt01: {
        facilitator: {
            partyUuid: "",
            user: {
                userId: "",
                partyUuid: "",
            },
        },
        client: {
            partyUuid: "",
        },
        agent: {
            partyUuid: "",
        },
        roleCode: "",
        resource: "",
    },
};
