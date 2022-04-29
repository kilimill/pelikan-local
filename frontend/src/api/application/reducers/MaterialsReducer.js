import AbstractReducer from "@/api/application/reducers/AbstractReducer";
import {mapKeys} from "lodash";
import camelCase from "camelcase";

export default class MaterialsReducer extends AbstractReducer {
    get sourceMaterials() {
        return this.propertyValue
    }

    execute() {
        return this.sourceMaterials?.map(MaterialsReducer.reduceMaterial);
    }

    static reduceMaterial(material) {
        return mapKeys(material, (value, key) => camelCase(key, key))
    }
}