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

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

// PodReconciler reconciles a Pod object
type PodReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=core,resources=pods,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=pods/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=core,resources=pods/finalizers,verbs=update

// Reconcile is part of the main kubernetes reconciliation loop which aims to
// move the current state of the cluster closer to the desired state.
// TODO(user): Modify the Reconcile function to compare the state specified by
// the Pod object against the actual cluster state, and then
// perform operations to make the cluster state reflect the state specified by
// the user.
//
// For more details, check Reconcile and its Result here:
// - https://pkg.go.dev/sigs.k8s.io/controller-runtime@v0.23.3/pkg/reconcile
func (r *PodReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := logf.FromContext(ctx)

	var pod corev1.Pod
	if err := r.Get(ctx, req.NamespacedName, &pod); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		log.Error(err, "Unable to fetch Pod", "namespace", req.Namespace, "name", req.Name)
		return ctrl.Result{}, err
	} else {
		minutesSince := int(time.Now().UTC().Sub(pod.CreationTimestamp.Time).Minutes())
		if minutesSince >= DeletionThreshold {
			log.Info(fmt.Sprintf("Pod %s should be deleted", pod.Name))
			if err := r.Delete(ctx, &pod); err != nil {
				if apierrors.IsNotFound(err) {
					return ctrl.Result{}, nil
				}
				log.Error(err, "Unable to delete old pod", "Pod", pod)
				return ctrl.Result{}, err
			}
		} else {
			// log.Info(fmt.Sprintf("Pod will be deleted in %d minutes", DeletionThreshold-minutesSince))
			return ctrl.Result{
				RequeueAfter: time.Duration(DeletionThreshold-minutesSince+1) * time.Minute,
			}, nil
		}
	}

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *PodReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.Pod{}).
		Watches(
			&corev1.Pod{},
			handler.EnqueueRequestsFromMapFunc(func(ctx context.Context, obj client.Object) []reconcile.Request {
				if val, ok := obj.GetLabels()["app"]; ok && val == "k6" {
					return []reconcile.Request{
						{
							NamespacedName: types.NamespacedName{
								Name:      "pod",
								Namespace: obj.GetNamespace(),
							},
						},
					}
				}
				if val, ok := obj.GetLabels()["generated-by"]; ok && val == "k6-action-image" {
					return []reconcile.Request{
						{
							NamespacedName: types.NamespacedName{
								Name:      "pod",
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
