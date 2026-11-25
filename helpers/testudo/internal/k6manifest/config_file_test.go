package k6manifest

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"

	yaml "gopkg.in/yaml.v3"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// writeConfig writes content to functional.yaml in a new folder and returns
// the path.
func writeConfig(t *testing.T, content string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "functional.yaml")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestUnknownKeysAreRejected(t *testing.T) {
	for _, tt := range []struct {
		name, key, content string
	}{
		{"top level", "namspace", `
namspace: platform
test_definitions: []
`},
		{"context", "enviroment", `
namespace: platform
test_definitions:
  - test_file: k6/first_test.js
    contexts:
      - enviroment: yt01
`},
		{"resources", "limits", `
namespace: platform
test_definitions:
  - test_file: k6/first_test.js
    contexts:
      - environment: yt01
        test_run:
          resources:
            limits:
              cpu: "1"
`},
	} {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ReadConfigFile(writeConfig(t, tt.content))
			if !errors.Is(err, errs.Invalid) {
				t.Fatalf("expected errs.Invalid, got %v", err)
			}
			if !strings.Contains(err.Error(), tt.key) {
				t.Errorf("the error does not name %q: %v", tt.key, err)
			}
		})
	}
}

func TestKnownKeysAreAccepted(t *testing.T) {
	for name, content := range map[string]string{
		"empty file": "",
		"every key": `
namespace: platform
base_dir: k6
schedule: "0 8 * * 1"
test_definitions:
  - test_file: first_test.js
    test_scope: first
    config_file: config.json
    env_file: env.env
    contexts:
      - environment: yt01
        node_type: spot
        test_type:
          type: smoke
          enabled: true
          config_file: smoke.json
        test_run:
          name: first
          id: yt01-first
          parallelism: 2
          resources:
            requests:
              memory: 1Gi
              cpu: "1"
          env:
            - name: FOO
              value: bar
          secrets:
            - token-generator-creds
`,
	} {
		if _, err := ReadConfigFile(writeConfig(t, content)); err != nil {
			t.Errorf("%s: %v", name, err)
		}
	}
}

// A test runs unless its file says enabled: false, also when test_type is
// there without enabled.
func TestEnabledDefaultsToTrue(t *testing.T) {
	for _, tt := range []struct {
		name, testType string
		want           bool
	}{
		{"no test_type", "", true},
		{"test_type without enabled", "\n        test_type:\n          type: smoke", true},
		{"enabled: true", "\n        test_type:\n          type: smoke\n          enabled: true", true},
		{"enabled: false", "\n        test_type:\n          type: smoke\n          enabled: false", false},
	} {
		t.Run(tt.name, func(t *testing.T) {
			path := writeConfig(t, `
namespace: platform
test_definitions:
  - test_file: k6/first_test.js
    contexts:
      - environment: yt01`+tt.testType+"\n")
			cf, err := ReadConfigFile(path)
			if err != nil {
				t.Fatal(err)
			}
			cf.SetDefaults(path)
			if got := *cf.TestDefinitions[0].Contexts[0].TestTypeDefinition.Enabled; got != tt.want {
				t.Errorf("expected enabled %t, actual %t", tt.want, got)
			}
		})
	}
}

var validEnvironmentsTests = []struct {
	envName  string // input
	expected bool   // expected result
}{
	{"at21", false},
	{"at22", true},
	{"at23", true},
	{"at25", false},
	{"", false},
	{"yt01", true},
	{"prod", true},
	{"custom", true},
	{"randomstring", false},
	{"tt02", true},
}

func TestIsValidDeploymentEnvironment(t *testing.T) {
	configFile := ConfigFile{
		ValidEnvironmentValues: []string{
			"at22",
			"at23",
			"tt02",
			"yt01",
			"prod",
			"custom",
		},
	}

	for _, tt := range validEnvironmentsTests {
		actual := configFile.IsValidDeploymentEnvironment(tt.envName)
		if actual != tt.expected {
			t.Errorf("isValidDeploymentEnvironment(%s): expected %t, actual %t", tt.envName, tt.expected, actual)
		}
	}
}

func TestDefaults(t *testing.T) {
	var bareMinimumConfig = `
namespace: platform
test_definitions:
  - test_file: services/k6/first_test.js
    contexts:
      - environment: yt01
`
	configFile := ConfigFile{
		ValidEnvironmentValues: []string{
			"at22",
			"at23",
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

	err := yaml.Unmarshal([]byte(bareMinimumConfig), &configFile)
	if err != nil {
		t.Fatalf("error: %v", err)
	}

	if !configFile.IsValid() {
		t.Errorf("Expected config file to be valid, but it's not")
	}

	configFile.SetDefaults("")

	if configFile.Namespace != "platform" {
		t.Errorf("setDefaults: expected %s, actual %s", "platform", configFile.Namespace)
	}
	if configFile.TestDefinitions[0].TestFile != "services/k6/first_test.js" {
		t.Errorf("setDefaults: expected %s, actual %s", "services/k6/first_test.js", configFile.TestDefinitions[0].TestFile)
	}
	if configFile.TestDefinitions[0].Contexts[0].Environment != "yt01" {
		t.Errorf("setDefaults: expected %s, actual %s", "yt01", configFile.TestDefinitions[0].Contexts[0].Environment)
	}
	if *configFile.TestDefinitions[0].Contexts[0].NodeType != "default" {
		t.Errorf("setDefaults: expected %s, actual %s", "default", *configFile.TestDefinitions[0].Contexts[0].NodeType)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestTypeDefinition.Type != "functional" {
		t.Errorf("setDefaults: expected %s, actual %s", "functional", *configFile.TestDefinitions[0].Contexts[0].TestTypeDefinition.Type)
	}
	if !*configFile.TestDefinitions[0].Contexts[0].TestTypeDefinition.Enabled {
		t.Errorf("setDefaults: expected enabled, actual disabled")
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Name != "first-test" {
		t.Errorf("setDefaults: expected %s, actual %s", "first-test", *configFile.TestDefinitions[0].Contexts[0].TestRun.Name)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Parallelism != 1 {
		t.Errorf("setDefaults: expected %d, actual %d", 1, *configFile.TestDefinitions[0].Contexts[0].TestRun.Parallelism)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Memory != "200Mi" {
		t.Errorf("setDefaults: expected %s, actual %s", "200Mi", *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Memory)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Cpu != "250m" {
		t.Errorf("setDefaults: expected %s, actual %s", "250m", *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Cpu)
	}
}

func TestTwoTests(t *testing.T) {
	var bareMinimumConfig = `
namespace: platform

test_definitions:
  - test_file: services/k6/test_k8s_wrapper_get_deployments.js
    contexts:
      - environment: at22
  - test_file: services/k6/test_k8s_wrapper_get_daemonsets.js
    contexts:
      - environment: at22
`
	configFile := ConfigFile{
		ValidEnvironmentValues: []string{
			"at22",
			"at23",
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

	err := yaml.Unmarshal([]byte(bareMinimumConfig), &configFile)
	if err != nil {
		t.Fatalf("error: %v", err)
	}

	if !configFile.IsValid() {
		t.Errorf("Expected config file to be valid, but it's not")
	}

	configFile.SetDefaults("")

	if configFile.Namespace != "platform" {
		t.Errorf("setDefaults: expected %s, actual %s", "platform", configFile.Namespace)
	}
	if configFile.TestDefinitions[0].TestFile != "services/k6/test_k8s_wrapper_get_deployments.js" {
		t.Errorf("setDefaults: expected %s, actual %s", "services/k6/test_k8s_wrapper_get_deployments.js", configFile.TestDefinitions[0].TestFile)
	}
	if configFile.TestDefinitions[0].Contexts[0].Environment != "at22" {
		t.Errorf("setDefaults: expected %s, actual %s", "at22", configFile.TestDefinitions[0].Contexts[0].Environment)
	}
	if *configFile.TestDefinitions[0].Contexts[0].NodeType != "default" {
		t.Errorf("setDefaults: expected %s, actual %s", "default", *configFile.TestDefinitions[0].Contexts[0].NodeType)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestTypeDefinition.Type != "functional" {
		t.Errorf("setDefaults: expected %s, actual %s", "functional", *configFile.TestDefinitions[0].Contexts[0].TestTypeDefinition.Type)
	}
	if !*configFile.TestDefinitions[0].Contexts[0].TestTypeDefinition.Enabled {
		t.Errorf("setDefaults: expected enabled, actual disabled")
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Name != "test-k8s-wrapper-get-deployments" {
		t.Errorf("setDefaults: expected %s, actual %s", "test-k8s-wrapper-get-deployments", *configFile.TestDefinitions[0].Contexts[0].TestRun.Name)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Parallelism != 1 {
		t.Errorf("setDefaults: expected %d, actual %d", 1, *configFile.TestDefinitions[0].Contexts[0].TestRun.Parallelism)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Memory != "200Mi" {
		t.Errorf("setDefaults: expected %s, actual %s", "200Mi", *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Memory)
	}
	if *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Cpu != "250m" {
		t.Errorf("setDefaults: expected %s, actual %s", "250m", *configFile.TestDefinitions[0].Contexts[0].TestRun.Resources.Requests.Cpu)
	}
}
