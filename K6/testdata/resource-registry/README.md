# Resource Registry test data

Read in `setup` by the [resource-registry tests](../../api/tests/resource-registry/README.md), one file per
environment. The files are fetched over HTTP from `main`, so a change takes effect when it is merged; for a local run
against a branch, set `TESTDATA_BRANCH=<branch>`. A missing or empty file fails the test in `setup`.

## Files

| File | Rows | Columns | Used for |
| --- | --- | --- | --- |
| `resources-<env>.csv` | 2 | `owner,ownerOrgNo,resourceId,actions` | Resources with access lists disabled, with the org that owns them and the actions of their policy. The v2 policy rights test checks the decomposed policy against `actions`. See [Resources](../../api/tests/resource-registry/README.md#resources). |
| `access-list-enforced-resources-<env>.csv` | 1 | `owner,ownerOrgNo,resourceId,actions` | Resources with access lists enabled, so membership decides access. The access list enforcement test connects its list to one of them. |

The enforcement test also reads organizations with their daglig leder from
`K6/testdata/authorization/pdp-authorize/orgs-dagl-<env>.csv`, which belongs to the authorization tests.

## Regenerating the files

**Resources.** Pick a resource the owner org has in the environment, with access lists disabled so a connection made
by a test grants nobody anything, and list the actions its policy grants with `actions` separated by `;`.
`GET /resourceregistry/api/v2/resource/{id}/policy/rights` shows the actions. `owner` is the org code and
`ownerOrgNo` its organization number; the enterprise token is issued for them.

**Enforced resources.** The same columns, for a resource with `accessListMode` set to `Enabled` and a policy that
grants the daglig leder role. `k6-tilgangsliste-test` is owned by ttd and was published for this in at22, at23 and
tt02; the `publish-test-resource` skill in `.claude/skills` describes how to publish another one.
