<template>
  <div class="add-point-tool">
    <el-radio-group class="flex-column" v-model="selectState.selectedComponentName">
      <el-radio-button value="normal-point">
        <img width="32" height="32" src="/images/marker.png" alt="marker" /> 一般點位
      </el-radio-button>
      <el-radio-button value="eq-point">
        <img width="32" height="32" src="/images/back-sorting.png" alt="back-sorting" /> 設備
      </el-radio-button>

      <el-radio-button value="stocker-point">
        <img width="32" height="32" src="/images/robot--v1.png" alt="robot--v1" /> Stocker
      </el-radio-button>
      <el-radio-button value="rack-point">
        <img width="32" height="32" src="/images/rack--v2.png" alt="rack--v2" /> Rack
      </el-radio-button>
      <el-radio-button value="charge-station-point">
        <img
          width="32"
          height="32"
          src="/images/external-Charge-Station-green-electric-energy-others-inmotus-design.png"
          alt="external-Charge-Station-green-electric-energy-others-inmotus-design"
        /> 充電站
      </el-radio-button>

      <el-radio-button value="auto-door-point">
        <img width="32" height="32" src="/images/door.png" alt="door" />
        自動門
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script>
import { ToolSelect } from './ToolModels';
import { watch } from 'vue';
import { MapStore } from '../store';
export default {
  data() {
    return {
      selectState: new ToolSelect('add-point', 'normal-point')
    }
  },
  mounted() {
    watch(() => this.selectState, (newVal, oldVal) => {
      console.info(newVal, oldVal)
      if (newVal)
        MapStore.commit('setToolState', newVal)
    }, { immediate: true, deep: true })
  },
}
</script>

<style lang="scss" scoped>
.add-point-tool {
  :deep(.el-radio-button),
  :deep(.el-radio-button__inner) {
    width: 140px;
  }

  :deep(.el-radio-button .el-radio-button__inner) {
    text-align: left;
    font-size: 18px;
  }
}
</style>