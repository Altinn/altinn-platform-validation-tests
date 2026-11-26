// Package buildinfo says which build of testudo is running. Go records the
// commit and its time in the binary when testudo is built in a git checkout,
// as make build, make install and the release workflow do. go run and go test
// do not record them.
package buildinfo

import (
	"runtime"
	"runtime/debug"
	"time"
)

// Info is what is known about the build.
type Info struct {
	// Version is the version of the testudo module, set when testudo is
	// installed with go install ...@<version>, e.g.
	// v0.0.0-20261126103750-19963b6680db. Go gives a build in a checkout of
	// this repository no version, only the commit.
	Version string `json:"version,omitempty"`
	// Commit is the full hash of the commit testudo was built from.
	Commit string `json:"commit,omitempty"`
	// CommitTime is when that commit was made, in UTC.
	CommitTime time.Time `json:"commitTime,omitzero"`
	// Modified is true when the checkout had changes that were not committed,
	// so the binary is not exactly the commit.
	Modified bool `json:"modified,omitempty"`
	// GoVersion is the Go release testudo was built with, e.g. go1.27.0.
	GoVersion string `json:"goVersion"`
	// Platform is the operating system and architecture, e.g. linux/amd64.
	Platform string `json:"platform"`
}

// Read returns the Info of the running testudo.
func Read() Info {
	bi, ok := debug.ReadBuildInfo()
	if !ok {
		return Info{GoVersion: runtime.Version(), Platform: platform()}
	}
	return fromBuildInfo(bi)
}

func fromBuildInfo(bi *debug.BuildInfo) Info {
	info := Info{GoVersion: bi.GoVersion, Platform: platform()}
	if bi.Main.Version != "(devel)" {
		info.Version = bi.Main.Version
	}
	for _, s := range bi.Settings {
		switch s.Key {
		case "vcs.revision":
			info.Commit = s.Value
		case "vcs.time":
			if t, err := time.Parse(time.RFC3339, s.Value); err == nil {
				info.CommitTime = t.UTC()
			}
		case "vcs.modified":
			info.Modified = s.Value == "true"
		}
	}
	return info
}

func platform() string {
	return runtime.GOOS + "/" + runtime.GOARCH
}
