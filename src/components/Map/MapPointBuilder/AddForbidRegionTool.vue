<template>
  <div class="add-forbid-region-tool">
    <el-radio-group
      @change="HandleChange"
      class="flex-column"
      v-model="selectState.selectedComponentName"
    >
      <el-radio-button value="passible">
        <img src="/images/icons8-south-dakota-48.png" />通行區
      </el-radio-button>
      <el-radio-button value="forbid">
        <img src="/images/icons8-truck-ban-48.png" /> 禁制區
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
      selectState: new ToolSelect('add-forbid-region', 'passible')
    }
  },
  methods: {
    HandleChange(val) {
      console.info(val)
      MapStore.commit('setToolState', new ToolSelect('add-forbid-region', val))
      this.$emit('onChanged', val)
    }
  }

}
</script>
<style lang="scss" scoped>
.add-forbid-region-tool {
  :deep(.el-radio-button .el-radio-button__inner) {
    text-align: left;
    font-size: 18px;
  }
}
</style>