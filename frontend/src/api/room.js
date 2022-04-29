import api from "@/api"

const CHANGE_SETTING_URL = "/room/change-setting"
const room = {
    ID: undefined, //O.o\\
    ROOM_BLOCK_PUBLIC_CHAT: "room.blockPublicChat",
    ROOM_BLOCK_RAISE_HAND: "room.blockRaiseHand",
    ROOM_VIDEO_STRICT_MODE: "room.videoStrictMode",
}

export default {
    /**
     *
     * @param roomId
     * @return {this}
     */
    setRoom(roomId) {
        room.ID = roomId
        return this
    },

    /**
     * @public
     * @param {*} value
     * @param {number} [roomId]
     */
    changeBlockPublicChat(value, roomId = room.ID){
        return this.changeSetting(room.ROOM_BLOCK_PUBLIC_CHAT, value, roomId)
    },

    /**
     * @public
     * @param {*} value
     * @param {number} [roomId]
     */
    changeBlockRaiseHand(value, roomId = room.ID) {
        return this.changeSetting(room.ROOM_BLOCK_RAISE_HAND, value, roomId)
    },

    /**
     * @public
     * @param {number} [roomId]
     */
    lowerRaisedHands(roomId = room.ID) {
        return api.post('room/lower-all-hands', {roomId})
    },

    /**
     * @private
     * @param {string} name
     * @param {*} value
     * @param {number} [roomId]
     */
    changeSetting(name, value, roomId= room.ID) {
        return api.post(CHANGE_SETTING_URL, {roomId, name, value})
    },

    /**
     * @public
     * @param roomId
     * @param streamId
     * @returns {*}
     */
    watch(roomId, streamId){
        return api.post('room/watch', {roomId, streamId});
    },

    /**
     *
     * @param value
     * @param roomId
     * @returns {*}
     */
    changeVideoStrictMode(value, roomId = room.ID) {
        return this.changeSetting(room.ROOM_VIDEO_STRICT_MODE, value, roomId)
    },

    /**
     *
     * @param streamId
     * @returns {*}
     */
    toggleIpCamVideo(streamId){
        return api.post('room/toggle-stream-video', {streamId});
    },

    /**
     *
     * @param value
     * @param roomId
     * @returns {*}
     */
    massToggleIpCamVideo(value, roomId = room.ID){
        return api.post('room/mass-toggle-stream-video', {value, roomId});
    },

    /**
     *
     * @param active
     * @returns {*}
     */
    toggleScreenCapture(active){
        return api.post('room/toggle-screen-capture', {active});
    },

    sendEchoTestMessages(testChannelId, testMsgCount){
        return api.post('room/send-echo-messages', {testChannelId, testMsgCount});
    },

    sendEchoTestResults(hasAudio, hasVideo, sendMessage){
        return api.post('room/set-echo-results', {hasAudio, hasVideo, sendMessage});
    },

    getWebcamFilename(isScreenCapture){
        return api.post('room/get-webcam-filename', {isScreenCapture});
    }
}
