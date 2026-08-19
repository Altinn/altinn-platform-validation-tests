FROM altinnplatformvalidationtests.azurecr.io/generate-metrics-from-junit-report AS builder

FROM node:24-trixie@sha256:66bb8d36ae1ddd72199ed235a089904874ca4079ee517936ca3adb80506a75c1

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
