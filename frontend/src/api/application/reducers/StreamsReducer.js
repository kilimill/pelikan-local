import AbstractReducer from "@/api/application/reducers/AbstractReducer";
import camelcase from "camelcase";
import SimpleObjectHydration from "@/abstract/SimpleObjectHydration";

export default class StreamsReducer extends AbstractReducer {

  get sourceStreams() {
    return this.propertyValue
  }

  execute () {
    return this.sourceStreams?.map(StreamsReducer.reduceStream);
  }

  static reduceStream(stream) {
    const resultTemplate = {
      id: undefined,
      roomId: undefined,
      name: undefined,
      statusId: undefined,
      mountpointId: undefined,
      videoOn: undefined
    }, hydration = new SimpleObjectHydration(resultTemplate)

    stream = Object.fromEntries(Object.entries(stream).map(([key, value]) => {
      return [camelcase(key), value]
    }))

    return hydration.hydrate(stream)
  }

}