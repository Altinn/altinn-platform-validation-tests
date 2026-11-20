package k6manifest

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"fmt"
	"maps"
	"os"
	"path/filepath"
	"slices"
	"strings"

	yaml "gopkg.in/yaml.v3"

	"github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/errs"
)

// k6ClusterConfig has the Prometheus address and the node types in the k6
// cluster.
//
//go:embed assets/k6_cluster_conf.yaml
var k6ClusterConfig []byte

// k6TrendStats are the statistics k6 sends to Prometheus for each trend.
const k6TrendStats = "avg,min,med,max,count,p(95),p(99),p(99.5),p(99.9)"

// k6Cluster is assets/k6_cluster_conf.yaml.
type k6Cluster struct {
	PrometheusRWServerURL string              `yaml:"prometheus_rw_server_url"`
	NodeTypes             map[string]nodeType `yaml:"node_types"`
}

// nodeType says where the runners of a test are placed in the cluster.
type nodeType struct {
	NodeSelector []struct {
		Label string `yaml:"label"`
		Value any    `yaml:"value"`
	} `yaml:"nodeSelector"`
	Tolerations []toleration `yaml:"tolerations"`
}

type toleration struct {
	Key      string `yaml:"key" json:"key,omitempty"`
	Operator string `yaml:"operator" json:"operator,omitempty"`
	Value    string `yaml:"value" json:"value,omitempty"`
	Effect   string `yaml:"effect" json:"effect,omitempty"`
}

func loadK6Cluster() (k6Cluster, error) {
	var c k6Cluster
	if err := yaml.Unmarshal(k6ClusterConfig, &c); err != nil {
		return c, fmt.Errorf("read k6_cluster_conf.yaml: %w", err)
	}
	return c, nil
}

// testRunParameters are the values the TestRun is made from.
type testRunParameters struct {
	dirName                     string
	configMapName               string
	uniqName                    string
	testName                    string
	manifestGenerationTimestamp string
	namespace                   string
	environment                 string
	parallelism                 int
	nodeType                    string
	secretReferences            []string
	extraEnvVars                []*Env
	resources                   *Resources
	imageName                   string
	testid                      string
	testScope                   string
	testFilename                string
	// extraCLIArgs are given to k6 after the arguments we set.
	extraCLIArgs string
}

// testRun is the TestRun resource (k6.io/v1alpha1) of the k6 operator, with
// the fields we set.
type testRun struct {
	APIVersion string      `json:"apiVersion"`
	Kind       string      `json:"kind"`
	Metadata   objectMeta  `json:"metadata"`
	Spec       testRunSpec `json:"spec"`
}

type objectMeta struct {
	Name        string            `json:"name"`
	Namespace   string            `json:"namespace"`
	Labels      map[string]string `json:"labels"`
	Annotations map[string]string `json:"annotations"`
}

type testRunSpec struct {
	Arguments   string `json:"arguments"`
	Parallelism int    `json:"parallelism"`
	Script      struct {
		ConfigMap struct {
			Name string `json:"name"`
			File string `json:"file"`
		} `json:"configMap"`
	} `json:"script"`
	Runner runner `json:"runner"`
}

type runner struct {
	Env      []envVar        `json:"env"`
	EnvFrom  []envFromSource `json:"envFrom"`
	Image    string          `json:"image,omitempty"`
	Metadata struct {
		Labels      map[string]string `json:"labels"`
		Annotations map[string]string `json:"annotations"`
	} `json:"metadata"`
	NodeSelector map[string]string `json:"nodeSelector"`
	Resources    *Resources        `json:"resources"`
	Tolerations  []toleration      `json:"tolerations"`
}

type envVar struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type envFromSource struct {
	ConfigMapRef *nameRef `json:"configMapRef,omitempty"`
	SecretRef    *nameRef `json:"secretRef,omitempty"`
}

type nameRef struct {
	Name string `json:"name"`
}

// newTestRun makes the TestRun for one test.
func newTestRun(p testRunParameters, cluster k6Cluster) (testRun, error) {
	testid := p.testid
	if testid == "" { // Only used in metrics
		testid = p.uniqName
	}
	node, ok := cluster.NodeTypes[p.nodeType]
	if !ok {
		return testRun{}, fmt.Errorf("%w: unknown node type %q", errs.Invalid, p.nodeType)
	}

	labels := map[string]string{
		"uniq_name":    p.uniqName,
		"generated-by": "k6-action-image",
	}
	annotations := map[string]string{
		"k6-action-image/test_name":    p.testName,
		"k6-action-image/test_scope":   p.testScope,
		"k6-action-image/testid":       testid,
		"k6-action-image/testfilename": p.testFilename,
	}

	// The variables every test gets. The test's own variables win, and the
	// list is sorted by name.
	env := map[string]string{
		"K6_NO_USAGE_REPORT":            "true",
		"K6_PROMETHEUS_RW_SERVER_URL":   cluster.PrometheusRWServerURL,
		"K6_PROMETHEUS_RW_TREND_STATS":  k6TrendStats,
		"MANIFEST_GENERATION_TIMESTAMP": p.manifestGenerationTimestamp,
		"NAMESPACE":                     p.namespace,
		"TESTID":                        testid,
		"ENVIRONMENT":                   p.environment,
		"RUNNING_IN_K8S":                "true",
		"TESTFILENAME":                  p.testFilename,
		"TEST_SCOPE":                    p.testScope,
	}
	for _, e := range p.extraEnvVars {
		env[*e.Name] = *e.Value
	}

	tr := testRun{
		APIVersion: "k6.io/v1alpha1",
		Kind:       "TestRun",
		Metadata: objectMeta{
			Name:        p.uniqName,
			Namespace:   p.namespace,
			Labels:      labels,
			Annotations: annotations,
		},
	}
	// cleanup: 'post' is not set. It seemed a bit too aggressive; some metrics
	// did not have time to be flushed.
	tr.Spec.Arguments = strings.Trim(fmt.Sprintf(
		"--tag testid=%s --tag namespace=%s --tag deploy_env=%s --tag test_name=%s --tag test_scope=%s --out experimental-prometheus-rw %s",
		testid, p.namespace, p.environment, p.testName, p.testScope, p.extraCLIArgs,
	), " ")
	tr.Spec.Parallelism = p.parallelism
	tr.Spec.Script.ConfigMap.Name = p.configMapName
	tr.Spec.Script.ConfigMap.File = "archive.tar"

	run := &tr.Spec.Runner
	for _, name := range slices.Sorted(maps.Keys(env)) {
		run.Env = append(run.Env, envVar{Name: name, Value: env[name]})
	}
	run.EnvFrom = []envFromSource{{ConfigMapRef: &nameRef{Name: "deploy-environments-" + p.environment}}}
	for _, s := range p.secretReferences {
		run.EnvFrom = append(run.EnvFrom, envFromSource{SecretRef: &nameRef{Name: s}})
	}
	run.Image = p.imageName
	run.Metadata.Labels = labels
	run.Metadata.Annotations = annotations
	run.NodeSelector = map[string]string{}
	for _, s := range node.NodeSelector {
		run.NodeSelector[s.Label] = toString(s.Value)
	}
	run.Resources = p.resources
	run.Tolerations = node.Tolerations
	if run.Tolerations == nil {
		run.Tolerations = []toleration{}
	}
	return tr, nil
}

// writeTestRun writes the TestRun to <DistDirectory>/<dirName>/testrun.json.
func (r K8sManifestGenerator) writeTestRun(p testRunParameters, cluster k6Cluster) error {
	p.extraCLIArgs = r.CommandLineArgs
	tr, err := newTestRun(p, cluster)
	if err != nil {
		return err
	}
	b, err := jsonnetJSON(tr)
	if err != nil {
		return err
	}
	newpath := filepath.Join(r.DistDirectory, p.dirName)
	if err := os.MkdirAll(newpath, os.ModePerm); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(newpath, "testrun.json"), b, 0644)
}

// toString writes a YAML value the way jsonnet's std.toString does.
func toString(v any) string {
	if v == nil {
		return "null"
	}
	return fmt.Sprint(v)
}

// jsonnetJSON formats v the way jsonnet writes a file: keys sorted, three
// spaces of indentation, { } and [ ] for empty objects and arrays, and a
// newline at the end. The TestRun used to be made with jsonnet, and this keeps
// the files byte for byte the same.
func jsonnetJSON(v any) ([]byte, error) {
	b, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	d := json.NewDecoder(bytes.NewReader(b))
	d.UseNumber()
	var generic any
	if err := d.Decode(&generic); err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	writeJsonnetValue(&buf, generic, "")
	buf.WriteByte('\n')
	return buf.Bytes(), nil
}

func writeJsonnetValue(buf *bytes.Buffer, v any, indent string) {
	const step = "   "
	switch v := v.(type) {
	case map[string]any:
		if len(v) == 0 {
			buf.WriteString("{ }")
			return
		}
		buf.WriteString("{\n")
		keys := slices.Sorted(maps.Keys(v))
		for i, k := range keys {
			buf.WriteString(indent + step)
			writeJsonnetString(buf, k)
			buf.WriteString(": ")
			writeJsonnetValue(buf, v[k], indent+step)
			if i < len(keys)-1 {
				buf.WriteByte(',')
			}
			buf.WriteByte('\n')
		}
		buf.WriteString(indent + "}")
	case []any:
		if len(v) == 0 {
			buf.WriteString("[ ]")
			return
		}
		buf.WriteString("[\n")
		for i, e := range v {
			buf.WriteString(indent + step)
			writeJsonnetValue(buf, e, indent+step)
			if i < len(v)-1 {
				buf.WriteByte(',')
			}
			buf.WriteByte('\n')
		}
		buf.WriteString(indent + "]")
	case string:
		writeJsonnetString(buf, v)
	case json.Number:
		buf.WriteString(v.String())
	case bool:
		fmt.Fprint(buf, v)
	case nil:
		buf.WriteString("null")
	}
}

// writeJsonnetString escapes s the way jsonnet does: like JSON, but only
// control characters are written as \u escapes. <, > and & are left as they
// are.
func writeJsonnetString(buf *bytes.Buffer, s string) {
	buf.WriteByte('"')
	for _, r := range s {
		switch r {
		case '"':
			buf.WriteString(`\"`)
		case '\\':
			buf.WriteString(`\\`)
		case '\b':
			buf.WriteString(`\b`)
		case '\f':
			buf.WriteString(`\f`)
		case '\n':
			buf.WriteString(`\n`)
		case '\r':
			buf.WriteString(`\r`)
		case '\t':
			buf.WriteString(`\t`)
		default:
			if r < 0x20 || (r >= 0x7f && r <= 0x9f) {
				fmt.Fprintf(buf, `\u%04x`, r)
			} else {
				buf.WriteRune(r)
			}
		}
	}
	buf.WriteByte('"')
}
