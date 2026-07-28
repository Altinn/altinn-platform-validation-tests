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
     * @param {string} source TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithSource(source) {
        this.request.source = source;

        return this;
    }

    /**
     * @param {string} specversion TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithSpecversion(specversion) {
        this.request.specversion = specversion;

        return this;
    }

    /**
     * @param {string} type TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithType(type) {
        this.request.type = type;

        return this;
    }

    /**
     * @param {string} subject TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} alternativesubject TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithAlternativeSubject(alternativesubject) {
        this.request.alternativesubject = alternativesubject;

        return this;
    }

    /**
     * @param {*} data TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithData(data) {
        this.request.data = data;

        return this;
    }

    /**
     * @param {string} dataschema TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithDataSchema(dataschema) {
        this.request.dataschema = dataschema;

        return this;
    }

    /**
     * @param {ContentType} contenttype TODO: Description
     * @returns {AppCloudEventRequestModelBuilder} TODO: Description
     */
    WithContentType(contenttype) {
        this.request.contenttype = contenttype;

        return this;
    }

    /**
     * @returns {AppCloudEventRequestModel} TODO: Description
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
     * @param {string} after TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithAfter(after) {
        this.query.after = after;

        return this;
    }

    /**
     * @param {string} from TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithFrom(from) {
        this.query.from = from;

        return this;
    }

    /**
     * @param {string} to TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithTo(to) {
        this.query.to = to;

        return this;
    }

    /**
     * @param {number} party TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithParty(party) {
        this.query.party = party;

        return this;
    }

    /**
     * @param {string} unit TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithUnit(unit) {
        this.query.unit = unit;

        return this;
    }

    /**
     * @param {string} person TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithPerson(person) {
        this.query.person = person;

        return this;
    }

    /**
     * @param {string[]} type TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithTypes(type) {
        this.query.type = type;

        return this;
    }

    /**
     * @param {number} size TODO: Description
     * @returns {AppEventsByAppQueryBuilder} TODO: Description
     */
    WithSize(size) {
        this.query.size = size;

        return this;
    }

    /**
     * @returns {object} TODO: Description
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
     * @param {string} after TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithAfter(after) {
        this.query.after = after;

        return this;
    }

    /**
     * @param {string} from TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithFrom(from) {
        this.query.from = from;

        return this;
    }

    /**
     * @param {string} to TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithTo(to) {
        this.query.to = to;

        return this;
    }

    /**
     * @param {number} party TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithParty(party) {
        this.query.party = party;

        return this;
    }

    /**
     * @param {string} unit TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithUnit(unit) {
        this.query.unit = unit;

        return this;
    }

    /**
     * @param {string} person TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithPerson(person) {
        this.query.person = person;

        return this;
    }

    /**
     * @param {string[]} source TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithSources(source) {
        this.query.source = source;

        return this;
    }

    /**
     * @param {string[]} type TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithTypes(type) {
        this.query.type = type;

        return this;
    }

    /**
     * @param {number} size TODO: Description
     * @returns {AppPartyEventsQueryBuilder} TODO: Description
     */
    WithSize(size) {
        this.query.size = size;

        return this;
    }

    /**
     * @returns {object} TODO: Description
     */
    Build() {
        return this.query;
    }
}

export {
    AppCloudEventRequestModelBuilder, AppEventsByAppQueryBuilder, AppPartyEventsQueryBuilder,
};
