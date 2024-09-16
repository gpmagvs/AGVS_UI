<template>
  <div class="map-build-tool-container bg-light border rounded p-2">
    <h5 class="border-bottom text-start py-1">
      <i class="bi bi-three-dots-vertical"></i>
      <span>元件</span>
      <!-- {{ toolState }} -->
    </h5>
    <AddPointTool></AddPointTool>
  </div>
</template>

<script>
import AddPointTool from './AddPointTool.vue';
import { MapStore } from '../store';
export default {
  components: {
    AddPointTool,
  },
  data() {
    return {
      selectedComponentName: ''
    }
  },
  computed: {
    toolState() {
      return MapStore.state.toolState;
    }
  },
}
</script>

<style lang="scss" scoped>
.map-build-tool-container {
  h5 {
  }
}
</style>