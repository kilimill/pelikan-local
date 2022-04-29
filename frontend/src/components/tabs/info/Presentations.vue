<template>
  <div class="presentations">
    <form ref="formElement" v-if="form" @submit.prevent>
      <label class="btn add-button" :class="{disabled: formDisabled}">
        <span class="material-icons">add_circle_outline</span>
        <span class="tab-info-btn-text">Добавить презентацию PDF</span>
        <input name="presentation" type="file" ref="fileInput" accept="application/pdf" :disabled="formDisabled">
      </label>
      <div class="form-text">До 35 файлов, каждый до 50 МБ, до 100 слайдов</div>
    </form>
    <template v-if="list">
      <section class="presentations--list">
        <div class="list-item" v-for="presentation of presentations" :key="presentation.id">
          <div class="item-actions">
            <button v-if="actionsEnabled" name="visibility" type="button" class="btn action-button"
                    :class="{visible: presentation.activity}"
                    @click="togglePresentation(presentation)">
              <span class="material-icons material-icons--visibility-on"></span>
              <span class="material-icons material-icons--visibility-off"></span>
            </button>
            <button v-if="actionsEnabled" name="delete" type="button" class="btn action-button"
                    @click="confirmDeletion = presentation">
              <span class="material-icons material-icons--delete-item"></span>
            </button>
            <button name="download" type="button" class="btn action-button" @click="downloadPresentation(presentation)">
              <span class="material-icons">download</span>
            </button>
          </div>
          <span class="item-name">{{ presentation.listName }}</span>
        </div>
      </section>
      <modal-confirm @confirmed="deletePresentation" v-model:confirm="confirmDeletion">
        <template v-slot:message>Вы действительно хотите удалить "{{ confirmDeletion?.listName }}"?</template>
      </modal-confirm>
    </template>
  </div>
</template>

<script>
import {computed, ref} from "vue";
import {useStore} from "vuex";
import usePresentationsList from "@/composables/room/presentations/usePresentationsList";
import useCurrentUser from "@/composables/users/useCurrentUser";
import presentationApi from "@/api/presentation";
import ModalConfirm from "@/components/common/ModalConfirm";
import useFilesForm from "@/composables/tabs/useFilesForm";
import useMessageSubscription from '@/composables/useMessageSubscription';

export default {
  name: "Presentations",
  components: {ModalConfirm},
  props: {
    form: Boolean,
    list: Boolean,
    disabled: Boolean,
  },
  emits: ['form:error'],
  setup(props, {emit}) {
    const store = useStore();

    const presentationForm = useFilesForm(presentationApi.createPresentation)
    const actionsEnabled = computed(() => !props.disabled)
    const formDisabled = computed(() => props.disabled || presentationForm.formLoading.value)

    const {isParticipant} = useCurrentUser()
    const {filteredPresentations} = usePresentationsList({enabled: (isParticipant.value || undefined)})
    const presentations = computed(() => {
      return filteredPresentations.value.map(i => i).sort((a, b) => a.listName.localeCompare(b.listName))
    })

    const confirmDeletion = ref()
    const deletePresentation = (presentation) => presentationApi.deletePresentation(presentation.id)
    const togglePresentation = presentation => {
      return presentationApi.togglePresentation(presentation.id, Number(!presentation.activity))
    }
    const {on} = useMessageSubscription(store.getters["application/getChannels"])

    const downloadPresentation = presentation => {
      presentationApi.downloadPresentation(presentation.id).then((response) => {
        let link = document.createElement('a')
        link.href = URL.createObjectURL(response.data)
        link.download = presentation.listName
        link.click()
      })
    }

    on("room.presentation.convertError", e => {
      emit('form:error', {reason: e.data.error, title: "Ошибка загрузки презентаций"})
    })
    presentationForm.setErrorHandler(reason => {
      emit('form:error', {reason, title: "Ошибка загрузки презентаций"})
    })

    return {
      ...presentationForm,
      formDisabled,
      actionsEnabled,
      confirmDeletion,
      deletePresentation,
      togglePresentation,
      downloadPresentation,
      presentations
    };
  },
}
</script>

<style scoped>
label.add-button input[type=file] {
  display: none;
}
</style>