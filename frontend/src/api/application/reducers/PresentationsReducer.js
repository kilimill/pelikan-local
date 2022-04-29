import AbstractReducer from "@/api/application/reducers/AbstractReducer";
import camelcase from "camelcase";
import SimpleObjectHydration from "@/abstract/SimpleObjectHydration";
import {mapKeys} from "lodash";

export default class PresentationsReducer extends AbstractReducer {

    get sourcePresentations() {
        return this.propertyValue
    }

    execute() {
        const list = this.#getResultList()
        const current = this.getConfigurationValue('currentRoom/settings/currentPresId')
        const strict = this.getConfigurationValue('currentRoom/settings/presStrictMode')

        return {list, current, strict}
    }

    static reducePresentation(presentation) {
        const resultTemplate = {
            activity: undefined,
            default: undefined,
            id: undefined,
            listName: undefined,
            pagesTotal: undefined,
            roomId: undefined,
            slideIndex: undefined,
        }, hydration = new SimpleObjectHydration(resultTemplate)

        presentation = mapKeys(presentation, (value, key) => camelcase(key.replace(/^pres_/, "")))

        return hydration.hydrate(presentation)
    }

    #getResultList() {
        return (this.sourcePresentations || []).map(presentation => {
            return PresentationsReducer.reducePresentation(presentation)
        })
    }
}