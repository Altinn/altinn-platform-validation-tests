local cronSchedule = std.extVar('cron_schedule');
local namespace = std.extVar('namespace');
local input_config_file = std.extVar('config_file');

local maxCronJobNameLength = 52;  // Don't remember the correct value, but yea... Need to fix this eventually.

local deVowel(str) =
  std.foldl(
    function(acc, vowel)
      std.strReplace(acc, vowel, ''),
    [
      'a',
      'e',
      'i',
      'o',
      'u',
    ],
    str
  );

local normalizeCronJobName(input) =
  std.asciiLower(
    std.strReplace(
      std.strReplace(
        std.strReplace(
          std.strReplace(
            std.strReplace(
              input,
              namespace + '/',
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

local cronJobName =
  local normalized = normalizeCronJobName(input_config_file);
  if std.length(normalized) > maxCronJobNameLength then
    deVowel(normalized)
  else
    normalized;

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
                image: 'ghcr.io/altinn/altinn-platform/k6-action-image:v0.0.42',
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
         '.yaml',
         ''
       ),
       './',
       ''
     ),
     '/',
     '_'
   )
   + '.json']: cronjob,
}
