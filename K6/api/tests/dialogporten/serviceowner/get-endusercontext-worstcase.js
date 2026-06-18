import { getClients } from "./common-functions.js";
import { getOptions } from "../../../../helpers.js";
import { GetEndUserContext } from "../../../building-blocks/dialogporten/serviceowner/index.js";

const environment = __ENV.ENVIRONMENT || "yt01";
const endUsersByEnvironment = {
    yt01: [
        { pid: "06917699338", label: "a_06917699338_73k" },
        { pid: "23826098759", label: "b_23826098759_62k" },
        { pid: "28866696375", label: "c_28866696375_52k" },
        { pid: "16896795523", label: "d_16896795523_41k" },
        { pid: "02875998768", label: "e_02875998768_30k" },
        { pid: "06925999758", label: "f_06925999758_20k" },
        { pid: "19866498574", label: "g_19866498574_10k" },
        { pid: "30906099140", label: "h_30906099140_2k" },
    ],
};

export const endUsers = endUsersByEnvironment[environment] || [];
export const endUserLabels = endUsers.map(user => { return { unique_id: user.label }; });

export const options = getOptions(endUserLabels);

export default function () {
    const [serviceOwnerApiClient] = getClients();
    const party = endUsers[__ITER % endUsers.length].pid;
    const getDialogslabel = { unique_id: endUsers[__ITER % endUsers.length].label };
    const queryParams = {
        party: `urn:altinn:person:identifier-no:${party}`,
    };
    GetEndUserContext(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
}