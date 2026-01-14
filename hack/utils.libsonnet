{
  cronToMinutes(cron):
    local parts = std.split(cron, ' ');
    local minute = std.parseInt(parts[0]);
    local hour = std.parseInt(parts[1]);
    local day_of_week = std.parseInt(parts[4]);

    day_of_week * 24 * 60 + hour * 60 + minute,

  generateK6ManifetsAction: std.format('Altinn/altinn-platform/actions/generate-k6-manifests@%s', '0d58976991bcad93df26d58e94a34aa3dd57672f'),  // v0.0.27
}
