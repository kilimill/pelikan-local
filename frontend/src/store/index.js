import { createStore } from 'vuex'
import messagePlugin from "@/store/plugins/messagePlugin";
import playbackPlugin from "@/store/plugins/playbackPlugin";
import privateNotifier from "@/store/plugins/privateNotifier";
import initModulePlugin from "@/store/plugins/initModulePlugin";
import rootActions from "./root/rootActions"
import application from "./modules/application"
import room from "./modules/room"
import user from "./modules/user"
import tabs from "./modules/tabs"
import echoTest from "./modules/echoTest"
import media from "./modules/media"
import playback from "./modules/playback"

export default createStore({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [messagePlugin, privateNotifier, initModulePlugin, playbackPlugin],
  actions: rootActions,
  modules: {
    application,
    room,
    user,
    tabs,
    echoTest,
    media,
    playback
  },
})
