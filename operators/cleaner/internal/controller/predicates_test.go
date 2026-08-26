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
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/event"
)

// CleanupPredicate is the only thing standing between the reconcilers and
// every other workload in the namespaces the operator watches. The
// reconciler specs all call Reconcile directly and therefore bypass it, so
// it is covered here on its own.

var _ = Describe("hasTargetLabels", func() {
	DescribeTable(
		"matches only the labels k6 resources carry",
		func(labels map[string]string, expected bool) {
			Expect(hasTargetLabels(labels)).To(Equal(expected))
		},
		Entry("nil labels", nil, false),
		Entry("no labels", map[string]string{}, false),
		Entry("app=k6", map[string]string{"app": "k6"}, true),
		Entry(
			"generated-by=k6-action-image",
			map[string]string{"generated-by": "k6-action-image"},
			true,
		),
		Entry(
			"both target labels",
			map[string]string{
				"app":          "k6",
				"generated-by": "k6-action-image",
			},
			true,
		),
		Entry(
			"target label alongside unrelated labels",
			map[string]string{
				"app":                    "k6",
				"app.kubernetes.io/name": "something-else",
			},
			true,
		),
		Entry("a different app", map[string]string{"app": "grafana"}, false),
		Entry(
			"app label with an empty value",
			map[string]string{"app": ""},
			false,
		),
		Entry(
			"a different generator",
			map[string]string{"generated-by": "helm"},
			false,
		),
		Entry(
			"only unrelated labels",
			map[string]string{"app.kubernetes.io/part-of": "k6"},
			false,
		),
	)
})

var _ = Describe("CleanupPredicate", func() {
	podWithLabels := func(labels map[string]string) *corev1.Pod {
		return &corev1.Pod{
			ObjectMeta: metav1.ObjectMeta{
				Name:      "some-pod",
				Namespace: "default",
				Labels:    labels,
			},
		}
	}

	targeted := podWithLabels(map[string]string{"app": "k6"})
	unrelated := podWithLabels(map[string]string{"app": "grafana"})

	It("admits create events for targeted objects only", func() {
		pred := CleanupPredicate()

		Expect(pred.Create(event.CreateEvent{Object: targeted})).
			To(BeTrue())
		Expect(pred.Create(event.CreateEvent{Object: unrelated})).
			To(BeFalse())
	})

	It("admits update events based on the updated object", func() {
		pred := CleanupPredicate()

		Expect(pred.Update(event.UpdateEvent{
			ObjectOld: targeted,
			ObjectNew: targeted,
		})).To(BeTrue())

		Expect(pred.Update(event.UpdateEvent{
			ObjectOld: unrelated,
			ObjectNew: unrelated,
		})).To(BeFalse())
	})

	It("admits delete events for targeted objects only", func() {
		pred := CleanupPredicate()

		Expect(pred.Delete(event.DeleteEvent{Object: targeted})).
			To(BeTrue())
		Expect(pred.Delete(event.DeleteEvent{Object: unrelated})).
			To(BeFalse())
	})

	It("admits generic events for targeted objects only", func() {
		pred := CleanupPredicate()

		Expect(pred.Generic(event.GenericEvent{Object: targeted})).
			To(BeTrue())
		Expect(pred.Generic(event.GenericEvent{Object: unrelated})).
			To(BeFalse())
	})
})
