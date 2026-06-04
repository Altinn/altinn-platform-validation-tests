#!/usr/bin/env bash
set -euo pipefail

git clone https://github.com/Altinn/altinn-platform-validation-tests.git
cd altinn-platform-validation-tests/playwright

npm install -D \
    @playwright/test \
    playwright-bdd

npm run example # Needs to be the input

/tmp/generateMetricsFromJunitReport

# TODO: It doesn't make sense to publish the report all the time.
# Maybe exit with a specific error code from the command above and decide to publish the report
# and send a slack message.

#npx -y @azure/static-web-apps-cli deploy \
#    --app-location "./playwright-report" \
#    --deployment-token "$APP_TOKEN" \
#    --subscription-id "$SUBSCRIPTION_ID" \
#    --resource-group playwright-rg \
#    --app-name playwright-reports-webapp \
#    --swa-config-location /etc/swa-config/ \
#	 --env Production
