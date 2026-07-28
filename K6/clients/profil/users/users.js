import { get, patch, post, put } from "../http-client.js";

/**
 * Client for Users endpoints.
 */
export class UsersClient {
    /**
     * Gets the user profile for a given user id.
     *
     * @param {number} userID TODO: Description
     * @returns {Promise<UserProfile>} TODO: Description
     */
    async getUserById(userID) {
        return get(`/users/${userID}`);
    }

    /**
     * Gets the user profile for a given user uuid.
     *
     * @param {string} userUuid TODO: Description
     * @returns {Promise<UserProfile>} TODO: Description
     */
    async getUserByUuid(userUuid) {
        return get(`/users/byuuid/${userUuid}`);
    }

    /**
     * Gets the current user based on the request context.
     *
     * @returns {Promise<UserProfile>} TODO: Description
     */
    async getCurrentUser() {
        return get("/users/current");
    }

    /**
     * Gets the user profile for a given SSN.
     *
     * @param {string} ssn TODO: Description
     * @returns {Promise<UserProfile>} TODO: Description
     */
    async getUserBySsn(ssn) {
        return post("/users", ssn);
    }

    /**
     * Updates the profile settings of the current user.
     *
     * @param {ProfileSettingPutRequest} request TODO: Description
     * @returns {Promise<ProfileSettingPreference>} TODO: Description
     */
    async updateProfileSettings(request) {
        return put("/users/current/profilesettings", request);
    }

    /**
     * Partially updates the profile settings of the current user.
     *
     * @param {ProfileSettingsPatchRequest} request TODO: Description
     * @returns {Promise<ProfileSettingPreference>} TODO: Description
     */
    async patchProfileSettings(request) {
        return patch("/users/current/profilesettings", request);
    }
}
