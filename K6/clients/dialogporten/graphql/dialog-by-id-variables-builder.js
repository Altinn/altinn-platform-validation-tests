export class DialogByIdVariablesBuilder {
    constructor() {
        this.variables = {
            id: null,
        };
    }

    /**
     * @param {uuidv7} id - the id of the dialog to get
     * @return {DialogSearchVariablesBuilder}
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
