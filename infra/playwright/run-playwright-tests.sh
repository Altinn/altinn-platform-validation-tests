#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:?Environment must be provided}"

git clone https://github.com/Altinn/altinn-platform-validation-tests.git
cd altinn-platform-validation-tests/playwright

npm install

set +e
npm run "test:${ENVIRONMENT}"
playwright_exit=$?

generateMetricsFromJunitReport
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
    --env "$ENVIRONMENT" \
    --verbose silly --print-config

if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    echo "Sending Slack notification..."

    # Bare testtitler, ikke feilmeldinger: de kan inneholde testdata fra prod.
    payload=$(METRICS_EXIT="$metrics_exit" PLAYWRIGHT_EXIT="$playwright_exit" ENVIRONMENT="$ENVIRONMENT" REPORT_URL="$REPORT_URL" node -e '
const { METRICS_EXIT, PLAYWRIGHT_EXIT, ENVIRONMENT, REPORT_URL } = process.env;
const miljo = ENVIRONMENT === "prod" ? "Produksjon" : ENVIRONMENT;
if (METRICS_EXIT !== "53") {
    console.log(JSON.stringify({ text: `:warning: *${miljo}*: Playwright-kjøringen kom ikke i gang (exit ${PLAYWRIGHT_EXIT}). Rapporten er tom, sjekk poddloggen.` }));
    process.exit(0);
}
const report = JSON.parse(require("fs").readFileSync("test-results.json", "utf8"));
const failed = [];
const walk = suite => {
    for (const child of suite.suites ?? []) walk(child);
    for (const spec of suite.specs ?? []) if (!spec.ok) failed.push(spec.title);
};
report.suites.forEach(walk);
const { expected, unexpected, flaky } = report.stats;
const list = failed.slice(0, 10).map(title => `• ${title}`).join("\n");
const more = failed.length > 10 ? `\n…og ${failed.length - 10} til` : "";
console.log(JSON.stringify({ text: `:red_circle: *${miljo}*: ${unexpected} av ${expected + unexpected + flaky} Playwright-tester feilet\n${list}${more}\nRapport: ${REPORT_URL}` }));
')

    curl \
        -s -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-type: application/json' \
        --data "$payload"
fi


else
    echo "All Playwright Tests ran successfully."
fi