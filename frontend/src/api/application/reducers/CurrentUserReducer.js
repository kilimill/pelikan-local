import AbstractReducer from "@/api/application/reducers/AbstractReducer";
import RoomUsersReducer from "@/api/application/reducers/RoomUsersReducer";

export default class CurrentUserReducer extends AbstractReducer {
    execute() {
        return RoomUsersReducer.reduceUser(this.propertyValue)
    }
}