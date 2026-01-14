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
          uses: 'actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98',
        },
        {
          name: 'Use Node.js',
          uses: 'actions/setup-node@65d868f8d4d85d7d4abb7de0875cde3fcc8798f5',
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
          uses: 'actions/checkout@0c366fd6a839edf440554fa01a7085ccba70ac98',
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
