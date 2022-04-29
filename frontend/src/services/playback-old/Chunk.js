export class Chunk {

    chunkRange = []
    chunkLow
    chunkHigh

    /**
     *
     * @param {Array} chunkRange
     */
    constructor(chunkRange) {
        this.chunkRange = chunkRange
        this.chunkLow = chunkRange[0]['time_created']
        this.chunkHigh = chunkRange[chunkRange.length - 1]['time_created']
    }

    isTimeStampAtChunkExists(timestamp) {
        return timestamp > this.chunkLow && timestamp < this.chunkHigh
    }

}