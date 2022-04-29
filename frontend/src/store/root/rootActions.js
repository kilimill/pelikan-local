import janusService from "@/services/janus";
import applicationApi from "@/api/application";

/**
 * @type {import("vuex/types").ActionTree}
 */
const rootActions = {
    // user/getChannelCode
    initRoom(context) {
        return context.dispatch("application/init").then(configuration => {
            this.initMessagePlugin(
                context.rootGetters["application/getRoute"],
                context.rootGetters["application/nchanServersList"],
                context.rootGetters["application/getChannels"],
                context.rootGetters["application/getChannelCode"],)
            this.initModules(configuration)

            janusService.configure({
                mountPoints: configuration.mountPoints,
                constants: configuration.constants,
            });

            return configuration
        })
    },

    initPlayback(context) {
        return applicationApi.initPlayback().then(config => {
            context.commit('application/configure', config)

            return this.initModules(config)
                .then(() => this.initPlaybackPlugin(config))
        })
    }
}

export default rootActions