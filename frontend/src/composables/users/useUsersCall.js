import {useStore} from "vuex";
import {computed, reactive} from "vue";
import useCurrentUser from '@/composables/users/useCurrentUser';
import useRoomSettings from '@/composables/room/useRoomSettings';

export default function useUsersCall() {
    const store = useStore()

    const userIsCalled = (id) => store.getters['room/users/isCalled'](id)
    const userIsResolvingCall = (id) => store.getters['room/users/isResolvingCall'](id)
    const startCalling = (id) => store.dispatch('room/users/call', id)
    const stopCalling = (id) => store.dispatch('room/users/dropCall', id)

    const canCallUser = computed(() => store.state.room.users.called === undefined)

    const toggleCall = (id) => userIsCalled(id) ? stopCalling(id) : startCalling(id)

    const {userAffectedByCallControl} = useCurrentUser()
    const userCallControlInProgress = computed(() => store.getters['application/userCallControlInProgress'])

    const {
        roomEnableScreenCapture,
        roomEnableUserCallControl
    } = useRoomSettings()

    const roomSettings = reactive({
        screenCaptureActive: roomEnableScreenCapture,
        enabledUserCallControl: roomEnableUserCallControl
    })

    const affectedByCallControl = computed(() => {
        return roomSettings.enabledUserCallControl &&
          userCallControlInProgress.value &&
          userAffectedByCallControl.value;
    })

    return {
        affectedByCallControl,
        canCallUser,
        userIsCalled,
        userIsResolvingCall,
        startCalling,
        stopCalling,
        toggleCall,
    }
}