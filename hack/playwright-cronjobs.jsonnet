local playwrightVersion = std.extVar('playwrightVersion');

local jobs = [
  /*
  {
    name: 'playwright-at22',
    schedule: '0 * * * *',
    environment: 'at22',
    reportUrl:
      'https://jolly-plant-033965703-at22.westeurope.7.azurestaticapps.net',
    slackWebhookEnabled: false,
  },
  */
  {
    name: 'playwright-at23',
    schedule: '*/15 * * * *',
    environment: 'at23',
    reportUrl:
      'https://jolly-plant-033965703-at23.westeurope.7.azurestaticapps.net',
    slackWebhookEnabled: false,
  },
  {
    name: 'playwright-tt02',
    schedule: '*/15 * * * *',
    environment: 'tt02',
    reportUrl:
      'https://jolly-plant-033965703-tt02.westeurope.7.azurestaticapps.net',
    slackWebhookEnabled: false,
  },
  {
    name: 'playwright-prod',
    schedule: '*/15 * * * *',
    environment: 'prod',
    reportUrl:
      'https://jolly-plant-033965703.7.azurestaticapps.net',
    slackWebhookEnabled: false,
  },
];

local playwrightTestdataVolume = {
  name: 'playwright-testdata',
  projected: {
    sources: [
      {
        secret: {
          name: 'daglig-leder-prod',
          items: [
            {
              key: 'dagligLeder.csv',
              path: 'dagligLeder/prod.csv',
            },
          ],
        },
      },
      {
        secret: {
          name: 'privat-person-uten-virksomhet-prod',
          items: [
            {
              key: 'privatPersonUtenVirksomhet.csv',
              path: 'privatPersonUtenVirksomhet/prod.csv',
            },
          ],
        },
      },
    ],
  },
};

local testdataContainerMixin = {
  volumeMounts+: [
    {
      name: 'playwright-testdata',
      mountPath: '/home/playwright/testdata',
      readOnly: true,
    },
  ],

  env+: [
    {
      name: 'TEST_DATA_PATH',
      value: '/home/playwright/testdata',
    },
  ],
};

local testdataPodMixin = {
  volumes+: [
    playwrightTestdataVolume,
  ],
};

local slackMixin = {
  env+: [
    {
      name: 'SLACK_WEBHOOK_URL',
      valueFrom: {
        secretKeyRef: {
          name: 'testsenteret-alerts',
          key: 'SLACK_WEBHOOK_URL',
        },
      },
    },
  ],
};


local cronJob(
  name,
  schedule,
  environment,
  reportUrl,
  slackWebhookEnabled,
      ) =
  local containerBase = {
    name: 'playwright',
    image:
      'altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:' +
      playwrightVersion,

    args: [environment],

    resources: {
      requests: {
        cpu: 4,
        memory: '8000Mi',
      },
    },

    volumeMounts: [
      {
        name: 'swa-config',
        mountPath: '/etc/swa-config',
        readOnly: true,
      },
    ],

    env: [
      {
        name: 'APP_TOKEN',
        valueFrom: {
          secretKeyRef: {
            name: 'swa-app-token',
            key: 'APP_TOKEN',
          },
        },
      },
      {
        name: 'SUBSCRIPTION_ID',
        valueFrom: {
          secretKeyRef: {
            name: 'swa-app-token',
            key: 'SUBSCRIPTION_ID',
          },
        },
      },
      {
        name: 'REPORT_URL',
        value: reportUrl,
      },
      {
        name: 'PLAYWRIGHT_HTML_OPEN',
        value: 'never',
      },
      {
        name: 'PLAYWRIGHT_HTML_ATTACHMENTS_BASE_URL',
        value: reportUrl + '/api/getreport/',
      },
      {
        name: 'PLAYWRIGHT_JUNIT_OUTPUT_NAME',
        value: 'test-results.xml',
      },
    ],

    envFrom: [
      {
        secretRef: {
          name: 'playwright-user-' + environment,
        },
      },
      {
        configMapRef: {
          name: 'deploy-environments-' + environment,
        },
      },
    ],
  };

  local container =
    containerBase
    + (if environment == 'prod' then testdataContainerMixin else {})
    + (if slackWebhookEnabled then slackMixin else {});

  local volumes =
    [
      {
        name: 'swa-config',
        secret: {
          secretName: 'swa-config',
        },
      },
    ]
    + (if environment == 'prod' then testdataPodMixin.volumes else []);
  {
    apiVersion: 'batch/v1',
    kind: 'CronJob',

    metadata: {
      name: name,
      namespace: 'playwright',
    },

    spec: {
      schedule: schedule,
      concurrencyPolicy: 'Forbid',
      successfulJobsHistoryLimit: 3,
      failedJobsHistoryLimit: 3,

      jobTemplate: {
        spec: {
          template: {
            metadata: {
              labels: {
                testrunner: name,
                'azure.workload.identity/use': 'true',
              },
            },

            spec: {
              restartPolicy: 'Never',

              serviceAccountName: 'playwright-reporter-sa',

              nodeSelector: {
                'kubernetes.azure.com/scalesetpriority': 'spot',
                spot8cpu28gbmem: 'true',
              },

              tolerations: [
                {
                  effect: 'NoSchedule',
                  key: 'kubernetes.azure.com/scalesetpriority',
                  operator: 'Equal',
                  value: 'spot',
                },
              ],

              containers: [
                container,
              ],

              volumes: volumes,
            },
          },
        },
      },
    },
  };


{
  [job.name + '.json']:
    cronJob(
      job.name,
      job.schedule,
      job.environment,
      job.reportUrl,
      job.slackWebhookEnabled,
    )
  for job in jobs
}
