export class User{

    static ROLE_HOST = 1;
    static ROLE_PARTICIPANT = 2;

    static CALL_STATUS_NOT_CALLED = 0;
    static CALL_STATUS_WAITING = 1;
    static CALL_STATUS_ACTIVE = 2;

    constructor(data) {
        this.proxy = data;
    }

    proxy;

    get id(){
        return this.proxy.id;
    }

    get settings(){
        return this.proxy.settings;
    }

    get callStatusIsNotCalled(){
        return this.proxy.callStatusId === User.CALL_STATUS_NOT_CALLED;
    }

    get callStatusIsWaiting(){
        return this.proxy.callStatusId === User.CALL_STATUS_WAITING;
    }

    get callStatusIsActive(){
        return this.proxy.callStatusId === User.CALL_STATUS_ACTIVE;
    }

    get isCalled(){
        return this.callStatusIsActive;
    }

    get isHost(){
        return this.proxy.roleId === User.ROLE_HOST;
    }

    get isParticipant(){
        return this.proxy.roleId === User.ROLE_PARTICIPANT;
    }

    setting(name){
        return this.settings[name];
    }

}


