import { GetActivityLogFilterValuesQuery, GetActivityLogQuery } from "./activity-log.types.js";

/**
 * Builder for the query parameters of {@link GetActivityLog}.
 */
class GetActivityLogQueryBuilder {
    constructor() {
        this.query = /** @type {GetActivityLogQuery} */ ({});
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf of.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.Party = party;
        return this;
    }

    /**
     * Required. Direction of the activity, either "from" or "to".
     *
     * @param {string} direction Direction of the activity, either "from" or "to".
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withDirection(direction) {
        this.query.Direction = direction;
        return this;
    }

    /**
     * Party UUIDs the access was given from. Can be called more than once.
     *
     * @param {string} from Party UUIDs the access was given from.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    addFrom(from) {
        this.query.From ??= [];
        this.query.From.push(from);
        return this;
    }

    /**
     * Party UUIDs the access was given from. Replaces any previous values.
     *
     * @param {Array<string>} fromValues Party UUIDs the access was given from.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withFrom(fromValues) {
        this.query.From = fromValues;
        return this;
    }

    /**
     * Party UUIDs the access was given to. Can be called more than once.
     *
     * @param {string} to Party UUIDs the access was given to.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    addTo(to) {
        this.query.To ??= [];
        this.query.To.push(to);
        return this;
    }

    /**
     * Party UUIDs the access was given to. Replaces any previous values.
     *
     * @param {Array<string>} toValues Party UUIDs the access was given to.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withTo(toValues) {
        this.query.To = toValues;
        return this;
    }

    /**
     * Party UUIDs the access was given via. Can be called more than once.
     *
     * @param {string} via Party UUIDs the access was given via.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    addVia(via) {
        this.query.Via ??= [];
        this.query.Via.push(via);
        return this;
    }

    /**
     * Party UUIDs the access was given via. Replaces any previous values.
     *
     * @param {Array<string>} viaValues Party UUIDs the access was given via.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withVia(viaValues) {
        this.query.Via = viaValues;
        return this;
    }

    /**
     * Party UUIDs of the actors that performed the activity. Can be called more than once.
     *
     * @param {string} by Party UUIDs of the actors that performed the activity.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    addBy(by) {
        this.query.By ??= [];
        this.query.By.push(by);
        return this;
    }

    /**
     * Party UUIDs of the actors that performed the activity. Replaces any previous values.
     *
     * @param {Array<string>} byValues Party UUIDs of the actors that performed the activity.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withBy(byValues) {
        this.query.By = byValues;
        return this;
    }

    /**
     * Activity type UUIDs to filter by. Can be called more than once.
     *
     * @param {string} typeId Activity type UUIDs to filter by.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    addTypeId(typeId) {
        this.query.TypeId ??= [];
        this.query.TypeId.push(typeId);
        return this;
    }

    /**
     * Activity type UUIDs to filter by. Replaces any previous values.
     *
     * @param {Array<string>} typeIdValues Activity type UUIDs to filter by.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withTypeId(typeIdValues) {
        this.query.TypeId = typeIdValues;
        return this;
    }

    /**
     * Optional. Only include activity after this date-time (ISO 8601).
     *
     * @param {string} after Only include activity after this date-time (ISO 8601).
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withAfter(after) {
        this.query.After = after;
        return this;
    }

    /**
     * Optional. Only include activity before this date-time (ISO 8601).
     *
     * @param {string} before Only include activity before this date-time (ISO 8601).
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withBefore(before) {
        this.query.Before = before;
        return this;
    }

    /**
     * Optional. Page number, starting at 0.
     *
     * @param {number} pageNo Page number, starting at 0.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withPageNo(pageNo) {
        this.query.PageNo = pageNo;
        return this;
    }

    /**
     * Optional. Page size, from 1 to 1000.
     *
     * @param {number} pageSize Page size, from 1 to 1000.
     * @returns {GetActivityLogQueryBuilder} This builder, for chaining.
     */
    withPageSize(pageSize) {
        this.query.PageSize = pageSize;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetActivityLogQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for the query parameters of {@link GetActivityLogFilterValues}.
 */
class GetActivityLogFilterValuesQueryBuilder {
    constructor() {
        this.query = /** @type {GetActivityLogFilterValuesQuery} */ ({});
    }

    /**
     * Optional. Free text term to filter the values by.
     *
     * @param {string} term Free text term to filter the values by.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withTerm(term) {
        this.query.Term = term;
        return this;
    }

    /**
     * Optional. Order of the values, either "Name" or "When".
     *
     * @param {string} orderBy Order of the values, either "Name" or "When".
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withOrderBy(orderBy) {
        this.query.OrderBy = orderBy;
        return this;
    }

    /**
     * Required. Party UUID of the party the request is made on behalf of.
     *
     * @param {string} party Party UUID of the party the request is made on behalf of.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withParty(party) {
        this.query.Party = party;
        return this;
    }

    /**
     * Required. Direction of the activity, either "from" or "to".
     *
     * @param {string} direction Direction of the activity, either "from" or "to".
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withDirection(direction) {
        this.query.Direction = direction;
        return this;
    }

    /**
     * Party UUIDs the access was given from. Can be called more than once.
     *
     * @param {string} from Party UUIDs the access was given from.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    addFrom(from) {
        this.query.From ??= [];
        this.query.From.push(from);
        return this;
    }

    /**
     * Party UUIDs the access was given from. Replaces any previous values.
     *
     * @param {Array<string>} fromValues Party UUIDs the access was given from.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withFrom(fromValues) {
        this.query.From = fromValues;
        return this;
    }

    /**
     * Party UUIDs the access was given to. Can be called more than once.
     *
     * @param {string} to Party UUIDs the access was given to.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    addTo(to) {
        this.query.To ??= [];
        this.query.To.push(to);
        return this;
    }

    /**
     * Party UUIDs the access was given to. Replaces any previous values.
     *
     * @param {Array<string>} toValues Party UUIDs the access was given to.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withTo(toValues) {
        this.query.To = toValues;
        return this;
    }

    /**
     * Party UUIDs the access was given via. Can be called more than once.
     *
     * @param {string} via Party UUIDs the access was given via.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    addVia(via) {
        this.query.Via ??= [];
        this.query.Via.push(via);
        return this;
    }

    /**
     * Party UUIDs the access was given via. Replaces any previous values.
     *
     * @param {Array<string>} viaValues Party UUIDs the access was given via.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withVia(viaValues) {
        this.query.Via = viaValues;
        return this;
    }

    /**
     * Party UUIDs of the actors that performed the activity. Can be called more than once.
     *
     * @param {string} by Party UUIDs of the actors that performed the activity.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    addBy(by) {
        this.query.By ??= [];
        this.query.By.push(by);
        return this;
    }

    /**
     * Party UUIDs of the actors that performed the activity. Replaces any previous values.
     *
     * @param {Array<string>} byValues Party UUIDs of the actors that performed the activity.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withBy(byValues) {
        this.query.By = byValues;
        return this;
    }

    /**
     * Activity type UUIDs to filter by. Can be called more than once.
     *
     * @param {string} typeId Activity type UUIDs to filter by.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    addTypeId(typeId) {
        this.query.TypeId ??= [];
        this.query.TypeId.push(typeId);
        return this;
    }

    /**
     * Activity type UUIDs to filter by. Replaces any previous values.
     *
     * @param {Array<string>} typeIdValues Activity type UUIDs to filter by.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withTypeId(typeIdValues) {
        this.query.TypeId = typeIdValues;
        return this;
    }

    /**
     * Optional. Only include activity after this date-time (ISO 8601).
     *
     * @param {string} after Only include activity after this date-time (ISO 8601).
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withAfter(after) {
        this.query.After = after;
        return this;
    }

    /**
     * Optional. Only include activity before this date-time (ISO 8601).
     *
     * @param {string} before Only include activity before this date-time (ISO 8601).
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withBefore(before) {
        this.query.Before = before;
        return this;
    }

    /**
     * Optional. Page number, starting at 0.
     *
     * @param {number} pageNo Page number, starting at 0.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withPageNo(pageNo) {
        this.query.PageNo = pageNo;
        return this;
    }

    /**
     * Optional. Page size, from 1 to 1000.
     *
     * @param {number} pageSize Page size, from 1 to 1000.
     * @returns {GetActivityLogFilterValuesQueryBuilder} This builder, for chaining.
     */
    withPageSize(pageSize) {
        this.query.PageSize = pageSize;
        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {GetActivityLogFilterValuesQuery} The built query parameters.
     */
    build() {
        return this.query;
    }
}

export {
    GetActivityLogFilterValuesQueryBuilder,
    GetActivityLogQueryBuilder,
};
