{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format('Altinn/altinn-platform/actions/generate-k6-manifests@%s',
                                       'dfcaed7b1320a7c6775893dd4e6ec7ce9b0c2953'),  // v0.0.30

  checkoutAction: std.format('actions/checkout@%s',
                             'de0fac2e4500dabe0009e67214ff5f5447ce83dd'),

  setupNode: std.format('actions/setup-node@%s',
                        '6044e13b5dc448c55e2357c09f80417699197238'),
}
