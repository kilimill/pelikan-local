import api from "@/api"
import Config from "@/abstract/ConfigurationBuilder"
import configMap from "@/api/application/configMap";
import DrawActionsReducer from "@/api/application/reducers/DrawActionsReducer";
import stub from "@/api/application/stub.json"; //TODO-удалить когданть

/**
 * Configure object by definition
 * @param {Object} source
 * @param {Object} destination
 * @return {*}
 */
const configure = function (destination, source) {
    const configured = (new Config(destination, source, configMap)).build()
    DrawActionsReducer.reduce(configured, "drawActions")
    return configured
}

export default {
    entryPoint: () => {
        return api.get("data/entry").then(({data: {room}}) => ({
            statusId: room['status_id'],
            recordStatusId: room['record_status_id']
        }))
    },
    initRoom: () => {
        let config = {}

        return api.get('data/ui').then(response => {
            return configure(config, response.data)
        }).catch(reason => {
            return Promise.reject(reason)
        })
    },
    initPlayback: () => {
        return api.get('data/playback').then(response => {
            return configure({}, Object.assign(response.data, stub))
        })
    },
}