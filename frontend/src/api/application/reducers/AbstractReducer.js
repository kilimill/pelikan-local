import NamespacedAccess from "@/abstract/NamespacedAccess";
import {cloneDeep} from "lodash";

/**
 * @abstract class of configuration reducers
 */
export default class AbstractReducer {
    #configuration
    #propertyName
    #namespaceChar

    /**
     *
     * @param {Object} configuration
     * @param {String} [propertyName]
     * @param {String} [nsDelimiter]
     */
    constructor(configuration, propertyName, nsDelimiter = "/") {
        this.#configuration = configuration
        this.#propertyName = propertyName
        this.#namespaceChar = nsDelimiter
    }

    static reduce(configuration, propertyName, nsDelimiter = "/") {
        const reducer = new this(configuration, propertyName, nsDelimiter)
        NamespacedAccess.setter(reducer.propertyName, configuration, reducer.execute(), reducer.namespaceChar)
    }

    get propertyName() {
        return this.#propertyName
    }

    get namespaceChar() {
        return this.#namespaceChar
    }

    get propertyValue() {
        return this.getConfigurationValue(this.propertyName, this.namespaceChar)
    }

    getConfigurationValue(propertyName, nsDelimiter = "/") {
        const value = NamespacedAccess.getter(propertyName, this.#configuration, nsDelimiter)
        return cloneDeep(value)
    }

    /**
     * @abstract Template Method
     * @return {Object} reduced
     */
    execute() {
        return this.propertyValue
    }
}