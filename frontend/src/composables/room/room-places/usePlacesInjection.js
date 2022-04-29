import {computed, inject, isRef, ref} from "vue";

/**
 *
 * @param {ComputedRef<string>} [place]
 * @return {{
 * isLargePlace: ComputedRef<boolean>,
 * placement: ComputedRef<string>,
 * switchPlaces: ((function(): never)|*),
 * isSmallPlace: ComputedRef<boolean>
 *     }}
 */
export default function usePlacesInjection(place) {
    const placement = inject('placement', isRef(place) ? place : ref(place || 'large'))
    const isLargePlace = computed(() => ['large', 'tab'].includes(placement.value))
    const isSmallPlace = computed(() => placement.value === 'small')
    const switchPlaces = inject('switchPlaces', () => {throw Error('Inject switchPlaces')})

    return {placement, switchPlaces, isSmallPlace, isLargePlace}
}