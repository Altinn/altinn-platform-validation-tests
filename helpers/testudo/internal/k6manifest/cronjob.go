package k6manifest

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// The schedules for config files without a schedule.
const (
	defaultFunctionalSchedule = "*/15 * * * *" // every 15 minutes
	defaultSmokeSchedule      = "0 * * * *"    // every hour
)

// The CronJob runs the generator in the cluster: it clones the repository,
// makes the manifests for the config file and applies them. The image and
// the generator in it are still the ones from altinn-platform.
const (
	cronJobImage  = "ghcr.io/altinn/altinn-platform/k6-action-image:v0.0.42"
	cronJobScript = "git clone https://github.com/Altinn/altinn-platform-validation-tests.git; cd altinn-platform-validation-tests/; generate-k6-manifests; kubectl apply --server-side -f .dist/ -R || true"
)

// maxCronJobNameLength is the longest name a CronJob can have, since
// Kubernetes adds 11 characters to it for the names of its Jobs.
const maxCronJobNameLength = 52

// cronJobSchedule is the schedule for the config file at configPath: the one
// in the file, or else the default for the test type of the file. Breakpoint
// tests have no default, so they only get a CronJob with a schedule.
func cronJobSchedule(configPath string, cf *ConfigFile) string {
	if cf.Schedule != "" {
		return cf.Schedule
	}
	switch testTypeFromFileName(configPath) {
	case "smoke":
		return defaultSmokeSchedule
	case "breakpoint":
		return ""
	default: // functional (and healthcheck) and browser
		return defaultFunctionalSchedule
	}
}

// validSchedule reports whether s looks like a schedule Kubernetes accepts:
// five fields, or a macro such as @hourly.
func validSchedule(s string) bool {
	return strings.HasPrefix(s, "@") || len(strings.Fields(s)) == 5
}

// WriteCronJob writes the CronJob that runs the tests in the config file at
// configPath on its schedule, to <CronJobDirectory>/<file>.json. Nothing is
// written for a breakpoint config file without a schedule.
func (r K8sManifestGenerator) WriteCronJob(configPath string, cf *ConfigFile) error {
	schedule := cronJobSchedule(configPath, cf)
	if schedule == "" {
		return nil
	}
	if !validSchedule(schedule) {
		return fmt.Errorf("%w: %s: schedule %q is not a cron expression with five fields", errs.Invalid, configPath, schedule)
	}
	repoPath, err := r.repoPath(configPath)
	if err != nil {
		return err
	}
	b, err := jsonnetJSON(newCronJob(repoPath, cf.Namespace, schedule))
	if err != nil {
		return err
	}
	if err := os.MkdirAll(r.CronJobDirectory, os.ModePerm); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(r.CronJobDirectory, cronJobFileName(repoPath)), b, 0644)
}

// repoPath is configPath relative to the root of the repository, the way
// `find ./K6` wrote it in the script this replaces, e.g.
// ./K6/api/tests/portaler/smoke.yaml. The CronJob runs from the root of the
// repository, and its name and file name are made from this path.
func (r K8sManifestGenerator) repoPath(configPath string) (string, error) {
	root, err := filepath.Abs(r.RepoRootDirectory)
	if err != nil {
		return "", err
	}
	abs, err := filepath.Abs(configPath)
	if err != nil {
		return "", err
	}
	rel, err := filepath.Rel(root, abs)
	if err != nil || strings.HasPrefix(rel, "..") {
		return "", fmt.Errorf("%w: %s is not in the repository", errs.Invalid, configPath)
	}
	return "./" + filepath.ToSlash(rel), nil
}

// cronJobName is the name of the CronJob for the config file: the path below
// the team folder, with dashes, e.g. consent-functional. A name longer than
// Kubernetes allows loses its vowels. The names are the same as the ones
// cronjob.jsonnet made, so applying replaces the CronJobs in the cluster.
func cronJobName(repoPath, namespace string) string {
	name := strings.ReplaceAll(repoPath, namespace+"/", "")
	name = strings.ReplaceAll(name, "./K6/browser/", "")
	name = strings.ReplaceAll(name, "./K6/api/tests/", "")
	name = strings.ReplaceAll(name, "/", "-")
	name = strings.ReplaceAll(name, ".yaml", "")
	name = strings.ToLower(name)
	if len(name) > maxCronJobNameLength {
		name = strings.NewReplacer("a", "", "e", "", "i", "", "o", "", "u", "").Replace(name)
	}
	return name
}

// cronJobFileName is the file the CronJob is written to, e.g.
// K6_api_tests_portaler_smoke.json.
func cronJobFileName(repoPath string) string {
	name := strings.ReplaceAll(repoPath, ".yaml", "")
	name = strings.ReplaceAll(name, "./", "")
	return strings.ReplaceAll(name, "/", "_") + ".json"
}

func newCronJob(repoPath, namespace, schedule string) map[string]any {
	return map[string]any{
		"apiVersion": "batch/v1",
		"kind":       "CronJob",
		"metadata": map[string]any{
			"name":      cronJobName(repoPath, namespace),
			"namespace": namespace,
			"labels": map[string]any{
				"generated-by": "github-action",
			},
		},
		"spec": map[string]any{
			"schedule":          schedule,
			"concurrencyPolicy": "Forbid",
			"jobTemplate": map[string]any{
				"spec": map[string]any{
					"template": map[string]any{
						"spec": map[string]any{
							"serviceAccount": "k6",
							"containers": []any{
								map[string]any{
									"name":    "generate-manifests",
									"image":   cronJobImage,
									"command": []any{"/bin/sh"},
									"args":    []any{"-c", cronJobScript},
									"env": []any{
										map[string]any{"name": "INPUT_CONFIG_FILE", "value": repoPath},
									},
								},
							},
							"restartPolicy": "Never",
						},
					},
				},
			},
		},
	}
}
