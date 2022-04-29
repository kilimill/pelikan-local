<template>
  <div class="materials">
    <form ref="formElement" v-if="form" @submit.prevent>
      <label class="btn add-button" :class="{disabled: formDisabled}">
        <span class="material-icons">add_circle_outline</span>
        <span class="tab-info-btn-text">Добавить материалы</span>
        <input name="materials[]" type="file" multiple ref="fileInput" :disabled="formDisabled">
      </label>
      <div class="form-text">Общий объем до 50 МБ</div>
    </form>
    <template v-if="list">
      <section class="materials--list">
        <div class="list-item" v-for="material of materials" :key="material.id">
          <div class="item-actions">
            <button v-if="actionsEnabled" name="visibility" type="button" class="btn action-button"
                    :class="{visible: material.active}"
                    @click="toggleMaterial(material)">
              <span class="material-icons material-icons--visibility-on"></span>
              <span class="material-icons material-icons--visibility-off"></span>
            </button>
            <button v-if="actionsEnabled" name="delete" type="button" class="btn action-button"
                    @click="confirmDeletion = material">
              <span class="material-icons material-icons--delete-item"></span>
            </button>
            <button name="download" type="button" class="btn action-button"
                    @click="downloadMaterial(material)">
              <span class="material-icons">download</span>
            </button>
          </div>
          <span class="item-name">{{ material.listName }}</span>
        </div>
      </section>
      <modal-confirm @confirmed="deleteMaterial" v-model:confirm="confirmDeletion">
        <template v-slot:message>Вы действительно хотите удалить "{{ confirmDeletion?.listName }}"?</template>
      </modal-confirm>
    </template>
  </div>
</template>

<script>
import {computed, ref} from "vue";
import useFilesForm from "@/composables/tabs/useFilesForm";
import materialsApi from "@/api/materials";
import useMaterials from "@/composables/room/useMaterials";
import useCurrentUser from "@/composables/users/useCurrentUser";
import ModalConfirm from "@/components/common/ModalConfirm";

export default {
  name: "Materials",
  components: {ModalConfirm},
  props: {
    form: Boolean,
    list: Boolean,
    disabled: Boolean
  },
  emits: ['form:error'],
  setup(props, {emit}) {
    const materialsForm = useFilesForm(materialsApi.uploadMaterials)
    const formDisabled = computed(() => props.disabled || materialsForm.formLoading.value)
    const actionsEnabled = computed(() => !props.disabled)
    const {isParticipant} = useCurrentUser()
    const {filteredMaterials} = useMaterials({enabled: isParticipant.value || undefined})
    const materials = computed(() => filteredMaterials.value
        .map(i => i).sort((a, b) => a.listName.localeCompare(b.listName)))

    const toggleMaterial = item => materialsApi.toggleMaterial(item.id, Number(!item.active))

    const confirmDeletion = ref()
    const deleteMaterial = (item) => materialsApi.deleteMaterial(item.id)

    const downloadMaterial = ({id, listName}) => {
      materialsApi.downloadMaterial(id).then(response => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(response.data)
        link.download = listName
        link.click()
      }).catch(reason => console.error(reason))
    }

    materialsForm.setErrorHandler(reason => {
      emit('form:error', {reason, title: "Ошибка загрузки материалов"})
    })

    return {
      formDisabled,
      actionsEnabled,
      ...materialsForm,
      materials,
      toggleMaterial,
      confirmDeletion,
      deleteMaterial,
      downloadMaterial
    }
  }
}
</script>

<style scoped>

</style>