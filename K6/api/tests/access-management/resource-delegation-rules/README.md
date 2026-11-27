# Resource delegation rules

Tests for the rules that decide whether a resource can be delegated:

- **Delegable:** a resource the Resource Registry marks as not delegable can't
  be delegated or requested, and a delegable one can.
- **Access lists:** with access lists enforced, only organizations on one of the
  resource's lists can delegate it.

These rules have always been there. The tests were added for
[Altinn/altinn-auth#4860](https://github.com/Altinn/altinn-auth/issues/4860),
which made Access Management read `Delegable` and `AccessListMode` from its own
copy of the resource instead of asking the Resource Registry. Nothing should
change for the caller, so the tests pass both before and after that change.

| Folder | `test_scope` in Grafana | What it covers |
| --- | --- | --- |
| `delegable/` | `resource-delegation-delegable` | Delegation check, service owner connections, enduser and service owner requests, for a delegable and a non-delegable resource |
| `access-list/` | `resource-delegation-access-list` | The delegation check and access lists |
| `registry-sync/` | – (by hand only) | Changes in the Resource Registry reach Access Management, and AM's copy matches the registry |

Shared by all three: `common.js` (test data, tokens, clients), `resources.js`
(the test resources) and `create-resources.js` (creates them).

## `delegable/` (scheduled in at22, at23 and tt02)

| Test | Checks |
| --- | --- |
| `delegation-check-not-delegable.js` | Delegation check refuses `k6-not-delegable-resource`: every right `result: false` with `ResourceNotDelegable`, resource and instance check |
| `delegation-check-delegable.js` | Delegation check allows `k6-delegable-resource`: every right `result: true`, resource and instance check |
| `service-owner-connections-not-delegable.js` | Service owner gets `400 AM-00042` both listing rights on and delegating `k6-not-delegable-resource` |
| `enduser-request-not-delegable.js` | Enduser request (v1) for `k6-not-delegable-resource`: `400` with `AM.VLD-00049` |
| `enduser-request-delegable.js` | Enduser request (v1) for `k6-delegable-resource`: created as `Pending`, then withdrawn |
| `enduser-request-v2-not-delegable.js` | Same as the v1 refusal, on v2 (at22 only) |
| `enduser-request-v2-delegable.js` | Same as the v1 request, on v2 (at22 only) |
| `service-owner-request-not-delegable.js` | Service owner request for `k6-not-delegable-resource`: `400` with `AM.VLD-00049` |
| `service-owner-request-delegable.js` | Service owner request for `k6-delegable-resource`: created as `Draft`, then withdrawn |

The service owner listing rights on, and delegating, a delegable resource is
covered by the existing `service-owner/connections` tests.

v2 of the enduser request API answered 404 in at23 and tt02 on 2026-11-25, so
the v2 tests are only scheduled in at22. Add an environment to
`delegable/functional.yaml` once it has v2.

Refusals go through the ordinary building blocks, called with the error status
the test expects (`expectedStatus`, as `ExchangeToken` does). They then return
the problem details, and the `CheckProblemCode` domain check reads the error
code. The service owner delegation is revoked afterwards either way. A request
that is wrongly accepted is not left to pile up, since asking again while one is
open returns that same request.

The instance delegation checks use a new random `urn:altinn:dialog-id:` each
run; the instance doesn't have to exist.

## `access-list/`

| Test | Checks | Scheduled |
| --- | --- | --- |
| `access-list-delegation-check.js` | Organization on no list for `k6-access-list-resource`: every right refused with `AccessListValidationFail`, resource and instance check | at22, at23, tt02 |
| `access-list-person.js` | A person is not affected by the access list | at22, at23, tt02 |
| `access-list-service-owner-delegation.js` | A service owner can't delegate `k6-access-list-resource` from an organization on no list (`400 AM-00053`) | Not yet |
| `access-list-membership.js` | Organization put on a list is allowed, and the service owner can delegate from it; lists limited to `read` and `READ`; removed from the list, refused again | By hand, about an hour |

- `access-list-service-owner-delegation.js` answered 200 instead of 400 in at22,
  at23 and tt02 on 2026-11-25, because bug Altinn/altinn-auth#4186 isn't fixed
  yet (PR #4831). Add it to `access-list/functional.yaml` and `run-all.js` once
  the fix is deployed.
- `access-list-membership.js` waits 11 minutes after every change, since the
  decision point caches access list memberships for 10 minutes in each pod
  (`PolicyCacheTimeout`), and so raises `maxDuration`. Its action filter steps
  fail in at22 and at23: with any action filter on the list, AM's delegation
  check refuses every action, because it sends the action to the decision
  point as a full URN while the filter holds `read`. That's a bug in AM, not in
  the test.

## `registry-sync/` (by hand only)

| Test | Checks | How long |
| --- | --- | --- |
| `delegable-flag-propagation.js` | Flipping `Delegable` in the registry reaches the delegation check within 3 minutes, measured as `local_resource_propagation_seconds` | A few minutes |
| `compare-registry-with-access-management.js` | AM agrees with the registry on `Delegable` and `AccessListMode` for every resource in the registry | A few minutes in at22/at23, about half an hour in tt02 |

There is no `run-all.js` here: both tests are run on purpose, one at a time.

- `delegable-flag-propagation.js` took 10–81 s per change in at22, at23 and tt02
  on 2026-11-25. It writes to `k6-delegable-toggle-resource` and always leaves
  it delegable.
- Don't run `compare-registry-with-access-management.js` while
  `delegable-flag-propagation.js` is running, or in the few minutes after it:
  the comparison will report `k6-delegable-toggle-resource` as a mismatch while
  the change is still on its way.
- `compare-registry-with-access-management.js` raises `maxDuration`: tt02 has
  over 5,000 resources, and a run cut off at k6's default 10 minutes ends
  before its checks and looks green. It prints only the resources that fail a
  check. Resources the registry has no policy for are only counted, since AM
  refuses them with `AM-00027` either way. A resource that changes while the
  comparison runs can show up as a mismatch once; run it again before reporting
  it.
- On 2026-11-25 it found `super-simple-service` (`delegable: false` in the
  registry, `true` in AM) in at22, at23 and tt02, and resources with a policy
  that AM doesn't know at all: `dodsbo.domstoladmin.api` in at23, and 70 in
  tt02. Every one of them has an owner code that isn't in Altinn's org list
  (`Digitaliseringsdirektoratet`, `KURS`, `BF`, `KMD`, `STFK`), which AM's
  import ignores. `super-simple-service` was republished with owner code
  `digdir` on 2026-11-25 and is correct in all three environments since.

The resolver changes (Altinn/altinn-auth#4793, #4795) can't be tested here: no
API calls the resolver.

## Resources

The test resources are owned by Digdir (`991825827`) and are set up with
`create-resources.js`:

- `k6-not-delegable-resource`: `delegable: false`.
- `k6-delegable-resource`: delegable. Never changed after it's set up.
- `k6-delegable-toggle-resource`: delegable. The propagation test flips it and
  puts it back. Running `create-resources.js` again also resets it.
- `k6-access-list-resource`: delegable, with access lists enforced. The access
  list tests create and delete the lists on it themselves.

All four use the same policy as `k6-serviceowner-resource-delegation`, which
grants DAGL. The daglig leder the tests act as therefore gets every right on a
delegable resource, so the flag or the access list is the only reason for a
refusal. All four are hidden from the portal (`visible: false`).

All four exist in at22, at23 and tt02. Run `create-resources.js` by hand, once
per environment, before the tests are scheduled there. It has no delete step,
because deleting a resource leaves rows behind
(Altinn/altinn-resource-registry#848). Access Management took about a minute to
import a new resource in at22, up to about five minutes in at23, and about 20
seconds in tt02.

```
k6 run K6/api/tests/access-management/resource-delegation-rules/create-resources.js
```

## Test data

The enduser calls act as the daglig ledere in
`testdata/access-management/enduser/request/<env>.csv`. Only rows that have
`userId` and `partyId` are used. yt01 has no such rows, so it isn't scheduled.

The first row's organization must never be on an access list for
`k6-access-list-resource`: the scheduled access list tests use it as the
organization on no list. `access-list-membership.js` puts the last row on a list
instead.
