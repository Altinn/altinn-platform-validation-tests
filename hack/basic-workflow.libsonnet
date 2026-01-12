{

  generate_basic_workflow(workflow_name, job_name, run_name): {
    name: workflow_name,

    on: {},

    'run-name': run_name,

    permissions: {
      'id-token': 'write',
      contents: 'read',
    },

    jobs: {
      [job_name]: {
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

        ],
      },
    },
  },

  generate_manifests_job(config_file): {
    name: 'Generate k8s manifests',
    uses: 'Altinn/altinn-platform/actions/generate-k6-manifests@main',
    with: {
      config_file: config_file,
    },
  },

  generate_apply_manifests(path=null):
    {
      name: 'Apply k8s manifests',
      shell: 'bash',
    } + if path != null
    then {
      run: std.format('kubectl apply --server-side -f .dist/%s', path),
    }
    else {
      run: 'kubectl apply --server-side -f .dist/ -R || true',
    },
}
