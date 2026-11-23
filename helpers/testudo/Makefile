# Builds and tests testudo. Run `make help` to list the targets.
#
# The recipes need a POSIX shell. On Windows, run make from Git Bash.

BINARY   := testudo
BIN_DIR  := bin
DIST_DIR := dist

# Platforms for `make build-all`, as GOOS/GOARCH. Override to build fewer, e.g.
# make build-all PLATFORMS="linux/amd64 windows/amd64"
PLATFORMS ?= linux/amd64 linux/arm64 darwin/amd64 darwin/arm64 windows/amd64 windows/arm64

# .exe on Windows, empty elsewhere.
EXE := $(shell go env GOEXE)

# Builds for other machines are static (no cgo) and leave out local paths and
# debug info.
RELEASE_FLAGS := -trimpath -ldflags="-s -w"

# GOOS and GOARCH of the platform target being built, e.g. linux/amd64.
os   = $(word 1,$(subst /, ,$@))
arch = $(word 2,$(subst /, ,$@))

.DEFAULT_GOAL := build

##@ General

.PHONY: help
help: ## Show this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

.PHONY: build
build: ## Build testudo for this machine into bin/.
	go build -o $(BIN_DIR)/$(BINARY)$(EXE) .

.PHONY: install
install: ## Install testudo into GOBIN, so it runs from any folder.
	go install .

.PHONY: test
test: ## Run the tests.
	go test ./...

.PHONY: vet
vet: ## Run go vet.
	go vet ./...

.PHONY: fmt
fmt: ## Format the code with gofmt.
	gofmt -w .

.PHONY: check
check: ## Check formatting, then run go vet and the tests.
	@files=$$(gofmt -l .); if [ -n "$$files" ]; then echo "Not formatted with gofmt:"; echo "$$files"; exit 1; fi
	go vet ./...
	go test ./...

##@ Release

.PHONY: build-all
build-all: $(PLATFORMS) ## Build testudo for Linux, macOS and Windows into dist/.

# One target per platform, so `make linux/arm64` builds just that one and
# `make -j build-all` builds them in parallel.
.PHONY: $(PLATFORMS)
$(PLATFORMS):
	GOOS=$(os) GOARCH=$(arch) CGO_ENABLED=0 go build $(RELEASE_FLAGS) \
		-o $(DIST_DIR)/$(BINARY)-$(os)-$(arch)$(if $(filter windows,$(os)),.exe) .

.PHONY: clean
clean: ## Remove bin/ and dist/.
	rm -rf $(BIN_DIR) $(DIST_DIR)
