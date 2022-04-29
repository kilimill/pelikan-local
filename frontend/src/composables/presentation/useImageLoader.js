export default function useImageLoader() {
    const loadImage = url => new Promise(((resolve, reject) => {
        let image = new Image()
        image.addEventListener('load', event => resolve({event, image}))
        image.addEventListener('error', event => reject({event, image}))
        image.src = url
    }))

    return {loadImage}
}