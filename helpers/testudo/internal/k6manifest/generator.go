// Package k6manifest makes the Kubernetes manifests that run K6 tests in the
// k6 cluster. It reads a config file such as functional.yaml or smoke.yaml,
// and for each test in it makes a k6 archive, a ConfigMap that holds the
// archive and a TestRun for the k6 operator. WriteCronJob makes the CronJob
// that runs the tests in the file on a schedule.
//
// The code was moved here from actions/generate-k6-manifests in
// altinn-platform. It used kubectl for the ConfigMap and jsonnet for the
// TestRun; both are made in Go now, and the files are the same as before,
// except that the generated-by label is testudo.
package k6manifest

import (
	"bytes"
	"embed"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"maps"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	yaml "gopkg.in/yaml.v3"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// generatedBy is the generated-by label on the ConfigMaps, TestRuns, runner
// pods and CronJobs testudo makes. The generator in altinn-platform wrote
// k6-action-image, and github-action on the CronJobs.
const generatedBy = "testudo"

// defaultScenarios has the load profile for each test type, used when the
// test's own config file does not set one.
//
//go:embed assets/default_scenarios/*.json
var defaultScenarios embed.FS

type K8sManifestGenerator struct {
	ConfigDirectory   string
	DistDirectory     string
	BuildDirectory    string
	CronJobDirectory  string
	RepoRootDirectory string
	// CommandLineArgs are extra arguments for k6, e.g. "--vus 23 -e FOO=bar".
	// They are added to the arguments of the TestRun, and each -e/--env
	// KEY=VALUE is also set as an environment variable for the test.
	CommandLineArgs string
	// Slack picks the Slack secret the tests get. Empty means SlackTest.
	Slack Slack
	// Parallel is how many tests are made at the same time, and so how many
	// k6 archive processes run at once. Zero means GOMAXPROCS, which follows
	// the CPU limit of the container the generator runs in.
	Parallel int
	// GenerationTime is when the manifests are made. Every test in a run gets
	// it, in MANIFEST_GENERATION_TIMESTAMP, the generation_timestamp label
	// and the TestRun name. It must be set: the command sets it to the time
	// it runs, and the tests to a fixed time.
	GenerationTime time.Time
}

// ReadConfigFile reads the config file at filePath and checks it, without
// filling in defaults.
func ReadConfigFile(filePath string) (*ConfigFile, error) {
	yfile, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("read config file: %w", err)
	}

	cf := ConfigFile{
		ValidEnvironmentValues: []string{
			"at22",
			"at23",
			"tt02",
			"yt01",
			"prod",
		},
		ValidTestTypes: []string{
			"functional",
			"smoke",
			"soak",
			"spike",
			"breakpoint",
			"browser",
			"custom",
		},
	}

	// Keys the config file format does not have are an error, so a typo such
	// as enviroment: is not silently ignored. An empty file has no tests.
	dec := yaml.NewDecoder(bytes.NewReader(yfile))
	dec.KnownFields(true)
	if err := dec.Decode(&cf); err != nil && !errors.Is(err, io.EOF) {
		return nil, fmt.Errorf("%w: %s: %v", errs.Invalid, filePath, err)
	}

	if !cf.IsValid() {
		return nil, fmt.Errorf("%w: %s is not a valid config file", errs.Invalid, filePath)
	}
	return &cf, nil
}

// Initialize reads the config file at filePath, fills in the defaults and
// writes the result to <ConfigDirectory>/expanded-configfile.yaml.
func (r K8sManifestGenerator) Initialize(filePath string) (*ConfigFile, error) {
	cf, err := ReadConfigFile(filePath)
	if err != nil {
		return nil, err
	}
	cf.SetDefaults(filePath)

	requiredDirs := []string{
		r.ConfigDirectory,
		r.BuildDirectory,
		r.DistDirectory,
	}

	for _, d := range requiredDirs {
		if _, err := os.Stat(d); os.IsNotExist(err) {
			err := os.Mkdir(d, 0775)
			if err != nil {
				return nil, fmt.Errorf("create the %s directory: %w", d, err)
			}
		}
	}

	d, err := yaml.Marshal(cf)
	if err != nil {
		return nil, err
	}
	err = os.WriteFile(fmt.Sprintf("%s/expanded-configfile.yaml", r.ConfigDirectory), d, 0644)
	if err != nil {
		return nil, fmt.Errorf("write the expanded config file: %w", err)
	}

	return cf, nil
}

func (r K8sManifestGenerator) generate(td *TestDefinition, c *TestContext, cf ConfigFile, envFileSlice []*Env, envOptions []*Env, cluster k6Cluster) error {
	manifestGenerationTimestamp := r.GenerationTime.UnixMilli()

	mergedEnvs := handleExtraEnvVars(c.TestRun.Env, envFileSlice)
	mergedEnvs = handleExtraEnvVars(mergedEnvs, getGithubRelatedVars())
	mergedEnvs = handleExtraEnvVars(mergedEnvs, envOptions)

	testFilename := td.TestFile

	k6ArchiveArgs := []string{
		"--env", fmt.Sprintf("%s=%s", "K6_NO_USAGE_REPORT", "true"),
		"--env", fmt.Sprintf("%s=%s", "K6_PROMETHEUS_RW_SERVER_URL", cluster.PrometheusRWServerURL),
		"--env", fmt.Sprintf("%s=%s", "K6_PROMETHEUS_RW_TREND_STATS", k6TrendStats),

		"--env", fmt.Sprintf("%s=%s", "ENVIRONMENT", c.Environment),
		"--env", fmt.Sprintf("%s=%s", "NAMESPACE", cf.Namespace),
		"--env", fmt.Sprintf("%s=%d", "MANIFEST_GENERATION_TIMESTAMP", manifestGenerationTimestamp),
		"--env", fmt.Sprintf("%s=%s", "TEST_SCOPE", td.TestScope),
		"--env", fmt.Sprintf("%s=%s", "TESTID", *c.TestRun.Id),
		"--env", fmt.Sprintf("%s=%s", "TEST_NAME", *c.TestRun.Name),
		"--env", fmt.Sprintf("%s=%s", "TESTFILENAME", testFilename),
	}
	if *c.TestTypeDefinition.Type == "functional" {
		k6ArchiveArgs = append(k6ArchiveArgs, "--env", fmt.Sprintf("%s=%s", "K6_PROMETHEUS_RW_PUSH_INTERVAL", "1s"))
	}
	for _, env := range mergedEnvs {
		k6ArchiveArgs = append(k6ArchiveArgs, "--env", fmt.Sprintf("%s=%s", *env.Name, *env.Value))
	}

	var configFile map[string]any
	var err error
	if *c.TestTypeDefinition.Type != "custom" {
		if *c.TestTypeDefinition.Type == "breakpoint" {
			configFile, err = r.HandleBreakpointConfigFile(mergedEnvs)
		} else {
			configFile, err = r.HandleConfigFile(td.ConfigFile, *c.TestTypeDefinition.Type)
			if err == nil && c.TestTypeDefinition.ConfigFile != "" {
				configFile, err = r.HandleConfigFileOverride(configFile, c.TestTypeDefinition.ConfigFile)
			}
		}
		if err != nil {
			return err
		}
	}

	uniqName := testRunName(c.Environment, *c.TestRun.Id, manifestGenerationTimestamp)
	testScope := td.TestScope
	dirName := *c.TestRun.Id
	newpath := filepath.Join(r.ConfigDirectory, dirName)
	testConfigFileToUse := fmt.Sprintf("%s/tweaked-testconfig.json", newpath)

	marshalledConfigFile, err := json.MarshalIndent(configFile, "", "  ")
	if err != nil {
		return err
	}

	if err = os.MkdirAll(newpath, os.ModePerm); err != nil {
		return err
	}

	err = os.WriteFile(testConfigFileToUse, marshalledConfigFile, 0644)
	if err != nil {
		return err
	}

	err = r.CallK6Archive(dirName, testConfigFileToUse, fmt.Sprintf("%s/%s", r.RepoRootDirectory, td.TestFile), k6ArchiveArgs)
	if err != nil {
		return err
	}

	configMapName := fmt.Sprintf("%s-%s", td.TestScope, *c.TestRun.Id)

	err = r.writeConfigMap(dirName, configMapName, uniqName, manifestGenerationTimestamp, *c.TestRun.Id, *c.TestRun.Name, testScope, cf.Namespace, testFilename)
	if err != nil {
		return err
	}

	secretReferences := make([]string, 0, len(c.TestRun.SecretReferences)+1)
	for _, s := range c.TestRun.SecretReferences {
		secretReferences = append(secretReferences, *s)
	}
	slack, err := slackSecret(r.Slack, c.Environment)
	if err != nil {
		return err
	}
	secretReferences = append(secretReferences, slack)

	imageName := "ghcr.io/altinn/altinn-platform/k6-image:v2.2.0"
	if *c.TestTypeDefinition.Type == "browser" {
		imageName = "grafana/k6:2.2.0-with-browser"
	}

	return r.writeTestRun(testRunParameters{
		dirName:                     dirName,
		configMapName:               configMapName,
		uniqName:                    uniqName,
		testName:                    *c.TestRun.Name,
		manifestGenerationTimestamp: strconv.FormatInt(manifestGenerationTimestamp, 10),
		namespace:                   cf.Namespace,
		environment:                 c.Environment,
		parallelism:                 *c.TestRun.Parallelism,
		nodeType:                    *c.NodeType,
		secretReferences:            secretReferences,
		extraEnvVars:                mergedEnvs,
		resources:                   c.TestRun.Resources,
		imageName:                   imageName,
		testid:                      *c.TestRun.Id,
		testScope:                   testScope,
		testFilename:                testFilename,
	}, cluster)
}

// Generate makes the manifests for every enabled test in cf. Up to Parallel
// tests are made at the same time. A test that fails, or panics, does not
// stop the others; the errors are returned together, in the order of the
// config file, each with the id of its test. A test that fails leaves nothing
// in DistDirectory, so applying it only applies the tests that were made in
// full.
//
// k6 must be on PATH. Generate does not check it; the command does, with
// tools.Require, before it starts.
func (r K8sManifestGenerator) Generate(cf ConfigFile) error {
	if !r.Slack.Valid() {
		return fmt.Errorf("%w: unknown Slack setting %q", errs.Invalid, r.Slack)
	}
	if r.Parallel < 0 {
		return fmt.Errorf("%w: Parallel must be 0 or more, got %d", errs.Invalid, r.Parallel)
	}
	if r.GenerationTime.IsZero() {
		return fmt.Errorf("%w: GenerationTime must be set", errs.Invalid)
	}
	cluster, err := loadK6Cluster()
	if err != nil {
		return err
	}

	// Command line args, used mainly with ad-hoc tests
	envOptions := getEnvVarsFromCliArgs(r.CommandLineArgs)

	// Every env file is read before any test is made, and all that cannot be
	// read are reported.
	var failed []error
	envFiles := make([][]*Env, len(cf.TestDefinitions))
	for i, td := range cf.TestDefinitions {
		if td.EnvFile != "" {
			envFiles[i], err = parseEnvFile(fmt.Sprintf("%s/%s", r.RepoRootDirectory, td.EnvFile))
			if err != nil {
				failed = append(failed, err)
			}
		}
	}
	if len(failed) > 0 {
		return errors.Join(failed...)
	}

	var ids []string
	var jobs []func() error
	for i, td := range cf.TestDefinitions {
		for _, c := range td.Contexts {
			if !*c.TestTypeDefinition.Enabled {
				continue
			}
			ids = append(ids, *c.TestRun.Id)
			jobs = append(jobs, func() error {
				return r.generate(td, c, cf, envFiles[i], envOptions, cluster)
			})
		}
	}
	parallel := r.Parallel
	if parallel == 0 {
		parallel = runtime.GOMAXPROCS(0)
	}
	for i, err := range runLimited(parallel, jobs) {
		if err == nil {
			continue
		}
		// A test that failed halfway may have written its ConfigMap but not
		// its TestRun.
		if rmErr := os.RemoveAll(filepath.Join(r.DistDirectory, ids[i])); rmErr != nil {
			err = errors.Join(err, rmErr)
		}
		failed = append(failed, fmt.Errorf("%s: %w", ids[i], err))
	}
	return errors.Join(failed...)
}

// runLimited runs the jobs, at most limit at a time, and returns their errors
// in the order of jobs. A job that fails does not stop the others, and a job
// that panics gets the panic and its stack as its error, so the other jobs
// still finish.
func runLimited(limit int, jobs []func() error) []error {
	results := make([]error, len(jobs))
	// A job takes a slot before its goroutine starts, so no more than limit
	// goroutines exist at once.
	slots := make(chan struct{}, max(limit, 1))
	var wg sync.WaitGroup
	for i, job := range jobs {
		slots <- struct{}{}
		wg.Go(func() {
			defer func() { <-slots }()
			defer func() {
				if p := recover(); p != nil {
					results[i] = fmt.Errorf("panic: %v\n%s", p, debug.Stack())
				}
			}()
			results[i] = job()
		})
	}
	wg.Wait()
	return results
}

func (r K8sManifestGenerator) HandleConfigFileOverride(base map[string]any, overrideConfigFile string) (map[string]any, error) {
	override := map[string]any{}

	overrideConfig, err := os.ReadFile(fmt.Sprintf("%s/%s", r.RepoRootDirectory, overrideConfigFile))
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal([]byte(overrideConfig), &override)
	if err != nil {
		return nil, fmt.Errorf("%w: %s: %v", errs.Invalid, overrideConfigFile, err)
	}

	_, okst := base["stages"]
	_, oksc := base["scenarios"]

	_, okit := override["iterations"]
	_, okvus := override["vus"]
	_, okduration := override["duration"]

	if (okit || okvus || okduration) && (okst || oksc) {
		delete(base, "stages")
		delete(base, "scenarios")
	}

	maps.Copy(base, override)

	return base, nil
}

func (r K8sManifestGenerator) HandleBreakpointConfigFile(envSlice []*Env) (map[string]any, error) {
	env := map[string]string{}
	for _, e := range envSlice {
		if strings.HasPrefix(*e.Name, "BREAKPOINT_") {
			env[*e.Name] = *e.Value
		}
	}
	var breakPointConf BreakpointConfig

	defaultScenario, err := defaultScenarios.ReadFile("assets/default_scenarios/breakpoint.json")
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal([]byte(defaultScenario), &breakPointConf)
	if err != nil {
		return nil, err
	}

	duration, ok := env["BREAKPOINT_STAGE_DURATION"]
	if ok {
		breakPointConf.Stages[0].Duration = duration
	}

	target, ok := env["BREAKPOINT_STAGE_TARGET"]
	if ok {
		i, err := strconv.Atoi(target)
		if err != nil {
			return nil, fmt.Errorf("%w: BREAKPOINT_STAGE_TARGET must be a whole number, got %q", errs.Invalid, target)
		}
		breakPointConf.Stages[0].Target = i
	}

	abortOnFail, ok := env["BREAKPOINT_STAGE_ABORTONFAIL"]
	if ok {
		b, err := strconv.ParseBool(abortOnFail)
		if err != nil {
			return nil, fmt.Errorf("%w: BREAKPOINT_STAGE_ABORTONFAIL must be true or false, got %q", errs.Invalid, abortOnFail)
		}
		for k := range breakPointConf.Thresholds {
			for idx := range breakPointConf.Thresholds[k] {
				breakPointConf.Thresholds[k][idx].AbortOnFail = b
			}
		}
	}

	// TODO: Hacky, make a better interface as we are likely to do something similar with smoke tests, etc.
	var gInterface map[string]any
	breakPointConfMarshalled, err := json.Marshal(breakPointConf)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(breakPointConfMarshalled, &gInterface)
	if err != nil {
		return nil, err
	}

	return gInterface, nil
}

func (r K8sManifestGenerator) HandleConfigFile(defaultConfigFile string, testType string) (map[string]any, error) {
	mergedOut := map[string]any{}

	if defaultConfigFile != "" {
		testConfig, err := os.ReadFile(fmt.Sprintf("%s/%s", r.RepoRootDirectory, defaultConfigFile))
		if err != nil {
			return nil, err
		}
		err = json.Unmarshal([]byte(testConfig), &mergedOut)
		if err != nil {
			return nil, fmt.Errorf("%w: %s: %v", errs.Invalid, defaultConfigFile, err)
		}
	}

	_, okst := mergedOut["stages"]
	_, oksc := mergedOut["scenarios"]
	_, okit := mergedOut["iterations"]
	_, okvus := mergedOut["vus"]
	_, okduration := mergedOut["duration"]
	// Don't override if users configured it.
	if !(okst || oksc || okit || okvus || okduration) {
		defaultScenario, err := defaultScenarios.ReadFile(fmt.Sprintf("assets/default_scenarios/%s.json", testType))
		if err != nil {
			return nil, err
		}
		temp := map[string]any{}
		err = json.Unmarshal([]byte(defaultScenario), &temp)
		if err != nil {
			return nil, err
		}
		maps.Copy(mergedOut, temp)
	}
	return mergedOut, nil
}

func (r K8sManifestGenerator) CallK6Archive(dirName string, testConfigFileToUse string, testFile string, k6ArchiveArgs []string) error {
	newpath := filepath.Join(r.BuildDirectory, dirName)
	err := os.MkdirAll(newpath, os.ModePerm)
	if err != nil {
		return err
	}
	// https://grafana.com/docs/k6/latest/using-k6/environment-variables/#-the--e-flag-does-not-configure-options
	// https://grafana.com/docs/k6/latest/reference/archive/#how-to-create-and-run-an-archive
	// https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/#the-init-stage
	var out, errb strings.Builder
	k6Args := []string{"archive"}
	k6Args = append(k6Args, k6ArchiveArgs...)

	if testConfigFileToUse != "" {
		k6Args = append(k6Args, "--config", testConfigFileToUse)
	}
	k6Args = append(k6Args, testFile, "-O", fmt.Sprintf("%s/archive.tar", newpath))

	cmd := exec.Command("k6", k6Args...)
	cmd.Stdout = &out
	cmd.Stderr = &errb
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("k6 archive %s: %w\n%s", testFile, err, errb.String())
	}
	return nil
}

// writeConfigMap writes the ConfigMap with the k6 archive to
// <DistDirectory>/<dirName>/configmap.json. It is the ConfigMap that
// kubectl create configmap --from-file makes: the archive is in data when it
// is valid UTF-8, and in binaryData otherwise.
func (r K8sManifestGenerator) writeConfigMap(dirName, configMapName, uniqName string, generationTimestamp int64, testId, testName, testScope, namespace, testFilename string) error {
	archive, err := os.ReadFile(fmt.Sprintf("%s/%s/archive.tar", r.BuildDirectory, dirName))
	if err != nil {
		return err
	}

	configMap := corev1.ConfigMap{
		TypeMeta: metav1.TypeMeta{Kind: "ConfigMap", APIVersion: "v1"},
		ObjectMeta: metav1.ObjectMeta{
			Name:      configMapName,
			Namespace: namespace,
			Labels: map[string]string{
				"generated-by":         generatedBy,
				"uniq_name":            uniqName,
				"generation_timestamp": strconv.FormatInt(generationTimestamp, 10),
			},
			Annotations: map[string]string{
				"k6-action-image/test_name":    testName,
				"k6-action-image/test_scope":   testScope,
				"k6-action-image/testid":       testId,
				"k6-action-image/testfilename": testFilename,
			},
		},
	}
	if utf8.Valid(archive) {
		configMap.Data = map[string]string{"archive.tar": string(archive)}
	} else {
		configMap.BinaryData = map[string][]byte{"archive.tar": archive}
	}

	configMapMarshalled, err := json.MarshalIndent(configMap, "", "  ")
	if err != nil {
		return err
	}

	newpath := filepath.Join(r.DistDirectory, dirName)
	err = os.MkdirAll(newpath, os.ModePerm)
	if err != nil {
		return err
	}

	err = os.WriteFile(fmt.Sprintf("%s/configmap.json", newpath), configMapMarshalled, 0644)
	if err != nil {
		return fmt.Errorf("write the ConfigMap for %s: %w", uniqName, err)
	}
	return nil
}
