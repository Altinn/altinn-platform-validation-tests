import { getItemFromList,getOptions, requireEnv } from "../../../../helpers.js";
import { GetEndUserContext } from "../../../building-blocks/dialogporten/serviceowner/index.js";
import { getClients } from "./common-functions.js";

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

export const endUsers = endUsersByEnvironment[__ENV.ENVIRONMENT] || [];
export const endUserLabels = endUsers.map(user => { return { unique_id: user.label }; });

export const options = getOptions(endUserLabels);

export function setup() {
    requireEnv(["ENVIRONMENT"]);
    return;
}

export default function () {
    const [serviceOwnerApiClient] = getClients();
    const endUser = getItemFromList(endUsers);
    const party = endUser.pid;
    const getDialogslabel = { unique_id: endUser.label };
    const queryParams = {
        party: `urn:altinn:person:identifier-no:${party}`,
    };
    GetEndUserContext(
        serviceOwnerApiClient,
        queryParams,
        getDialogslabel,
    );
}
