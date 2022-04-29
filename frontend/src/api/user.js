import api from "@/api"

export default {
    updateActivity() {
        return api.post('room/update-activity')
    },
    toggleRaiseHand(userId, roomId) {
        return api.post('room/raise-hand', {userId, roomId})
    },
    changeUserSetting(userId, name, value){
        return api.post('user/change-setting', {userId, name, value})
    },

    call(userId) {
        return api.post('room/call-user', {userId})
    },

    dropCall(userId, removeHasDevices = false) {
        return api.post('room/drop-user-call', {userId, removeHasDevices})
    },
    sendParticipantStreamEvent(){
        return api.post('room/participant-stream-event')
    },

    userCallControlPassed(){
        return api.post('room/user-call-control-passed')
    },

    rejectCall(userId, timeout = false){
        return api.post('room/reject-user-call', {userId, timeout})
    },

    sendGUMError(error, msg){
        return api.post('room/send-gum-error', {error, msg})
    },

    broadcastStream(serverId, roomId, typeId, publisherId){
        return api.post('room/broadcast-stream', {serverId, roomId, typeId, publisherId})
    }

}