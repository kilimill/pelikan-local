/*eslint no-dupe-class-members: "off"*/
import Connection from "@/services/message/Connection"
import ConnectsCollection from "@/services/message/ConnectsCollection";
import mitt from "mitt"
import message from "@/services/message/message";

/**
 * Dispatch connections
 */

export default class Dispatcher {
    /** @type {String[]} */
    #servers

    /** {String} */
    #protocol

    /** {String} */
    #userToken

    /** @type {import("mitt/index").Emitter} */
    #emitter

    /** @type {ConnectsCollection}*/
    #connections

    /** @type {Boolean} */
    #connected;

    /**
     * @param {String[]} [servers]
     * @param {String[]} [channels]
     * @param {String} [proto]
     */
    constructor(servers = [], channels = [], proto = 'ws', userToken = '') {
        this.#protocol = proto
        this.#userToken = userToken
        this.#emitter = mitt()
        this.#connections = new ConnectsCollection()
        this.configure({servers, channels})

        this.on('dispatcher:connect, dispatcher:disconnect', ({connected}) => {
            this.#connected = connected
        })
    }

    /**
     *
     * @param {String[]} [servers]
     * @param {String[]} [channels]
     * @param {String} [protocol]
     */
    configure({servers, channels, protocol = this.#protocol}, userToken) {
        this.#protocol = protocol
        this.#userToken = userToken,
        this.servers = servers && servers.length ? servers : this.#servers || []
        this.channels = channels && channels.length ? channels : this.channels || []
    }

    connect(route) {
        if (!this.#connections.hasConnection(route) && typeof route === "string") {
            let connection = new Connection(route, {protocol: this.#protocol, servers: this.#servers}, this.#userToken)
            this.#connections.addConnection(connection)
            this.#dispatch(connection)
            
            if (this.isConnected) {
                connection.open()
            }
        }

        if (!this.isConnected) {
            this.#connections.each(connection => connection.open())
            this.#emitter.emit('dispatcher:connect', {connected: true})
        }

    }

    disconnect() {
        if (this.isConnected) {
            this.#connections.each(connection => connection.close())
            this.#emitter.emit('dispatcher:disconnect', {connected: false})
        }
    }

    /**
     * @param {String} type
     * @param {Function} handler
     */
    on(type, handler) {
        type.split(',').forEach(type => {
            this.#emitter.on(type.trim(), payload => handler(payload))
        })
    }

    /**
     * @param {String} type
     * @param {Function} handler
     */
    off(type, handler) {
        this.#emitter.off(type, handler)
    }

    static get EVENTS() {
        return ['connect', 'disconnect']
    }

    /**
     * Set servers
     * @param {String[]} list
     */
    set servers(list) {
        this.#servers = list
        this.#connections.each(connection => connection.reconfigure({
            servers: this.#servers,
            protocol: this.#protocol
        }))
    }

    /**
     * Set channels
     * @param {String[]} list
     */
    set channels(list) {
        this.#connections.each(connection => {
            connection.clear()
        })
        this.#connections = new ConnectsCollection();
        list.forEach(channel => this.addChannel(channel))
    }

    get channels() {
        return this.#connections.channels
    }

    get isConnected() {
        return !!this.#connected
    }

    /**
     * @param {string} channelName
     */
    // removeChannel(channelName) {
    //     if (this.#connections.hasConnection(channelName)) {
    //         this.#connections.getConnection(channelName).clear()
    //         this.#connections.removeConnection(channelName)
    //     }
    // }

    /**
     * @param {Connection} connection
     */
    #dispatch(connection) {
        this.injectConnectionStrategy(connection);

        Connection.EVENTS.forEach(type => connection.on(type, event => {
            if (type === 'message') { // поменять на цепочки обработчиков
                this.#messageProxyEmitter(connection.channel, event)
            } else this.#emitter.emit(`connection:${type}`, {channel: connection.channel, event})
        }))
    }

    /**
     * @param {Connection} connection
     */
    injectConnectionStrategy(connection) {
        let attempt = 1,
            reconnect = 1000

        connection.reconnectionStrategy = (connection => {
            let servers = connection.servers.length,
                loop = Math.ceil(attempt++ / servers)
            connection.close()
            setTimeout(() => {
                if (this.channels.includes(connection.channel)) {
                    connection.open()
                } else {
                    connection.clear()
                    connection.reconnectionStrategy = undefined
                }
            }, reconnect + (1000 * loop))
        })
    }

    /**
     * message event proxy
     * @param {string} channel
     * @param {*} event
     */
    #messageProxyEmitter(channel, event) {
        message(event.data).then(event => this.#emitter.emit('connection:message', {channel, event}))
    }
}