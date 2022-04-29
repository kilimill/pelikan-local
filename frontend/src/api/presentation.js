import api from "@/api"

export default {
    selectPresentation(presentationId, slideIndex) {
        return api.post('/room/select-presentation', {presentationId, slideIndex})
    },
    createPresentation(formData) {
        return api.post('/room/update-present', formData)
    },
    deletePresentation(presentationId) {
        return api.post('/room/delete-presentation', {presentationId})
    },
    togglePresentation(presentationId, activity) {
        return api.post('/room/presentation-activity', {presentationId, activity})
    },
    downloadPresentation(presentationId) {
        return api({
            method: 'POST',
            url: '/room/download-file',
            data: {
                id: presentationId,
                type: 'presentation',
            },
            responseType: 'blob'
        })
    }
}