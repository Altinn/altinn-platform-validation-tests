import http from "k6/http";
import { serviceResources, getClients } from "./common-functions.js";

import { getItemFromList, getOptions, parseCsvData } from "../../../../helpers.js";
import { GetDialogs } from "../../../building-blocks/dialogporten/serviceowner/index.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

// Noen ord som går igjen i testgenererte dialoger, for å øke sjansen for treff i søkefiltrene
export const texts = ["påkrevd", "rapportering", "sammendrag", "Maks 200 tegn"];
// Noen stedsnavn som ikke er så vanlige, for å øke sjansen for ingen treff i søkefiltrene
export const texts_no_hit = ["sjøvegan", "lavik", "kvalsund", "jøssheim", "sørli"];

const filter_combos = [
    { label: { action: "01. party" }, filters: ["party"] },
    { label: { action: "02. enduser-serviceresource" }, filters: ["endUserId", "serviceResource"] },
    { label: { action: "03. enduser-serviceresource-createdafter" }, filters: ["endUserId", "serviceResource", "createdAfter"] },
    { label: { action: "04. enduser-serviceresource-createdbefore" }, filters: ["endUserId", "serviceResource", "createdBefore"] },
    { label: { action: "05. createdafter-party" }, filters: ["createdAfter", "party"] },
    { label: { action: "06. createdbefore-party" }, filters: ["createdBefore", "party"] },
    { label: { action: "07. search-enduser-serviceresource" }, filters: ["Search", "endUserId", "serviceResource"] },
    { label: { action: "08. search-serviceresource-enduser-createdafter" }, filters: ["Search", "serviceResource", "endUserId", "createdAfter"] },
    { label: { action: "09. search-serviceresource-enduser-createdafter-nohit" }, filters: ["Search", "serviceResource", "endUserId", "createdAfter"] },
];

const getDialogslabels = filter_combos.map(combo => combo.label);

export const options = getOptions(getDialogslabels);

export default function (data) {
    const [serviceOwnerApiClient] = getClients();
    const { queryParams, label } = getQueryParamsAndLabel(data);
    GetDialogs(
        serviceOwnerApiClient,
        queryParams,
        label
    );
}

const sevenDaysAgoIso = () =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

const inOneDayIso = () =>
    new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();

const urns = {
    person: ssn => `urn:altinn:person:identifier-no:${ssn}`,
    organization: orgno => `urn:altinn:organization:identifier-no:${orgno}`,
    resource: resource => `urn:altinn:resource:${resource}`,
};

const filterValueBuilders = {
    endUserId: ({ data }) => urns.person(getItemFromList(data, randomize).ssn),
    serviceResource: () => urns.resource(getItemFromList(serviceResources, randomize)),
    party: ({ data }) => urns.organization(getItemFromList(data, randomize).orgno),
    status: () => 'NotApplicable',
    deleted: () => 'Exclude',
    createdAfter: () => sevenDaysAgoIso(),
    createdBefore: () => inOneDayIso(),
    Search: ({ label }) =>
        label.action.includes('nohit')
            ? getItemFromList(texts_no_hit, true)
            : getItemFromList(texts, true),
};

function getFilterValue(filter, label, data) {
    const buildValue =
        filterValueBuilders[filter] ??
        (() => urns.resource(getItemFromList(serviceResources, randomize)));

    return buildValue({ filter, label, data });
}

function getQueryParamsAndLabel(data) {
    const filterCombo = getItemFromList(filter_combos, true);
    const queryParams = {};

    for (const filter of filterCombo.filters) {
        queryParams[filter] = getFilterValue(
            filter,
            filterCombo.label,
            data
        );
    }

    return {
        queryParams,
        label: filterCombo.label,
    };
}
