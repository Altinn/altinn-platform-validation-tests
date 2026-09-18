FROM altinnplatformvalidationtests.azurecr.io/helpers-junitparser:1.0.1 AS builder

FROM node:24-bookworm@sha256:6dac556d980b7f0e5498d08f08cee0ca67798b4ad6c23964a9214920e67758d0

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

ARG PLAYWRIGHT_VERSION

RUN npm install -g \
    playwright@${PLAYWRIGHT_VERSION} \
    @azure/static-web-apps-cli@v2.0.10

RUN useradd -m playwright

ENV PLAYWRIGHT_BROWSERS_PATH=/home/playwright/.cache/ms-playwright

RUN playwright install --with-deps

WORKDIR /home/playwright/

COPY --from=builder /app/generateMetricsFromJunitReport .

COPY --chown=playwright:playwright ./run-playwright-tests.sh .

USER playwright


# TODO: try to cache this inside the image? Instead of having to download it every time
#RUN mkdir -p ~/.swa/deploy/689a6c1fe8fc32f40348cc41223a7e9d83dd43d2 && \
#    curl -L \
#    https://swalocaldeployv2-bndtgugjgqc3dhdx.b01.azurefd.net/downloads/689a6c1fe8fc32f40348cc41223a7e9d83dd43d2/linux/StaticSitesClient@689a6c1fe8fc32f40348cc41223a7e9d83dd43d2 \
#    -o ~/.swa/deploy/689a6c1fe8fc32f40348cc41223a7e9d83dd43d2/StaticSitesClient

ENV PATH=$PATH:/opt/az/bin

ENTRYPOINT ["bash", "./run-playwright-tests.sh"]
