local slo_definitions = [
  {
    namespace: 'platform',
    team: 'platform',
    application: 'k8s-wrapper',
    slo_name: 'k8-wrapper-deployments-service-owner-get',
    url_path: '.*/kuberneteswrapper/api/v1/Deployments',
  },
  {
    namespace: 'platform',
    team: 'platform',
    application: 'altinncdn',
    slo_name: 'altinncdn-orgs-get',
    url_path: 'https://altinncdn.no/orgs/altinn-orgs.json',
  },
];

local slo = {
  new(namespace, slo_name, team, application, url_path): {
    apiVersion: 'pyrra.dev/v1alpha1',
    kind: 'ServiceLevelObjective',
    metadata: {
      name: slo_name,
      namespace: namespace,
      labels: {
        prometheus: 'k8s',
        role: 'alert-rules',
        'pyrra.dev/team': team,
        'pyrra.dev/application': application,
        release: 'kube-prometheus-stack',  // Important, otherwise the Prometheus instance won't pick it up
        'generated-by': 'k6-action-image',  // not true, but leave it for now
      },
    },
    spec: {
      target: '99.9',
      window: '28d',
      indicator: {
        ratio: {
          errors: {
            // metric: 'k6_http_reqs_total{ name=~".*/kuberneteswrapper/api/v1/Deployments", status=~"5...|418" }',
            metric: std.format('k6_http_reqs_total{ url=~%s, status=~"5...|418" }', url_path),
          },
          total: {
            // metric: 'k6_http_reqs_total{ name=~".*/kuberneteswrapper/api/v1/Deployments" }',
            metric: std.format('k6_http_reqs_total{ url=~%s }', url_path),
          },
        },
      },
    },
  },
};

{
  'slos.json': [slo.new(s.namespace, s.slo_name, s.team, s.application, s.url_path) for s in slo_definitions],
}
