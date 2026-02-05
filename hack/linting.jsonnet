local input_config_files = std.extVar('config_files');
local config_files = std.split(input_config_files, '\n');
local utils = import './utils.libsonnet';

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
          uses: 'actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd',
        },
        {
          name: 'Use Node.js',
          uses: 'actions/setup-node@6044e13b5dc448c55e2357c09f80417699197238',
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
          uses: 'actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd',
        },
        {
          uses: utils.generateK6ManifetsAction,
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
