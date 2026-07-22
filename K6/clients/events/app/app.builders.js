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
     * @param {string} source
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithSource(source) {
        this.request.source = source;

        return this;
    }

    /**
     * @param {string} specversion
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithSpecversion(specversion) {
        this.request.specversion = specversion;

        return this;
    }

    /**
     * @param {string} type
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithType(type) {
        this.request.type = type;

        return this;
    }

    /**
     * @param {string} subject
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithSubject(subject) {
        this.request.subject = subject;

        return this;
    }

    /**
     * @param {string} alternativesubject
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithAlternativeSubject(alternativesubject) {
        this.request.alternativesubject = alternativesubject;

        return this;
    }

    /**
     * @param {*} data
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithData(data) {
        this.request.data = data;

        return this;
    }

    /**
     * @param {string} dataschema
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithDataSchema(dataschema) {
        this.request.dataschema = dataschema;

        return this;
    }

    /**
     * @param {ContentType} contenttype
     * @returns {AppCloudEventRequestModelBuilder}
     */
    WithContentType(contenttype) {
        this.request.contenttype = contenttype;

        return this;
    }

    /**
     * @returns {AppCloudEventRequestModel}
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
     * @param {string} after
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithAfter(after) {
        this.query.after = after;

        return this;
    }

    /**
     * @param {string} from
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithFrom(from) {
        this.query.from = from;

        return this;
    }

    /**
     * @param {string} to
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithTo(to) {
        this.query.to = to;

        return this;
    }

    /**
     * @param {number} party
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithParty(party) {
        this.query.party = party;

        return this;
    }

    /**
     * @param {string} unit
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithUnit(unit) {
        this.query.unit = unit;

        return this;
    }

    /**
     * @param {string} person
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithPerson(person) {
        this.query.person = person;

        return this;
    }

    /**
     * @param {string[]} type
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithTypes(type) {
        this.query.type = type;

        return this;
    }

    /**
     * @param {number} size
     * @returns {AppEventsByAppQueryBuilder}
     */
    WithSize(size) {
        this.query.size = size;

        return this;
    }

    /**
     * @returns {Object}
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
     * @param {string} after
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithAfter(after) {
        this.query.after = after;

        return this;
    }

    /**
     * @param {string} from
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithFrom(from) {
        this.query.from = from;

        return this;
    }

    /**
     * @param {string} to
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithTo(to) {
        this.query.to = to;

        return this;
    }

    /**
     * @param {number} party
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithParty(party) {
        this.query.party = party;

        return this;
    }

    /**
     * @param {string} unit
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithUnit(unit) {
        this.query.unit = unit;

        return this;
    }

    /**
     * @param {string} person
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithPerson(person) {
        this.query.person = person;

        return this;
    }

    /**
     * @param {string[]} source
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithSources(source) {
        this.query.source = source;

        return this;
    }

    /**
     * @param {string[]} type
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithTypes(type) {
        this.query.type = type;

        return this;
    }

    /**
     * @param {number} size
     * @returns {AppPartyEventsQueryBuilder}
     */
    WithSize(size) {
        this.query.size = size;

        return this;
    }

    /**
     * @returns {Object}
     */
    Build() {
        return this.query;
    }
}



export {
    AppCloudEventRequestModelBuilder, AppEventsByAppQueryBuilder, AppPartyEventsQueryBuilder,
};
