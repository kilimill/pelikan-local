<template>
  <div class="miro-boards">
    <template v-if="button">
      <button type="button" class="btn add-button" :disabled="disabled" @click="miroModal.show()">
        <span class="material-icons">add_circle_outline</span>
        <span class="button-label">Добавить доску Miro</span>
      </button>
      <span class="form-text">До 35 досок</span>
    </template>
    <template v-if="list">
      <section class="miro-boards--list">
        <div class="list-item" v-for="board of miroBoards" :key="board.id">
          <div class="item-actions" v-if="actionsEnabled">
            <button name="visibility" type="button" class="btn action-button"
                    :class="{visible: board.enabled}" @click="toggleVisibility(board)">
              <span class="material-icons material-icons--visibility-on"></span>
              <span class="material-icons material-icons--visibility-off"></span>
            </button>
            <button name="delete" type="button" class="btn action-button" @click="deleteItem = board">
              <span class="material-icons material-icons--delete-item"></span>
            </button>
          </div>
          <span class="item-name">{{ board.name }}</span>
        </div>
      </section>
    </template>
    <modal-confirm v-model:confirm="deleteItem" v-on:confirmed="deleteBoard">
      <template v-slot:message>Вы действительно желаете удалить доску "{{deleteItem?.name}}"?</template>
    </modal-confirm>

    <modal-dialog ref="miroModal" centered>
      <template v-slot:modal-title>Новая доска Miro</template>
      <template v-slot:modal-body>
        <form name="miro-form" @submit.prevent>
          <div class="mb-3">
            <label for="miro-name" class="form-label" :class="{'text-danger': hasNameErrors}">Название</label>
            <input id="miro-name" type="text" class="form-control"
                   :class="{'is-invalid': hasNameErrors}"
                   :disabled="formDisabled"
                   v-model="formFields.name"
                   @input="clearErrors('name')"/>
            <div v-show="hasNameErrors" class="invalid-feedback">
              <div v-for="error in formErrors.name" :key="error">{{ error }}</div>
            </div>
          </div>
          <div class="mb-3">
            <label for="miro-link" class="form-label" :class="{'text-danger': hasLinkErrors}">Ссылка</label>
            <input id="miro-link" type="text" class="form-control"
                   :class="{'is-invalid': hasLinkErrors}"
                   :disabled="formDisabled"
                   v-model="formFields.link"
                   @input="clearErrors('link')"/>
            <div v-show="hasLinkErrors" class="invalid-feedback">
              <div v-for="error in formErrors.link" :key="error">{{ error }}</div>
            </div>
          </div>
        </form>
        <div class="alert alert-danger" v-show="errorSubmission"><b>Ошибка</b>: {{ errorSubmission }}</div>
      </template>
      <template v-slot:modal-footer>
        <button type="button" class="btn btn-primary" @click="submitForm" :disabled="formDisabled">Сохранить</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
      </template>
    </modal-dialog>
  </div>
</template>

<script>
import ModalDialog from "@/components/common/ModalDialog";
import ModalConfirm from "@/components/common/ModalConfirm";
import useMiroForm from "@/composables/tabs/useMiroForm";
import useMiroBoards from "@/composables/room/miro-boards/useMiroBoards";
import useCurrentUser from "@/composables/users/useCurrentUser";
import {computed, onBeforeUnmount, onMounted, ref} from "vue";

export default {
  name: "MiroBoards",
  components: {ModalConfirm, ModalDialog},
  props: {button: Boolean, list: Boolean, disabled: Boolean},
  setup(props) {
    const miroModal = ref()
    const {isParticipant} = useCurrentUser()
    const miroForm = useMiroForm()
    const miroBoards = useMiroBoards({enabled: (isParticipant.value || undefined)})
    const errorSubmission = ref(undefined);

    const hasNameErrors = computed(() => miroForm.formErrors.name.length)
    const hasLinkErrors = computed(() => miroForm.formErrors.link.length)

    const submitForm = () => miroForm.submitForm().then(success => {
      if (success) {
        miroForm.clearForm()
        miroModal.value.hide()
      }
    }).catch(reason => errorSubmission.value = reason)

    onMounted(() => miroModal.value.on('hide',miroForm.clearForm))
    onBeforeUnmount(() => miroModal.value.off('hide',miroForm.clearForm))

    return {
      miroModal,
      ...miroForm,
      ...miroBoards,
      hasNameErrors,
      hasLinkErrors,
      errorSubmission,
      submitForm,
      actionsEnabled: computed(() => !props.disabled),
      miroBoards: computed(() => miroBoards.filteredList.value
          .map(i => i)
          .sort((a, b) => a.name.localeCompare(b.name))),
    }
  },
}
</script>

<style scoped lang="scss">
.miro-boards {
  button.action-button {

  }

}
</style>