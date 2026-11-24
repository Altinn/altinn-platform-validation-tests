# Swagger docs

Every app has two swaggers, with a separate client for each.

`app-api/` follows "Altinn App API", `/{org}/{app}/swagger/v1/swagger.json`. It lists the controllers in
app-lib-dotnet, which every app has, so the clients take the org and the app as parameters. It has no
operationIds or summaries, so the methods are named after the controller actions.
https://ttd.apps.tt02.altinn.no/ttd/brukermonster-test-app/swagger/index.html?urls.primaryName=Altinn+App+API

`brukermonster-test-app/` follows the end user swagger for ttd/brukermonster-test-app,
`/{org}/{app}/v1/customOpenapi.json`, which documents the API that app offers its users, with its own
data types. It has no operationIds, so the methods are named after the summaries.
https://ttd.apps.tt02.altinn.no/ttd/brukermonster-test-app/swagger/index.html?urls.primaryName=End+user+app+API+for+ttd%2Fbrukermonster-test-app
