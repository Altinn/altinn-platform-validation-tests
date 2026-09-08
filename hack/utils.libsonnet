{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format(
    'Altinn/altinn-platform/actions/generate-k6-manifests@%s',
    '8daeca34a2c281e6cef8ef6887b284fb77d5a552'
  ),  // v0.0.42

  checkoutAction: std.format(
    'actions/checkout@%s',
    '3d3c42e5aac5ba805825da76410c181273ba90b1'
  ),  // v7

  setupNode: std.format(
    'actions/setup-node@%s',
    '53b83947a5a98c8d113130e565377fae1a50d02f'
  ),
}
