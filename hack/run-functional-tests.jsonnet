local team = std.extVar('team');
local cron_expression = '*/15 * * * *';
local input_config_files = std.extVar('config_files');

local config_files = std.split(input_config_files, '\n');

local generate_manifests = [
  {
    name: 'Generate k8s manifests',
    uses: 'Altinn/altinn-platform/actions/generate-k6-manifests@main',
    with: {
      config_file: c,
    },
  }
  for c in config_files
];

local apply_manifests =
  {
    name: 'Apply k8s manifests',
    shell: 'bash',
    run: 'kubectl apply --server-side -f .dist/ -R; rm -rf .build/ .conf/ .dist/',
  };

local interleaved_tasks = [
  item
  for task in generate_manifests
  for item in [task, apply_manifests]
];

{
  name: std.format('%s - run k6 functional tests', team),

  on: {
    schedule: [{ cron: std.format('%s', cron_expression) }],
  },

  permissions: {
    'id-token': 'write',
    contents: 'read',
  },

  jobs: {
    'k6-functional': {
      'runs-on': 'ubuntu-latest',
      environment: 'test',
      steps: [
        {
          name: 'Checkout code',
          uses: 'actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8',
        },
        {
          name: 'Setup k8s client',
          uses: './.github/actions/setup-k8s',
          with: {
            'azure-client-id': '${{ secrets.AZURE_CLIENT_ID }}',
            'azure-tenant-id': '${{ secrets.AZURE_TENANT_ID }}',
            'azure-subscription-id': '${{ secrets.AZURE_SUBSCRIPTION_ID }}',
          },
        },
      ] + interleaved_tasks,
    },
  },
}
