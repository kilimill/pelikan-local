import NamespacedAccess from "@/abstract/NamespacedAccess";

export default class ConfigurationBuilder {
    #result;

    constructor(dst, src = {}, definitions = {}) {
        this.#result = dst;

        for (let [nsDst, nsSrc] of Object.entries(definitions)) {
            this.#apply(nsDst, NamespacedAccess.getter(nsSrc, src));
        }
    }

    build() {
        return Object.assign({}, this.#result);
    }

    /**
     * @param {String} namespace
     * @param value
     */
    #apply(namespace, value) {
        NamespacedAccess.setter(namespace, this.#result, value);
    }
}