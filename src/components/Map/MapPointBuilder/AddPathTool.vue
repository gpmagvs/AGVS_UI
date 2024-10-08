<template>
  <div class="add-path-tool">
    <el-radio-group class="flex-column" v-model="direction" @change="onDirectionChange">
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
export default {
  data() {
    return {
      direction: 'bi-direction'
    }
  },
  methods: {
    onDirectionChange(direction) {
      this.$emit('onDirectionChanged', direction);
    }
  }
}
</script>

<style lang="scss" scoped>
.add-path-tool {
  .el-radio-button {
    margin-bottom: 10px;
  }

  :deep(.el-radio-button .el-radio-button__inner) {
    text-align: left;
    font-size: 18px;
  }
}
</style>