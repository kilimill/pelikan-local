<template>
  <div class="application-entry"></div>
</template>

<script>
import applicationApi from "@/api/application";
import useApplicationMode from "@/composables/useApplicationMode";
import useApplicationRoute from "@/composables/useApplicationRoute";

import {
  STATUS_FINISHED,
  RECORD_STATUS_SUCCESS,
} from "@/store/modules/room/roomStatuses";
import ApplicationModeException from "@/exceptions/ApplicationModeException";
import useApplicationError from "@/composables/useApplicationError";

export default {
  name: "EntryPoint",
  setup() {
    const applicationRoute = useApplicationRoute()
    const applicationMode  = useApplicationMode()
    const applicationError = useApplicationError()

    if (applicationMode.isUndefined()) {
      applicationApi.entryPoint().then(({statusId, recordStatusId}) => {
        const validStatusID = Number.isInteger(statusId)
        const eventFinished = statusId === STATUS_FINISHED
        const recordSuccess = recordStatusId === RECORD_STATUS_SUCCESS

        if (eventFinished && recordSuccess) {
          applicationMode.setPlaybackMode()
        } else if (validStatusID && !eventFinished) {
          applicationMode.setActivityMode()
        } else throw new ApplicationModeException("Ошибка")

        applicationRoute.resolve()
      }).catch(applicationError.setError)
    } else applicationRoute.resolve()
  }
}
</script>

<style scoped lang="scss">
.application-entry {
  background: #e9e9e9 url("../assets/logo.png") no-repeat center;
  width: 100%;
  height: 100%;
}
</style>