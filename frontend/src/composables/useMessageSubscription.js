import message from "@/services/message"

const handlers = []
export default function useMessageSubscription(channel) {
    /**
     * @param {String} name
     * @param {Function} handler
     * @return {Boolean}
     */
    const on = (name, handler) => {
        return Boolean(name && handler ? handlers.push({
            name,
            handler
        }) : undefined)
    }

    /**
     * @param {String} name
     * @param {Function} handler
     * @return {Boolean}
     */
    const off = (name, handler) => {
        let index = handlers.findIndex(i => i.name === name && i.handler === handler)
        return Boolean(~index ? handlers.splice(index, 1) : undefined)
    }

    const messageSub = () => {
        message.subscribe(channel, subscription => {
            subscription.on('subscribe')
            subscription.on('publish', (data) => {
                const {
                    name,
                    message
                } = data.data
                handlers.forEach(i => i.name === name ? i.handler({
                    name,
                    // meta,
                    data: message
                }) : undefined)
            })
        })
    }

    return {
        on,
        off,
        messageSub
    }
}