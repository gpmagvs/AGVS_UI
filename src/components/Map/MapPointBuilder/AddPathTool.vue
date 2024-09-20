<template>
  <div class="add-path-tool">
    <el-radio-group class="flex-column" v-model="selectState.selectedComponentName">
      <el-radio-button value="single-direction">
        <img width="32" height="32" src="/images/arrow-up.svg" alt="marker" /> 單向
      </el-radio-button>
      <el-radio-button value="bi-direction">
        <img width="32" height="32" src="/images/arrows-vertical.svg" alt="marker" /> 雙向
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
      selectState: new ToolSelect('add-path', 'bi-direction')
    }
  },
  mounted() {
    watch(() => this.selectState, (newVal, oldVal) => {
      console.info(newVal, oldVal)
      if (newVal)
        MapStore.commit('setToolState', newVal)
    }, { immediate: true, deep: true })
  }
}
</script>

<style lang="scss" scoped>
.add-path-tool {
  .el-radio-button {
    margin-bottom: 10px;
  }

  ::v-deep .el-radio-button .el-radio-button__inner {
    text-align: left;
    font-size: 18px;
  }
}
</style>