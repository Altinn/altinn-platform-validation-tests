FROM altinnplatformvalidationtests.azurecr.io/generate-metrics-from-junit-report AS builder

FROM node:20-bookworm

RUN apt update && \
    apt upgrade -y && \
    apt install -y --no-install-recommends \
    git apt-transport-https ca-certificates curl gnupg lsb-release && \
    rm -rf /var/lib/apt/lists/*

# https://learn.microsoft.com/nb-no/cli/azure/install-azure-cli-linux?view=azure-cli-latest&pivots=apt#option-2-step-by-step-installation-instructions
RUN mkdir -p /etc/apt/keyrings && \
    curl -sLS https://packages.microsoft.com/keys/microsoft.asc | \
    gpg --dearmor | \
    tee /etc/apt/keyrings/microsoft.gpg > /dev/null && \
    chmod go+r /etc/apt/keyrings/microsoft.gpg

RUN AZ_DIST=$(lsb_release -cs) && \
    ARCH=$(dpkg --print-architecture) && \
    tee /etc/apt/sources.list.d/azure-cli.sources <<EOF
Types: deb
URIs: https://packages.microsoft.com/repos/azure-cli/
Suites: ${AZ_DIST}
Components: main
Architectures: ${ARCH}
Signed-by: /etc/apt/keyrings/microsoft.gpg
EOF

RUN apt-get update && apt-get install azure-cli

# https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-v10?toc=/azure/storage/blobs/toc.json&bc=/azure/storage/blobs/breadcrumb/toc.json#download-a-portable-binary
RUN curl -L -o azcopy.tar.gz https://aka.ms/downloadazcopy-v10-linux && \
    tar -xvf azcopy.tar.gz && \
    cp ./azcopy_linux_amd64_*/azcopy /usr/local/bin/ && \
    chmod +x /usr/local/bin/azcopy

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

ENV PATH=$PATH:/opt/az/bin

CMD ["bash", "./run-playwright-tests.sh"]
