#!/usr/bin/env bash
set -euo pipefail

git clone https://github.com/Altinn/altinn-platform-validation-tests.git
cd altinn-platform-validation-tests/playwright

npm install --silent -D \
    @playwright/test \
    playwright-bdd

npm run native || true # Needs to be the input

set +e
/tmp/generateMetricsFromJunitReport
exit_code=$?
set -e
exit_code=53
if [ "$exit_code" -eq 53 ]; then
    echo "Not all Playwright Tests ran successfully, uploading the report..."

    # export AZCOPY_AUTO_LOGIN_TYPE=DEVICE
    az login --identity --only-show-errors --output none
    azcopy login --login-type workload

    azcopy cp \
    --log-level=ERROR \
    --recursive \
    "./playwright-report/data/*" \
    "https://playwrightartifacts6546.blob.core.windows.net/playwright-artifacts" \
    >/dev/null 2>&1 \
    && echo "AzCopy succeeded" \
    || echo "AzCopy failed"

    rm -rf playwright-report/data/

    npx -y @azure/static-web-apps-cli deploy \
        --app-location "./playwright-report" \
        --deployment-token "$APP_TOKEN" \
        --subscription-id "$SUBSCRIPTION_ID" \
        --resource-group playwright-rg \
        --app-name playwright-reports-webapp \
        --swa-config-location /etc/swa-config/ \
    	--env Production

    #curl \
    #    -s -X POST "$SLACK_WEBHOOK_URL" \
    #    -H 'Content-type: application/json' \
    #cl    --data "{\"text\":\"Playwright tests failed, report in: $REPORT_URL\"}"
else
    echo "All Playwright Tests ran successfully."
fi
