import AbstractReducer from "@/api/application/reducers/AbstractReducer";
import {mapKeys} from "lodash";
import camelCase from "camelcase";

export default class CurrentRoomReducer extends AbstractReducer {
    /**
     * @return {{settings: object|undefined}}
     */
    get sourceCurrentRoom() {
        return this.propertyValue
    }

    execute() {
        const currentRoom = mapKeys(this.sourceCurrentRoom, (v, k) => camelCase(k));
        return {...currentRoom}
    }
}