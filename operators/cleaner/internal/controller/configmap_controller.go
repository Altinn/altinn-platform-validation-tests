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
	"strconv"
	"time"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	logf "sigs.k8s.io/controller-runtime/pkg/log"
)

// ConfigMapReconciler reconciles a ConfigMap object
type ConfigMapReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

func getGenerationTime(cm corev1.ConfigMap) (time.Time, bool) {
	val, ok := cm.Labels["generation_timestamp"]
	if !ok || val == "" {
		return time.Time{}, false
	}

	ms, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		return time.Time{}, false
	}

	t := time.Unix(0, ms*int64(time.Millisecond))
	return t, true
}

// +kubebuilder:rbac:groups=k6.dis.altinn.cloud,resources=configmaps,verbs=get;list;watch;delete
// +kubebuilder:rbac:groups=k6.dis.altinn.cloud,resources=configmaps/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=k6.dis.altinn.cloud,resources=configmaps/finalizers,verbs=update

func (r *ConfigMapReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := logf.FromContext(ctx)

	var cm corev1.ConfigMap
	if err := r.Get(ctx, req.NamespacedName, &cm); err != nil {
		if apierrors.IsNotFound(err) {
			return ctrl.Result{}, nil
		}
		log.Error(err, "Unable to fetch ConfigMap", "namespace", req.Namespace, "name", req.Name)
		return ctrl.Result{}, err
	} else {
		ts, succ := getGenerationTime(cm)
		if !succ {
			// Does not have the label so skip it.
			return ctrl.Result{}, nil
		}

		if ts.Before(time.Now().AddDate(0, -1, 0)) { // // 1 month ago
			log.Info(fmt.Sprintf("ConfigMap %s should be deleted", cm.Name))
			if err := r.Delete(ctx, &cm); err != nil {
				if apierrors.IsNotFound(err) {
					return ctrl.Result{}, nil
				}
				log.Error(err, "Unable to delete old ConfigMap", "ConfigMap", cm)
				return ctrl.Result{}, err
			}
		} else {
			return ctrl.Result{
				RequeueAfter: 30 * 24 * time.Hour, // every 30 days should be fine.. but I doubt the pod will stay up that long hehe
			}, nil
		}
	}

	return ctrl.Result{}, nil
}

// SetupWithManager sets up the controller with the Manager.
func (r *ConfigMapReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&corev1.ConfigMap{}).
		WithEventFilter(CleanupPredicate()).
		Complete(r)
}
