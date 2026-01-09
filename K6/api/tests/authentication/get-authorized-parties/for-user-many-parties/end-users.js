// This file contains a list of end users with their pids and labels.
// The labels include the approximate number of authorized parties for each user.
// The labels are prefixed with a letter to ensure consistent ordering in test reports.

export const endUsers = [
  { pid: "14022216091", label: "a_14022216091_80k" },
  { pid: "21070450361", label: "b_21070450361_47K" },
  { pid: "10121251049", label:  "c_10121251049_30k" },
  { pid: "11111574113", label:  "d_11111574113_27k" },
  { pid: "26091077719", label:  "e_26091077719_27k" },
  // { pid: "25060453384", label:  "f_25060453384_18k" },
  // { pid: "11082839536", label:  "g_11082839536_11k" },
  // { pid: "02050231790", label:  "h_02050231790_8K" },
  // { pid: "14836599080", label:  "i_14836599080_6K" },
  // { pid: "25110450144", label:  "j_25110450144_4K" },
  // { pid: "15120645029", label:  "k_15120645029_2K" },
  // { pid: "22021570668", label:  "l_22021570668_1K" },
];

export const endUserLabels = endUsers.map(user => user.label);
