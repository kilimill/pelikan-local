import mitt from "mitt";
import Dispatcher from "@/services/message/Dispatcher";
import ChannelsCollection from "@/services/message/ChannelsCollection";
import Connection from "@/services/message/Connection";
import Subscription from "@/services/message/Subscription";

/**
 * message Service
 * Подписка/Отписка на каналы
 */
export default new class MessageService {
    /** @type {import("mitt").Emitter} */
    #emitter
    /** @type {Dispatcher} */
    #dispatcher
    /** @type {ChannelsCollection} */
    #channels

    constructor() {
        this.#emitter = mitt()
        this.#dispatcher = new Dispatcher()
        this.#channels = new ChannelsCollection()
        this.#dispatch()
    }

    /**
     * Конфигурирование сервиса
     * @param {String[]} servers
     * @param {String} [protocol]
     */
    configure(servers, userToken, protocol = 'wss', route) {
        this.#dispatcher.configure({servers, protocol}, userToken)
        this.#dispatcher.connect(route)
    }

    /**
     * Подписка
     * @param {string} channelName
     * @param {function (subscription: Subscription): void} subscriptionHandler
     * @return {*}
     */
    subscribe(channelName, subscriptionHandler) {
        channelName.forEach(item => {
            if (typeof item !== 'string') {
                throw new Error(`invalid type ${typeof item}, string expected`)
            }

            let channel = this.#channels.getChannel(item)
            if (channel === undefined) {
                channel = this.#channels.addChannel(item)
            }

            return subscriptionHandler(new Subscription(channel))
        })
    }
    
    removeChannel(channelName) {
        this.#channels.removeChannel(channelName)
    }

    #dispatch() {
        [
            ...Connection.EVENTS.map(e => `connection:${e}`),
            ...Dispatcher.EVENTS.map(e => `dispatcher:${e}`),
        ].forEach(eventType => {
            this.#dispatcher.on(eventType, ({channel, event}) => {
                if (this.#channels.hasChannel(channel)) {
                    this.#channels.getChannel(channel).emit(eventType.replace(/^[^:]+:/, ''), event)
                }

                if (process.env.NODE_ENV === "development") {
                    // console.info({eventType, channel, event})
                }
            })
        })
    }
}
