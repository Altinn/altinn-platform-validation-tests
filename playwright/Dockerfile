FROM altinnplatformvalidationtests.azurecr.io/generate-metrics-from-junit-report AS builder

FROM node:24-trixie@sha256:f7d34e58713740f9eef9092c0bd6ff10369d132f7238399a4b270f16d47fa608

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
