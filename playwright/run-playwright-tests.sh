#!/usr/bin/env bash
set -euo pipefail

# git clone https://github.com/Altinn/altinn-platform-validation-tests.git
# cd altinn-platform-validation-tests/playwright
git clone https://github.com/monteiro-renato/altinn-access-management-frontend.git
cd altinn-access-management-frontend/playwright

npm i --prefix .

# npm run example || true # Needs to be the input
./node_modules/.bin/playwright test

set +e
/tmp/generateMetricsFromJunitReport
exit_code=$?
set -e

if [ "$exit_code" -eq 53 ]; then
    echo "Not all Playwright Tests ran successfully, uploading the report..."

    npx -y @azure/static-web-apps-cli deploy \
        --app-location "./playwright-report" \
        --deployment-token "$APP_TOKEN" \
        --subscription-id "$SUBSCRIPTION_ID" \
        --resource-group playwright-rg \
        --app-name playwright-reports-webapp \
        --swa-config-location /etc/swa-config/ \
    	--env Production # TODO: Tweak this

    #curl \
    #    -s -X POST "$SLACK_WEBHOOK_URL" \
    #    -H 'Content-type: application/json' \
    #    --data "{\"text\":\"Playwright tests failed, report in: $REPORT_URL\"}"
else
    echo "All Playwright Tests ran successfully."
fi
