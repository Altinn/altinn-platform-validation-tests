package controller

import (
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
)

func CleanupPredicate() predicate.Predicate {
	return predicate.NewPredicateFuncs(func(obj client.Object) bool {
		labels := obj.GetLabels()
		return hasTargetLabels(labels)
	})
}

func hasTargetLabels(labels map[string]string) bool {
	if labels == nil {
		return false
	}

	return labels["app"] == "k6" ||
		labels["generated-by"] == "k6-action-image"
}
