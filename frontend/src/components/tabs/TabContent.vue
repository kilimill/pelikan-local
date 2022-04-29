<template>
  <div class="tab-content">
    <main-panel placement="tab" />
  </div>
</template>

<script>
import MainPanel from "@/components/room/main-panel";
export default {
  name: "TabContent",
  components: {MainPanel},
  icon: "smart_display",
  visibility: false,
}
</script>

<style scoped lang="scss">
  .tab-content {
    position: relative;
  }
</style>