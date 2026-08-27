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
	"errors"
	"strconv"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	k6iov1alpha1 "github.com/grafana/k6-operator/api/v1alpha1"
	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
	"sigs.k8s.io/controller-runtime/pkg/client/interceptor"
)

// The per-controller specs only cover the happy path: the API server always
// answers and deletion always succeeds. These specs drive the same four
// reconcilers through a client that fails, which is the behaviour that
// decides whether a hiccup is retried or silently swallowed.

// errorPathCase describes one reconciler in terms of what the shared specs
// below need from it.
type errorPathCase struct {
	name        string
	addToScheme func(*runtime.Scheme) error
	// expired returns an object the reconciler will want to delete.
	expired func() client.Object
	// reconcile runs the reconciler under test against the given client.
	reconcile func(
		ctx context.Context,
		c client.Client,
		s *runtime.Scheme,
		key types.NamespacedName,
	) (ctrl.Result, error)
}

func expiredMeta(name string) metav1.ObjectMeta {
	return metav1.ObjectMeta{
		Name:      name,
		Namespace: "default",
		CreationTimestamp: metav1.NewTime(
			time.Now().UTC().Add(
				-(DeletionThreshold + 10*time.Minute),
			),
		),
	}
}

var errorPathCases = []errorPathCase{
	{
		name:        "PodReconciler",
		addToScheme: corev1.AddToScheme,
		expired: func() client.Object {
			return &corev1.Pod{
				ObjectMeta: expiredMeta("expired-pod"),
				Status: corev1.PodStatus{
					Phase: corev1.PodSucceeded,
				},
			}
		},
		reconcile: func(
			ctx context.Context,
			c client.Client,
			s *runtime.Scheme,
			key types.NamespacedName,
		) (ctrl.Result, error) {
			r := &PodReconciler{Client: c, Scheme: s}
			return r.Reconcile(ctx, ctrl.Request{NamespacedName: key})
		},
	},
	{
		name:        "JobReconciler",
		addToScheme: batchv1.AddToScheme,
		expired: func() client.Object {
			return &batchv1.Job{ObjectMeta: expiredMeta("expired-job")}
		},
		reconcile: func(
			ctx context.Context,
			c client.Client,
			s *runtime.Scheme,
			key types.NamespacedName,
		) (ctrl.Result, error) {
			r := &JobReconciler{Client: c, Scheme: s}
			return r.Reconcile(ctx, ctrl.Request{NamespacedName: key})
		},
	},
	{
		name:        "TestRunReconciler",
		addToScheme: k6iov1alpha1.AddToScheme,
		expired: func() client.Object {
			return &k6iov1alpha1.TestRun{
				ObjectMeta: expiredMeta("expired-test-run"),
				Status: k6iov1alpha1.TestRunStatus{
					Stage: "finished",
				},
			}
		},
		reconcile: func(
			ctx context.Context,
			c client.Client,
			s *runtime.Scheme,
			key types.NamespacedName,
		) (ctrl.Result, error) {
			r := &TestRunReconciler{Client: c, Scheme: s}
			return r.Reconcile(ctx, ctrl.Request{NamespacedName: key})
		},
	},
	{
		name:        "ConfigMapReconciler",
		addToScheme: corev1.AddToScheme,
		expired: func() client.Object {
			meta := expiredMeta("expired-configmap")
			meta.Labels = map[string]string{
				"generation_timestamp": strconv.FormatInt(
					time.Now().UTC().AddDate(0, -2, 0).UnixMilli(),
					10,
				),
			}

			return &corev1.ConfigMap{ObjectMeta: meta}
		},
		reconcile: func(
			ctx context.Context,
			c client.Client,
			s *runtime.Scheme,
			key types.NamespacedName,
		) (ctrl.Result, error) {
			r := &ConfigMapReconciler{Client: c, Scheme: s}
			return r.Reconcile(ctx, ctrl.Request{NamespacedName: key})
		},
	},
}

var _ = Describe("Reconciler error paths", func() {
	for _, tc := range errorPathCases {
		Describe(tc.name, func() {
			var (
				ctx    context.Context
				scheme *runtime.Scheme
				obj    client.Object
				key    types.NamespacedName
			)

			BeforeEach(func() {
				ctx = context.Background()

				scheme = runtime.NewScheme()
				Expect(tc.addToScheme(scheme)).To(Succeed())

				obj = tc.expired()
				key = types.NamespacedName{
					Namespace: obj.GetNamespace(),
					Name:      obj.GetName(),
				}
			})

			When("the Get fails with something other than NotFound", func() {
				It("should return the error so the request is retried", func() {
					getErr := apierrors.NewInternalError(
						errors.New("api server is unhappy"),
					)

					c := fake.NewClientBuilder().
						WithScheme(scheme).
						WithInterceptorFuncs(interceptor.Funcs{
							Get: func(
								_ context.Context,
								_ client.WithWatch,
								_ client.ObjectKey,
								_ client.Object,
								_ ...client.GetOption,
							) error {
								return getErr
							},
						}).
						Build()

					result, err := tc.reconcile(ctx, c, scheme, key)

					Expect(err).To(MatchError(getErr))
					Expect(result).To(Equal(ctrl.Result{}))
				})
			})

			When("the Delete fails", func() {
				It("should return the error so the request is retried", func() {
					deleteErr := apierrors.NewInternalError(
						errors.New("deletion rejected"),
					)

					c := fake.NewClientBuilder().
						WithScheme(scheme).
						WithObjects(obj).
						WithInterceptorFuncs(interceptor.Funcs{
							Delete: func(
								_ context.Context,
								_ client.WithWatch,
								_ client.Object,
								_ ...client.DeleteOption,
							) error {
								return deleteErr
							},
						}).
						Build()

					result, err := tc.reconcile(ctx, c, scheme, key)

					Expect(err).To(MatchError(deleteErr))
					Expect(result).To(Equal(ctrl.Result{}))
				})
			})

			When("the object is deleted by someone else first", func() {
				It("should treat the NotFound as success", func() {
					c := fake.NewClientBuilder().
						WithScheme(scheme).
						WithObjects(obj).
						WithInterceptorFuncs(interceptor.Funcs{
							Delete: func(
								_ context.Context,
								_ client.WithWatch,
								o client.Object,
								_ ...client.DeleteOption,
							) error {
								return apierrors.NewNotFound(
									schema.GroupResource{
										Resource: "objects",
									},
									o.GetName(),
								)
							},
						}).
						Build()

					result, err := tc.reconcile(ctx, c, scheme, key)

					Expect(err).NotTo(HaveOccurred())
					Expect(result).To(Equal(ctrl.Result{}))
				})
			})
		})
	}
})
