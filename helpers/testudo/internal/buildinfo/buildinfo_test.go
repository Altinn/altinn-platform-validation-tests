package buildinfo

import (
	"runtime"
	"runtime/debug"
	"testing"
	"time"
)

func TestFromBuildInfo(t *testing.T) {
	platform := runtime.GOOS + "/" + runtime.GOARCH
	for _, tt := range []struct {
		name string
		bi   debug.BuildInfo
		want Info
	}{
		{
			// What make build-all recorded in a checkout with changes.
			name: "built in a checkout with changes",
			bi: debug.BuildInfo{
				GoVersion: "go1.27.2",
				Main:      debug.Module{Version: "(devel)"},
				Settings: []debug.BuildSetting{
					{Key: "-trimpath", Value: "true"},
					{Key: "vcs", Value: "git"},
					{Key: "vcs.revision", Value: "19963b6680dbcbb1328e5a459a827fcf1590384d"},
					{Key: "vcs.time", Value: "2026-11-26T11:37:50Z"},
					{Key: "vcs.modified", Value: "true"},
				},
			},
			want: Info{
				Commit:     "19963b6680dbcbb1328e5a459a827fcf1590384d",
				CommitTime: time.Date(2026, 11, 26, 11, 37, 50, 0, time.UTC),
				Modified:   true,
				GoVersion:  "go1.27.2",
				Platform:   platform,
			},
		},
		{
			name: "built in a clean checkout, commit time with an offset",
			bi: debug.BuildInfo{
				GoVersion: "go1.27.2",
				Main:      debug.Module{Version: "(devel)"},
				Settings: []debug.BuildSetting{
					{Key: "vcs.revision", Value: "19963b6680dbcbb1328e5a459a827fcf1590384d"},
					{Key: "vcs.time", Value: "2026-11-26T12:37:50+01:00"},
					{Key: "vcs.modified", Value: "false"},
				},
			},
			want: Info{
				Commit:     "19963b6680dbcbb1328e5a459a827fcf1590384d",
				CommitTime: time.Date(2026, 11, 26, 11, 37, 50, 0, time.UTC),
				GoVersion:  "go1.27.2",
				Platform:   platform,
			},
		},
		{
			name: "installed with go install",
			bi: debug.BuildInfo{
				GoVersion: "go1.27.2",
				Main:      debug.Module{Version: "v0.0.0-20261126113750-19963b6680db"},
			},
			want: Info{
				Version:   "v0.0.0-20261126113750-19963b6680db",
				GoVersion: "go1.27.2",
				Platform:  platform,
			},
		},
		{
			name: "built without git",
			bi: debug.BuildInfo{
				GoVersion: "go1.27.2",
				Main:      debug.Module{Version: "(devel)"},
			},
			want: Info{GoVersion: "go1.27.2", Platform: platform},
		},
		{
			name: "a commit time Go did not write",
			bi: debug.BuildInfo{
				GoVersion: "go1.27.2",
				Settings:  []debug.BuildSetting{{Key: "vcs.time", Value: "yesterday"}},
			},
			want: Info{GoVersion: "go1.27.2", Platform: platform},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if got := fromBuildInfo(&tt.bi); got != tt.want {
				t.Errorf("expected %+v, actual %+v", tt.want, got)
			}
		})
	}
}

func TestRead(t *testing.T) {
	// go test does not record the commit, so only these are known.
	got := Read()
	if got.GoVersion != runtime.Version() {
		t.Errorf("GoVersion: expected %q, actual %q", runtime.Version(), got.GoVersion)
	}
	if want := runtime.GOOS + "/" + runtime.GOARCH; got.Platform != want {
		t.Errorf("Platform: expected %q, actual %q", want, got.Platform)
	}
}
