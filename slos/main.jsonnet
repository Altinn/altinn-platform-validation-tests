local slo_definitions = [
  {
    action: 'get-active-consents',
    namespace: 'access-management-bff',
    endpoint: 'https://am.ui.yt01.altinn.cloud/accessmanagement/api/v1/consent/active/{party}',
    deploy_env: 'yt01',
    method: 'GET',
  },
  {
    action: 'get-consent-log',
    namespace: 'access-management-bff',
    endpoint: 'https://am.ui.yt01.altinn.cloud/accessmanagement/api/v1/consent/log/{party}',
    deploy_env: 'yt01',
    method: 'GET',
  },
  {
    action: 'get-authorized-parties',
    namespace: 'access-management',
    endpoint: 'https://platform.yt01.altinn.cloud/accessmanagement/api/v1/resourceowner/authorizedparties',
    deploy_env: 'yt01',
    method: 'POST',
  },
  {
    action: 'get-right-holders',
    namespace: 'access-management-bff',
    endpoint: 'https://am.ui.yt01.altinn.cloud/accessmanagement/api/v1/connection/rightholders',
    deploy_env: 'yt01',
    method: 'GET',
  },
  {
    action: 'authorize-post',
    namespace: 'authorization',
    endpoint: 'https://platform.yt01.altinn.cloud/authorization/api/v1/authorize',
    deploy_env: 'yt01',
    method: 'POST',
  },
  {
    action: 'roles-get-roles',
    namespace: 'access-management',
    endpoint: 'https://platform.yt01.altinn.cloud/accessmanagement/api/v1/meta/info/roles',
    deploy_env: 'yt01',
    method: 'GET',
  },
  {
    action: 'get-filter-service-resources',
    namespace: 'dialogporten',
    endpoint: 'https://platform.at23.altinn.cloud/dialogporten/graphql',
    deploy_env: 'at23',
    method: 'POST',
  },
  {
    action: 'get-all-dialogs-for-party',
    namespace: 'dialogporten',
    endpoint: 'https://platform.at23.altinn.cloud/dialogporten/graphql',
    deploy_env: 'at23',
    method: 'POST',
  },
  {
    action: 'get-parties',
    namespace: 'dialogporten',
    endpoint: 'https://platform.at23.altinn.cloud/dialogporten/graphql',
    deploy_env: 'at23',
    method: 'POST',
  },
  {
    action: 'get-dialogs',
    namespace: 'dialogporten',
    endpoint: 'https://platform.at23.altinn.cloud/dialogporten/api/v1/serviceowner/dialogs',
    deploy_env: 'at23',
    method: 'GET',
  },
];


local slo = {
  new(action, namespace, endpoint, deploy_env, method): {
    apiVersion: 'pyrra.dev/v1alpha1',
    kind: 'ServiceLevelObjective',
    metadata: {
      name: deploy_env + '-' + action,
      namespace: namespace,
      labels: {
        prometheus: 'k8s',
        role: 'alert-rules',
        'pyrra.dev/team': namespace,
        'pyrra.dev/deploy_env': deploy_env,
        release: 'kube-prometheus-stack',  // Important, otherwise the Prometheus instance won't pick it up
        'generated-by': 'k6-action-image',  // not true, but leave it for now
      },
    },
    spec: {
      target: '95',
      window: '28d',
      indicator: {
        ratio: {
          errors: {
            metric: std.format(
              'k6_http_reqs_total{endpoint="%s", deploy_env="%s", method="%s", status=~"5.."}',
              [
                endpoint,
                deploy_env,
                method,
              ]
            ),
          },
          total: {
            metric: std.format(
              'k6_http_reqs_total{endpoint="%s", deploy_env="%s", method="%s"}',
              [
                endpoint,
                deploy_env,
                method,
              ]
            ),
          },
        },
      },
    },
  },
};

{
  'slos.json': [
    slo.new(
      s.action,
      s.namespace,
      s.endpoint,
      s.deploy_env,
      s.method
    )
    for s in slo_definitions
  ],
}
