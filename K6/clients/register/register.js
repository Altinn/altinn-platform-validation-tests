import http from "k6/http";

const TAGS = {
    AccessManagementPartiesQuery: {
        action: "register-access-management-parties-query",
    },
    GetCustomers: {
        action: "register-get-customers",
    },
};

/**
 * The roles from the Central Coordinating Register (Enhetsregisteret) that a
 * party can hold on behalf of its customers, and that Register serves a customer
 * list for. The values are the last path segment of the endpoint.
 *
 * Register has one endpoint per role rather than a role parameter, but they take
 * the same arguments and answer with the same shape, so the client models them
 * as one call. This object is the list of roles that call accepts.
 *
 * @readonly
 */
const CcrCustomerRoles = {
    // Auditor.
    REVISOR: "revisor",
    // Accountant.
    REGNSKAPSFORER: "regnskapsforer",
    // Property manager.
    FORRETNINGSFORER: "forretningsforer",
};

/**
 * Client for the Register API.
 *
 * Swagger: https://github.com/Altinn/altinn-register
 *
 * Only the endpoints the tests in this repo call are covered. Register serves
 * one set of party endpoints per consumer (access-management, correspondence,
 * dialogporten, apps, ...), all reading the same parties but each returning the
 * shape its consumer asked for. Add the consumer you need rather than reusing
 * another one's endpoint.
 *
 * The endpoints do not share an authentication scheme: the access-management
 * query takes a platform access token, while the internal party endpoints take
 * a bearer token with the `altinn:register/partylookup.admin` scope. The token
 * generator handed to the constructor therefore has to match the endpoints the
 * caller intends to use, which in practice means one client instance per token
 * flavour.
 */
class RegisterClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.at22.altinn.cloud.
     * @param {*} tokenGenerator Generates the tokens used to call the API.
     * @param {string} subscriptionKey APIM subscription key for Register.
     */
    constructor(baseUrl, tokenGenerator, subscriptionKey) {
        /**
         * Generates authentication tokens.
         */
        this.tokenGenerator = tokenGenerator;

        /**
         * Sent as `Ocp-Apim-Subscription-Key`. Required by APIM in front of
         * Register, and unrelated to what the token says the caller may do.
         */
        this.subscriptionKey = subscriptionKey;

        /**
         * Base API path.
         */
        this.BASE_PATH = "/register/api/v1";

        /**
         * Fully-qualified API path.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}`;
    }

    static get TAGS() {
        return TAGS;
    }

    /**
     * Looks up parties by identifier, for the access-management consumer.
     *
     * An identifier that is not found is left out of the response rather than
     * failing the request, so a successful response may hold fewer items than
     * the request asked for.
     *
     * Authenticated with a platform access token.
     *
     * @param {Array<PartyUrn>} urns The party identifiers to look up.
     * @param {Array<PartyFieldInclude>} [fields]
     * The fields to include in the response. Everything outside the default set
     * has to be asked for, so a caller that reads `user.username` has to include
     * `user` or `user.username` here.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Body holds a PartyRecord list object.
     */
    AccessManagementPartiesQuery(urns, fields = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const path = `${this.FULL_PATH}/access-management/parties/query`;

        let url = path;

        if (fields !== null) {
            url += `?fields=${encodeURIComponent(fields.join(","))}`;
        }

        let tags = {
            endpoint: url,
            name: path,
            action: TAGS.AccessManagementPartiesQuery.action,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(url, JSON.stringify({ data: urns }), {
            tags,
            headers: {
                PlatformAccessToken: token,
                "Ocp-Apim-Subscription-Key": this.subscriptionKey,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    /**
     * Gets the customers of a party for one of its roles from the Central
     * Coordinating Register (Enhetsregisteret): the parties that have assigned
     * that role to this party. An auditor's customers are the organizations that
     * have made it their `revisor`.
     *
     * Register exposes one endpoint per role. They take the same arguments and
     * answer with the same shape, so the role is a parameter here rather than
     * three near-identical methods. `ccrRole` goes into the path, so a value
     * outside CcrCustomerRoles is a 404 rather than a validation error.
     *
     * Authenticated with a bearer token holding the
     * `altinn:register/partylookup.admin` scope.
     *
     * @param {string} partyUuid The party whose customers to get.
     * @param {string} ccrRole The role the customers have assigned, from CcrCustomerRoles.
     * @param {Array<PartyFieldInclude>} [fields] The party fields to include.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Body holds a Party list object.
     */
    GetCustomers(partyUuid, ccrRole, fields = null, labels = null) {
        const token = this.tokenGenerator.getToken();

        const path = `${this.FULL_PATH}/internal/parties/${partyUuid}/customers/ccr/${ccrRole}`;

        let url = path;

        if (fields !== null) {
            url += `?fields=${encodeURIComponent(fields.join(","))}`;
        }

        // The role stays out of the name tag and gets its own, so the three roles
        // share one endpoint in the metrics and can still be told apart.
        let tags = {
            endpoint: url,
            name: `${this.FULL_PATH}/internal/parties/{partyUuid}/customers/ccr/{ccrRole}`,
            action: TAGS.GetCustomers.action,
            ccrRole: ccrRole,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.get(url, {
            tags,
            headers: {
                Authorization: `Bearer ${token}`,
                "Ocp-Apim-Subscription-Key": this.subscriptionKey,
                Accept: "application/json",
            },
        });
    }
}

export { CcrCustomerRoles, RegisterClient };
