import JanusServer from '@/services/janus/servers/JanusServer';

export class MountPoint {

    static TYPE_IP_CAM = 1;
    static TYPE_WEB_CAM_HOST = 2;
    static TYPE_WEB_CAM_CALLED_USER = 3;
    static TYPE_HOST_SCREEN = 4;

    static isIpMountpoint (mountPoints, id) {
        return mountPoints.ip.indexOf(id) !== -1;
    }

    static isCalledUserMountPoint (mountPoints, id) {
        return mountPoints.web.called.id === id;
    }

    static isHostDeviceMountPoint (mountPoints, id) {
        return mountPoints.web.host.id === id;
    }

    static isHostScreenCaptureMountPoint (mountPoints, id) {
        return mountPoints.web.screen.id === id;
    }

    static getServerType(isWebCamRoom, mountPoints, id){
        let plugin = JanusServer.TYPE_PRIMARY;

        if(this.isCalledUserMountPoint(mountPoints, id)){
            plugin = JanusServer.TYPE_CALLED;
        }
        return plugin;
    }
}