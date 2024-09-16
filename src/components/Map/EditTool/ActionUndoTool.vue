<template>
  <div class="action-undo border rounded p-1 bg-light d-flex">
    <el-tooltip content="復原操作">
      <el-button type="primary" :disabled="!IsUnDoAllow" @click="Undo()">
        <i class="bi bi-arrow-90deg-left"></i>
      </el-button>
    </el-tooltip>
    <el-tooltip content="取消復原操作">
      <el-button type="primary">
        <i class="bi bi-arrow-90deg-right"></i>
      </el-button>
    </el-tooltip>
    <!-- {{ mapCachesLength }} -->
  </div>
</template>

<script>
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import { MapStore } from '../store';

export default {
  props: {
    refPointsLayer: {
      type: VectorLayer,
      default: new VectorLayer()
    },
    refPathLayer: {
      type: VectorLayer,
      default: new VectorLayer()
    }
  },
  data() {
    return {
    }
  },
  computed: {
    IsUnDoAllow() {
      return this.mapCachesLength != 0;
    },
    mapCachesLength() {
      return MapStore.state.TempMapDataStack.length;
    }
  },
  methods: {

    Undo() {
      this.$emit('onUnDo')
    }
  },

}
</script>

<style lang="scss" scoped>
.action-undo {
  font-weight: bold;
}
</style>