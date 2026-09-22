# Service owner resource delegation

The functional test calls the service-owner API as Digdir and delegates the
dedicated resource `k6-serviceowner-resource-delegation` from one Tenor
organization to another. Digdir is the resource owner and the only party
authorized to perform the delegation. The two Tenor organizations are the
`from` and `to` parties in the resulting connection; they do not call the
service-owner API themselves.

The resource is owned by Digdir (`991825827`), is hidden from the portal, and is
delegable. Its XACML policy grants `read` and `write` through the `jordbruk`
access package.

The resource has been provisioned in AT22, AT23, and TT02. The functional test
is registered only for AT22. Add later environments to `functional.yaml` after
the service-owner endpoints have been promoted and verified there.