import Connection from "@/services/message/Connection";

export default class Subscription {
    /** @type {import('Channel').default} */
    #channel

    #centrifuge
    
    #subscription

    #handlers
    
    /** @param {import('Channel').default} channel */
    constructor(channel) {
        this.#channel = channel
        this.#subscription = ''
        this.#centrifuge = Connection.centrifuge
        this.#handlers = Object.fromEntries(Connection.EVENTS.map(type => [type, []]))
    }

    on(event, handler) {
        if (this.#handlers[event]) {
            this.#handlers[event].push(handler)
            
            if (event == 'connect') {
                this.#centrifuge.on(event, handler);
            } else if (event == 'subscribe'){
                this.#subscription = this.#centrifuge.subscribe(this.#channel.name)
                this.#subscription.on('error', error => console.log(error));
            } else { 
                this.#subscription.on(event, handler)
            }
        }
    }
        

    off(event, handler) {
        if (this.#handlers[event] && this.#handlers[event].includes(handler)) {
            this.#subscription.off(event, handler)
            this.#handlers[event].splice(this.#handlers[event].indexOf(handler))
        }
    }

    get channelName() {
        return this.#channel.name
    }
}