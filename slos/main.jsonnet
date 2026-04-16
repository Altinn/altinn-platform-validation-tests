local ratio_slo_definitions = [
  {
    namespace: 'platform',
    team: 'platform',
    application: 'k8s-wrapper',
    slo_name: 'k8-wrapper-deployments-service-owner-get',
    endpoint: '.*/kuberneteswrapper/api/v1/Deployments',
  },
  {
    namespace: 'platform',
    team: 'platform',
    application: 'altinncdn',
    slo_name: 'altinncdn-orgs-get',
    endpoint: 'https://altinncdn.no/orgs/altinn-orgs.json',
  },
  {
    namespace: 'authentication',
    team: 'authentication',
    application: 'accessmanagement',
    slo_name: 'accessmanagement-resourceowneropenapi-get-authorized-parties',
    endpoint: '.+/resourceowner/authorizedparties',
  },
];

local latency_slo_definitions = [
  {
    namespace: 'authentication',
    team: 'authentication',
    application: 'register',
    slo_name: 'register-enhets-registeret-update',
    endpoint: 'https://.+/enhets-registeret/api/v1/update.svc.+',
    latency: '400ms'
  },
  {
    namespace: 'authentication',
    team: 'authentication',
    application: 'accessmanagement',
    slo_name: 'accessmanagement-resourceowneropenapi-get-authorized-parties',
    endpoint: '.+/resourceowner/authorizedparties',
    latency: '200ms'
  },
];

local slo = {
  local common(namespace, slo_name, team, application) = {
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
    },
  },

  newRatio(namespace, slo_name, team, application, endpoint): common(namespace, slo_name, team, application) + {
    spec+: {
      indicator: {
        ratio: {
          errors: {
            // metric: 'k6_http_reqs_total{ name=~".*/kuberneteswrapper/api/v1/Deployments", status=~"5...|418" }',
            metric: std.format('k6_http_reqs_total{ endpoint=~"%s", status=~"5...|418" }', endpoint),
          },
          total: {
            // metric: 'k6_http_reqs_total{ name=~".*/kuberneteswrapper/api/v1/Deployments" }',
            metric: std.format('k6_http_reqs_total{ endpoint=~"%s" }', endpoint),
          },
        },
      },
    },
  },
  newLatencyNative(namespace, slo_name, team, application, endpoint, latency): common(namespace, slo_name, team, application) + {
    spec+: {
      target: '99.9',
      window: '28d',
      indicator: {
        latencyNative: {
          latency: latency,
          total: {
            metric: std.format('k6_http_req_duration_p99{ endpoint=~"%s", expected_response="true" }', endpoint),
          },
        },
      },
    },
  },
};

{
  'slos.json':
    [slo.newRatio(s.namespace, s.slo_name, s.team, s.application, s.endpoint) for s in ratio_slo_definitions] +
    [slo.newLatencyNative(s.namespace, s.slo_name, s.team, s.application, s.endpoint, s.latency) for s in latency_slo_definitions],
}
