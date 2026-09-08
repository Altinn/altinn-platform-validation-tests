/**
 * The variables the dialogById query takes.
 *
 * @typedef {object} DialogByIdVariables
 * @property {string|null} id The id of the dialog to get.
 */

export class DialogByIdVariablesBuilder {
    constructor() {
        this.variables = /** @type {DialogByIdVariables} */ ({
            id: null,
        });
    }

    /**
     * @param {string} id - the id of the dialog to get
     * @returns {DialogByIdVariablesBuilder} TODO: description
     * */
    withId(id) {
        this.variables.id = id;
        return this;
    }

    /**
     * @returns {DialogByIdVariables} The built variables.
     */

    build() {
        return { ...this.variables };
    }
}

// Runtime stub, so a file documenting this typedef has something to import and an
// editor can follow the name back here.
export const DialogByIdVariables = undefined;
