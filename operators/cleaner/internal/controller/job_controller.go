/*
Copyright 2026.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package controller

import (
	"context"
	"strings"
	"time"

	batchv1 "k8s.io/api/batch/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/utils/ptr"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
)

// JobReconciler reconciles a Job object
type JobReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=batch,resources=jobs,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=batch,resources=jobs/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=batch,resources=jobs/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Job object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.23.3/pkg/reconcile
func (r *JobReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := logf.FromContext(ctx)

	var job batchv1.Job
	if err := r.Get(ctx, req.NamespacedName, &job); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}

		log.Error(err, "Unable to fetch Job",
			"namespace", req.Namespace,
			"name", req.Name,
		)
		return ctrl.Result{}, err
	}

	shouldDelete := false
	deleteReason := ""

	// Delete jobs older than the configured threshold.
	elapsedTime := time.Since(job.CreationTimestamp.Time)

	if elapsedTime >= DeletionThreshold {
		shouldDelete = true
		deleteReason = "exceeded age threshold"
	}

	// Delete completed jobs ending in -initializer or -starter.
	// These are created by the k6-operator so they can be deleted faster
	cleanupSuffixes := []string{
		"-initializer",
		"-starter",
	}

	isJobToBeCleaned := false
	for _, suffix := range cleanupSuffixes {
		if strings.HasSuffix(job.Name, suffix) {
			isJobToBeCleaned = true
			break
		}
	}

	now := metav1.Now()
	minimumTimeForDeletion := metav1.NewTime(
		now.Add(-SupportingPodsDeletionThreshold),
	)

	if isJobToBeCleaned &&
		job.Status.CompletionTime != nil &&
		job.Status.CompletionTime.Before(&minimumTimeForDeletion) {
		shouldDelete = true
		deleteReason = "completed initializer/starter job"
	}

	if shouldDelete {
		log.Info("Deleting Job",
			"name", job.Name,
			"reason", deleteReason,
		)

		if err := r.Delete(ctx, &job, &client.DeleteOptions{
			PropagationPolicy: ptr.To(metav1.DeletePropagationBackground),
		}); err != nil {
			if apierrors.IsNotFound(err) {
				return ctrl.Result{}, nil
			}

			log.Error(err, "Unable to delete Job", "Job", job)
			return ctrl.Result{}, err
		}

		return ctrl.Result{}, nil
	}

	return ctrl.Result{
		RequeueAfter: DeletionThreshold - elapsedTime + time.Minute,
	}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *JobReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&batchv1.Job{}).
		WithEventFilter(CleanupPredicate()).
		Complete(r)
}
