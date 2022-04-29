<template>
  <section class="tab-content">
    <scrollable-decorator>
      <div class="tab-info">
        <div class="tab-info-logo">
          <a href="https://pelikan.online/">
          </a>
        </div>
        <div class="tab-info-about">
          <div class="row">
            Преподаватель:
          </div>
          <div class="row mb-2">
            {{ about.teacherName }}
          </div>
          <div class="row">
            Описание урока:
          </div>
          <div class="row mb-2">
            {{ about.lessonInfo }}
          </div>
        </div>

        <template v-if="showForms">
          <materials form @form:error="formError" :disabled="isDisabledMaterialsBtn" class="button-container"/>
          <presentations form @form:error="formError" :disabled="isDisabledPdfBtn" class="button-container"/>
          <miro-boards button :disabled="isDisabledMiroBtn" class="button-container"/>
        </template>

        <div class="lists-holder" :class="{empty: listsIsEmpty}">
          <materials list :disabled="disableActions" class="materials-list"/>
          <presentations list :disabled="disableActions" class="presentations-list"/>
          <miro-boards list :disabled="disableActions" class="boards-list"  />
        </div>
      </div>
    </scrollable-decorator>
    <modal-alert v-model:message="formsErrorMessage.reason">
      <template v-slot:title>{{formsErrorMessage.title}}</template>
    </modal-alert>
  </section>
</template>

<script>
import {computed, reactive} from 'vue'
import ScrollableDecorator from "@/components/common/ScrollableDecorator";
import ModalAlert from "@/components/common/ModalAlert";
import MiroBoards from "@/components/tabs/info/MiroBoards";
import Presentations from "@/components/tabs/info/Presentations";
import Materials from "@/components/tabs/info/Materials";
import useMiroBoards from "@/composables/room/miro-boards/useMiroBoards";
import useMaterials from "@/composables/room/useMaterials";
import usePresentationsList from "@/composables/room/presentations/usePresentationsList";
import useCurrentUser from "@/composables/users/useCurrentUser";

export default {
  name: "TabInfo",
  components: {ModalAlert, Materials, Presentations, MiroBoards, ScrollableDecorator},
  icon: "info",
  visibility: true,
  setup() {
    const {isHost, isParticipant} = useCurrentUser()
    const disableActions = computed(() => !isHost.value)
    const {hasFilteredResults: hasMaterials, materialsFilter} = useMaterials()
    const {hasFilteredResults: hasPresentations, presentationsFilter} = usePresentationsList()
    const {hasFilteredResults: hasMiroBoards, boardsFilter} = useMiroBoards()
    const listsIsEmpty = computed(() => !(hasMiroBoards.value || hasPresentations.value || hasMaterials.value))

    const formsErrorMessage = reactive({title: undefined, reason: undefined})
    const formError = ({reason, title}) => {
      formsErrorMessage.title = title
      formsErrorMessage.reason = reason
    }

    materialsFilter.enabled =
        presentationsFilter.enabled =
            boardsFilter.enabled = isParticipant.value || undefined

    return {
      disableActions,
      listsIsEmpty,
      formsErrorMessage,
      formError,
      showForms: isHost,
    }
  },
  computed: {
    isDisabledMaterialsBtn() {
      return false
    },
    isDisabledPdfBtn() {
      return false
    },
    isDisabledMiroBtn() {
      return false
    },
  },
  data() {
    return {
      about: {
        teacherName: false,
        lessonInfo: 'test'
      },
    }
  },
}
</script>
<style lang="scss" src="../../../assets/scss/external/tabs-info.scss" />

<style scoped>
.tab-content{
  padding: 10px;
}
.tab-info {
  position: relative;
}

.tab-info-logo {
  position: absolute;
  right: 15px;
  top: 3px;
  width: 30px;
}

.tab-info-about .row {
  margin: 0;
  text-align: left;
}
</style>