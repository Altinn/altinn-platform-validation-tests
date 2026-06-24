/**
 * This test fetches parties for users with many parties from the Dialogporten GraphQL API.
 * The users are defined in the endUsersByEnvironment object, which maps environment names to arrays of user objects containing personal identification numbers (pid) and labels.
 */
import { getOptions, requireEnv } from "../../../../helpers.js";
import { GetParties } from "../../../building-blocks/dialogporten/graphql/index.js";
import { getClient, getDialogportenOpts } from "./common-functions.js";

// labels and pids for users with many parties, grouped by environment
// labels are in the format of "a_<pid>_<total_number_of_parties>_<number_of_parties_returned>"
// number_of_parties_returned will be lower than total_number_of_parties if the profile option show assosiated parties is set to false for the user
const endUsersByEnvironment = {
    yt01: [
        { pid: "20041065185", label: { pid_avgivere: "a_20041065185_95k_95k" } },
        { pid: "14022216091", label: { pid_avgivere: "b_14022216091_84k_84k" } },
        { pid: "21070450361", label: { pid_avgivere: "c_21070450361_47k_1371" } },
        { pid: "10121251049", label: { pid_avgivere: "d_10121251049_30k_41" } },
        { pid: "11111574113", label: { pid_avgivere: "e_11111574113_27k_124" } },
        { pid: "26091077719", label: { pid_avgivere: "f_26091077719_27k_511" } },
        { pid: "06053077178", label: { pid_avgivere: "g_06053077178_5k_5k" } },
        { pid: "03012995740", label: { pid_avgivere: "h_03012995740_5k_5k" } },
        { pid: "14063069966", label: { pid_avgivere: "i_14063069966_5k_5k" } },
        { pid: "21060469919", label: { pid_avgivere: "j_21060469919_4k_4k" } },
        { pid: "13031471499", label: { pid_avgivere: "k_13031471499_4k_3k" } },
    ],
    tt02: [
        { pid: "06095101567", label: { pid_avgivere: "a_06095101567_48k_11k" } },
        { pid: "22877497392", label: { pid_avgivere: "b_22877497392_16k_16k" } },
        { pid: "05897398887", label: { pid_avgivere: "c_05897398887_16k_16k" } },
        { pid: "13886499404", label: { pid_avgivere: "d_13886499404_13k_9" } },
        { pid: "01055902352", label: { pid_avgivere: "e_01055902352_12k_12k" } },
    ],
    at23: [
        { pid: "22877497392", label: { pid_avgivere: "a_22877497392_15k_15k" } },
        { pid: "13886499404", label: { pid_avgivere: "b_13886499404_13k_13k" } },
        { pid: "14836599080", label: { pid_avgivere: "c_14836599080_6k_6k" } },
        { pid: "23812849735", label: { pid_avgivere: "d_23812849735_6k_6k" } },
        { pid: "24916399592", label: { pid_avgivere: "e_24916399592_6k_6k" } },
    ],
};

export const endUsers = endUsersByEnvironment[__ENV.ENVIRONMENT] || [];
export const endUserLabels = endUsers.map(user => { return user.label; });

export const options = getOptions(endUserLabels);

export function setup() {
    requireEnv(["ENVIRONMENT"]);
    return;
}

export default function () {
    const [graphqlClient, tokenGenerator] = getClient();
    const endUser = endUsers[__ITER % endUsers.length].pid;
    const getPartiesLabel = endUsers[__ITER % endUsers.length].label;
    tokenGenerator.setTokenGeneratorOptions(getDialogportenOpts(endUser));
    GetParties(
        graphqlClient,
        getPartiesLabel,
    );
}
