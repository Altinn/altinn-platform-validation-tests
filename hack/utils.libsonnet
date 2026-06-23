{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format(
    'Altinn/altinn-platform/actions/generate-k6-manifests@%s',
    'ec383f5b2cafb06b2d760d14ae2d06f711d8e3e7'
  ),  // v0.0.41

  checkoutAction: std.format(
    'actions/checkout@%s',
    'df4cb1c069e1874edd31b4311f1884172cec0e10'
  ),

  setupNode: std.format(
    'actions/setup-node@%s',
    '53b83947a5a98c8d113130e565377fae1a50d02f'
  ),
}
