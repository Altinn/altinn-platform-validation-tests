/**
 * Fills the activity log of a handful of organizations, so the activity log
 * tests read realistic logs instead of the near-empty ones the "be om tilgang"
 * users have (see the README).
 *
 * Not a test of anything on its own. Each VU owns one target organization and
 * acts as its daglig leder; each iteration is one round of the events below,
 * with a new partner person and partner organization every round:
 *
 * Connections (shows up in the target's `connections` log, direction From):
 * 1. The target adds the partner person (assignment created)
 * 2. delegates an access package to them, 3. removes it again
 * 4. The partner organization is added, given a package and removed (cascade)
 *
 * Requests (the target's `request` log, direction To):
 * 5. The partner person asks for a package, and the target rejects it
 * 6. asks for another, and withdraws it themselves
 * 7. asks for a third, and the target approves it
 * 8. The target removes the partner person again (cascade), which also takes
 * the approved package
 *
 * Maskinporten (the target's `maskinporten` log, From; the partner's, To):
 * 9. The target adds the partner organization as supplier, and removes it
 *
 * Everything created is removed again in the same round, so the run leaves
 * entries in the activity log and no access behind. A round adds roughly 15
 * entries, so the default 15 rounds take an organization past one page (100).
 *
 * The teardown prints the target organizations as the csv the activity log
 * tests read, to be committed as
 * K6/testdata/access-management/enduser/activity-log/<env>.csv.
 *
 * Writes data, so agree with the team when and how much before running it:
 *
 * ```sh
 * ENVIRONMENT=yt01 BASE_URL=https://platform.yt01.altinn.cloud ORGS=10 ROUNDS=15 \
 * k6 run K6/api/tests/access-management/enduser/activity-log/testdataGeneration/activity-log-data.js
 * ```
 */

import { fail, group } from "k6";
import exec from "k6/execution";

import { ActivityLogArea, ActivityLogClient, ActivityLogQueryBuilder } from "../../../../../../clients/access-management/enduser/activity-log/index.js";
import {
    ConnectionsClient,
    CreateAccessPackageQueryBuilder,
    CreateConnectionQueryBuilder,
    DeleteAccessPackageQueryBuilder,
    DeleteConnectionQueryBuilder,
} from "../../../../../../clients/access-management/enduser/connections/index.js";
import { MaskinportenSuppliersClient, MaskinportenSuppliersQueryBuilder } from "../../../../../../clients/access-management/enduser/maskinporten-suppliers/index.js";
import { RequestClient } from "../../../../../../clients/access-management/enduser/request/index.js";
import { PersonalTokenGenerator } from "../../../../../../common-imports.js";
import { getOptions, lazy, pickUnique } from "../../../../../../helpers.js";
import { EndUserBuildingBlocks } from "../../../../../building-blocks/access-management/enduser/index.js";
import { CreateMaskinportenSupplier, DeleteMaskinportenSupplier } from "../../../../../building-blocks/access-management/enduser/maskinporten-suppliers/index.js";
import {
    ApproveReceivedRequest,
    CreatePackageRequest,
    RejectReceivedRequest,
    WithdrawSentRequest,
} from "../../../../../building-blocks/access-management/enduser/request/index.js";
import { setup as requestSetup } from "../../request/common-functions.js";
import { getTokenOpts } from "../common.js";

// How many organizations to fill, and how many rounds of events each gets.
const ORGS = __ENV.ORGS ? parseInt(__ENV.ORGS) : 10;
const ROUNDS = __ENV.ROUNDS ? parseInt(__ENV.ROUNDS) : 15;

// This writes data, so it only runs in the test environments.
const ALLOWED_ENVIRONMENTS = ["at22", "at23", "yt01"];

const labels = {
    addPerson: { step: "1. Add partner person" },
    delegatePackage: { step: "2. Delegate package to person" },
    removePackage: { step: "3. Remove package from person" },
    addOrganization: { step: "4a. Add partner organization" },
    delegatePackageToOrganization: { step: "4b. Delegate package to organization" },
    removeOrganization: { step: "4c. Remove partner organization" },
    requestPackage: { step: "5-7. Partner person requests package" },
    rejectRequest: { step: "5. Reject request" },
    withdrawRequest: { step: "6. Withdraw request" },
    approveRequest: { step: "7. Approve request" },
    removePerson: { step: "8. Remove partner person" },
    addSupplier: { step: "9a. Add maskinporten supplier" },
    removeSupplier: { step: "9b. Remove maskinporten supplier" },
};

export const options = {
    ...getOptions(Object.values(labels)),
    setupTimeout: "120s",
    scenarios: {
        default: {
            // One VU per target organization, so no two VUs touch the same one.
            executor: "per-vu-iterations",
            vus: ORGS,
            iterations: ROUNDS,
            maxDuration: "2h",
        },
    },
};

/**
 * @typedef {object} User
 * @property {string} pid
 * @property {string} partyUuid
 * @property {string} orgUuid
 * @property {string} orgNo
 * @property {string} lastName
 */

/**
 * Creates and caches the clients, sharing one token generator that is pointed
 * at whoever acts in each step.
 */
const getClients = lazy(function () {
    const tokenGenerator = new PersonalTokenGenerator(getTokenOpts());

    return {
        connections: new ConnectionsClient(__ENV.BASE_URL, tokenGenerator),
        request: new RequestClient(__ENV.BASE_URL, tokenGenerator),
        maskinporten: new MaskinportenSuppliersClient(__ENV.BASE_URL, tokenGenerator),
        activityLog: {
            connections: new ActivityLogClient(__ENV.BASE_URL, tokenGenerator, ActivityLogArea.CONNECTIONS),
            request: new ActivityLogClient(__ENV.BASE_URL, tokenGenerator, ActivityLogArea.REQUEST),
            maskinporten: new ActivityLogClient(__ENV.BASE_URL, tokenGenerator, ActivityLogArea.MASKINPORTEN),
        },
        tokenGenerator,
    };
});

/**
 * Splits the "be om tilgang" users into the target organizations, which get
 * filled, and the partners, who are added, delegated to and request access.
 * Keeping the two apart means no VU's partner is another VU's target.
 *
 * @returns {{targets: User[], partners: User[], packages: string[]}} The plan.
 */
export function setup() {
    if (!ALLOWED_ENVIRONMENTS.includes(__ENV.ENVIRONMENT)) {
        fail(`Refusing to write activity log data to ${__ENV.ENVIRONMENT}; allowed: ${ALLOWED_ENVIRONMENTS.join(", ")}`);
    }

    const { users, packages } = requestSetup();

    if (users.length < ORGS + 2) {
        fail(`Need at least ${ORGS + 2} users to fill ${ORGS} organizations, got ${users.length}`);
    }
    if (packages.length < 4) {
        fail(`Need at least 4 assignable access packages, got ${packages.length}`);
    }

    return {
        targets: users.slice(0, ORGS),
        partners: users.slice(ORGS),
        packages,
    };
}

/**
 * Acts as the given user for the following calls.
 *
 * @param {User} user The user to act as.
 */
function actAs(user) {
    getClients().tokenGenerator.setTokenGeneratorOptions(getTokenOpts(user.pid, user.partyUuid));
}

/**
 * One round of events for this VU's target organization.
 *
 * @param {{targets: User[], partners: User[], packages: string[]}} data The plan from setup.
 */
export default function (data) {
    const clients = getClients();
    const round = exec.vu.iterationInScenario;
    const target = data.targets[exec.vu.idInTest - 1];

    // A new partner every round, spread so the VUs don't all start on the same one.
    const partnerIndex = (exec.vu.idInTest * ROUNDS + round) % data.partners.length;
    const person = data.partners[partnerIndex];
    const organization = data.partners[(partnerIndex + 1) % data.partners.length];
    const [directPackage, rejectedPackage, withdrawnPackage, approvedPackage] = pickUnique(data.packages, 4);

    group("Connections and requests with a person", function () {
        actAs(target);
        const assignment = EndUserBuildingBlocks.Connections.CreateConnection(
            clients.connections,
            new CreateConnectionQueryBuilder().withParty(target.orgUuid).build(),
            { personIdentifier: person.pid, lastName: person.lastName },
            labels.addPerson,
        );
        if (assignment === null) {
            // Without the connection the person can neither be delegated to nor ask for access.
            return;
        }

        EndUserBuildingBlocks.Connections.CreateAccessPackage(
            clients.connections,
            new CreateAccessPackageQueryBuilder()
                .withParty(target.orgUuid)
                .withTo(person.partyUuid)
                .withPackage(directPackage)
                .build(),
            null,
            labels.delegatePackage,
        );
        EndUserBuildingBlocks.Connections.DeleteAccessPackage(
            clients.connections,
            new DeleteAccessPackageQueryBuilder()
                .withParty(target.orgUuid)
                .withFrom(target.orgUuid)
                .withTo(person.partyUuid)
                .withPackage(directPackage)
                .build(),
            labels.removePackage,
        );

        actAs(person);
        const rejected = CreatePackageRequest(clients.request, person.partyUuid, target.orgUuid, rejectedPackage, labels.requestPackage);
        const withdrawn = CreatePackageRequest(clients.request, person.partyUuid, target.orgUuid, withdrawnPackage, labels.requestPackage);
        const approved = CreatePackageRequest(clients.request, person.partyUuid, target.orgUuid, approvedPackage, labels.requestPackage);
        if (withdrawn !== null) {
            WithdrawSentRequest(clients.request, person.partyUuid, withdrawn.id, labels.withdrawRequest);
        }

        actAs(target);
        if (rejected !== null) {
            RejectReceivedRequest(clients.request, target.orgUuid, rejected.id, labels.rejectRequest);
        }
        if (approved !== null) {
            // An empty body approves the whole package.
            ApproveReceivedRequest(clients.request, target.orgUuid, approved.id, [], labels.approveRequest);
        }

        // Cascade also removes the package the approval gave.
        EndUserBuildingBlocks.Connections.DeleteConnection(
            clients.connections,
            new DeleteConnectionQueryBuilder()
                .withParty(target.orgUuid)
                .withFrom(target.orgUuid)
                .withTo(person.partyUuid)
                .withCascade(true)
                .build(),
            labels.removePerson,
        );
    });

    group("Connections with an organization", function () {
        actAs(target);
        const assignment = EndUserBuildingBlocks.Connections.CreateConnection(
            clients.connections,
            new CreateConnectionQueryBuilder().withParty(target.orgUuid).withTo(organization.orgUuid).build(),
            null,
            labels.addOrganization,
        );
        if (assignment === null) {
            return;
        }

        EndUserBuildingBlocks.Connections.CreateAccessPackage(
            clients.connections,
            new CreateAccessPackageQueryBuilder()
                .withParty(target.orgUuid)
                .withTo(organization.orgUuid)
                .withPackage(directPackage)
                .build(),
            null,
            labels.delegatePackageToOrganization,
        );
        EndUserBuildingBlocks.Connections.DeleteConnection(
            clients.connections,
            new DeleteConnectionQueryBuilder()
                .withParty(target.orgUuid)
                .withFrom(target.orgUuid)
                .withTo(organization.orgUuid)
                .withCascade(true)
                .build(),
            labels.removeOrganization,
        );
    });

    group("Maskinporten supplier", function () {
        actAs(target);
        const supplier = new MaskinportenSuppliersQueryBuilder()
            .withParty(target.orgUuid)
            .withSupplier(organization.orgNo)
            .build();

        if (CreateMaskinportenSupplier(clients.maskinporten, supplier, labels.addSupplier) !== null) {
            DeleteMaskinportenSupplier(clients.maskinporten, supplier, labels.removeSupplier);
        }
    });

    if (round === ROUNDS - 1) {
        logActivityLogSize(target);
    }
}

/**
 * Logs how many entries the target's logs hold after its last round, so the run
 * shows whether it produced what it was meant to.
 *
 * @param {User} target The organization that was filled.
 */
function logActivityLogSize(target) {
    actAs(target);
    const sizes = [];

    for (const area of Object.values(ActivityLogArea)) {
        for (const direction of /** @type {Array<"To"|"From">} */ (["To", "From"])) {
            const log = EndUserBuildingBlocks.ActivityLog.GetActivityLog(
                getClients().activityLog[area],
                new ActivityLogQueryBuilder()
                    .withParty(target.orgUuid)
                    .withDirection(direction)
                    .withPageSize(1000)
                    .build(),
                { action: "count-activity-log" },
            );
            sizes.push(`${area} ${direction}: ${log?.data?.length ?? "?"}${log?.links?.next ? "+" : ""}`);
        }
    }

    console.log(`Activity log of ${target.orgNo} after ${ROUNDS} rounds: ${sizes.join(", ")}`);
}

/**
 * Prints the filled organizations as the csv the activity log tests read.
 *
 * @param {{targets: User[]}} data The plan from setup.
 */
export function teardown(data) {
    const lines = ["pid,partyUuid,orgUuid,orgNo,lastName"]
        .concat(data.targets.map((u) => [u.pid, u.partyUuid, u.orgUuid, u.orgNo, u.lastName].join(",")));

    console.log(`Copy into K6/testdata/access-management/enduser/activity-log/${__ENV.ENVIRONMENT}.csv:\n${lines.join("\n")}`);
}
