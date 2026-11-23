package k6manifest

import (
	"fmt"
	"path"
	"path/filepath"
	"slices"
	"strings"
)

type ConfigFile struct {
	Namespace string `yaml:"namespace"`
	BaseDir   string `yaml:"base_dir"`
	// Schedule is when the CronJob runs the tests in the file, as a cron
	// expression. Without it the default for the test type is used, see
	// cronJobSchedule.
	Schedule               string            `yaml:"schedule,omitempty"`
	TestDefinitions        []*TestDefinition `yaml:"test_definitions"`
	ValidEnvironmentValues []string          `yaml:"-"`
	ValidTestTypes         []string          `yaml:"-"`
}

type TestDefinition struct {
	TestScope  string         `yaml:"test_scope"`
	TestFile   string         `yaml:"test_file"`
	ConfigFile string         `yaml:"config_file"`
	EnvFile    string         `yaml:"env_file"`
	Contexts   []*TestContext `yaml:"contexts"`
}

type TestContext struct {
	Environment        string              `yaml:"environment"`
	NodeType           *string             `yaml:"node_type"`
	TestTypeDefinition *TestTypeDefinition `yaml:"test_type"`
	TestRun            *TestRun            `yaml:"test_run"`
}

type TestTypeDefinition struct {
	Type       *string `yaml:"type"`
	Enabled    bool    `yaml:"enabled"`
	ConfigFile string  `yaml:"config_file"`
}

type TestRun struct {
	Name             *string    `yaml:"name"`
	Id               *string    `yaml:"id,omitempty"`
	Parallelism      *int       `yaml:"parallelism"`
	Resources        *Resources `yaml:"resources"`
	Env              []*Env     `yaml:"env"`
	SecretReferences []*string  `yaml:"secrets"`
}

// Resources are also written to the TestRun, hence the json tags.
type Resources struct {
	Requests *Requests `yaml:"requests" json:"requests"`
}

type Requests struct {
	Memory *string `yaml:"memory" json:"memory"`
	Cpu    *string `yaml:"cpu" json:"cpu"`
}

type Env struct {
	Name  *string `yaml:"name"`
	Value *string `yaml:"value"`
}

func (cFile *ConfigFile) IsValidDeploymentEnvironment(environmentName string) bool {
	return slices.Contains(cFile.ValidEnvironmentValues, environmentName)
}

func (cFile *ConfigFile) IsValidTestType(testType string) bool {
	return slices.Contains(cFile.ValidTestTypes, testType)
}

func (cFile *ConfigFile) HasOnlyValidTestTypes() bool {
	for _, td := range cFile.TestDefinitions {
		for _, c := range td.Contexts {
			if c.TestTypeDefinition != nil && c.TestTypeDefinition.Type != nil && !cFile.IsValidTestType(*c.TestTypeDefinition.Type) {
				fmt.Printf("detected invalid test type: %s\n", *c.TestTypeDefinition.Type)
				return false
			}
		}
	}
	return true
}

func (cFile *ConfigFile) HasOnlyValidDeploymentEnvironments() bool {
	for _, td := range cFile.TestDefinitions {
		for _, c := range td.Contexts {
			if !cFile.IsValidDeploymentEnvironment(c.Environment) {
				fmt.Printf("detected invalid environment: %s\n", c.Environment)
				return false
			}
		}
	}
	return true
}

// Validates the config file the user generated
func (cFile *ConfigFile) IsValid() bool {
	// Validate envs are correct, that test files exist, that node types are valid, etc.
	return cFile.HasOnlyValidDeploymentEnvironments() && cFile.HasOnlyValidTestTypes()
}

// testTypeFromFileName is the test type of the tests in the config file at
// filePath when they do not set one: smoke, breakpoint or browser when the
// file name says so, and functional otherwise (healthcheck.yaml too).
func testTypeFromFileName(filePath string) string {
	fileName := filepath.Base(filePath)
	switch {
	case strings.Contains(fileName, "smoke"):
		return "smoke"
	case strings.Contains(fileName, "breakpoint"):
		return "breakpoint"
	case strings.Contains(fileName, "browser"):
		return "browser"
	default:
		return "functional"
	}
}

// Sets defaults for things that the user did not configure.
func (cFile *ConfigFile) SetDefaults(filePath string) {
	for _, td := range cFile.TestDefinitions {

		// The paths are relative to the repository root. They are joined with
		// forward slashes on every OS, since the test scope, names and
		// annotations below are made from them.
		if cFile.BaseDir != "" {
			if !strings.HasPrefix(td.TestFile, cFile.BaseDir) {
				td.TestFile = path.Join(cFile.BaseDir, td.TestFile)
			}
			if td.ConfigFile != "" && !strings.HasPrefix(td.ConfigFile, cFile.BaseDir) {
				td.ConfigFile = path.Join(cFile.BaseDir, td.ConfigFile)
			}
			if td.EnvFile != "" && !strings.HasPrefix(td.EnvFile, cFile.BaseDir) {
				td.EnvFile = path.Join(cFile.BaseDir, td.EnvFile)
			}
		}

		if td.TestScope == "" {
			td.TestScope = strings.Split(td.TestFile, "/")[len(strings.Split(td.TestFile, "/"))-2]
		}
		td.TestScope = strings.ReplaceAll(td.TestScope, "_", "-")

		for _, c := range td.Contexts {
			if c.TestTypeDefinition == nil {
				testType := testTypeFromFileName(filePath)
				c.TestTypeDefinition = &TestTypeDefinition{
					Type:    &testType,
					Enabled: true,
				}
			}
			if c.TestRun == nil {
				c.TestRun = &TestRun{}
			}
			if c.TestRun.Name == nil || *c.TestRun.Name == "" {
				c.TestRun.Name = sanitizeNameFromTestFileName(td.TestFile)
			}
			if c.TestRun.Id == nil || *c.TestRun.Id == "" {
				suffix := ""
				switch *c.TestTypeDefinition.Type {
				case "breakpoint":
					suffix = "-break"
				case "smoke":
					suffix = "-smoke"
				}

				tempString := sanitizeNameFromTestFileName(td.TestFile)
				defaultId := fmt.Sprintf("%s-%s%s", c.Environment, *tempString, suffix)
				c.TestRun.Id = &defaultId
			}
			if c.TestTypeDefinition.ConfigFile != "" && !strings.HasPrefix(c.TestTypeDefinition.ConfigFile, cFile.BaseDir) {
				c.TestTypeDefinition.ConfigFile = path.Join(cFile.BaseDir, c.TestTypeDefinition.ConfigFile)
			}
			if c.TestRun.Parallelism == nil || *c.TestRun.Parallelism <= 0 {
				tempInt := 1
				c.TestRun.Parallelism = &tempInt
			}
			if c.TestRun.Resources == nil {
				c.TestRun.Resources = &Resources{
					Requests: &Requests{},
				}
			}
			if c.TestRun.Resources.Requests.Memory == nil || *c.TestRun.Resources.Requests.Memory == "" {
				defaultMemoryRequests := "200Mi"
				if *c.TestTypeDefinition.Type == "breakpoint" {
					defaultMemoryRequests = "4Gi"
				}
				c.TestRun.Resources.Requests.Memory = &defaultMemoryRequests
			}
			if c.TestRun.Resources.Requests.Cpu == nil || *c.TestRun.Resources.Requests.Cpu == "" {
				defaultCpuRequests := "250m"
				if *c.TestTypeDefinition.Type == "breakpoint" {
					defaultCpuRequests = "2"
				}
				c.TestRun.Resources.Requests.Cpu = &defaultCpuRequests
			}
			found := false
			tokenGeneratorCreds := "token-generator-creds"
			for i := range c.TestRun.SecretReferences {
				if *c.TestRun.SecretReferences[i] == tokenGeneratorCreds {
					found = true
				}
			}
			if !found {
				c.TestRun.SecretReferences = append(c.TestRun.SecretReferences, &tokenGeneratorCreds)
			}
			if c.NodeType == nil || *c.NodeType == "" {
				// As of now we have enough capacity in the default node pool to run functional and smoke tests there.
				nodeType := "default"
				if *c.TestTypeDefinition.Type == "breakpoint" {
					nodeType = "spot"
				}
				c.NodeType = &nodeType
			}
		}
	}
}
