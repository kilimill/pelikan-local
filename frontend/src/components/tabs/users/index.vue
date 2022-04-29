<template>
  <section class="tab-content" ref="content">
    <header>
      <div class="btn-group btn-group_tabs" role="group">
        <template v-if="currentUserIsHost">
          <input type="radio" class="btn-check" name="sort" id="sort-name" autocomplete="off"
                 v-model="sortOrder" :value="sortOrders.SORT_ORDER_NAME">
          <label class="btn btn-tab_button shadow-none" for="sort-name" data-bs-title="По алфавиту">
            <span class="material-icons">arrow_upward</span>&nbsp;<span class="material-icons">account_circle</span>
          </label>
          <input type="radio" class="btn-check" name="sort" id="sort-hand" autocomplete="off"
                 v-model="sortOrder" :value="sortOrders.SORT_ORDER_HAND">
          <label class="btn btn-tab_button shadow-none" for="sort-hand" data-bs-title="По поднятым рукам">
            <span class="material-icons">arrow_upward</span>&nbsp;<span class="material-icons">pan_tool</span>
          </label>
          <button class="btn btn-tab_button shadow-none" data-bs-title="Опустить руки" @click="lowerAllHandsInRoom()">
            <span class="material-icons">close</span><span class="material-icons">pan_tool</span>
          </button>
          <input type="checkbox" class="btn-check" id="disable-hands" autocomplete="off" v-model="blockRaiseHand">
          <label class="btn btn-tab_button shadow-none" for="disable-hands" :data-bs-title="labelRaiseHandBlocking">
            <span class="material-icons">block</span><span class="material-icons">pan_tool</span>
          </label>
        </template>
      </div>
    </header>
    <scrollable-decorator>
      <div class="accordion" id="accordionExample">
        <participant v-for="participant in participants"
                     :key="participant.id"
                     :participant="participant"
                     :expand="currentUserIsHost"
        />
      </div>
    </scrollable-decorator>
    <footer>
      <span>Участников: {{ participantsCount }}</span>
      <span v-if="currentUserIsHost">Поднятых рук: {{ raisedHandsCount }}</span>
    </footer>
  </section>
</template>
<script>
import {useStore} from "vuex";
import {computed, ref} from "vue";
import ScrollableDecorator from "@/components/common/ScrollableDecorator";
import participant from "@/components/tabs/users/Participant";
import {SORT_ORDER_HAND, SORT_ORDER_NAME} from "@/store/modules/tabs/users";
import useUsersRepository from "@/composables/users/useUsersRepository";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";

export default {
  name: "TabUsers",
  components: {participant, ScrollableDecorator},
  icon: 'account_circle',
  visibility: true,
  setup() {
    const store = useStore()
    const rootElement = ref()
    const {
      sortOrder,
      participants,
      raisedHandsCount,
      participantsCount,
    } = useUsersRepository()

    useBootstrapTooltip(rootElement, "[data-bs-title]")

    return {
      sortOrder,
      participants,
      raisedHandsCount,
      participantsCount,

      content: rootElement,
      currentUserIsHost: computed(() => store.getters["user/isHost"]),

      lowerAllHandsInRoom: () => store.dispatch('room/lowerAllHands'),

      blockRaiseHand: computed({
        get: () => store.state.room.settings.blockRaiseHand,
        set: vl => store.dispatch('room/settings/setBlockRaiseHand', vl),
      })
    }
  },
  data: () => ({
    sortOrders: {SORT_ORDER_HAND, SORT_ORDER_NAME},
  }),
  computed: {
    labelRaiseHandBlocking() {
      return this.blockRaiseHand ? 'Разрешить поднимать руки' : 'Запретить поднимать руки'
    }
  }
}
</script>

<style scoped lang="scss">
header, footer {
  padding: 10px 0
}

footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>