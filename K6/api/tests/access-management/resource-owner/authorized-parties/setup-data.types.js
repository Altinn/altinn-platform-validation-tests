/**
 * The fixtures `setup()` fetches and hands to every scenario as the default function's
 * `data` argument.
 *
 * @typedef {object} SetupData
 * @property {AccountingFirmFixture} testdata
 * The accounting firm tree this suite brought with it, from `K6/testdata/access-management/resource-owner/authorized-parties/<environment>.json`.
 * @property {HierarchyFixture} hierarchy
 * The main unit and subunit delegation tree, from `K6/testdata/access-management/enduser/testdata-<environment>.json`.
 * Shared with the enduser suite, which was ported from the same Bruno fixture.
 * @property {SharedTestData} sharedTestData
 * Environment independent constants, from `K6/testdata/access-management/enduser/shared-testdata.json`.
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
 * @property {string} [clientId] Client id, on system users.
 * @property {string} [emailId] Email the ID-porten user is registered by.
 * @property {string} [username] User name, on enterprise users.
 * @property {string} [deletedDate] Deletion date, on deleted parties, as YYYY-MM-DD.
 * @property {FixtureParty} [innehaver] The owner, on sole proprietorships.
 * @property {FixtureParty} [subunit] The subunit, on organisations that have one.
 * @property {string} [clientPackage] Access package the client relation carries.
 * @property {string} [directPackageToDelegate] Access package the rightholder can pass on.
 * @property {string} [packageDelegatedToPerson] Access package already delegated to a person.
 * @property {string} [resourceIdDelegatedToPerson] Resource already delegated to a person.
 */

/**
 * The accounting firm tree, keyed by the fixture names the scenarios read.
 *
 * @typedef {object} AccountingFirmFixture
 * @property {number} deletedPartyRetentionYears
 * How many years a deleted party keeps granting access to its owner.
 * @property {AccountingFirm} REGN_ULASTELIG_RETTFERDIG_TIGER
 * The firm, its daily leader, subunit, clients, rightholders, deleted sole
 * proprietorships and system user.
 * @property {FixtureParty} a2BrunoSIUser A self identified user.
 * @property {FixtureParty} a2BrunoECUser An enterprise user.
 * @property {FixtureParty} idportenEmailUser An ID-porten user registered by email.
 * @property {BusinessManagerFirm} forretningsforerNonfigurativEmosjonellPuma
 * A business manager firm, its daily leader and its housing company clients.
 */

/**
 * The accounting firm the suite delegates from, with everyone it reaches.
 *
 * @typedef {object} AccountingFirm
 * @property {string} name Display name.
 * @property {string} orgno Organisation number.
 * @property {number} partyId Party id.
 * @property {string} partyUuid Party uuid.
 * @property {FixtureParty} dagligleder The daily leader of the firm.
 * @property {FixtureParty} subunit The subunit of the firm.
 * @property {FixtureParty} client_USENSUELL_UVIRKSOM_TIGER A client organisation with a subunit.
 * @property {FixtureParty} client_ENK_HUMAN_TOPP_KATT_BIL A sole proprietorship client.
 * @property {FixtureParty} client_WITHOUT_CLIENTDELEGATION A client without a client delegation.
 * @property {FixtureParty} client_rightholderOrg2 A client with a package and a resource delegated on.
 * @property {FixtureParty} client_ENK_DELETED_2025_11_27_InnehaverAccess
 * A deleted sole proprietorship its owner still reaches.
 * @property {FixtureParty} client_ENK_DELETED_2023_11_01_NoInnehaverAccess
 * A deleted sole proprietorship its owner no longer reaches.
 * @property {FixtureParty} systemuser_tilgangsstyrer The system user of the firm.
 * @property {FixtureParty} employee_rightholderWithPackages An employee holding access packages.
 * @property {FixtureParty} employee_rightholderWithoutPackages An employee holding none.
 */

/**
 * The business manager firm and the housing companies it manages.
 *
 * @typedef {object} BusinessManagerFirm
 * @property {string} name Display name.
 * @property {string} orgno Organisation number.
 * @property {number} partyId Party id.
 * @property {string} partyUuid Party uuid.
 * @property {FixtureParty} dagligleder The daily leader of the firm.
 * @property {FixtureParty} esekClient A housing company client.
 * @property {FixtureParty} nonBrlEsekClient A client that is not a housing company.
 */

/**
 * The main unit and subunit delegation tree. Every delegation between these parties is
 * pre seeded in the environment; the fixture records only the parties.
 *
 * @typedef {object} HierarchyFixture
 * @property {string} [env] The environment, carried over from Bruno and read by nothing.
 * @property {FixtureParty} authParties_personA A person who both delegates and receives.
 * @property {FixtureParty} authParties_personB A person who receives from person A.
 * @property {HierarchyMainUnit} authParties_hovedenhetA Main unit A, its daily leader, subunit and person C.
 * @property {HierarchyMainUnit} authParties_hovedenhetB Main unit B and its daily leader.
 * @property {HierarchyMainUnit} authParties_hovedenhetC Main unit C, its daily leader and subunit.
 * @property {HierarchyMainUnit} authParties_hovedenhetD Main unit D, its daily leader and subunit.
 * @property {{[key: string]: string}} [instancer] Instance identifiers used by the enduser suite.
 */

/**
 * A main unit and what hangs off it. Which subunit and person a unit carries differs
 * per unit, so everything but the daily leader is optional.
 *
 * @typedef {object} HierarchyMainUnit
 * @property {string} [org_no] Organisation number.
 * @property {string} [partyuuid] Party uuid.
 * @property {number} [partyid] Party id.
 * @property {FixtureParty} dagligleder The daily leader of the unit.
 * @property {FixtureParty} [authParties_underenhetA] Subunit of main unit A.
 * @property {FixtureParty} [authParties_underenhetC] Subunit of main unit C.
 * @property {FixtureParty} [authParties_underenhetD] Subunit of main unit D.
 * @property {FixtureParty} [authParties_personC] A person main unit A delegates to.
 */

/**
 * Environment independent constants.
 *
 * @typedef {object} SharedTestData
 * @property {{[key: string]: {org: string, orgno: string}}} serviceOwners Service owners by short name.
 * @property {{[key: string]: string}} auth_scopes Scope strings by short name.
 * @property {{[key: string]: string}} authTokenType Token type names accepted by the token generator.
 */

export const SetupData = undefined;
