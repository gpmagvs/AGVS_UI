<template>
  <div>
    <el-drawer v-model="isVisible" title="地圖進階設定" size="30%">
      <el-form label-position="left">
        <el-form-item label="導航路徑顯示涵蓋範圍">
          <el-switch
            v-model="showAGVPathCoverage"
            active-text="顯示"
            inactive-text="隱藏"
            @change="handleAGVPathCoverageChange"
          />
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, defineProps, defineExpose, defineEmits } from 'vue';

const props = defineProps({
  defaultShowAGVPathCoverage: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['showAGVPathCoverageChange']);


const isVisible = ref(false)

const open = ({ defaultShowAGVPathCoverage = false }) => {
  isVisible.value = true
  showAGVPathCoverage.value = defaultShowAGVPathCoverage
}

const close = () => {
  isVisible.value = false
}

const showAGVPathCoverage = ref(props.defaultShowAGVPathCoverage)

const handleAGVPathCoverageChange = () => {
  emit('showAGVPathCoverageChange', showAGVPathCoverage.value)
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
</style>