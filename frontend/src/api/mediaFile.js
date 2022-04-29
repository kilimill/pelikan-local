import api from "@/api"

export default {
  toggleFile: (id, active) => api.post('/room/toggle-media-file', {id, active}),
  deleteFile: id => api.post('/room/delete-media-file', {id}),
}