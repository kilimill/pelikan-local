<template>
  <div v-for="message of messages" :key="message.eventId" class="chat-message" :class="{system: message.system}">
    <header>
      <button v-if="showDeleteButton(message)" class="delete-message btn" @click="deletePublicMessage(message.eventId)">
        <span class="material-icons">clear</span>
      </button>
      <time :class="{'text-danger': message.userIsHost}">{{ message.time }}</time>
      <div :class="{'text-danger': message.userIsHost}" class="title">{{ message.alias }}</div>
    </header>
    <div class="message-content">{{ message.deleted ? 'Удалено модератором' : message.message }}</div>
  </div>
</template>

<script>
import {useStore} from "vuex";
import useCurrentUser from "@/composables/users/useCurrentUser";
import {computed} from "vue";

export default {
  name: "Message",
  props: {
    messages: {type: Array, required: true},
    isPrivateChat: {type: Boolean, required: true}
  },
  setup(props) {
    const store = useStore()
    const isPublicChat = computed(() => !props.isPrivateChat)
    const isPrivateChat = computed(() => !isPublicChat.value)
    const deletePublicMessage = (id) => store.dispatch("tabs/chat/public/deleteMessage", id)
    const {currentUser: {value: {id, isHost}}} = useCurrentUser()
    const showDeleteButton = ({userId, deleted}) => (isPrivateChat.value || deleted) ? false : isHost || userId === id

    return {deletePublicMessage, showDeleteButton}
  },
}
</script>

<style scoped lang="scss">
  header {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #cccccc;

    button{

      .material-icons:hover{
        color: #999;
      }

      &.delete-message {
        background: transparent;
        border: none;
        color: white;
        margin: 0;
        padding: 0;
      }
    }

    time {
      margin-right: 5px;
    }
  }

  .chat-message {
    margin-bottom: 7px;
    line-height: normal;

    &.system {
      .title {font-style: italic}
    }
  }
</style>