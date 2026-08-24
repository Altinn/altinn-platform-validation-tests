#!/usr/bin/env bash
set -euo pipefail

git clone https://github.com/Altinn/altinn-platform-validation-tests.git
cd altinn-platform-validation-tests/playwright

npm install

set +e
env=at23
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
    	--env $env \
        --verbose silly --print-config

    #curl \
    #    -s -X POST "$SLACK_WEBHOOK_URL" \
    #    -H 'Content-type: application/json' \
    #cl    --data "{\"text\":\"Playwright tests failed, report in: $REPORT_URL\"}"
else
    echo "All Playwright Tests ran successfully."
fi
