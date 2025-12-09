local cronToMinutes(cron) =
  local parts = std.split(cron, ' ');
  local minute = std.parseInt(parts[0]);
  local hour = std.parseInt(parts[1]);
  local day_of_week = std.parseInt(parts[4]);

  day_of_week * 24 * 60 + hour * 60 + minute;

local schedule_map = {
  '0 08 * * 1': 'yt01-post-consent-break',  // “At 08:00 on Monday.”

  '0 10 * * 1': 'yt01-get-authorized-parties-for-org-break',  //  “At 10:00 on Monday.”
  '0 12 * * 1': 'yt01-get-authorized-parties-for-system-user-break',  //  “At 12:00 on Monday.”
  '0 14 * * 1': 'yt01-get-authorized-parties-for-user-break',  //  “At 14:00 on Monday.”

  '0 4 * * 2': 'yt01-pdp-authorize-enduser-break',  //  “At 04:00 on Tuesday.”
  '20 4 * * 2': 'yt01-pdp-authorize-dagl-break',  //  “At 04:20 on Tuesday.”
  '40 4 * * 2': 'yt01-pdp-authorize-dagl-direct-delegation-break',  //  “At 04:40 on Tuesday.”
  '0 5 * * 2': 'yt01-pdp-authorize-dagl-deny-break',  //  “At 05:00 on Tuesday.”

  '20 5 * * 2': 'yt01-get-connections-to-break',  //  “At 05:20 on Tuesday.”
  '40 5 * * 2': 'yt01-get-connections-from-break',  //  “At 05:40 on Tuesday.”

  '0 6 * * 2': 'yt01-get-access-packages-to-break',  //  “At 06:00 on Tuesday.”
  '20 6 * * 2': 'yt01-get-access-packages-from-break',  //  “At 06:20 on Tuesday.”

  '40 4 * * 3': 'yt01-get-roles-break',  //  “At 04:40 on Wednesday.”

  '0 5 * * 3': 'yt01-get-authorized-parties-for-user-avgiver-liste-break',  //  “At 05:00 on Wednesday.”
  '20 5 * * 3': 'yt01-get-authorized-parties-for-user-dialogporten-break',  //  “At 05:20 on Wednesday.”
  '40 5 * * 3': 'yt01-get-authorized-parties-for-user-dp-with-filter-break',  //  “At 05:40 on Wednesday.”
};

local schedule_entries = std.sort(std.objectFields(schedule_map), function(a) cronToMinutes(a));

local step_entries = [
  {
    name: 'Run Breakpoint for .dist/' + schedule_map[e],
    'if': std.format("github.event.schedule == '%s'", e),
    shell: 'bash',
    run: 'kubectl apply --server-side -f .dist/' + schedule_map[e],
  }
  for e in schedule_entries
];

{
  name: 'Auth - run k6 breakpoint tests',

  on: {
    schedule: [{ cron: std.format(' %s ', e) } for e in schedule_entries],
  },

  'run-name': 'Auth - run breakpoint',

  permissions: {
    'id-token': 'write',
    contents: 'read',
  },

  jobs: {
    'k6-breakpoint': {
      'runs-on': 'ubuntu-latest',
      environment: 'test',
      steps: [
        {
          name: 'Checkout code',
          uses: 'actions/checkout@93cb6efe18208431cddfb8368fd83d5badbf9bfd',  // v5
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
        {
          name: 'Generate k8s manifests',
          uses: 'Altinn/altinn-platform/actions/generate-k6-manifests@main',
          with: {
            config_file: 'conf/auth-break.yaml',
          },
        },
      ] + step_entries,
    },
  },
}
