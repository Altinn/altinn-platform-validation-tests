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
	"strconv"
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

var _ = Describe("ConfigMap Controller", func() {
	var (
		ctx        context.Context
		reconciler *ConfigMapReconciler
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

		reconciler = &ConfigMapReconciler{
			Client: k8sClient,
			Scheme: scheme,
		}
	})

	When("the ConfigMap does not exist", func() {
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

	When("the ConfigMap does not have a generation timestamp", func() {
		It("should skip the ConfigMap", func() {
			cm := &corev1.ConfigMap{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "no-timestamp",
					Namespace: "default",
				},
			}

			Expect(k8sClient.Create(ctx, cm)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var existingCM corev1.ConfigMap
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
				&existingCM,
			)).To(Succeed())
		})
	})

	When("the ConfigMap has an empty generation timestamp", func() {
		It("should skip the ConfigMap", func() {
			cm := &corev1.ConfigMap{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "empty-timestamp",
					Namespace: "default",
					Labels: map[string]string{
						"generation_timestamp": "",
					},
				},
			}

			Expect(k8sClient.Create(ctx, cm)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var existingCM corev1.ConfigMap
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
				&existingCM,
			)).To(Succeed())
		})
	})

	When("the ConfigMap has an invalid generation timestamp", func() {
		It("should skip the ConfigMap", func() {
			cm := &corev1.ConfigMap{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "invalid-timestamp",
					Namespace: "default",
					Labels: map[string]string{
						"generation_timestamp": "not-a-timestamp",
					},
				},
			}

			Expect(k8sClient.Create(ctx, cm)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var existingCM corev1.ConfigMap
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
				&existingCM,
			)).To(Succeed())
		})
	})

	When("the ConfigMap is less than one month old", func() {
		It("should requeue the reconciliation", func() {
			generationTime := time.Now().UTC().AddDate(0, 0, -15)

			cm := &corev1.ConfigMap{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "young-configmap",
					Namespace: "default",
					Labels: map[string]string{
						"generation_timestamp": strconv.FormatInt(
							generationTime.UnixMilli(),
							10,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, cm)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())

			// The reconciler requeues for the ConfigMap's remaining
			// lifetime plus one minute, not on a fixed interval.
			Expect(result.RequeueAfter).To(BeNumerically(
				"~",
				time.Until(generationTime.AddDate(0, 1, 0))+time.Minute,
				time.Minute,
			))

			var existingCM corev1.ConfigMap
			Expect(k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
				&existingCM,
			)).To(Succeed())
		})
	})

	When("the ConfigMap is older than one month", func() {
		It("should delete the ConfigMap", func() {
			generationTime := time.Now().UTC().AddDate(0, -2, 0)

			cm := &corev1.ConfigMap{
				ObjectMeta: metav1.ObjectMeta{
					Name:      "old-configmap",
					Namespace: "default",
					Labels: map[string]string{
						"generation_timestamp": strconv.FormatInt(
							generationTime.UnixMilli(),
							10,
						),
					},
				},
			}

			Expect(k8sClient.Create(ctx, cm)).To(Succeed())

			result, err := reconciler.Reconcile(ctx, ctrl.Request{
				NamespacedName: types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
			})

			Expect(err).NotTo(HaveOccurred())
			Expect(result).To(Equal(ctrl.Result{}))

			var deletedCM corev1.ConfigMap
			err = k8sClient.Get(
				ctx,
				types.NamespacedName{
					Namespace: cm.Namespace,
					Name:      cm.Name,
				},
				&deletedCM,
			)

			Expect(apierrors.IsNotFound(err)).To(BeTrue())
		})
	})
})

var _ = Describe("getGenerationTime", func() {
	It("should parse a valid generation timestamp", func() {
		expected := time.Date(
			2026,
			time.January,
			15,
			12,
			30,
			0,
			0,
			time.UTC,
		)

		cm := corev1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Labels: map[string]string{
					"generation_timestamp": strconv.FormatInt(
						expected.UnixMilli(),
						10,
					),
				},
			},
		}

		result, ok := getGenerationTime(cm)

		Expect(ok).To(BeTrue())
		Expect(result).To(BeTemporally("==", expected))
	})

	It("should return false when the label is missing", func() {
		cm := corev1.ConfigMap{}

		result, ok := getGenerationTime(cm)

		Expect(ok).To(BeFalse())
		Expect(result).To(BeZero())
	})

	It("should return false when the label is empty", func() {
		cm := corev1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Labels: map[string]string{
					"generation_timestamp": "",
				},
			},
		}

		result, ok := getGenerationTime(cm)

		Expect(ok).To(BeFalse())
		Expect(result).To(BeZero())
	})

	It("should return false when the label is invalid", func() {
		cm := corev1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Labels: map[string]string{
					"generation_timestamp": "invalid",
				},
			},
		}

		result, ok := getGenerationTime(cm)

		Expect(ok).To(BeFalse())
		Expect(result).To(BeZero())
	})
})
