import { AppCloudEventRequestModel, AppEventsByAppQuery, AppPartyEventsQuery, ContentType } from "../types.js";

class AppCloudEventRequestModelBuilder {
    constructor() {
        this.request = {
            source: null,
            specversion: null,
            type: null,
            subject: null,
            alternativesubject: null,
            data: null,
            dataschema: null,
            contenttype: null,
        };
    }

    /**
     * @param {string} source See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithSource(source) {
        this.request.source = source;

        return this;
    }

    /**
     * @param {string} specversion See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithSpecversion(specversion) {
        this.request.specversion = specversion;

        return this;
    }

    /**
     * @param {string} type See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithType(type) {
        this.request.type = type;

        return this;
    }

    /**
     * @param {string} subject See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} alternativesubject See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithAlternativeSubject(alternativesubject) {
        this.request.alternativesubject = alternativesubject;

        return this;
    }

    /**
     * @param {*} data See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithData(data) {
        this.request.data = data;

        return this;
    }

    /**
     * @param {string} dataschema See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithDataSchema(dataschema) {
        this.request.dataschema = dataschema;

        return this;
    }

    /**
     * @param {ContentType} contenttype See the client method.
     * @returns {AppCloudEventRequestModelBuilder} This builder, for chaining.
     */
    WithContentType(contenttype) {
        this.request.contenttype = contenttype;

        return this;
    }

    /**
     * @returns {AppCloudEventRequestModel} The built payload.
     */
    Build() {
        return this.request;
    }
}
class AppEventsByAppQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} after See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithAfter(after) {
        this.query.after = after;

        return this;
    }

    /**
     * @param {string} from See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.query.from = from;

        return this;
    }

    /**
     * @param {string} to See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.query.to = to;

        return this;
    }

    /**
     * @param {number} party See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithParty(party) {
        this.query.party = party;

        return this;
    }

    /**
     * @param {string} unit See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithUnit(unit) {
        this.query.unit = unit;

        return this;
    }

    /**
     * @param {string} person See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithPerson(person) {
        this.query.person = person;

        return this;
    }

    /**
     * @param {string[]} type See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithTypes(type) {
        this.query.type = type;

        return this;
    }

    /**
     * @param {number} size See the client method.
     * @returns {AppEventsByAppQueryBuilder} This builder, for chaining.
     */
    WithSize(size) {
        this.query.size = size;

        return this;
    }

    /**
     * @returns {AppEventsByAppQuery} The built payload.
     */
    Build() {
        return this.query;
    }
}

class AppPartyEventsQueryBuilder {
    constructor() {
        this.query = {};
    }

    /**
     * @param {string} after See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithAfter(after) {
        this.query.after = after;

        return this;
    }

    /**
     * @param {string} from See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithFrom(from) {
        this.query.from = from;

        return this;
    }

    /**
     * @param {string} to See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithTo(to) {
        this.query.to = to;

        return this;
    }

    /**
     * @param {number} party See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithParty(party) {
        this.query.party = party;

        return this;
    }

    /**
     * @param {string} unit See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithUnit(unit) {
        this.query.unit = unit;

        return this;
    }

    /**
     * @param {string} person See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithPerson(person) {
        this.query.person = person;

        return this;
    }

    /**
     * @param {string[]} source See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithSources(source) {
        this.query.source = source;

        return this;
    }

    /**
     * @param {string[]} type See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithTypes(type) {
        this.query.type = type;

        return this;
    }

    /**
     * @param {number} size See the client method.
     * @returns {AppPartyEventsQueryBuilder} This builder, for chaining.
     */
    WithSize(size) {
        this.query.size = size;

        return this;
    }

    /**
     * @returns {AppPartyEventsQuery} The built payload.
     */
    Build() {
        return this.query;
    }
}

export {
    AppCloudEventRequestModelBuilder, AppEventsByAppQueryBuilder, AppPartyEventsQueryBuilder,
};
