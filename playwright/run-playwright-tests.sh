#!/usr/bin/env bash
set -euo pipefail

git clone https://github.com/Altinn/altinn-platform-validation-tests.git
cd altinn-platform-validation-tests/playwright

npm install

set +e
npm run test:at23 # Needs to be the input
playwright_exit=$?
/tmp/generateMetricsFromJunitReport
metrics_exit=$?
set -e

# 53 er "noen tester feilet". En exit-kode fra Playwright uten at metrics sier fra
# betyr at kjøringen aldri kom i gang, for eksempel en globalSetup som stoppet den.
# Da er rapporten tom, og tomt må ikke leses som grønt.
if [ "$metrics_exit" -eq 53 ] || [ "$playwright_exit" -ne 0 ]; then
    echo "Not all Playwright Tests ran successfully, uploading the report..."

    npx -y @azure/static-web-apps-cli deploy \
        --app-location "./playwright-report" \
        --deployment-token "$APP_TOKEN" \
        --subscription-id "$SUBSCRIPTION_ID" \
        --resource-group playwright-rg \
        --app-name playwright-reports-webapp \
        --swa-config-location /etc/swa-config/ \
    	--env Production

    curl \
        -s -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-type: application/json' \
        --data "{\"text\":\"Playwright tests failed, report in: $REPORT_URL\"}"
else
    echo "All Playwright Tests ran successfully."
fi
