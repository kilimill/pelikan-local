import api from "@/api"

const syncState = {
    page: 1,
    next: true
}

export default {
    getEventMessages(page = 1) {
        return api.get('message', {params: {page}})
    },

    getNextPartition() {
        return syncState.next ? this.getEventMessages(syncState.page)
            .then(response => {
                syncState.next = response.data._meta.currentPage < response.data._meta.pageCount
                syncState.page++;
                return response.data
            }) : Promise.resolve(undefined)
    }
}