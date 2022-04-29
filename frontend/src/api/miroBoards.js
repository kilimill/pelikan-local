import api from "@/api"

export default {
    list: () => api.get('/miro-board'),
    create: ({name, link}) => api.post('/miro-board/create', {name, link}),
    delete: id => api.post('miro-board/delete', {id}),
    update: item => api.post('miro-board/update', item),
    select: id => api.post('miro-board/select', {id}),
}