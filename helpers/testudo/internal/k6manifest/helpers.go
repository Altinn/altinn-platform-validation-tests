package k6manifest

import (
	"bufio"
	"crypto/sha256"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	orderedmap "github.com/elliotchance/orderedmap/v3"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

func getEnvVarsFromCliArgs(cliArgs string) []*Env {
	var envOptions []*Env
	args := strings.Fields(cliArgs)
	for i, arg := range args {
		if strings.HasPrefix(arg, "-e") || strings.HasPrefix(arg, "--env") {
			if i < len(args)-1 {
				keyValue := strings.Split(args[i+1], "=")
				if len(keyValue) == 2 {
					key := keyValue[0]
					value := keyValue[1]
					envOptions = append(envOptions, &Env{Name: &key, Value: &value})
				}
			}
		}
	}
	return envOptions
}

func sanitizeNameFromTestFileName(pathToTestFile string) *string {
	// TODO: might need more validation here..
	tempString := filepath.Base(pathToTestFile)
	tempString = strings.ReplaceAll(tempString, "_", "-")
	// Remove .js or .ts
	tempString = strings.TrimSuffix(tempString, filepath.Ext(tempString))
	return &tempString
}

// testRunName is the name of a TestRun, which is also its uniq_name label:
// <environment>-<timestamp>-<suffix>. The five-character suffix is made from
// the test id and the timestamp, so the tests in a run get different names,
// and the same test and time always give the same name.
func testRunName(environment, testID string, timestamp int64) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	sum := sha256.Sum256(fmt.Appendf(nil, "%s\x00%d", testID, timestamp))
	suffix := make([]byte, 5)
	for i := range suffix {
		suffix[i] = letters[int(sum[i])%len(letters)]
	}
	return fmt.Sprintf("%s-%d-%s", environment, timestamp, suffix)
}

func parseEnvFile(filePath string) ([]*Env, error) {
	envFromFile := []*Env{}
	tempFile, err := os.Open(filePath)

	if err != nil {
		return nil, fmt.Errorf("open env file: %w", err)
	}
	defer tempFile.Close()

	scanner := bufio.NewScanner(tempFile)
	for scanner.Scan() {
		line := scanner.Text()
		// Skip empty lines and comments
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		keyValue := strings.Split(line, "=")
		if len(keyValue) != 2 {
			return nil, fmt.Errorf("%w: %s: expected %q to have the format KEY=VALUE", errs.Invalid, filePath, line)
		}
		envFromFile = append(envFromFile, &Env{
			Name:  &keyValue[0],
			Value: &keyValue[1],
		})
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("read env file: %w", err)
	}
	return envFromFile, nil
}

func handleExtraEnvVars(original []*Env, extra []*Env) []*Env {
	newEnv := []*Env{}
	m := orderedmap.NewOrderedMap[string, string]()
	for _, o := range original {
		m.Set(*o.Name, *o.Value)
	}
	for _, e := range extra {
		m.Set(*e.Name, *e.Value)
	}
	for k, v := range m.AllFromFront() {
		newEnv = append(newEnv, &Env{
			Name:  &k,
			Value: &v,
		})
	}
	return newEnv
}

// Slack says which Slack secret the TestRun gets. The tests post failed
// checks to the channel in it, see K6/slack.js.
type Slack string

const (
	// SlackTest gives every test slack-test. It is the default, so a run
	// from a branch or a laptop does not post to the team channels.
	SlackTest Slack = "test"
	// SlackEnvironment gives slack-dev for at22, at23 and yt01, and
	// slack-prod for tt02 and prod.
	SlackEnvironment Slack = "environment"
)

// Valid reports whether s is one of the Slack settings. Empty means
// SlackTest.
func (s Slack) Valid() bool {
	return s == "" || s == SlackTest || s == SlackEnvironment
}

// slackSecret is the Slack secret for a test in env.
func slackSecret(slack Slack, env string) (string, error) {
	switch slack {
	case "", SlackTest:
		return "slack-test", nil
	case SlackEnvironment:
		secret, ok := map[string]string{
			"at22": "slack-dev",
			"at23": "slack-dev",
			"yt01": "slack-dev",

			"tt02": "slack-prod",
			"prod": "slack-prod",
		}[env]
		if !ok {
			return "", fmt.Errorf("%w: no Slack channel for the environment %q", errs.Invalid, env)
		}
		return secret, nil
	default:
		return "", fmt.Errorf("%w: unknown Slack setting %q", errs.Invalid, slack)
	}
}
