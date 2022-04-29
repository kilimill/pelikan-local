import useResizeObserver from "@/composables/useResizeObserver";

export default function (canvas) {
    const {handleResize, unobserve} = useResizeObserver()

    return new Promise(resolve => {
        if (canvas.width && canvas.height) {
            resolve(canvas)
        } else {
            handleResize(canvas, bound => {
                if (bound.width && bound.height) {
                    resolve(canvas)
                    unobserve(canvas)
                }
            })
        }
    })
}