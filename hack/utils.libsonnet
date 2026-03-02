{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format(
    'Altinn/altinn-platform/actions/generate-k6-manifests@%s',
    '95b12546a386deaf2672aefc4f76ee4f4104df71'
  ),  // v0.0.31

  checkoutAction: std.format(
    'actions/checkout@%s',
    'de0fac2e4500dabe0009e67214ff5f5447ce83dd'
  ),

  setupNode: std.format(
    'actions/setup-node@%s',
    '54045abd5dcd3b0fee9ca02fa24c57545834c9cc'
  ),
}
