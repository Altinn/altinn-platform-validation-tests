local input_config_files = std.extVar('config_files');
local config_files = std.split(input_config_files, '\n');

{
  name: 'Linting Tests',
  'run-name': 'linting',
  on: {
    pull_request: {
      branches: ['main'],
      paths: ['.github/workflows/**', 'K6/**', 'conf'],
    },
  },

  permissions: {
    contents: 'read',
  },

  jobs: {
    checks: {
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          name: 'Checkout code',
          uses: 'actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8',
        },
        {
          name: 'Use Node.js',
          uses: 'actions/setup-node@395ad3262231945c25e8478fd5baf05154b1d79f',
          with: {
            'node-version': '24.x',
          },
        },
        {
          name: 'Dependencies',
          run: 'npm install',
        },
        {
          name: 'Lint Code',
          run: 'npm run lint',
        },
        {
          name: 'Ensure javascript files are Kebab Case',
          shell: 'bash',
          run: './validate.sh',
        },
      ],
    },
    validate_generation: {
      'runs-on': 'ubuntu-latest',
      strategy: {
        matrix: {
          config_file: [c for c in config_files],
        },
      },
      steps: [
        {
          uses: 'actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8',
        },
        {
          uses: 'Altinn/altinn-platform/actions/generate-k6-manifests@main',
          with: {
            config_file: '${{ matrix.config_file }}',
          },
        },
        {
          name: 'Tree',
          shell: 'bash',
          run: 'tree .dist/',
        },
      ],
    },
  },
}
