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
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	corev1 "k8s.io/api/core/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

var _ = Describe("Pod Controller", func() {
	var (
		ctx        context.Context
		reconciler *PodReconciler
		k8sClient  client.Client
		scheme     *runtime.Scheme
	)

	BeforeEach(func() {
		ctx = context.Background()

		scheme = runtime.NewScheme()
		Expect(corev1.AddToScheme(scheme)).To(Succeed())

		k8sClient = fake.NewClientBuilder().
			WithScheme(scheme).
			Build()

		reconciler = &PodReconciler{
			Client: k8sClient,
			Scheme: scheme,
		}
	})

	When("the Pod does not exist", func() {
		It("should successfully reconcile without an error", func() {
			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: "default",
					Name:      "does-not-exist",
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))
		})
	})

	When("the Pod is older than the deletion threshold", func() {
		It("should delete the Pod", func() {
			pod := &corev1.Pod{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "old-pod",
					Namespace: "default",
					CreationTimestamp: metav1.Time{
						Time: time.Now().UTC().Add(
							-(time.Duration(DeletionThreshold) + 1) * time.Minute,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, pod)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: pod.Namespace,
					Name:      pod.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var deletedPod corev1.Pod
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: pod.Namespace,
					Name:      pod.Name,
				},
				&deletedPod,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})

	When("the Pod is younger than the deletion threshold", func() {
		It("should requeue the reconciliation", func() {
			const minutesUntilDeletion = 10

			pod := &corev1.Pod{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "young-pod",
					Namespace: "default",
					CreationTimestamp: metav1.Time{
						Time: time.Now().UTC().Add(
							-(time.Duration(DeletionThreshold) -
								minutesUntilDeletion) * time.Minute,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, pod)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: pod.Namespace,
					Name:      pod.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())

			// Reconcile adds one minute to the calculated remaining
			// lifetime before requeueing.
			Expect(result.RequeueAfter).To(BeNumerically(
				"==",
				time.Duration(minutesUntilDeletion+1)*time.Minute,
			))

			var existingPod corev1.Pod
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: pod.Namespace,
					Name:      pod.Name,
				},
				&existingPod,
			)).To(Succeed())
		})
	})

	When("the Pod is already past the deletion threshold", func() {
		It("should delete the Pod and not requeue", func() {
			pod := &corev1.Pod{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "expired-pod",
					Namespace: "default",
					CreationTimestamp: metav1.Time{
						Time: time.Now().UTC().Add(
							-(time.Duration(DeletionThreshold) + 10) * time.Minute,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, pod)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: pod.Namespace,
					Name:      pod.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result.Requeue).To(BeFalse())
			Expect(result.RequeueAfter).To(Equal(time.Duration(0)))

			var deletedPod corev1.Pod
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: pod.Namespace,
					Name:      pod.Name,
				},
				&deletedPod,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})
})
