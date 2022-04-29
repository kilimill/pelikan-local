import messageService from "@/services/message"
import camelCase from "camelcase";
/**
 * @type {import("vuex/types").Plugin}
 * @param {import("vuex/types").Store} store
 */
const messagePlugin = store => {
    const messagesEventListener = event => {
        let rootEventAction = camelCase(`event.${event.name}`)
        if (Object.prototype.hasOwnProperty.call(store['_actions'], rootEventAction)) {
            store.dispatch(rootEventAction, {
                meta: event.meta,
                name: event.name,
                data: event.message,
            }, {
                root: true
            }).catch(reason => console.error(reason))
        }
    }
    const subscriptionHandler = subscription => {
        subscription.on('subscribe');
        subscription.on('publish', (message) => {
            messagesEventListener(message.data);
        });
    }

    /**
     *
     * @param {string} route
     * @param {string[]} servers
     * @param {string[]} channels
     * @param {string} userToken
     * @param {string} [protocol]
     */
    store.initMessagePlugin = (route, servers, channels, userToken, protocol = 'wss') => {
        messageService.configure(servers, userToken, protocol, route);
        setTimeout(() => messageService.subscribe(channels, subscriptionHandler))
    }
}

export default messagePlugin