export class DialogByIdVariablesBuilder {
    constructor() {
        this.variables = {
            id: null,
        };
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
     * @returns {DialogByIdVariablesBuilder}
     */

    build() {
        return { ...this.variables };
    }
}
