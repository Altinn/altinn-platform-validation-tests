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

	k6iov1alpha1 "github.com/grafana/k6-operator/api/v1alpha1"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/client/fake"
)

/*
func TestControllers(t *testing.T) {
	RegisterFailHandler(Fail)

	RunSpecs(t, "Controller Suite")
}
*/

var _ = Describe("TestRun Controller", func() {
	var (
		ctx        context.Context
		reconciler *TestRunReconciler
		k8sClient  client.Client
		scheme     *runtime.Scheme
	)

	BeforeEach(func() {
		ctx = context.Background()

		scheme = runtime.NewScheme()
		Expect(k6iov1alpha1.AddToScheme(scheme)).To(Succeed())

		k8sClient = fake.NewClientBuilder().
			WithScheme(scheme).
			Build()

		reconciler = &TestRunReconciler{
			Client: k8sClient,
			Scheme: scheme,
		}
	})

	When("the TestRun does not exist", func() {
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

	When("the TestRun is older than the deletion threshold", func() {
		It("should delete the TestRun", func() {
			testRun := &k6iov1alpha1.TestRun{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "old-test-run",
					Namespace: "default",
				},
				Status: k6iov1alpha1.TestRunStatus{
					Stage: "finished",
				},
			}

			testRun.CreationTimestamp = metav1.Time{
				Time: time.Now().UTC().Add(
					-(DeletionThreshold + time.Minute),
				),
			}

			Expect(k8sClient.Create(ctx, testRun)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var deletedTestRun k6iov1alpha1.TestRun
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
				&deletedTestRun,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})

	When("the TestRun is younger than the deletion threshold", func() {
		It("should requeue the reconciliation", func() {
			const minutesUntilDeletion = 10

			testRun := &k6iov1alpha1.TestRun{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "young-test-run",
					Namespace: "default",
				},
			}

			testRun.CreationTimestamp = metav1.Time{
				Time: time.Now().UTC().Add(
					-(DeletionThreshold - time.Duration(minutesUntilDeletion)*time.Minute),
				),
			}

			Expect(k8sClient.Create(ctx, testRun)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())

			// The reconciler adds one minute to the calculated
			// remaining lifetime before requeueing.
			Expect(result.RequeueAfter).To(
				BeNumerically("~", time.Duration(minutesUntilDeletion+1)*time.Minute, time.Second),
			)

			var existingTestRun k6iov1alpha1.TestRun
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
				&existingTestRun,
			)).To(Succeed())
		})
	})

	When("the TestRun is exactly at the deletion threshold", func() {
		It("should delete the TestRun", func() {
			testRun := &k6iov1alpha1.TestRun{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "threshold-test-run",
					Namespace: "default",
				},
				Status: k6iov1alpha1.TestRunStatus{
					Stage: "finished",
				},
			}

			testRun.CreationTimestamp = metav1.Time{
				Time: time.Now().UTC().Add(
					-DeletionThreshold,
				),
			}

			Expect(k8sClient.Create(ctx, testRun)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var deletedTestRun k6iov1alpha1.TestRun
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
				&deletedTestRun,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})

	When("the TestRun is older than the deletion threshold but not finished", func() {
		It("should not delete the TestRun", func() {
			testRun := &k6iov1alpha1.TestRun{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "old-running-test-run",
					Namespace: "default",
				},
				Status: k6iov1alpha1.TestRunStatus{
					Stage: "started",
				},
			}

			testRun.CreationTimestamp = metav1.Time{
				Time: time.Now().UTC().Add(
					-(DeletionThreshold + time.Minute),
				),
			}

			Expect(k8sClient.Create(ctx, testRun)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var existingTestRun k6iov1alpha1.TestRun
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: testRun.Namespace,
					Name:      testRun.Name,
				},
				&existingTestRun,
			)).To(Succeed())
		})
	})

})
