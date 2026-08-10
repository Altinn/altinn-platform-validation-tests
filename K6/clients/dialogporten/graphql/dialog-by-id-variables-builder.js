export class DialogByIdVariablesBuilder {
    constructor() {
        this.variables = {
            id: null,
        };
    }

    /**
     * @param {uuidv7} id - the id of the dialog to get
     * @returns {DialogSearchVariablesBuilder} TODO: description
     * */
    withId(id) {
        this.variables.id = id;
        return this;
    }

    /**
     * @returns {DialogSearchVariablesBuilder}
     */

    build() {
        return { ...this.variables };
    }
}
