local basic_workflow = import './basic-workflow.libsonnet';
local schedule_map = import './breakpoint-schedule.libsonnet';
local utils = import './utils.libsonnet';

local team = std.extVar('team');
local test_scope = std.extVar('test_scope');
local config_file = std.extVar('config_file');


local team_schedule_map = schedule_map[team][config_file];


local schedule_entries = std.sort(std.objectFields(team_schedule_map), function(a) utils.cronToMinutes(a));

local step_entries(config_file) = [
  {
    name: 'Run Breakpoint for .dist/' + team_schedule_map[e],
    'if': std.format("github.event.schedule == '%s'", e),
    shell: 'bash',
    run: 'kubectl apply --server-side -f .dist/' + team_schedule_map[e],
  }
  for e in schedule_entries
];

local workflow_name = std.format('%s - run k6 %s breakpoint tests', [team, test_scope]);
local base_job_name = 'k6-breakpoint';
local run_name = 'run breakpoint';

local workflow = basic_workflow.generate_basic_workflow(
  workflow_name,
  base_job_name,
  run_name,
) + {
  on+: if std.length(schedule_entries) > 0 then {
    schedule: [{ cron: std.format('%s', e) } for e in schedule_entries],
  } else {
    workflow_dispatch: {},
  },
  jobs+: {
    [base_job_name]+: {
      'runs-on': 'ubuntu-latest',
      steps+: [basic_workflow.generate_manifests_job(config_file)] + step_entries(config_file),
    },
  },
};

workflow
