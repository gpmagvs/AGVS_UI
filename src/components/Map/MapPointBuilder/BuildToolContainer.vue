<template>
  <div class="map-build-tool-container bg-light border rounded p-2">
    <h5 class="border-bottom text-start py-1">
      <i class="bi bi-three-dots-vertical"></i>
      <span>元件</span>
      <!-- {{ toolState }} -->
    </h5>
    <AddPointTool v-if="operation == 'add-station'"></AddPointTool>
    <AddPathTool v-if="operation == 'add-path'" @onDirectionChanged="HandlePathToolComponentChange"></AddPathTool>
    <AddForbidRegionTool
      v-if="operation == 'add-forbid-region'"
      @onChanged="HandleRegionToolComponentChange"
    ></AddForbidRegionTool>
  </div>
</template>

<script>
import AddPointTool from './AddPointTool.vue';
import AddPathTool from './AddPathTool.vue';
import AddForbidRegionTool from './AddForbidRegionTool.vue';
import { MapStore } from '../store';
export default {
  components: {
    AddPointTool,
    AddPathTool,
    AddForbidRegionTool
  },
  props: {
    operation: {
      type: String,
      default: 'add-station'
    },
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
  methods: {
    HandleRegionToolComponentChange(val) {
      console.info(val)
      this.$emit('onRegionToolComponentChange', val)
    },
    HandlePathToolComponentChange(val) {
      console.info(val)
      this.$emit('onPathToolComponentChange', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.map-build-tool-container {
  h5 {
  }
}
</style>