package k6manifest

import (
	"bufio"
	"fmt"
	"math/rand"
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

func getGithubRelatedVars() []*Env {
	var githubRelatedEnvVars []*Env
	githubEnvKeys := [8]string{
		"GITHUB_REPOSITORY",
		"GITHUB_SERVER_URL",
		"GITHUB_RUN_ID",
		"GITHUB_BASE_REF",
		"GITHUB_HEAD_REF",
		"GITHUB_REF",
		"GITHUB_REF_NAME",
		"GITHUB_SHA",
	}
	for i := range githubEnvKeys {
		if val, ok := os.LookupEnv(githubEnvKeys[i]); ok {
			githubRelatedEnvVars = append(githubRelatedEnvVars, &Env{
				Name:  &githubEnvKeys[i],
				Value: &val,
			})
		}
	}
	return githubRelatedEnvVars
}

func randomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")
	s := make([]rune, n)
	for i := range s {
		s[i] = letters[rand.Intn(len(letters))]
	}
	return string(s)
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

func chooseCorrectSlackChannel(deploy_env string) string {
	branch, ok := os.LookupEnv("GITHUB_REF")

	if ok && branch == "refs/heads/main" {
		aux := map[string]string{
			"at22": "slack-dev",
			"at23": "slack-dev",
			"yt01": "slack-dev",

			"tt02": "slack-prod",
			"prod": "slack-prod",
		}
		return aux[deploy_env]
	}

	return "slack-test"
}
