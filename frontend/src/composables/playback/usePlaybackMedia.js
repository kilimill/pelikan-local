import {useStore} from "vuex";
import {computed, watch} from "vue";

export default function usePlaybackMedia(){

  let players = {
    main: undefined,
    secondary: undefined,
    screen: undefined
  };

  const store = useStore();

  const currentValue = computed(() => store.getters["playback/timeline/currentValue"]);
  const duration = computed(() => store.getters["playback/timeline/duration"]);
  const playbackIsActive = computed(() => store.getters["playback/timeline/active"]);
  const manualSeek = computed(() => store.getters["playback/timeline/manualSeek"]);
  const activeRangeHost = computed(() => store.getters["playback/ranges/activeRangeHost"]);
  const activeRangeCalled = computed(() => store.getters["playback/ranges/activeRangeCalled"]);
  const activeRangeScreen = computed(() => store.getters["playback/ranges/activeRangeScreen"]);
  const activeFileHost = computed(() => store.getters["playback/files/activeFileHost"]);
  const activeFileCalled = computed(() => store.getters["playback/files/activeFileCalled"]);
  const activeFileScreen = computed(() => store.getters["playback/files/activeFileScreen"]);

  const playerMain = computed(() => store.getters["playback/playerMain"])
  const activeMountPointId = computed(() => store.getters["playback/mountpoints/activeId"]);

  watch(activeMountPointId, (newVal) => {
    if(newVal !== undefined){
      let type = store.getters["playback/mountpoints/typeById"](newVal)
      let playerType = (type === "host" ? "main" : "secondary" );
      store.commit("media/setPlayer", {
        name: "main",
        value: players[playerType],
      });
    }
  });

  watch(playbackIsActive, (newVal) => {
    if(newVal){
      console.error('playbackIsActive startPlayback');
      startPlayback();
    }else{
      console.error('playbackIsActive watcher stop');
      setPlayersTime();
    }
  });

  watch(manualSeek, (newVal) => {
    if(newVal){
      console.error(newVal);
      if(currentValue.value !== duration.value){
        setPlayersTime();
      }else{
        store.commit('playback/timeline/setActive', false);
        store.dispatch('playback/timeline/stopInterval');
      }
    }
  });

  watch(activeFileHost, (newFile) => {
    stopPlayer(players.main)
    if(newFile !== undefined){
      setPlayerSrc(players.main, newFile.id);
    }else{
      unsetPlayerSrc(players.main);
    }
  });

  watch(activeFileCalled, (newFile) => {
    stopPlayer(players.secondary)
    console.error(newFile);
    if(newFile !== undefined){
      setPlayerSrc(players.secondary, newFile.id);
    }else{
      unsetPlayerSrc(players.secondary);
    }
  });

  watch(activeFileScreen, (newFile) => {
    stopPlayer(players.screen)
    if(newFile !== undefined){
      setPlayerSrc(players.screen, newFile.id);
    }else{
      unsetPlayerSrc(players.screen);
    }
  });

  const setPlayersTime = () => {
    stopPlayer(players.main);
    stopPlayer(players.secondary);
    stopPlayer(players.screen);
    setPlayerTime(players.main, activeRangeHost.value);
    setPlayerTime(players.secondary, activeRangeCalled.value);
    setPlayerTime(players.screen, activeRangeScreen.value);
  }

  const playerRangeMap = computed(() => {
    return {
      "main": activeRangeHost.value,
      "secondary": activeRangeCalled.value,
      "screen": activeRangeScreen.value,
    }
  });

  const setPlayer = (type, playerElement) => {
    if(type in players && playerElement){
      players[type] = playerElement;
      setSeekedEvent(players[type]);
      setLoadedEvent(players[type], type);
      store.commit("media/setPlayer", {
        name: type,
        value: players[type],
      });
    }
  }

  const unsetPlayer = (type) => {
    store.commit("media/setPlayer", {
      name: type,
      value: undefined,
    });
  }

  const startPlayer = async (player) => {
    if (player !== undefined && player.paused){
      await player.play();
    }
  }

  const stopPlayer = (player) => {
    if (player !== undefined && !player.paused){
      player.pause();
    }
  }

  const setPlayerTime = (player, range) => {
    if (player !== undefined){
      let timeValue = 0;
      if(range !== undefined){
        timeValue = currentValue.value - range.timeStart;
      }
      player.currentTime = timeValue;
    }
  }

  const getStorageFileUrl = (fileId) => {
    return `${process.env.VUE_APP_STORAGE}storage/file/${fileId}`;
  }

  const setPlayerSrc = (player, fileId) => {
    if (player !== undefined && fileId !== undefined){
      player.src = getStorageFileUrl(fileId);
    }
  }

  const unsetPlayerSrc = (player) => {
    if (player !== undefined){
      player.src = "";
    }
  }

  const setSeekedEvent = (player) => {
    player.addEventListener('seeked', () => {
      console.error(player.id, "seekedEvent");
      seekedEventHandler(player);
    });
  }

  const setLoadedEvent = (player, type) => {
    player.addEventListener('loadedmetadata', () => {
      console.error(player.id, "loadedmetadata");

      if(playbackIsActive.value){
        store.dispatch("playback/timeline/stopInterval");
      }

      if(playerRangeMap.value[type]){
        setPlayerTime(player, playerRangeMap.value[type]);
      }
      // loadedEventHandler(player);
    });
  }

  const seekedEventHandler = (player) => {
    player.pause();
    if(playbackIsActive.value){
      console.error('seekedEventHandler startPlayback');
      startPlayback();
    }
  }

  // const loadedEventHandler = (player) => {
  //   player.pause();
  //   if(playbackIsActive.value){
  //     startPlayback();
  //   }
  // }

  const startPlayback = async () => {
    console.error("startPlayback");
    players.screen?.pause();
    players.secondary?.pause();
    players.main?.pause();

    if(activeFileScreen.value !== undefined){
      console.error("await players.screen");
      await startPlayer(players.screen);
    }
    if(activeFileCalled.value !== undefined){
      console.error("await players.secondary");
      await startPlayer(players.secondary);
    }
    if(activeFileHost.value !== undefined){
      console.error("await players.main");
      await startPlayer(players.main);
    }
    store.dispatch('playback/timeline/startInterval');
  }

  return {
    setPlayer,
    unsetPlayer,
    setPlayerTime,
    playerMain
  }
}