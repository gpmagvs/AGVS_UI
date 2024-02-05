<template>
  <el-dialog draggable :modal="false" title="地圖設置" v-model="show">
    <div> ??? </div>
  </el-dialog>
</template>

<script>
import { MapStore } from '@/components/Map/store'
export default {
  data() {
    return {
      show: false
    }
  },
}
</script>

<style lang="scss" scoped></style>