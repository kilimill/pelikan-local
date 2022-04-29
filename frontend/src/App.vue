<template>
  <error-page v-if="hasError" :error="getError()"></error-page>
  <router-view v-else/>
</template>
<script>
import useApplicationError from "@/composables/useApplicationError";
import useApplicationMode from "@/composables/useApplicationMode";
import ErrorPage from "@/views/ErrorPage";
import useMultiTabProtection from "@/composables/useMultiTabProtection";

export default {
  name: 'App',
  components: {ErrorPage},
  setup() {
    const applicationError = useApplicationError()
    const applicationMode = useApplicationMode()
    const {check:checkTab} = useMultiTabProtection()

    if (checkTab()) {
      applicationError.setError(new Error("Мероприятие уже открыто в другой вкладке"))
    }

    return {
      ...applicationMode,
      ...applicationError,
    }
  },
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
}
</style>
