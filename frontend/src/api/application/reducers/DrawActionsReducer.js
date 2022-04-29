import AbstractReducer from "@/api/application/reducers/AbstractReducer";

export default class DrawActionsReducer extends AbstractReducer {
    get sourceDrawActions() {
        return this.propertyValue
    }

    execute() {
        if (this.sourceDrawActions instanceof Object) {
            const destinationDrawActions = []

            for (let presentationId of this.extractIDs(this.sourceDrawActions)) {
                for (let slideIndex of this.extractIDs(this.sourceDrawActions[presentationId])) {
                    let drawActions = this.actionsTypecasting(this.sourceDrawActions[presentationId][slideIndex])
                    destinationDrawActions.push({presentationId, slideIndex, drawActions})
                }
            }

            return destinationDrawActions
        } else return []
    }

    /**
     * Extract IDs from object keys
     * @protected
     * @param {Object} targetObject
     * @return {number[]}
     */
    extractIDs(targetObject) {
        return (targetObject instanceof Object ? Object.keys(targetObject) : [])
            .map(id => parseInt(id))
    }

    /**
     *
     * @param {Object} actions
     * @return {object} tool releases
     */
    actionsTypecasting(actions) {
        return actions instanceof Object ? Object.values(actions).map(action => ({
            ...action.settings,
            path: action.coords
        })): []
    }
}