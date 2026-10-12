/**
 * @typedef {object} AppCloudEventRequestModel
 * @property {string|null} source Source of the event.
 * @property {string|null} specversion Specification version of the event.
 * @property {string|null} type Type of the event.
 * @property {string|null} subject Subject of the event.
 * @property {string|null} alternativesubject Alternative subject of the event.
 * @property {*} data CloudEvent data content. The event payload.
 * @property {string|null} dataschema Link to the schema that the data attribute adheres to.
 * @property {ContentType|null} contenttype Content type of the event payload.
 */

/**
 * @typedef {object} CloudEvent
 * @property {string|null} [specVersion] Specification version. Read-only.
 * @property {*} data Event payload.
 * @property {string|null} dataContentType Content type of the event payload.
 * @property {string|null} id Event identifier.
 * @property {string|null} dataSchema Schema of the event data.
 * @property {string|null} source Source URI of the event.
 * @property {string|null} subject Event subject.
 * @property {string|null} time Event timestamp.
 * @property {string|null} type Event type.
 * @property {string|null} [resourceinstance] Identifier of the specific instance of the resource the event relates to.
 * @property {string|null} [resource] URN uniquely identifying the resource the event relates to.
 * @property {string|null} [alternativesubject] Alternative identifier for the subject of the event, e.g. a person or organisation number.
 */

/**
 * @typedef {object} ContentType
 * @property {string|null} boundary Multipart boundary.
 * @property {string|null} charSet Character set.
 * @property {string|null} mediaType Media type.
 * @property {string|null} name Content type name.
 * @property {*[]|null} parameters Content type parameters.
 */

/**
 * Query parameters used when retrieving cloud events.
 *
 * @typedef {object} EventsQueryParams
 * @property {string} resource Required resource attribute.
 * @property {string|null} [after] Retrieve events registered after this event id.
 * @property {string|null} [subject] Filter events by exact subject.
 * @property {string|null} [alternativeSubject] Filter events by alternative subject header.
 * @property {string[]|null} [type] Filter by event types.
 * @property {number|null} [size] Maximum number of events to return.
 */

/**
 * Response returned when retrieving events.
 *
 * @typedef {CloudEvent[]} EventsResponse
 */

/**
 * Response returned after posting a cloud event.
 *
 * @typedef {string} EventsPostResponse
 */

/**
 * Problem details returned by the API on validation errors.
 *
 * @typedef {object} ProblemDetails
 * @property {string|null} [type] Error type URI.
 * @property {string|null} [title] Error title.
 * @property {number|null} [status] HTTP status code.
 * @property {string|null} [detail] Error description.
 * @property {string|null} [instance] Error instance URI.
 */

/**
 * Class that describes the events subscription request model.
 *
 * @typedef {object} SubscriptionRequestModel
 * @property {string|null} endPoint Endpoint to receive matching events.
 * @property {string|null} sourceFilter Filter on source.
 * @property {string|null} subjectFilter Filter on subject.
 * @property {string|null} resourceFilter Filter on resource.
 * @property {string|null} alternativeSubjectFilter Filter on alternative subject.
 * @property {string|null} typeFilter Filter for event type.
 * @property {boolean} [includeSubunits] Whether to include events for sub-units of the subject. Only has an effect when subjectFilter identifies the main unit of the organisation.
 */

/**
 * Class that describes an events subscription.
 *
 * @typedef {object} Subscription
 * @property {number} id Subscription id.
 * @property {string|null} endPoint Endpoint to receive matching events.
 * @property {string|null} sourceFilter Filter on source.
 * @property {string|null} resourceFilter Filter on resource.
 * @property {string|null} subjectFilter Filter on subject.
 * @property {string|null} alternativeSubjectFilter Filter on alternative subject.
 * @property {string|null} typeFilter Filter for event type.
 * @property {string|null} consumer Events consumer.
 * @property {string|null} createdBy User or organisation that created the subscription.
 * @property {string} created When the subscription was created.
 * @property {boolean} validated Whether the subscription has been validated.
 * @property {boolean} includeSubunits Whether to include events for sub-units of the subject. Only has an effect when subjectFilter identifies the main unit of the organisation.
 */

/**
 * An object containing a list of subscriptions and metadata.
 *
 * @typedef {object} SubscriptionList
 * @property {number} count Number of subscriptions in the list.
 * @property {Subscription[]|null} subscriptions List of subscriptions.
 */

/**
 * Query parameters for the app events of one application owner and application.
 *
 * @typedef {object} AppEventsByAppQuery
 * @property {string} [after] Retrieve events registered after this event id.
 * @property {string} [from] Retrieve events registered after this time.
 * @property {string} [to] Retrieve events registered before this time.
 * @property {number} [party] Party id filter.
 * @property {string} [unit] Organisation number filter.
 * @property {string} [person] Person identifier filter.
 * @property {string[]} [type] Filter by event types.
 * @property {number} [size] Maximum number of events to return.
 */

/**
 * Query parameters for the app events of one party.
 *
 * @typedef {object} AppPartyEventsQuery
 * @property {string} [after] Retrieve events registered after this event id.
 * @property {string} [from] Retrieve events registered after this time.
 * @property {string} [to] Retrieve events registered before this time.
 * @property {number} [party] Party id filter.
 * @property {string} [unit] Organisation number filter.
 * @property {string} [person] Person identifier filter.
 * @property {string[]} [source] Source filters.
 * @property {string[]} [type] Filter by event types.
 * @property {number} [size] Maximum number of events to return.
 */

export const AppCloudEventRequestModel = undefined;
export const AppEventsByAppQuery = undefined;
export const AppPartyEventsQuery = undefined;
export const CloudEvent = undefined;
export const ContentType = undefined;
export const EventsQueryParams = undefined;
export const Subscription = undefined;
export const SubscriptionList = undefined;
export const SubscriptionRequestModel = undefined;
