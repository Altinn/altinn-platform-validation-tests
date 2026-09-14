import http from "k6/http";

import { buildUrl, jsonBody, requestParams } from "../../common/request.js";

const TAGS = {
    GetUserProfile: {
        action: "get-user-profile",
    },
    UpdateShowDeleted: {
        action: "update-show-deleted",
    },
    GetActorListOld: {
        action: "get-actor-list-old",
    },
    GetActorList: {
        action: "get-actor-list",
    },
    GetFavorites: {
        action: "get-favorites",
    },
    CreateFavorite: {
        action: "create-favorite",
    },
    DeleteFavorite: {
        action: "delete-favorite",
    },
    GetReportee: {
        action: "get-reportee",
    },
    GetReporteeList: {
        action: "get-reportee-list",
    },
    GetIsAdmin: {
        action: "get-is-admin",
    },
    GetIsClientAdmin: {
        action: "get-is-client-admin",
    },
    GetIsCompanyProfileAdmin: {
        action: "get-is-company-profile-admin",
    },
    GetIsHovedadmin: {
        action: "get-is-hovedadmin",
    },
    GetIsInstanceAdmin: {
        action: "get-is-instance-admin",
    },
    GetIsMaskinportenAdmin: {
        action: "get-is-maskinporten-admin",
    },
};

/**
 * Client for the user endpoints of the Access Management BFF API.
 */
class UserClient {
    /**
     * @param {string} baseUrl Base URL of the host serving the Access Management
     * frontend.
     * @param {*} tokenGenerator Generates bearer tokens.
     */
    constructor(baseUrl, tokenGenerator) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/accessmanagement/api/v1/user";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Gets the profile of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetUserProfile(labels = null) {
        return http.get(
            `${this.FULL_PATH}/profile`,
            requestParams({
                endpoint: `${this.FULL_PATH}/profile`,
                action: TAGS.GetUserProfile.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Updates whether deleted entities are shown for the authenticated user.
     *
     * @param {boolean|null} [body] Whether to show deleted entities.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    UpdateShowDeleted(body = null, labels = null) {
        return http.put(
            `${this.FULL_PATH}/profile/settingspreferences/showdeleted`,
            jsonBody(body),
            requestParams({
                endpoint: `${this.FULL_PATH}/profile/settingspreferences/showdeleted`,
                action: TAGS.UpdateShowDeleted.action,
                labels,
                token: this.tokenGenerator.getToken(),
                json: true,
            }),
        );
    }

    /**
     * Gets the actor list of the authenticated user in the Altinn 2 format.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActorListOld(labels = null) {
        return http.get(
            `${this.FULL_PATH}/actorlist/old`,
            requestParams({
                endpoint: `${this.FULL_PATH}/actorlist/old`,
                action: TAGS.GetActorListOld.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the actor list of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetActorList(labels = null) {
        return http.get(
            `${this.FULL_PATH}/actorlist`,
            requestParams({
                endpoint: `${this.FULL_PATH}/actorlist`,
                action: TAGS.GetActorList.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the favourite actors of the authenticated user.
     *
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetFavorites(labels = null) {
        return http.get(
            `${this.FULL_PATH}/actorlist/favorites`,
            requestParams({
                endpoint: `${this.FULL_PATH}/actorlist/favorites`,
                action: TAGS.GetFavorites.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Adds an actor to the favourites of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the actor.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    CreateFavorite(partyUuid, labels = null) {
        return http.put(
            `${this.FULL_PATH}/actorlist/favorites/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/actorlist/favorites/{partyUuid}`,
                action: TAGS.CreateFavorite.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Removes an actor from the favourites of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the actor.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    DeleteFavorite(partyUuid, labels = null) {
        return http.del(
            `${this.FULL_PATH}/actorlist/favorites/${partyUuid}`,
            null,
            requestParams({
                endpoint: `${this.FULL_PATH}/actorlist/favorites/{partyUuid}`,
                action: TAGS.DeleteFavorite.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets a reportee of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReportee(partyUuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/reportee/${partyUuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/reportee/{partyUuid}`,
                action: TAGS.GetReportee.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Gets the right holders of a reportee of the authenticated user.
     *
     * @param {string} partyUuid Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetReporteeList(partyUuid, labels = null) {
        return http.get(
            `${this.FULL_PATH}/reporteelist/${partyUuid}`,
            requestParams({
                endpoint: `${this.FULL_PATH}/reporteelist/{partyUuid}`,
                action: TAGS.GetReporteeList.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether the authenticated user is an administrator for the reportee.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsAdmin(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isAdmin`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/isAdmin`,
                action: TAGS.GetIsAdmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether the authenticated user is a client administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsClientAdmin(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isClientAdmin`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/isClientAdmin`,
                action: TAGS.GetIsClientAdmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether the authenticated user is a company profile administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsCompanyProfileAdmin(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isCompanyProfileAdmin`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/isCompanyProfileAdmin`,
                action: TAGS.GetIsCompanyProfileAdmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether the authenticated user is a main administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsHovedadmin(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isHovedadmin`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/isHovedadmin`,
                action: TAGS.GetIsHovedadmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether the authenticated user is an instance administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsInstanceAdmin(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isInstanceAdmin`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/isInstanceAdmin`,
                action: TAGS.GetIsInstanceAdmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }

    /**
     * Checks whether the authenticated user is a Maskinporten administrator.
     *
     * @param {string} party Party UUID of the reportee.
     * @param {{[key: string]: string}|null} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse<"text">} Exposes body with best possible type.
     */
    GetIsMaskinportenAdmin(party, labels = null) {
        return http.get(
            buildUrl(`${this.FULL_PATH}/isMaskinportenAdmin`, { party }),
            requestParams({
                endpoint: `${this.FULL_PATH}/isMaskinportenAdmin`,
                action: TAGS.GetIsMaskinportenAdmin.action,
                labels,
                token: this.tokenGenerator.getToken(),
            }),
        );
    }
}

export { UserClient };
