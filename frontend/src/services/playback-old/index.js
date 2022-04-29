import {ChunkManager} from "@/services/playback/ChunkManager";
import {StoreAccessor} from "@/services/playback/StoreAccessor";

export default new class PlaybackService {

    /**
     *
     * @type {ChunkManager}
     */
    chunkManager = undefined

    /**
     *
     * @type {StoreAccessor}
     */
    storeAccessor = undefined

    constructor() {
        this.chunkManager = new ChunkManager()
        this.storeAccessor = new StoreAccessor()
    }

    /**
     *
     * @param {function:Promise} dataSource
     * @param {{dataBaseName: String, objectStoreName: String}} options
     */
    configure(dataSource, {dataBaseName, objectStoreName, chunkLength}) {
        return this.storeAccessor.configure(dataBaseName, objectStoreName, chunkLength).then(dataSource)
    }

    addEventListener() {
//добавлять в стек слушателей
    }

    addEventSource() {
//добавить источник событий, будет генерировать тики
    }
}