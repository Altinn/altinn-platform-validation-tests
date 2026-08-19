# Source denne før du kjører Playwright-testene mot prod. Fyll inn testbrukeren og
# passordet selv, og hold fila utenfor repoet. Testbrukeren i prod skal ikke
# sjekkes inn noe sted.

export AF_UI_BASE_URL="https://af.altinn.no"
export AM_UI_BASE_URL="https://am.ui.altinn.no"
export INFO_CLOUD_URL="https://info.altinn.no"
export BASE_URL="https://platform.altinn.no"
export ENVIRONMENT="prod"

# Syntetisk Tenor-bruker, måned 81-92.
export TEST_USER_PID=
export TEST_USER_NAME=

# Delt tilgangspassord for innlogging som syntetisk bruker.
export TEST_IDP_PASSWORD=
