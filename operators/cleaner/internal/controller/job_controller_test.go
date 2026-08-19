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

	batchv1 "k8s.io/api/batch/v1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

var _ = Describe("Job Controller", func() {
	var (
		ctx        context.Context
		reconciler *JobReconciler
		k8sClient  client.Client
		scheme     *runtime.Scheme
	)

	BeforeEach(func() {
		ctx = context.Background()

		scheme = runtime.NewScheme()
		Expect(batchv1.AddToScheme(scheme)).To(Succeed())

		k8sClient = fake.NewClientBuilder().
			WithScheme(scheme).
			Build()

		reconciler = &JobReconciler{
			Client: k8sClient,
			Scheme: scheme,
		}
	})

	When("the Job does not exist", func() {
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

	When("the Job is older than the deletion threshold", func() {
		It("should delete the Job", func() {
			job := &batchv1.Job{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "old-job",
					Namespace: "default",
					CreationTimestamp: metav1.Time{
						Time: time.Now().UTC().Add(
							-(time.Duration(DeletionThreshold) + 1) * time.Minute,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, job)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: job.Namespace,
					Name:      job.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var deletedJob batchv1.Job
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: job.Namespace,
					Name:      job.Name,
				},
				&deletedJob,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})

	When("the Job is younger than the deletion threshold", func() {
		It("should requeue the reconciliation", func() {
			const minutesUntilDeletion = 10

			job := &batchv1.Job{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "young-job",
					Namespace: "default",
					CreationTimestamp: metav1.Time{
						Time: time.Now().UTC().Add(
							-(time.Duration(DeletionThreshold) -
								minutesUntilDeletion) * time.Minute,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, job)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: job.Namespace,
					Name:      job.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())

			// The reconciler adds one minute to the calculated
			// remaining lifetime before requeueing.
			Expect(result.RequeueAfter).To(BeNumerically(
				"==",
				time.Duration(minutesUntilDeletion+1)*time.Minute,
			))

			var existingJob batchv1.Job
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: job.Namespace,
					Name:      job.Name,
				},
				&existingJob,
			)).To(Succeed())
		})
	})

	When("the Job is already past the deletion threshold", func() {
		It("should delete the Job and not requeue", func() {
			job := &batchv1.Job{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "expired-job",
					Namespace: "default",
					CreationTimestamp: metav1.Time{
						Time: time.Now().UTC().Add(
							-(time.Duration(DeletionThreshold) + 10) * time.Minute,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, job)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: job.Namespace,
					Name:      job.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result.Requeue).To(BeFalse())
			Expect(result.RequeueAfter).To(Equal(time.Duration(0)))

			var deletedJob batchv1.Job
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: job.Namespace,
					Name:      job.Name,
				},
				&deletedJob,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})
})
