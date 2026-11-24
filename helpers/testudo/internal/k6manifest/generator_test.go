package k6manifest

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"strings"
	"sync/atomic"
	"testing"
	"text/template"
	"time"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// The paths in the example config files are relative to testdata.
func initGenerator(confDir, distDir, buildDir string) K8sManifestGenerator {
	return K8sManifestGenerator{
		ConfigDirectory:   confDir,
		DistDirectory:     distDir,
		BuildDirectory:    buildDir,
		RepoRootDirectory: "testdata",
	}
}

func validateConfigFolder(confDir string, testVersion string, t *testing.T) {
	_ = filepath.Walk(confDir, func(path string, info os.FileInfo, err error) error {
		if !info.IsDir() {
			t.Logf("Validating %s", path)
			_, deployEnv := getInfoFromFilePath(confDir, path)
			if info.Name() == "expanded-configfile.yaml" {
				generatedFile, knownExpectedFile, equalContents := readFilesAndCompareContents(path, fmt.Sprintf("./testdata/expected_generated_files/%s/expanded-configfile.yaml", testVersion))
				if !equalContents {
					t.Errorf("generate %s: expected \n%s, actual \n%s", testVersion, knownExpectedFile, generatedFile)
				}
			} else if info.Name() == "tweaked-testconfig.json" {
				generatedFile, knownExpectedFile, equalContents := readFilesAndCompareContents(path, fmt.Sprintf("./testdata/expected_generated_files/%s/%s/tweaked-testconfig.json", testVersion, deployEnv))
				if !equalContents {
					t.Errorf("generate %s: expected \n%s, actual \n%s", testVersion, knownExpectedFile, generatedFile)
				}
			}
		}
		return nil
	})
}

func validateTestRun(path, dirName, testVersion, deployEnv string, t *testing.T) {
	uniqName, err := extractUniqueIdFromGeneratedTestRun(path)
	if err != nil {
		t.Fatalf("error: %v", err)
	}
	manifestGenerationTimestamp := strings.Split(uniqName, "-")[1]
	// Ugly hack, but let's go with it until I refactor further.
	var testName string
	testName = strings.TrimPrefix(dirName, fmt.Sprintf("%s-", deployEnv))
	testName = strings.TrimSuffix(testName, "-breakpoint")
	testName = strings.TrimSuffix(testName, "-smoke")
	testName = strings.TrimSuffix(testName, "-spike")

	generatedFile, knownExpectedFile, equalContents := readFileAndCompareWithTemplatedFile(
		path,
		fmt.Sprintf("./testdata/expected_generated_files/%s/%s/testrun.json.tmpl", testVersion, deployEnv),
		map[string]string{
			"DirName":                     dirName,
			"DeployEnv":                   deployEnv,
			"ManifestGenerationTimestamp": manifestGenerationTimestamp,
			"TestName":                    testName,
			"TestId":                      dirName,
			"UniqName":                    uniqName,
		},
	)
	if !equalContents {
		t.Errorf("generate %s: expected \n%s, actual \n%s", testVersion, knownExpectedFile, generatedFile)
	}
}

func extractUniqueIdFromGeneratedTestRun(filepath string) (string, error) {
	generatedFile, err := os.ReadFile(filepath)
	if err != nil {
		log.Fatal(err)
	}

	var generatedTestRun unstructured.Unstructured
	err = json.Unmarshal([]byte(generatedFile), &generatedTestRun)
	if err != nil {
		return "", err
	}
	return generatedTestRun.GetName(), nil
}

func validateConfigMap(path, testVersion, dirName string, t *testing.T) {
	generatedFile, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("failed to read file %s: %v", path, err)
	}

	var generatedConfigMap corev1.ConfigMap
	err = json.Unmarshal([]byte(generatedFile), &generatedConfigMap)
	if err != nil {
		t.Fatalf("error: %v", err)
	}

	if !strings.Contains(generatedConfigMap.Name, dirName) {
		t.Errorf("generate %s: expected \n%s to contain \n%s", testVersion, generatedConfigMap.Name, dirName)
	}
	if !strings.Contains(generatedConfigMap.Annotations["k6-action-image/testid"], dirName) {
		t.Errorf("generate %s: expected \n%s, to contain \n%s", testVersion, generatedConfigMap.Annotations["k6-action-image/testid"], dirName)
	}
	if !(len(generatedConfigMap.Data["archive.tar"]) > 0) {
		t.Errorf("generate %s: expected length of data in key archive.tar to be over 0 , actual %d", testVersion, len(generatedConfigMap.Data["archive.tar"]))
	}
}

// TODO: Hacky just to test
func preTest(t *testing.T, version string, g *K8sManifestGenerator) {
	// The GitHub variables are added to the manifests, so they are removed
	// for the tests that do not set them, e.g. when the tests run in GitHub
	// Actions.
	for _, key := range []string{"GITHUB_REPOSITORY", "GITHUB_SERVER_URL", "GITHUB_RUN_ID", "GITHUB_BASE_REF", "GITHUB_HEAD_REF", "GITHUB_REF", "GITHUB_REF_NAME", "GITHUB_SHA"} {
		t.Setenv(key, "") // restores the value after the test
		os.Unsetenv(key)
	}
	if version == "v7" {
		g.CommandLineArgs = "-e runFullTestSet=true -e tokenGeneratorUserName=olanordmenn -e orgNoRecipient=1234 -e resourceId=abcd"
	}
	if version == "v10" {
		t.Setenv("GITHUB_REPOSITORY", "octocat/Hello-World")
		t.Setenv("GITHUB_SERVER_URL", "https://github.com")
		t.Setenv("GITHUB_RUN_ID", "14965885066")
		t.Setenv("GITHUB_REF", "refs/heads/main")
		// The expected files have slack-dev and slack-prod. They used to
		// come from GITHUB_REF; now they must be asked for.
		g.Slack = SlackEnvironment
	}
}

func TestSlackSecret(t *testing.T) {
	// GITHUB_REF no longer picks the channel.
	t.Setenv("GITHUB_REF", "refs/heads/main")
	for _, tt := range []struct {
		slack Slack
		env   string
		want  string
	}{
		{"", "prod", "slack-test"},
		{SlackTest, "at22", "slack-test"},
		{SlackTest, "prod", "slack-test"},
		{SlackEnvironment, "at22", "slack-dev"},
		{SlackEnvironment, "at23", "slack-dev"},
		{SlackEnvironment, "yt01", "slack-dev"},
		{SlackEnvironment, "tt02", "slack-prod"},
		{SlackEnvironment, "prod", "slack-prod"},
	} {
		got, err := slackSecret(tt.slack, tt.env)
		if err != nil || got != tt.want {
			t.Errorf("slackSecret(%q, %q): expected %q, actual %q (%v)", tt.slack, tt.env, tt.want, got, err)
		}
	}
	for _, tt := range []struct {
		slack Slack
		env   string
	}{
		{SlackEnvironment, "at21"},
		{"prod", "prod"},
	} {
		if _, err := slackSecret(tt.slack, tt.env); !errors.Is(err, errs.Invalid) {
			t.Errorf("slackSecret(%q, %q): expected errs.Invalid, got %v", tt.slack, tt.env, err)
		}
	}
}

func TestRunLimited(t *testing.T) {
	const n = 12
	for _, limit := range []int{1, 3, n} {
		var running, most atomic.Int32
		jobs := make([]func() error, n)
		for i := range jobs {
			jobs[i] = func() error {
				now := running.Add(1)
				defer running.Add(-1)
				for {
					m := most.Load()
					if now <= m || most.CompareAndSwap(m, now) {
						break
					}
				}
				// The later jobs finish first, so the errors are only in
				// order if runLimited puts them there.
				time.Sleep(time.Duration(n-i) * 2 * time.Millisecond)
				if i == 4 {
					panic("boom")
				}
				if i%3 == 0 {
					return fmt.Errorf("job %d", i)
				}
				return nil
			}
		}

		results := runLimited(limit, jobs)

		if got := most.Load(); got != int32(limit) {
			t.Errorf("limit %d: %d jobs ran at once", limit, got)
		}
		if len(results) != n {
			t.Fatalf("limit %d: expected %d results, got %d", limit, n, len(results))
		}
		for i, err := range results {
			if i == 4 {
				if err == nil || !strings.HasPrefix(err.Error(), "panic: boom\n") || !strings.Contains(err.Error(), "goroutine") {
					t.Errorf("limit %d: result 4: expected the panic and its stack, actual %v", limit, err)
				}
				continue
			}
			want := ""
			if i%3 == 0 {
				want = fmt.Sprintf("job %d", i)
			}
			got := ""
			if err != nil {
				got = err.Error()
			}
			if got != want {
				t.Errorf("limit %d: result %d: expected %q, actual %q", limit, i, want, got)
			}
		}
	}
}

func TestGenerateRejectsNegativeParallel(t *testing.T) {
	g := K8sManifestGenerator{Parallel: -1}
	if err := g.Generate(ConfigFile{}); !errors.Is(err, errs.Invalid) {
		t.Errorf("expected errs.Invalid, got %v", err)
	}
}

// failingTests has a test that is made, a test whose TestRun cannot be made
// after its ConfigMap is written, and a test whose file does not exist. The
// paths are relative to testdata.
const failingTests = `namespace: platform
test_definitions:
  - test_file: test_service/k8s_wrapper/get_deployments.js
    contexts:
      - environment: at22
        test_run:
          id: made
      - environment: at23
        node_type: nope
        test_run:
          id: unknown-node-type
  - test_file: test_service/k8s_wrapper/missing.js
    contexts:
      - environment: at22
        test_run:
          id: missing-file
`

func TestFailedTestsAreReportedAndLeaveNothingInDist(t *testing.T) {
	requireTools(t, "k6")
	g := initGenerator(t.TempDir(), t.TempDir(), t.TempDir())
	cf, err := g.Initialize(writeConfig(t, failingTests))
	if err != nil {
		t.Fatal(err)
	}

	err = g.Generate(*cf)

	if !errors.Is(err, errs.Invalid) {
		t.Fatalf("expected the unknown node type as errs.Invalid, got %v", err)
	}
	msg := err.Error()
	nodeType, missing := strings.Index(msg, "unknown-node-type: "), strings.Index(msg, "missing-file: ")
	if nodeType < 0 || missing < 0 || nodeType > missing {
		t.Errorf("expected the errors of unknown-node-type and missing-file, in that order, got\n%s", msg)
	}
	if strings.Contains(msg, "made: ") {
		t.Errorf("the test that was made is among the errors:\n%s", msg)
	}
	for _, f := range []string{"configmap.json", "testrun.json"} {
		if _, err := os.Stat(filepath.Join(g.DistDirectory, "made", f)); err != nil {
			t.Errorf("the test that was made: %v", err)
		}
	}
	for _, id := range []string{"unknown-node-type", "missing-file"} {
		if _, err := os.Stat(filepath.Join(g.DistDirectory, id)); !errors.Is(err, os.ErrNotExist) {
			t.Errorf("%s failed, but is in %s (%v)", id, g.DistDirectory, err)
		}
	}
}

// requireTools fails the test when one of the programs the generator runs is
// not on PATH.
func requireTools(t *testing.T, names ...string) {
	t.Helper()
	var missing []string
	for _, name := range names {
		if _, err := exec.LookPath(name); err != nil {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		t.Fatalf("%s must be on PATH to run this test", strings.Join(missing, ", "))
	}
}

var generateExamplesVersion = []string{
	"v1",
	"v2",
	"v3",
	"v4",
	"v5",
	"v6",
	"v7",
	"v8",
	"v9",
	"v10",
	"v11",
	"v12",
	"v13",
	"v14",
	"smoke",
}

func TestGenerate(t *testing.T) {
	requireTools(t, "k6")
	for _, version := range generateExamplesVersion {
		t.Run(version, func(t *testing.T) {
			testVersion := version
			distDir, confDir, buildDir := t.TempDir(), t.TempDir(), t.TempDir()
			g := initGenerator(confDir, distDir, buildDir)
			preTest(t, version, &g)
			cf, err := g.Initialize(fmt.Sprintf("./testdata/example_configfiles/%s.yaml", testVersion))
			if err != nil {
				t.Fatal(err)
			}
			if err := g.Generate(*cf); err != nil {
				t.Fatal(err)
			}

			validateConfigFolder(confDir, testVersion, t)

			_ = filepath.Walk(distDir, func(path string, info os.FileInfo, err error) error {
				if !info.IsDir() {
					t.Logf("Validating %s", path)
					dirName, deployEnv := getInfoFromFilePath(distDir, path)
					if info.Name() == "testrun.json" {
						validateTestRun(path, dirName, testVersion, deployEnv, t)
					} else if info.Name() == "configmap.json" {
						validateConfigMap(path, testVersion, dirName, t)
					} else if info.Name() == "slo.json" {
						// TODO
					}
				}
				return nil
			})
		})
	}
}

func readFilesAndCompareContents(filePath1 string, filePath2 string) (string, string, bool) {
	file1, err := os.ReadFile(filePath1)

	if err != nil {
		log.Fatal(err)
	}

	file2, err := os.ReadFile(filePath2)

	if err != nil {
		log.Fatal(err)
	}
	return string(file1), string(file2), string(file1) == string(file2)
}

func readFileAndCompareWithTemplatedFile(filePath1 string, filePath2 string, templateSubstitutions map[string]string) (string, string, bool) {
	file1, err := os.ReadFile(filePath1)

	if err != nil {
		log.Fatal(err)
	}

	tpl, err := template.ParseFiles(filePath2)
	if err != nil {
		log.Fatal(err)
	}
	buffer := bytes.Buffer{}
	err = tpl.Execute(&buffer, templateSubstitutions)
	if err != nil {
		log.Fatal(err)
	}
	file2 := buffer.String()

	return string(file1), file2, string(file1) == file2
}

// getInfoFromFilePath returns the first folder of path below root (the test
// id) and the environment the test id starts with.
func getInfoFromFilePath(root, path string) (dirName, deployEnv string) {
	rel, err := filepath.Rel(root, path)
	if err != nil {
		log.Fatal(err)
	}
	dirName = strings.Split(filepath.ToSlash(rel), "/")[0]
	deployEnv = strings.Split(dirName, "-")[0]
	return
}

var envVarOverrides = []struct {
	originalEnv map[string]string
	extraEnv    map[string]string
	mergedEnv   map[string]string
}{
	{
		originalEnv: map[string]string{},
		extraEnv:    map[string]string{},
		mergedEnv:   map[string]string{},
	},
	{
		originalEnv: map[string]string{"ENVFROMFILE1": "ENV1"},
		extraEnv:    map[string]string{},
		mergedEnv:   map[string]string{"ENVFROMFILE1": "ENV1"},
	},
	{
		originalEnv: map[string]string{},
		extraEnv:    map[string]string{"ENVFROMFILE1": "ENV1"},
		mergedEnv:   map[string]string{"ENVFROMFILE1": "ENV1"},
	},
	{
		originalEnv: map[string]string{"ENVFROMFILE1": "ENV1"},
		extraEnv:    map[string]string{"ENVFROMFILE2": "ENV2"},
		mergedEnv:   map[string]string{"ENVFROMFILE1": "ENV1", "ENVFROMFILE2": "ENV2"},
	},
	{
		originalEnv: map[string]string{"ENVFROMFILE1": "ENV1"},
		extraEnv:    map[string]string{"ENVFROMFILE1": "ENV2", "FOO": "BAR"},
		mergedEnv:   map[string]string{"ENVFROMFILE1": "ENV2", "FOO": "BAR"},
	},
}

func TestEnvOverride(t *testing.T) {
	for _, tt := range envVarOverrides {
		var original []*Env
		var extra []*Env
		for k, v := range tt.originalEnv {
			original = append(original, &Env{
				Name:  &k,
				Value: &v,
			})
		}
		for k, v := range tt.extraEnv {
			extra = append(extra, &Env{
				Name:  &k,
				Value: &v,
			})
		}
		result := handleExtraEnvVars(original, extra)
		resultMap := make(map[string]string)
		for _, v := range result {
			resultMap[*v.Name] = *v.Value
		}
		eq := reflect.DeepEqual(tt.mergedEnv, resultMap)
		if !eq {
			t.Errorf("TestEnvOverride: expected %v, actual %v", tt.mergedEnv, resultMap)
		}
	}
}

func TestJsonnetJSON(t *testing.T) {
	input := map[string]any{
		"b":          []any{},
		"a":          map[string]any{},
		"s":          "q\"b\\s/n\nt\tc\x01d\x7fe\u0085f<g>&h iæø\x00j\x1fk l",
		"r":          "a\bb\fc\rd~",
		"n":          1,
		"big":        12345678901,
		"z":          nil,
		"y":          true,
		"l":          []any{1, map[string]any{"x": "y"}},
		"e":          map[string]any{"k": []any{}},
		"Zcap":       "upper sorts first",
		"with space": "x",
		"_u":         "underscore",
	}
	got, err := jsonnetJSON(input)
	if err != nil {
		t.Fatal(err)
	}
	want, err := os.ReadFile("testdata/jsonnet_format/expected.json")
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != string(want) {
		t.Errorf("expected\n%s\nactual\n%s", want, got)
	}
}

// The archive is in data when it is valid UTF-8 and in binaryData otherwise,
// as when the ConfigMap was made with kubectl.
func TestConfigMapData(t *testing.T) {
	for _, tt := range []struct {
		name    string
		archive []byte
		binary  bool
	}{
		{"text", []byte("export default function () {}\x00\x00"), false},
		{"binary", []byte{0xff, 0xfe, 0x00}, true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			g := initGenerator(t.TempDir(), t.TempDir(), t.TempDir())
			if err := os.MkdirAll(filepath.Join(g.BuildDirectory, "id"), 0o755); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(filepath.Join(g.BuildDirectory, "id", "archive.tar"), tt.archive, 0o644); err != nil {
				t.Fatal(err)
			}
			if err := g.writeConfigMap("id", "scope-id", "at22-1-abcde", 1, "id", "name", "scope", "ns", "test.js"); err != nil {
				t.Fatal(err)
			}
			b, err := os.ReadFile(filepath.Join(g.DistDirectory, "id", "configmap.json"))
			if err != nil {
				t.Fatal(err)
			}
			var cm corev1.ConfigMap
			if err := json.Unmarshal(b, &cm); err != nil {
				t.Fatal(err)
			}
			got := []byte(cm.Data["archive.tar"])
			if tt.binary {
				got = cm.BinaryData["archive.tar"]
				if _, ok := cm.Data["archive.tar"]; ok {
					t.Error("binary archive is also in data")
				}
			}
			if !bytes.Equal(got, tt.archive) {
				t.Errorf("archive: expected %q, actual %q", tt.archive, got)
			}
			if cm.Kind != "ConfigMap" || cm.APIVersion != "v1" || cm.Name != "scope-id" || cm.Namespace != "ns" {
				t.Errorf("unexpected type or metadata: %+v %+v", cm.TypeMeta, cm.ObjectMeta)
			}
		})
	}
}

func TestUnknownNodeType(t *testing.T) {
	cluster, err := loadK6Cluster()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := newTestRun(testRunParameters{nodeType: "nope"}, cluster); !errors.Is(err, errs.Invalid) {
		t.Errorf("expected errs.Invalid, got %v", err)
	}
}
