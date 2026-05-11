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
	"fmt"
	"time"

	k6iov1alpha1 "github.com/grafana/k6-operator/api/v1alpha1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

// TestRunReconciler reconciles a TestRun object
type TestRunReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

var (
	DeletionThreshold = 5
)

// +kubebuilder:rbac:groups=k6.io,resources=testruns,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=k6.io,resources=testruns/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=k6.io,resources=testruns/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the TestRun object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.23.3/pkg/reconcile
func (r *TestRunReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := logf.FromContext(ctx)

	var testRun k6iov1alpha1.TestRun
	if err := r.Get(ctx, req.NamespacedName, &testRun); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		log.Error(err, "Unable to fetch TestRun", "namespace", req.Namespace, "name", req.Name)
		return ctrl.Result{}, err
	} else {
		minutesSince := int(time.Now().UTC().Sub(testRun.CreationTimestamp.Time).Minutes())
		if minutesSince >= DeletionThreshold {
			log.Info(fmt.Sprintf("Test run %s should be deleted", testRun.Name))
			if err := r.Delete(ctx, &testRun); err != nil {
				if apierrors.IsNotFound(err) {
					return ctrl.Result{}, nil
				}
				log.Error(err, "Unable to delete old testrun", "TestRun", testRun)
				return ctrl.Result{}, err
			}
		} else {
			// log.Info(fmt.Sprintf("TestRun will be deleted in %d minutes", DeletionThreshold-minutesSince))
			return ctrl.Result{
				RequeueAfter: time.Duration(DeletionThreshold-minutesSince+1) * time.Minute,
			}, nil
		}
	}
	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *TestRunReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&k6iov1alpha1.TestRun{}).
		Watches(
			&k6iov1alpha1.TestRun{},
			handler.EnqueueRequestsFromMapFunc(func(ctx context.Context, obj client.Object) []reconcile.Request {
				if val, ok := obj.GetLabels()["app"]; ok && val == "k6" {
					return []reconcile.Request{
						{
							NamespacedName: types.NamespacedName{
								Name:      "testrun",
								Namespace: obj.GetNamespace(),
							},
						},
					}
				}
				if val, ok := obj.GetLabels()["generated-by"]; ok && val == "k6-action-image" {
					return []reconcile.Request{
						{
							NamespacedName: types.NamespacedName{
								Name:      "testrun",
								Namespace: obj.GetNamespace(),
							},
						},
					}
				}
				return []reconcile.Request{}
			}),
		).
		Complete(r)
}
