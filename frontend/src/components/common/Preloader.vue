<template>
  <div class="preloader">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Preloader"
}
</script>

<style scoped>
.preloader {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
}
</style>