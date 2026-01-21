// This file contains a list of end users with their pids and labels.
// The labels include the approximate number of authorized parties for each user.
// The labels are prefixed with a letter to ensure consistent ordering in test reports.

const environment = __ENV.ENVIRONMENT || "yt01";
const endUsersByEnvironment = {
    yt01: [
        { pid: "14022216091", label: "a_14022216091_80k" },
        { pid: "21070450361", label: "b_21070450361_47K" },
        { pid: "10121251049", label:  "c_10121251049_30k" },
        { pid: "11111574113", label:  "d_11111574113_27k" },
        { pid: "26091077719", label:  "e_26091077719_27k" },
    ],
    tt02: [
        { pid: "06095101567", label:  "a_06095101567_48k" },
        { pid: "22877497392", label:  "b_22877497392_15k" },
        { pid: "05897398887", label:  "c_05897398887_15k" },
        { pid: "13886499404", label:  "d_13886499404_13k" },
        { pid: "01055902352", label:  "e_01055902352_12k" },
    ],
    at23: [
        { pid: "22877497392", label:  "a_22877497392_15k" },
        { pid: "13886499404", label:  "b_13886499404_13k" },
        { pid: "14836599080", label:  "c_14836599080_6k" },
        { pid: "23812849735", label:  "d_23812849735_6k" },
        { pid: "24916399592", label:  "e_24916399592_6k" },
    ],
};

export const endUsers = endUsersByEnvironment[environment] || [];
export const endUserLabels = endUsers.map(user => user.label);

// Some more if needed:
// Environment: yt01:
// { pid: "25060453384", label:  "f_25060453384_18k" },
// { pid: "11082839536", label:  "g_11082839536_11k" },
// { pid: "02050231790", label:  "h_02050231790_8K" },
// { pid: "14836599080", label:  "i_14836599080_6K" },
// { pid: "25110450144", label:  "j_25110450144_4K" },
// { pid: "15120645029", label:  "k_15120645029_2K" },
// { pid: "22021570668", label:  "l_22021570668_1K" },

// Environment: tt02:
// FNumber_AK	Name	antall
// 14836599080	BAKTANKE USYMMETRISK	6088
// 23812849735	TELEFONKATALOG OKSYDERT	5990
// 24916399592	SKJORTE GRUNN	5989
// 24856398710	AKTOR SIKKER	5795
// 30867297010	BEVILLING STANDHAFTIG	5519
// 11866598926	HANDEL OPTIMISTISK	5516
// 07845595733	DØR SPESIELL	4805

// Environment: at23:
// 24856398710	AKTOR SIKKER	5784
// 30867297010	BEVILLING STANDHAFTIG	5517
// 11866598926	HANDEL OPTIMISTISK	5513
// 12816799307	KULTURPLANTE MORALSK	3666
// 1866297785	EKORNHALE KORREKT	3613
// 1846998515	KRYDDER RIKTIG	3577
// 15893148970	BASS BESKJEDEN GITAR	3516
// 19856297910	BAKEPULVER KLOK	3343
// 25922849741	FORSKJELL FAMILIÆR	3040