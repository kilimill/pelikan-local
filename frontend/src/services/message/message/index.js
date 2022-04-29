export default async function message(data) {
    let reader = new FileReader()

    if (!(data instanceof Blob)) {
        data = new Blob([data], {type: "text/plain"})
    }

    return new Promise((resolve, reject) => {
        reader.addEventListener('abort', event => reject(event))
        reader.addEventListener('error', event => reject(event))
        reader.addEventListener('load', () => {
            let matches = reader.result.match(/^id: (.*)\n(content-type: (.*)\n)?\n/m);

            resolve({
                data: reader.result.slice(matches[0].length),
                meta: {id: matches[1], 'content-type': matches[3]}
            })
        })

        reader.readAsText(data)
    })
}