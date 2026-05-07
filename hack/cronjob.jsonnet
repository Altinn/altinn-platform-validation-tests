local cronSchedule = std.extVar('cron_schedule');
local namespace = std.extVar('namespace');
local input_config_file = std.extVar('config_file');

local cronJobName = std.asciiLower(
  std.strReplace(
    std.strReplace(
      std.strReplace(
        std.strReplace(
          std.strReplace(
            input_config_file,
            namespace + "/",
            ''
          ),
          './K6/browser/',
          ''
        ),
        './K6/api/tests/',
        ''
      ),
      '/',
      '-'
    ),
    '.yaml',
    ''
  )
);

local cronjob = {
  apiVersion: 'batch/v1',
  kind: 'CronJob',
  metadata: {
    name: cronJobName,
    namespace: namespace,
    labels: {
      'generated-by': 'github-action',
    },
  },
  spec: {
    schedule: cronSchedule,
    concurrencyPolicy: 'Forbid',
    jobTemplate: {
      spec: {
        template: {
          spec: {
            serviceAccount: 'k6',
            containers: [
              {
                name: 'generate-manifests',
                image: 'ghcr.io/altinn/altinn-platform/k6-action-image:v0.0.37',
                command: [
                  '/bin/sh',
                ],
                args: [
                  '-c',
                  'git clone https://github.com/Altinn/altinn-platform-validation-tests.git; cd altinn-platform-validation-tests/; generate-k6-manifests; kubectl apply --server-side -f .dist/ -R || true',
                ],
                env: [
                  {
                    name: 'INPUT_CONFIG_FILE',
                    value: input_config_file,
                  },
                ],
              },
            ],
            restartPolicy: 'Never',
          },
        },
      },
    },
  },
};

{
  [std.strReplace(
    std.strReplace(
      std.strReplace(
      input_config_file,
      ".yaml", ""),
       "./", ""),
      "/", "_" )
      + '.json']: cronjob,
}
