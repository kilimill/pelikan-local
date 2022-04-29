export class Room{

    static TYPE_IP_CAMERAS = 1;
    static TYPE_WEB_CAMERAS = 2;

    static STATUS_EVENT_PENDING = 1;
    static STATUS_EVENT_ACTIVE = 2;
    static STATUS_EVENT_PAUSED = 3;
    static STATUS_EVENT_FINISHED = 4;

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

    get streams(){
        return this.proxy.streams;
    }

    get janusPin(){
        return this.proxy.janusPin;
    }

    get isIpCamRoom(){
        return this.proxy.typeId === Room.TYPE_IP_CAMERAS;
    }

    get isWebCamRoom(){
        return this.proxy.typeId === Room.TYPE_WEB_CAMERAS;
    }

    get isPending(){
        return this.proxy.statusId === Room.STATUS_EVENT_PENDING;
    }

    get isActive(){
        return this.proxy.statusId === Room.STATUS_EVENT_ACTIVE;
    }

    get isPaused(){
        return this.proxy.statusId === Room.STATUS_EVENT_PAUSED;
    }

    get isFinished(){
        return this.proxy.statusId === Room.STATUS_EVENT_FINISHED;
    }

    setting(name){
        return this.settings[name];
    }
}