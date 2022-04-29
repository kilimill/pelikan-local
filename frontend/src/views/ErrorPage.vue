<template>
  <div class="error">
    <div class="content">
      <span class="error-title">Произошла ошибка: </span>
      <span v-show="displayMessage" >{{errorMessage}}. </span>
      <span class="error-postfix">Обратитесь в службу поддержки.</span>
    </div>
  </div>
</template>

<script>
import {computed} from "vue";

export default {
  name: 'ErrorPage',
  props: {error: Error},
  setup(props) {
    const errorMessage = computed(() => `${props.error.message}`)
    const displayMessage = computed(() => /[а-я]/i.test(errorMessage.value))

    return {errorMessage, displayMessage}
  },
}
</script>

<style scoped lang="scss">

.error {
  .content {
    background: #e86f6f;
    color: #fff;
    padding: 10px 0;
    text-align: center;
  }
}

</style>