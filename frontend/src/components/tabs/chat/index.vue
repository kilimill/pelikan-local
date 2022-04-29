<template>
  <div class="tab-content" ref="content">
    <header class="chat-header chat-header--public" v-show="isPublicChat">
      <div class="btn-group btn-group_tabs" role="group">
        <input type="radio" name="sort" class="btn-check" value="time" id="sort-time" v-model="publicSortOrder">
        <label class="btn btn-tab_button shadow-none" for="sort-time" data-bs-title="По времени">
          <span class="material-icons">arrow_upward</span>&nbsp;<span class="material-icons">query_builder</span>
        </label>
        <input type="radio" name="sort" class="btn-check" value="user" id="sort-user" v-model="publicSortOrder">
        <label class="btn btn-tab_button shadow-none" for="sort-user" data-bs-title="По алфавиту">
          <span class="material-icons">arrow_upward</span>&nbsp;<span class="material-icons">account_circle</span>
        </label>
        <template v-if="currentUser.isHost">
          <input type="checkbox" class="btn-check" id="mute-chat" autocomplete="off" v-model="publicChatBlocking">
          <label class="btn btn-tab_button shadow-none" for="mute-chat" :data-bs-title="buttonDisablePublicChatTitle">
            <span class="material-icons">block</span>&nbsp;<span class="material-icons">textsms</span>
          </label>
        </template>
      </div>
    </header>
    <header class="chat-header chat-header--private" v-show="isPrivateChat">
      <section class="btn-group btn-group_tabs">
        <button type="button" class="btn btn-tab_button shadow-none"
                data-bs-title="Закрыть личный чат" @click="dialog = undefined">
          <span class="material-icons">close</span>&nbsp;<span class="material-icons">textsms</span>
        </button>
        <template v-if="currentUser.isHost">
          <input type="checkbox" class="btn-check" id="mute-user" autocomplete="off" v-model="disablePrivateChat">
          <label class="btn btn-tab_button shadow-none" for="mute-user" :data-bs-title="buttonDisablePrivateChatTitle">
            <span class="material-icons">block</span>&nbsp;<span class="material-icons">textsms</span>
          </label>
        </template>
      </section>
      <section class="chat-header-title">
        <span>Личный чат: </span><span v-text="dialogName"></span>
      </section>
    </header>
    <scrollable-decorator ref="scroll" @scroll="onScroll">
      <div class="messages-holder">
        <message-list :isPrivateChat="isPrivateChat" :messages="messages"></message-list>
      </div>
    </scrollable-decorator>
    <footer>
      <form name="chat-form" @submit.prevent.stop="submitForm">
        <fieldset :disabled="form.disabled">
          <div class="input-group g-3">
            <textarea class="form-control shadow-none"
                      v-model.trim="form.content"
                      :disabled="disableChatFormInput" ref="formInput"
                      @keydown.enter.exact.prevent="submitForm">
            </textarea>
            <button class="btn btn-dark shadow-none" type="submit" :disabled="formCantBeSubmit">
              <span class="material-icons">arrow_forward</span>
            </button>
          </div>
        </fieldset>
      </form>
    </footer>
  </div>
</template>

<script>
import ScrollableDecorator from "@/components/common/ScrollableDecorator"
import {useStore} from "vuex"
import MessageList from "@/components/tabs/chat/MessageList";
import {computed, nextTick, ref, watch} from "vue";
import useChatMessages from "@/composables/chat/useChatMessages";
import useChatPrivateMessages from "@/composables/chat/useChatPrivateMessages";
import useUserSettings from "@/composables/users/useUserSettings";
import useBootstrapTooltip from "@/composables/bootstrap/useBootstrapTooltip";
import useCurrentUser from "@/composables/users/useCurrentUser";

export default {
  name: "TabChat",
  components: {MessageList, ScrollableDecorator},
  icon: "textsms",
  visibility: true,
  props: {
    userId: {type: Number, default: undefined},
  },

  setup(props) {
    const rootElement = ref()
    const store = useStore()
    const {currentUser, isHost} = useCurrentUser()
    const {dialog} = useChatPrivateMessages()
    const {userEnablePrivateChat} = useUserSettings(isHost.value ? props.userId : currentUser.value.id)
    const disablePrivateChat = ref(!userEnablePrivateChat.value)

    useBootstrapTooltip(rootElement, "[data-bs-title]")
    watch(disablePrivateChat, value => userEnablePrivateChat.value = !value)

    return {
      content: rootElement,
      ...useChatMessages(props.userId),
      isPublicChat: computed(() => dialog.value === undefined),
      isPrivateChat: computed(() => dialog.value !== undefined),
      getIsHost: (userId) => store.getters["room/users/isHost"](userId),
      currentUser,
      disablePrivateChat,
    }
  },
  data: () => ({
    autoScroll: true,
    form: {
      disabled: false,
      sending: false,
      content: undefined,
    },
  }),
  computed: {
    formCantBeSubmit() {
      return this.form.sending ||
          this.form.content === undefined ||
          this.form.content.length < 1 ||
          this.blocked
    },
    disableChatFormInput() {
      return this.form.sending || this.blocked
    },
    participantUserId() {
      return this.currentUser.isHost ? this.dialog : this.currentUser.id
    },
    buttonDisablePublicChatTitle() {
      return this.publicChatBlocking ? 'Разрешить писать' : 'Запретить писать'
    },
    buttonDisablePrivateChatTitle() {
      return this.disablePrivateChat ? 'Разрешить писать' : 'Запретить писать'
    }
  },

  mounted() {
    this.$refs.scroll.scrollTo(100)
    this.markAsRead()
  },

  methods: {
    submitForm() {
      if (this.formCantBeSubmit) {
        return
      }
      this.form.sending = true
      this.sendMessage(this.form.content)
          .then(() => this.form.content = undefined)
          .catch(reason => console.log(reason))
          .finally(() => {
            this.form.sending = false
            nextTick().then(() => this.$refs.formInput.focus())
          })
    },
    onScroll({scrollPercent}) {
      this.autoScroll = scrollPercent === 100
    },
  },
  watch: {
    messages: {
      deep: true,
      handler() {
        if (this.autoScroll && this.publicSortOrder === this.availableOrders.SORT_TIME) {
          nextTick().then(() => this.$refs.scroll.scrollTo(100))
          this.markAsRead()
        }
      }
    },
    autoScroll(val) {
      if (val && this.publicSortOrder === this.availableOrders.SORT_TIME) {
        this.markAsRead()
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/scss/theme";

.tab-content {
  display: flex;
  flex-direction: column;

  header, footer {
    padding: 10px 0
  }

  footer {
    padding-bottom: 0
  }

  .chat-header {
    &--public {}
    &--private {
      .chat-header-title {
        padding: 10px 0;
        color: #ccc;
      }
    }
  }
}

.messages-holder {
  font-size: 15px;
}

form[name=chat-form] {
  textarea {
    $bg-color: darken($middle-gray, 10);
    background-color: $bg-color;
    border-color: $bg-color;
    color: $light;
    resize: none;
    height: 38px;
  }

  button[type=submit] {
    padding: 0 15px;
    font-size: 1.5em;
  }
}

</style>