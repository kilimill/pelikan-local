import {computed, reactive, ref} from "vue";
import {isEmpty} from "lodash";

/**
 * @typedef {import("@vue/reactivity").UnwrapNestedRefs} UnwrapNestedRefs
 * @return {{
 * outgoingURL: ComputedRef<URL|undefined>,
 * params: UnwrapNestedRefs<{embedAutoplay: boolean, moveToViewport: *[]}>,
 * incomingURL: Ref<any>}}
 */
export default function useMiroURLBuilder() {
    const sourcePattern = new RegExp('(?<=https://miro.com/app/board/).+(?=/)')
    const destinationPattern = `https://miro.com/app/live-embed/%board-id%`

    const buildQuery = queryObject => {
        return Object.entries(queryObject).reduce((previous, [key, value]) => {
            value = Array.isArray(value) ? value.join(',') : String(value)
            return isEmpty(value) ? previous : [...previous, [key, value].join('=')]
        }, []).join('&')
    }

    const buildURL = (url, queryParams) => {
        const urlString = destinationPattern.replace(/%board-id%$/, sourcePattern.exec(url)[0])
        const urlObject = new URL(urlString)
        urlObject.search = buildQuery(queryParams)
        return urlObject
    }

    const params = reactive({embedAutoplay: true, moveToViewport: []})
    const incomingURL = ref()
    const outgoingURL = computed(() => incomingURL.value ? buildURL(incomingURL.value, params) : undefined)

    return {
        incomingURL,
        outgoingURL,
        params,
    }
}