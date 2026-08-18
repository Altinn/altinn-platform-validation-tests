/**
 * The fixtures `setup()` fetches and hands to every scenario as the default function's
 * `data` argument.
 *
 * @typedef {object} SetupData
 * @property {AccountingFirmFixture} testdata
 * The accounting firm tree this suite brought with it, from `../testdata-<env>.json`.
 * @property {HierarchyFixture} hierarchy
 * The main unit and subunit delegation tree, from `../../enduser/testdata-<env>.json`.
 * Shared with the enduser suite, which was ported from the same Bruno fixture.
 * @property {SharedTestData} sharedTestData
 * Environment independent constants, from `../../enduser/shared-testdata.json`.
 */

/**
 * A party as the fixtures record one. Which fields are present varies: an organisation
 * carries `orgno`, a person carries `pid`, and only some carry `userId` or `partyId`.
 *
 * @typedef {object} FixtureParty
 * @property {string} name Display name.
 * @property {string} [orgno] Organisation number, on organisations.
 * @property {string} [pid] National identity number, on people.
 * @property {string} [partyUuid] Party uuid, lower cased to match what the API returns.
 * @property {string} [partyuuid] Party uuid, as the hierarchy fixture spells it.
 * @property {number} [partyId] Party id.
 * @property {number} [partyid] Party id, as the hierarchy fixture spells it.
 * @property {number} [userId] User id.
 * @property {string} [org_no] Organisation number, as the hierarchy fixture spells it.
 */

/**
 * The accounting firm tree, keyed by the fixture names the scenarios read.
 *
 * @typedef {object} AccountingFirmFixture
 * @property {string} env The environment the fixture describes.
 * @property {number} deletedPartyRetentionYears
 * How many years a deleted party keeps granting access to its owner.
 * @property {object} REGN_ULASTELIG_RETTFERDIG_TIGER
 * The firm, its daily leader, subunit, clients, rightholders, deleted sole
 * proprietorships and system user.
 * @property {FixtureParty} a2BrunoSIUser A self identified user.
 * @property {FixtureParty} a2BrunoECUser An enterprise user.
 * @property {FixtureParty} idportenEmailUser An ID-porten user registered by email.
 * @property {object} forretningsforerNonfigurativEmosjonellPuma
 * A business manager firm, its daily leader and its housing company clients.
 */

/**
 * The main unit and subunit delegation tree. Every delegation between these parties is
 * pre seeded in the environment; the fixture records only the parties.
 *
 * @typedef {object} HierarchyFixture
 * @property {string} env The environment the fixture describes.
 * @property {FixtureParty} authParties_personA A person who both delegates and receives.
 * @property {FixtureParty} authParties_personB A person who receives from person A.
 * @property {object} authParties_hovedenhetA Main unit A, its daily leader, subunit and person C.
 * @property {object} authParties_hovedenhetB Main unit B and its daily leader.
 * @property {object} authParties_hovedenhetC Main unit C, its daily leader and subunit.
 * @property {object} authParties_hovedenhetD Main unit D, its daily leader and subunit.
 * @property {object} [instancer] Instance identifiers used by the enduser suite.
 */

/**
 * Environment independent constants.
 *
 * @typedef {object} SharedTestData
 * @property {object} serviceOwners Service owners by short name, each with `org` and `orgno`.
 * @property {object} auth_scopes Scope strings by short name.
 * @property {object} authTokenType Token type names accepted by the token generator.
 */

export const SetupData = undefined;
