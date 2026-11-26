package k6manifest

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"testing"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// writeCronJob writes the CronJob for a config file at configPath (relative
// to the repository root, which is the test's folder) and returns the file
// name and the CronJob, or "" when none was written.
func writeCronJob(t *testing.T, configPath string, cf *ConfigFile) (string, map[string]any) {
	t.Helper()
	g := K8sManifestGenerator{CronJobDirectory: t.TempDir(), RepoRootDirectory: "."}
	if err := g.WriteCronJob(configPath, cf); err != nil {
		t.Fatal(err)
	}
	files, err := os.ReadDir(g.CronJobDirectory)
	if err != nil {
		t.Fatal(err)
	}
	if len(files) == 0 {
		return "", nil
	}
	if len(files) > 1 {
		t.Fatalf("expected one CronJob, got %d", len(files))
	}
	b, err := os.ReadFile(filepath.Join(g.CronJobDirectory, files[0].Name()))
	if err != nil {
		t.Fatal(err)
	}
	var cronJob map[string]any
	if err := json.Unmarshal(b, &cronJob); err != nil {
		t.Fatal(err)
	}
	return files[0].Name(), cronJob
}

// The golden file was made with hack/cronjob.jsonnet, which this is to
// replace. Only the generated-by label is different, testudo instead of
// github-action. jsonnet formats the file differently, so the values are
// compared, not the text.
func TestCronJobIsAsBefore(t *testing.T) {
	const name = "K6_api_tests_access-management-bff_access-packages_functional.json"
	g := K8sManifestGenerator{CronJobDirectory: t.TempDir(), RepoRootDirectory: "."}
	err := g.WriteCronJob("K6/api/tests/access-management-bff/access-packages/functional.yaml", &ConfigFile{Namespace: "access-management-bff"})
	if err != nil {
		t.Fatal(err)
	}
	got, want, equal := readJSONFilesAndCompareValues(t, filepath.Join(g.CronJobDirectory, name), filepath.Join("testdata", "cronjob", name))
	if !equal {
		t.Errorf("expected\n%s\nactual\n%s", want, got)
	}
}

func TestCronJobNameAndSchedule(t *testing.T) {
	for _, tt := range []struct {
		configPath, namespace, schedule  string
		wantFile, wantName, wantSchedule string
	}{
		{
			configPath: "K6/api/tests/access-management/tls-valid/healthcheck.yaml", namespace: "access-management",
			wantFile: "K6_api_tests_access-management_tls-valid_healthcheck.json", wantName: "tls-valid-healthcheck", wantSchedule: "*/15 * * * *",
		},
		{
			configPath: "./K6/browser/system-user/browser.yaml", namespace: "authentication",
			wantFile: "K6_browser_system-user_browser.json", wantName: "system-user-browser", wantSchedule: "*/15 * * * *",
		},
		{
			// Longer than 52 characters, so the vowels are removed.
			configPath: "K6/api/tests/access-management/resource-owner/get-authorized-parties/for-user-many-parties/functional.yaml", namespace: "access-management",
			wantFile: "K6_api_tests_access-management_resource-owner_get-authorized-parties_for-user-many-parties_functional.json", wantName: "rsrc-wnr-gt-thrzd-prts-fr-sr-mny-prts-fnctnl", wantSchedule: "*/15 * * * *",
		},
		{
			configPath: "K6/api/tests/access-management/resource-owner/get-authorized-parties/for-user-many-parties/smoke.yaml", namespace: "access-management",
			wantFile: "K6_api_tests_access-management_resource-owner_get-authorized-parties_for-user-many-parties_smoke.json", wantName: "rsrc-wnr-gt-thrzd-prts-fr-sr-mny-prts-smk", wantSchedule: "0 * * * *",
		},
		{
			// The schedule in the file wins over the default.
			configPath: "K6/api/tests/portaler/smoke.yaml", namespace: "portaler", schedule: "30 6 * * 1-5",
			wantFile: "K6_api_tests_portaler_smoke.json", wantName: "smoke", wantSchedule: "30 6 * * 1-5",
		},
		{
			// Breakpoint tests are only scheduled when the file says so.
			configPath: "K6/api/tests/access-management/consent/breakpoint.yaml", namespace: "access-management", schedule: "0 8 * * 1",
			wantFile: "K6_api_tests_access-management_consent_breakpoint.json", wantName: "consent-breakpoint", wantSchedule: "0 8 * * 1",
		},
	} {
		t.Run(tt.configPath, func(t *testing.T) {
			file, cronJob := writeCronJob(t, tt.configPath, &ConfigFile{Namespace: tt.namespace, Schedule: tt.schedule})
			if file != tt.wantFile {
				t.Errorf("file: expected %q, actual %q", tt.wantFile, file)
			}
			if cronJob == nil {
				return
			}
			if name := cronJob["metadata"].(map[string]any)["name"]; name != tt.wantName {
				t.Errorf("name: expected %q, actual %q", tt.wantName, name)
			}
			if schedule := cronJob["spec"].(map[string]any)["schedule"]; schedule != tt.wantSchedule {
				t.Errorf("schedule: expected %q, actual %q", tt.wantSchedule, schedule)
			}
		})
	}
}

func TestBreakpointWithoutScheduleGetsNoCronJob(t *testing.T) {
	if file, _ := writeCronJob(t, "K6/api/tests/access-management/consent/breakpoint.yaml", &ConfigFile{Namespace: "access-management"}); file != "" {
		t.Errorf("expected no CronJob, got %s", file)
	}
}

func TestInvalidSchedule(t *testing.T) {
	g := K8sManifestGenerator{CronJobDirectory: t.TempDir(), RepoRootDirectory: "."}
	for _, schedule := range []string{"*/15 * * *", "every 15 minutes please", "TZ=UTC 0 * * * *"} {
		err := g.WriteCronJob("K6/api/tests/portaler/smoke.yaml", &ConfigFile{Namespace: "portaler", Schedule: schedule})
		if !errors.Is(err, errs.Invalid) {
			t.Errorf("%q: expected errs.Invalid, got %v", schedule, err)
		}
	}
	for _, schedule := range []string{"@hourly", "0 8 * * 1"} {
		if err := g.WriteCronJob("K6/api/tests/portaler/smoke.yaml", &ConfigFile{Namespace: "portaler", Schedule: schedule}); err != nil {
			t.Errorf("%q: %v", schedule, err)
		}
	}
}

func TestConfigFileOutsideRepository(t *testing.T) {
	g := K8sManifestGenerator{CronJobDirectory: t.TempDir(), RepoRootDirectory: "testdata"}
	if err := g.WriteCronJob("cronjob_test.go", &ConfigFile{Namespace: "x"}); !errors.Is(err, errs.Invalid) {
		t.Errorf("expected errs.Invalid, got %v", err)
	}
}
