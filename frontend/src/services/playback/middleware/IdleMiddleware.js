import Middleware, {EVENT_FINISH, EVENT_RETURN, EVENT_START} from "@/services/playback/middleware/Middleware";

export default class IdleMiddleware extends Middleware {

    dispatch(message) {
        if (message.data.name === 'event.start') {
            this.manager.dispatchEvent(EVENT_START)
            return Promise.resolve(undefined)
        }

        if (message.data.name === 'event.pause') {
            this.manager.dispatchEvent(EVENT_RETURN, {idle: message.time_created})
            return Promise.resolve(undefined)
        }

        if (message.data.name === 'event.finish') {
            this.manager.dispatchEvent(EVENT_FINISH, null)
            return Promise.resolve(undefined)
        }

        return this.next(message)
    }
}