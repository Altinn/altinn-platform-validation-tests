local playwrightVersion = std.extVar('playwrightVersion');

local jobs = [
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
    // Prod-testbrukerne kan ikke sjekkes inn, så de monteres fra en secret.
    testdataSecret: 'playwright-testdata-prod',
  },
];


local cronJob(
  name,
  schedule,
  environment,
  reportUrl,
  slackWebhookEnabled,
  testdataSecret,
      ) = {
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

            resources: {
              requests: {
                cpu: 4,
                memory: '8000Mi',
              },
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
              {
                name: 'playwright',
                image: 'altinnplatformvalidationtests.azurecr.io/custom-playwright-runner:' + playwrightVersion,
                // imagePullPolicy: "Always",

                args: [environment],  // TODO: true for now, but might need to think about how we will support different test frequencies within the same env.
                volumeMounts: [
                  {
                    name: 'swa-config',
                    mountPath: '/etc/swa-config',
                    readOnly: true,
                  },
                ] + (
                  if testdataSecret != null then [
                    {
                      name: 'testdata',
                      mountPath: '/etc/playwright-testdata',
                      readOnly: true,
                    },
                  ]
                  else []
                ),

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
                ] + (
                  if testdataSecret != null then [
                    {
                      name: 'TESTDATA_ROOT',
                      value: '/etc/playwright-testdata',
                    },
                  ]
                  else []
                ) + (
                  if slackWebhookEnabled then [
                    {
                      name: 'SLACK_WEBHOOK_URL',
                      valueFrom: {
                        secretKeyRef: {
                          name: 'testsenteret-alerts',
                          key: 'SLACK_WEBHOOK_URL',
                        },
                      },
                    },
                  ]
                  else []
                ),
              },
            ],

            volumes: [
              {
                name: 'swa-config',
                secret: {
                  secretName: 'swa-config',
                },
              },
            ] + (
              // Hver brukergruppe i playwright/testdata/index.ts er en nøkkel i
              // secreten, og havner der testdata.ts leter etter den.
              if testdataSecret != null then [
                {
                  name: 'testdata',
                  secret: {
                    secretName: testdataSecret,
                    items: [
                      {
                        key: gruppe + '.csv',
                        path: 'testdata/' + gruppe + '/' + environment + '.csv',
                      }
                      for gruppe in ['privatPersonUtenVirksomhet', 'dagligLeder']
                    ],
                  },
                },
              ]
              else []
            ),
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
      std.get(job, 'testdataSecret', null),
    )
  for job in jobs
}
