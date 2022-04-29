import api from "@/api"

/**
 * @typedef {import("axios/index").AxiosResponse} AxiosResponse
 */

export default {
    /**
     *
     * @param {Number} presentationId
     * @param {Number} slideIndex
     * @param {Object} toolRelease
     * @return {Promise<AxiosResponse<any>>}
     */
    draw(presentationId, slideIndex, toolRelease) {
        let settings = Object.entries(toolRelease).reduce((a, [key, value]) => {
            return key === 'path' ? a : {...a, [key]: value}
        }, {}), pointsData = {settings, coords: toolRelease.path}

        return api.post("room/send-coordinates", {presentationId, slideIndex, pointsData})
    },

    undo(presentationId, slideIndex) {
        return api.post("room/undo-slide-draw-action", {presentationId, slideIndex})
    },

    delete(presentationId, slideIndex) {
        return api.post("room/delete-slide-draw-actions", {presentationId, slideIndex})
    }
}