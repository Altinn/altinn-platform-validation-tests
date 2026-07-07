/**
 * @typedef {object} ReceivedRequestsParams
 * @property {string} party - required, the party whose received requests are listed (party uuid)
 * @property {string=} from - filter on the party the requests originate from (party uuid)
 * @property {string[]=} status - filter on request status
 * @property {string=} type - filter on request type
 */

/**
 * Valid values for the `status` query parameter (RequestStatus enum).
 *
 * @see https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Request/get_enduser_request_received
 */
export const RequestStatus = {
    None: "None",
    Draft: "Draft",
    Pending: "Pending",
    Approved: "Approved",
    Rejected: "Rejected",
    Withdrawn: "Withdrawn",
};

/**
 * Builder for the GET /enduser/request/received query parameters.
 * `party` is required; everything else is optional.
 *
 * @see https://docs.altinn.studio/nb/api/accessmanagement/enduser/#/Request/get_enduser_request_received
 * @example
 * const queryParams = new ReceivedRequestsParamsBuilder()
 *     .withParty("a3a3...-...-...-...")        // partyUuid
 *     .withFrom("b4b4...-...-...-...")         // optional, partyUuid
 *     .withStatus(RequestStatus.Pending)       // optional, enum value()
 *     .build();
 */
export class ReceivedRequestsParamsBuilder {
    constructor() {
        this.params = {};
    }

    /**
     * Required. The party whose received requests are listed
     *
     * @param {string} party - party uuid, e.g. "a3a3...-...-...-..."
     * @returns {ReceivedRequestsParamsBuilder} TODO: description
     */
    withParty(party) {
        this.params.party = party;
        return this;
    }

    /**
     * Optional. Only return requests originating from this party
     *
     * @param {string} from - party uuid, e.g. "b4b4...-...-...-..."
     * @returns {ReceivedRequestsParamsBuilder} TODO: description
     */
    withFrom(from) {
        this.params.from = from;
        return this;
    }

    /**
     * Optional. Filter on one or more request statuses.
     *
     * @param {string|string[]} status - one or more {@link RequestStatus} values, e.g. RequestStatus.Pending
     * @returns {ReceivedRequestsParamsBuilder} TODO: description
     */
    withStatus(status) {
        this.params.status = Array.isArray(status) ? status : [status];
        return this;
    }

    /**
     * Optional. Filter on request type.
     *
     * @param {string} type TODO: description
     * @returns {ReceivedRequestsParamsBuilder} TODO: description
     */
    withType(type) {
        this.params.type = type;
        return this;
    }

    /**
     * @returns {ReceivedRequestsParams} TODO: description
     */
    build() {
        if (this.params.party === undefined) {
            throw new Error("ReceivedRequestsParamsBuilder: party is required");
        }
        return { ...this.params };
    }
}
