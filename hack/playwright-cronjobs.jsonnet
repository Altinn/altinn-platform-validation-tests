local playwrightVersion = std.extVar('playwrightVersion');

local jobs = [
  {
    name: 'playwright-at22',
    schedule: '0 * * * *',
    environment: 'at22',
    reportUrl:
      'https://jolly-plant-033965703-at22.westeurope.7.azurestaticapps.net/api/getreport/',
    slackWebhookEnabled: false,
  },
  {
    name: 'playwright-at23',
    schedule: '*/15 * * * *',
    environment: 'at23',
    reportUrl:
      'https://jolly-plant-033965703-at23.westeurope.7.azurestaticapps.net/api/getreport/',
    slackWebhookEnabled: false,
  },
  {
    name: 'playwright-tt02',
    schedule: '*/15 * * * *',
    environment: 'tt02',
    reportUrl:
      'https://jolly-plant-033965703-tt02.westeurope.7.azurestaticapps.net/api/getreport/',
    slackWebhookEnabled: false,
  },
  {
    name: 'playwright-prod',
    schedule: '*/15 * * * *',
    environment: 'prod',
    reportUrl:
      'https://jolly-plant-033965703.7.azurestaticapps.net/api/getreport/',
    slackWebhookEnabled: false,
  },
];


local cronJob(
  name,
  schedule,
  environment,
  reportUrl,
  slackWebhookEnabled,
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
                cpu: 2,
                memory: '2000Mi',
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

                args: [environment],  // TODO: true for now, but might need to think about how we will support different test frequencies within the same env.
                volumeMounts: [
                  {
                    name: 'swa-config',
                    mountPath: '/etc/swa-config',
                    readOnly: true,
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
                    valueFrom: {
                      secretKeyRef: {
                        name: 'swa-app-token',
                        key: 'REPORT_URL',
                      },
                    },
                  },
                  {
                    name: 'PLAYWRIGHT_HTML_OPEN',
                    value: 'never',
                  },
                  {
                    name: 'PLAYWRIGHT_HTML_ATTACHMENTS_BASE_URL',
                    value: reportUrl,
                  },
                  {
                    name: 'PLAYWRIGHT_JUNIT_OUTPUT_NAME',
                    value: 'test-results.xml',
                  },
                ] + (
                  if slackWebhookEnabled then [
                    {
                      name: 'SLACK_WEBHOOK_URL',
                      valueFrom: {
                        secretKeyRef: {
                          name: 'slack-test',
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
            ],
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
