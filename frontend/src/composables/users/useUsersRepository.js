import {SORT_ORDER_HAND, SORT_ORDER_NAME} from "@/store/modules/tabs/users";
import {useStore} from "vuex";
import {computed} from "vue";


export default function useUsersRepository() {
    const store = useStore()

    const sortOrder = computed({
        get: () => store.state.tabs.users.sortOrder,
        set: vl => store.commit("tabs/users/sortOrder", vl)
    })

    const userIsHost = (id) => store.getters["room/users/isHost"](id)
    const userIsCurrent = (id) => store.getters["room/users/isCurrent"](id)
    const userIsCalled = (id) => store.getters["room/users/isCalled"](id)

    const usersList = computed(() => store.getters["room/users/list"])

    const headerLiners = computed(() => [
        store.state.room.users.host,
        store.state.room.users.called,
        store.state.room.users.current,
    ].filter(i => Boolean(i)))

    const unsortedList = computed(() => usersList.value.filter(i => !headerLiners.value.includes(i)))
    const nameSortedList = computed(() => unsortedList.value.map(i => i).sort((a, b) => a.alias.localeCompare(b.alias)))
    const handSortedList = computed(() => [
        ...nameSortedList.value.filter(i => i.handRaised)
            .sort((a, b) => a.handRaised > b.handRaised ? 1 : b.handRaised > a.handRaised ? -1 : 0),
        ...nameSortedList.value.filter(i => !i.handRaised)
    ])

    const participants = computed(() => ([
        ...headerLiners.value,
        ...{
            [SORT_ORDER_NAME]: nameSortedList.value,
            [SORT_ORDER_HAND]: handSortedList.value,
        }[sortOrder.value]
    ]))

    return {
        sortOrder,
        userIsHost,
        userIsCurrent,
        userIsCalled,
        participants,
        raisedHandsCount: computed(() => participants.value.filter(i => i.handRaised).length),
        participantsCount: computed(() => participants.value.length - 1),
        userIsHighlighted: (id) => store.getters["room/users/isHighlighted"](id),
        findUser: (id) => participants.value.find(i => i.id === id)
    }
}