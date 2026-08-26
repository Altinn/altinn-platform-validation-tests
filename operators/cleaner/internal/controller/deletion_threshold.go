package controller

import "time"

/*
TODO: It might make sense to have more granular thresholds for the various tests.
Haven't really had the time to work on this so this should work for now.
As we add more and more tests, we might need to be a bit more aggressive with cleanups tho.
*/
var (
	DeletionThreshold               = time.Duration(15 * time.Minute)
	SupportingPodsDeletionThreshold = time.Duration(5 * time.Minute) // -initializer and -starter from the k6 operator
)
