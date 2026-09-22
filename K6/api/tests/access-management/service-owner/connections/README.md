# Service owner resource delegation

The functional test delegates the dedicated resource
`k6-serviceowner-resource-delegation` between two Tenor organizations and
revokes it in the same iteration.

The resource is owned by Digdir (`991825827`), is hidden from the portal, and is
delegable. Its XACML policy grants `read` and `write` through the `jordbruk`
access package.

## Provisioning

Run the provisioner once per environment before enabling the functional test:

```bash
source K6/example_env/at22.sh
set -a
source K6/.env.local
set +a
k6 run --vus 1 --iterations 1 \
  K6/api/tests/access-management/service-owner/connections/provision-resource.js
```

The provisioner is idempotent. It creates or updates the resource and policy,
then verifies that both expected actions are available.

The resource has been provisioned in AT22, AT23, and TT02. The functional test
is registered only for AT22. Add later environments to `functional.yaml` after
the service-owner endpoints have been promoted and verified there.