import Middleware from "@/services/playback/middleware/Middleware";

export default class SkipMiddleware extends Middleware {
    skipList = [
        'room.leaveByDaemon',
        //'event.start',
        'event.resume',
        //'event.finish',
    ]
    dispatch(message) {
        if (this.skipList.includes(message.data.name)) {
            return Promise.resolve(undefined)
        }

        return this.next(message)
    }
}