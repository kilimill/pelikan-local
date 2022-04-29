import AbstractReducer from '@/api/application/reducers/AbstractReducer';
import { camelCase, mapKeys } from 'lodash';

export default class PlaybackDataReducer extends AbstractReducer{

  get sourceData() {
    return this.propertyValue
  }

  execute () {
    return PlaybackDataReducer.reducePlaybackData(this.sourceData)
  }

  static reducePlaybackData(data) {
    return mapKeys(data, (value, key) => camelCase(key, key))
  }
}