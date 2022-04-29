import api from "@/api"

export default {
  getJanusInServer(trafficType){
    return api.post('server/roomer', {trafficType})
  },
  getJanusOutServer(trafficType){
    return api.post('server/streamer', {trafficType})
  },
}

