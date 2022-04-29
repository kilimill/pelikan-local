export default function () {
    const opacities = [25, 50, 75, 100]

    const palette = [
        0xFFFFFF, 0x000000, 0x999999, 0xFF0000,
        0xFFFF00, 0x00FF00, 0x0000FF, 0xCC33CC
    ]

    /**
     *
     * @param {Number} color
     * @param {Number} alpha
     * @return {string|string}
     */
    const parseColor = (color, alpha = 100) => {
        let alphaHex = Math.floor(alpha / 100 * 255).toString(16),
            hexColor = [
                ((color & 0xFF0000) >>> 16).toString(16),
                ((color & 0xFF00) >>> 8).toString(16),
                ((color & 0xFF) >>> 0).toString(16),
            ].reduce((a, i) => a + (i.length < 2 ? i + i : i), '#')
        return hexColor + (alphaHex.length > 2 ? alphaHex + alphaHex : alphaHex)
    }

    return {
        opacities,
        palette,
        parseColor,
    }
}