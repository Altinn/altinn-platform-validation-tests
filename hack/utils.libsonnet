{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format('Altinn/altinn-platform/actions/generate-k6-manifests@%s',
                                       'bfff0d4e624bcc96321727367c865e5ed6dcffc8'),  // v0.0.28
}
