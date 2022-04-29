import AbstractReducer from "@/api/application/reducers/AbstractReducer";
import {isEmpty, mapKeys, omit} from "lodash";
import camelcase from "camelcase";

export default class RoomUsersReducer extends AbstractReducer {
    /**
     * @param {Object|undefined} user
     * @return {Pick<Dictionary<any>, never>|Omit<Dictionary<any>, never>|PartialObject<Dictionary<any>>}
     */
    reduceUser = (user) => RoomUsersReducer.reduceUser(user)

    /**
     * @return {{host: []|null,currentParticipant:[]|null,called:[]|null,participants:[]|null,assistants:[]|null} | undefined}
     */
    get sourceUsers() {
        return this.propertyValue
    }

    execute() {
        const users = this.sourceUsers

        return users ? {
            host: this.reduceUser(users.host),
            current: this.reduceUser(users.currentParticipant),
            called: this.reduceUser(users.called),
            participants: Object.values(users.participants).map(i => this.reduceUser(i)),
            assistants: Object.values(users.assistants).map(i => this.reduceUser(i))
        }: undefined
    }

    static reduceUser(user) {
        const current = mapKeys(user,(value, key) => camelcase(key))
        const settings = mapKeys(current['settings'], (v, k) => k.replace(/^user\./, ''))
        return isEmpty(current) ? undefined : {...omit(current, ['authKey']), settings}
    }
}