FROM altinnplatformvalidationtests.azurecr.io/generate-metrics-from-junit-report AS builder

FROM node:24-trixie@sha256:5ac1f09047e215d1e4df7fbdf95ff86ca14a35632380b6672d6c9c62d5ac3800

RUN apt update && \
    apt upgrade -y && \
    apt install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g \
    playwright \
    @azure/static-web-apps-cli

RUN useradd -m playwright

ENV PLAYWRIGHT_BROWSERS_PATH=/home/playwright/.cache/ms-playwright

RUN playwright install --with-deps

WORKDIR /tmp

COPY --from=builder /app/generateMetricsFromJunitReport .

COPY --chown=playwright:playwright ./run-playwright-tests.sh .

USER playwright

CMD ["bash", "./run-playwright-tests.sh"]
