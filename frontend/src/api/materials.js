import api from "@/api"

export default {
    uploadMaterials: formData => api.post('/room/update-materials', formData),
    toggleMaterial: (id, activity) => api.post('/room/material-activity', {id, activity}),
    deleteMaterial: materialId => api.post('/room/delete-material', {materialId}),
    downloadMaterial: id => api({
        method: 'POST',
        url: '/room/download-file',
        data: {id, type: 'material'},
        responseType: 'blob'
    })
}