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
					CreationTimestamp: metav1.NewTime(
						time.Now().UTC().Add(
							-(DeletionThreshold + time.Minute),
						),
					),
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
			const minutesUntilDeletion = 10 * time.Minute

			job := &batchv1.Job{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "young-job",
					Namespace: "default",
					CreationTimestamp: metav1.NewTime(
						time.Now().UTC().Add(
							-(DeletionThreshold - minutesUntilDeletion),
						),
					),
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
			Expect(result.RequeueAfter).To(
				BeNumerically(
					"~",
					minutesUntilDeletion+time.Minute,
					time.Second,
				),
			)

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

	When("the Job is exactly at the deletion threshold", func() {
		It("should delete the Job and not requeue", func() {
			job := &batchv1.Job{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "threshold-job",
					Namespace: "default",
					CreationTimestamp: metav1.NewTime(
						time.Now().UTC().Add(
							-DeletionThreshold,
						),
					),
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

	// The -initializer/-starter rule is what makes the operator delete k6
	// helper jobs ahead of the age threshold, so every spec below keeps the
	// job young enough that the age rule cannot be what triggers deletion.
	Context("the completed initializer/starter rule", func() {
		const minutesUntilDeletion = 10 * time.Minute

		youngJob := func(name string, completed bool) *batchv1.Job {
			job := &batchv1.Job{
				ObjectMeta: metav1.ObjectMeta{
					Name:      name,
					Namespace: "default",
					CreationTimestamp: metav1.NewTime(
						time.Now().UTC().Add(
							-(DeletionThreshold - minutesUntilDeletion),
						),
					),
				},
			}

			if completed {
				completionTime := metav1.NewTime(
					time.Now().UTC().Add(
						-(SupportingPodsDeletionThreshold + time.Minute),
					),
				)

				job.Status.CompletionTime = &completionTime
			}

			return job
		}

		DescribeTable(
			"deletes only completed jobs carrying a cleanup suffix",
			func(name string, completed bool, shouldDelete bool) {
				job := youngJob(name, completed)

				// WithObjects keeps the populated status when initializing
				// the fake client.
				testClient := fake.NewClientBuilder().
					WithScheme(scheme).
					WithObjects(job).
					Build()

				k8sClient = testClient
				reconciler.Client = testClient

				result, err := reconciler.Reconcile(ctx, ctrl.Request{
					NamespacedName: types.NamespacedName{
						Namespace: job.Namespace,
						Name:      job.Name,
					},
				})

				Expect(err).NotTo(HaveOccurred())

				if shouldDelete {
					Expect(result).To(Equal(ctrl.Result{}))
					Expect(exists(k8sClient, job)).To(BeFalse())
					return
				}

				Expect(result.RequeueAfter).To(
					BeNumerically(
						"~",
						minutesUntilDeletion+time.Minute,
						time.Second,
					),
				)

				Expect(exists(k8sClient, job)).To(BeTrue())
			},
			Entry(
				"completed initializer",
				"k6-test-initializer",
				true,
				true,
			),
			Entry(
				"completed starter",
				"k6-test-starter",
				true,
				true,
			),
			Entry(
				"running initializer",
				"k6-test-initializer",
				false,
				false,
			),
			Entry(
				"running starter",
				"k6-test-starter",
				false,
				false,
			),
			Entry(
				"completed runner",
				"k6-test-runner-1",
				true,
				false,
			),
			Entry(
				"completed unsuffixed job",
				"k6-test",
				true,
				false,
			),
			Entry(
				"suffix in the middle of the name",
				"k6-initializer-test",
				true,
				false,
			),
		)
	})
})

func exists(k8sClient client.Client, job *batchv1.Job) bool {
	var fetched batchv1.Job

	err := k8sClient.Get(
		context.Background(),
		types.NamespacedName{
			Namespace: job.Namespace,
			Name:      job.Name,
		},
		&fetched,
	)

	return err == nil
}
