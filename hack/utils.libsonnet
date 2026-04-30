{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format(
    'Altinn/altinn-platform/actions/generate-k6-manifests@%s',
    'a638d57d0b66f8977f364b321902801d11e75c15'
  ),  // v0.0.36

  checkoutAction: std.format(
    'actions/checkout@%s',
    '0c366fd6a839edf440554fa01a7085ccba70ac98'
  ),

  setupNode: std.format(
    'actions/setup-node@%s',
    '53b83947a5a98c8d113130e565377fae1a50d02f'
  ),
}
