import {onUnmounted} from "vue";

export default function useResizeObserver() {
    const resizeHandlers = []

    const resizeObserver = new ResizeObserver(entries => entries.forEach(entry => {
        resizeHandlers.forEach(item => item.element === entry.target ? item.handler(entry.contentRect) : undefined)
    }))

    onUnmounted(() => {
        resizeObserver.disconnect()
        resizeHandlers.splice(0, resizeHandlers.length)
    })

    return {
        /**
         *
         * @param {Element||HTMLElement} element
         * @param {function(rect:DOMRectReadOnly)} handler
         */
        handleResize: (element, handler) => {
            resizeHandlers.push({element, handler})
            resizeObserver.observe(element)
        },

        unobserve: element => resizeObserver.unobserve(element)
    }
}