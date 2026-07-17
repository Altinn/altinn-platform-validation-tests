import { get, post, put, patch } from "../http-client.js";

/**
 * Client for Users endpoints.
 */
export class UsersClient {
    /**
     * Gets the user profile for a given user id.
     *
     * @param {number} userID
     * @returns {Promise<UserProfile>}
     */
    async getUserById(userID) {
        return get(`/users/${userID}`);
    }

    /**
     * Gets the user profile for a given user uuid.
     *
     * @param {string} userUuid
     * @returns {Promise<UserProfile>}
     */
    async getUserByUuid(userUuid) {
        return get(`/users/byuuid/${userUuid}`);
    }

    /**
     * Gets the current user based on the request context.
     *
     * @returns {Promise<UserProfile>}
     */
    async getCurrentUser() {
        return get("/users/current");
    }

    /**
     * Gets the user profile for a given SSN.
     *
     * @param {string} ssn
     * @returns {Promise<UserProfile>}
     */
    async getUserBySsn(ssn) {
        return post("/users", ssn);
    }

    /**
     * Updates the profile settings of the current user.
     *
     * @param {ProfileSettingPutRequest} request
     * @returns {Promise<ProfileSettingPreference>}
     */
    async updateProfileSettings(request) {
        return put("/users/current/profilesettings", request);
    }

    /**
     * Partially updates the profile settings of the current user.
     *
     * @param {ProfileSettingsPatchRequest} request
     * @returns {Promise<ProfileSettingPreference>}
     */
    async patchProfileSettings(request) {
        return patch("/users/current/profilesettings", request);
    }
}
