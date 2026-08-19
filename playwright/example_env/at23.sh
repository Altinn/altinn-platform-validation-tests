# Source denne før du kjører Playwright-testene mot at23. Samme konvensjon som
# k6-testene, se K6/example_env/README.md. Fyll inn hemmelighetene selv, og hold
# fila utenfor repoet.

export AF_UI_BASE_URL="https://af.at23.altinn.cloud"
export AM_UI_BASE_URL="https://am.ui.at23.altinn.cloud"
export INFO_CLOUD_URL="https://info.at23.altinn.cloud"
export BASE_URL="https://platform.at23.altinn.cloud"
export ENVIRONMENT="at23"

# Syntetisk Tenor-bruker, måned 81-92.
export TEST_USER_PID="31851449372"
export TEST_USER_NAME="Ordinær Æresdoktor"

# Delt tilgangspassord for innlogging som syntetisk bruker.
export TEST_IDP_PASSWORD=
