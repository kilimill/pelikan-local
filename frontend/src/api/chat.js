import api from "@/api"

const COMMON_MESSAGE_SEND_URL = "room/message"
const COMMON_MESSAGE_DELETE_URL = "room/delete-message"

export default {
    /**
     * @public
     * @param {number} from
     * @param {string} message
     */
    sendPublicMessage({from, message}) {
        return this.sendMessage("public", {userId: from, message})
    },
    /**
     * @public
     * @param {number} id
     */
    deletePublicMessage(id) {
        return this.deleteMessage("public", id)
    },
    /**
     * @public
     * @param {number} from
     * @param {number} to
     * @param {string} message
     */
    sendPrivateMessage({from, to, message}) {
        return this.sendMessage("private", {userId: from, targetId: to, message})
    },

    /**
     * @private
     * @param {string} target
     * @param {number} id
     */
    deleteMessage(target, id) {
        return api.post(`${COMMON_MESSAGE_DELETE_URL}-${target}`, {eventId:id})
    },

    /**
     * @private
     * @param {string} target
     * @param {Object} data
     */
    sendMessage(target, data) {
        return api.post(`${COMMON_MESSAGE_SEND_URL}-${target}`, data)
    }
}