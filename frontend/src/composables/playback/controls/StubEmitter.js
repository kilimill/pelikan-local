import EventEmitter from "@/abstract/EventEmitter";

export default class StubEmitter extends EventEmitter {
    /**
     * Stub emitter эмулирует события:
     * seeked
     * seeking
     * timeupdate
     * canplay
     * canplaythrough
     * play
     * playing
     * pause
     * ended
     */
}