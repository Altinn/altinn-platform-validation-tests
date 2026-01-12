local basic_workflow = import './basic-workflow.libsonnet';
local team = std.extVar('team');
local cron_expression = '*/15 * * * *';
local input_config_files = std.extVar('config_files');

local config_files = std.split(input_config_files, '\n');

local generate_manifests = [
  basic_workflow.generate_manifests_job(c)
  for c in config_files
];

local apply_manifests = basic_workflow.generate_apply_manifests();

local interleaved_tasks = [
  item
  for task in generate_manifests
  for item in [task, apply_manifests]
];


local workflow_name = std.format('%s - run k6 functional tests', team);
local job_name = 'k6-functional';
local run_name = 'run functional';

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
      steps+: interleaved_tasks,
    },

  },
};

workflow
