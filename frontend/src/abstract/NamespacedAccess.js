export default class NamespacedAccess {
    /**
     * Gets property
     * @param namespace
     * @param object
     * @param nsDelimiter
     */
    static getter(namespace, object, nsDelimiter = ".") {
        let current = object,
            path = namespace.split(nsDelimiter), i = 0;

        while (i < path.length && current !== undefined) {
            current = current[path[i++]]
        }

        return current;
    }

    /**
     * Set property
     * @param namespace
     * @param object
     * @param value
     * @param nsDelimiter
     */
    static setter(namespace, object, value, nsDelimiter = ".") {
        let current = object;

        namespace.split(nsDelimiter).forEach((key, index, path) => {
            if (index === path.length - 1) {
                current[key] = value === null || value === undefined ? current[key] : value;
                return undefined;
            }
            if (current[key] === undefined) {
                current[key] = {};
            }

            current = current[key];
        })
    }
}