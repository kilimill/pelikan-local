import notifyService from "@/services/notify";

/**
 * @type {import("vuex/types").Plugin}
 * @param {import("vuex/types").Store} store
 */
const privateNotifier = store => {
    const handleMessage = (userId, message) => {
        let user = store.getters["room/users/findUser"](userId),
            targetUserId = store.state.user.id,
            time = (new Date()).toLocaleTimeString().replace(/:[^:]+$/, ''),
            alias = message

        if (user instanceof Object) {
            return {data: {userId, alias, time, targetUserId, system: true, message: null}}
        } else throw new Error(`User #${userId} not found`)
    }

    notifyService.subscribe((from, message) => store.dispatch("eventRoomMessagePrivate", handleMessage(from, message)))
}

export default privateNotifier