local basic_workflow = import './basic-workflow.libsonnet';
local team = std.extVar('team');
local cron_expression = std.extVar('cron_expression');
local input_config_files = std.extVar('config_files');

local config_files = std.split(input_config_files, '\n');

local interleaved_tasks = [
  [
    basic_workflow.generate_manifests_job(c),
    if c == 'K6/api/tests/authentication/get-authorized-parties/for-user-many-parties/smoke.yaml' then
      basic_workflow.generate_apply_manifests(one_by_one=true)
    else
      basic_workflow.generate_apply_manifests(one_by_one=false),
  ]
  for c in config_files
];


local workflow_name = std.format('%s - run k6 smoke tests', team);
local job_name = 'k6-smoke';
local run_name = 'run smoke';

local workflow = basic_workflow.generate_basic_workflow(
  workflow_name,
  job_name,
  run_name
) + {
  on: {
    schedule: [{ cron: std.format('%s', cron_expression) }],
  },
  jobs+: {
    [job_name]+: {
      steps+: std.flattenArrays(interleaved_tasks),
    },

  },
};

workflow
