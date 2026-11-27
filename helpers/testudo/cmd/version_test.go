package cmd

import (
	"bytes"
	"encoding/json"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/buildinfo"
)

func TestWriteVersion(t *testing.T) {
	for _, tt := range []struct {
		name string
		info versionInfo
		want string
	}{
		{
			name: "built in a checkout with changes",
			info: versionInfo{Variant: "full", Info: buildinfo.Info{
				Commit:     "19963b6680dbcbb1328e5a459a827fcf1590384d",
				CommitTime: time.Date(2026, 11, 26, 11, 37, 50, 0, time.UTC),
				Modified:   true,
				GoVersion:  "go1.27.2",
				Platform:   "linux/amd64",
			}},
			want: `variant:     full
commit:      19963b6680dbcbb1328e5a459a827fcf1590384d, with changes that were not committed
commit time: 2026-11-26T11:37:50Z
go:          go1.27.2
platform:    linux/amd64
`,
		},
		{
			name: "installed with go install",
			info: versionInfo{Variant: "slim", Info: buildinfo.Info{
				Version:   "v0.0.0-20261126113750-19963b6680db",
				GoVersion: "go1.27.2",
				Platform:  "darwin/arm64",
			}},
			want: `version:     v0.0.0-20261126113750-19963b6680db
variant:     slim
commit:      unknown
commit time: unknown
go:          go1.27.2
platform:    darwin/arm64
`,
		},
		{
			name: "built without git",
			info: versionInfo{Variant: "slim", Info: buildinfo.Info{GoVersion: "go1.27.2", Platform: "windows/arm64"}},
			want: `variant:     slim
commit:      unknown
commit time: unknown
go:          go1.27.2
platform:    windows/arm64
`,
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			var out bytes.Buffer
			if err := writeVersion(&out, tt.info); err != nil {
				t.Fatal(err)
			}
			if out.String() != tt.want {
				t.Errorf("expected\n%s\nactual\n%s", tt.want, out.String())
			}
		})
	}
}

func TestVersion(t *testing.T) {
	out, err := execute("version")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{
		"variant:     " + variant + "\n",
		"go:          " + runtime.Version() + "\n",
		"platform:    " + runtime.GOOS + "/" + runtime.GOARCH + "\n",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("expected %q in\n%s", want, out)
		}
	}
}

func TestVersionJSON(t *testing.T) {
	out, err := execute("version", "--json")
	if err != nil {
		t.Fatal(err)
	}
	var got map[string]any
	if err := json.Unmarshal([]byte(out), &got); err != nil {
		t.Fatalf("not JSON: %v\n%s", err, out)
	}
	if got["variant"] != variant || got["goVersion"] != runtime.Version() || got["platform"] != runtime.GOOS+"/"+runtime.GOARCH {
		t.Errorf("expected variant, goVersion and platform, actual %s", out)
	}
}

func TestVersionDoesNotReadTheConfigFile(t *testing.T) {
	missing := filepath.Join(t.TempDir(), "missing.yaml")
	if _, err := execute("--config", missing, "version"); err != nil {
		t.Errorf("expected version to work without the config file, got %v", err)
	}
}

func TestVersionTakesNoArguments(t *testing.T) {
	if _, err := execute("version", "extra"); err == nil {
		t.Error("expected an error")
	}
}
