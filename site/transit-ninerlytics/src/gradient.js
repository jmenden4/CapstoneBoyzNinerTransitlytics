
const mixComponent = (a, b, t) => {
    return Math.round(Math.sqrt((a * a * (1 - t)) + (b * b * t)))
}

const mixRGBs = (a, b, t) => {
    t = Math.min(Math.max(t, 0), 1)
    return [
        mixComponent(a[0], b[0], t),
        mixComponent(a[1], b[1], t),
        mixComponent(a[2], b[2], t),
    ]
}


const Gradient = class {
    constructor(colors) {
        this.colors = colors
        this.rgbs = colors.map(x => [
            parseInt(x.substring(0, 2), 16),
            parseInt(x.substring(2, 4), 16),
            parseInt(x.substring(4, 6), 16),
        ])
    }

    colorAt(x) {
        const t = x * (this.colors.length - 1)
        const i0 = Math.floor(t)
        const i1 = Math.ceil(t)
        const mix = t - i0
        const [r, g, b] = mixRGBs(this.rgbs[i0], this.rgbs[i1], mix).map(x => x.toString(16).padStart(2, '0'))
        return `#${r}${g}${b}`
    }
}

export default Gradient