This is a simple script to help us try to keep up to date with Swagger docs changes.

The goal is to let it run as a Github Action once a week and receive a Slack alert everytime a change is detected.

We need to update the clients/ and building_blocks/ folders to match the new changes.

Eventually also update tests.

run `go run .` in order to update the state file and download the new swagger docs versions.

The script does not cover the Access Management BFF. Whenever you run it, also check the
BFF by hand as described in [Access Management BFF](#access-management-bff).

Exit codes:
    0 = no changes
    1 = script error
    2 = change detected

## Access Management BFF

The BFF in [altinn-access-management-frontend](https://github.com/Altinn/altinn-access-management-frontend)
only serves its swagger when it runs with `ASPNETCORE_ENVIRONMENT=Development`, so no
environment publishes it and the script cannot fetch it. The copy in
`.swagger/altinn-access-management-frontend-bff.json` is updated by hand.

It is left out of the weekly workflow on purpose: fetching it means building and running the
frontend's `main` branch on the runner, in the same job as the Slack webhook secret.

To check it:

1. Update your checkout of altinn-access-management-frontend to the latest `main`. On
   Windows, keep the checkout path short; the build copies files with long names.

2. From `backend/src/Altinn.AccessManagement.UI/Altinn.AccessManagement.UI` in that checkout,
   build and start the BFF. In PowerShell:

   ```powershell
   dotnet build
   $env:ASPNETCORE_ENVIRONMENT = "Development"
   $env:ASPNETCORE_URLS = "http://localhost:5099"
   $env:KeyVaultSettings__SecretUri = "invalid"
   dotnet run --no-build --no-launch-profile
   ```

   Or in bash:

   ```bash
   dotnet build
   ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5099 \
     KeyVaultSettings__SecretUri=invalid dotnet run --no-build --no-launch-profile
   ```

   The invalid Key Vault URI makes the BFF skip Azure at startup; it logs the error and
   keeps going, and generating the swagger needs no backend. The BFF still runs as you, with
   access to whatever you are signed in to, as when you build that repo for any other reason.

3. From this folder, in another terminal, download the swagger over the copy (in
   PowerShell, write `curl.exe`):

   ```bash
   curl -sS http://localhost:5099/swagger/v1/swagger.json -o .swagger/altinn-access-management-frontend-bff.json
   ```

4. Stop the BFF, and run `git diff --stat .swagger/altinn-access-management-frontend-bff.json`.
   If the copy changed, update `K6/clients/access-management-bff` and
   `K6/api/building-blocks/access-management-bff` to match, as for the other documents.
