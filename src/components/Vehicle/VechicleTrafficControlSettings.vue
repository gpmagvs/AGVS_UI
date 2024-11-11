<template>
  <div class="rounded">
    <pre>{{ agv_row }}</pre>

    <el-form :model="agv_row">
      <el-form-item label="變更位置">
        <div class="d-flex">
          <el-select v-model="agv_row.AGV_Name" placeholder="請選擇位置">
            <el-option />
          </el-select>
          <el-button type="primary">變更</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup >
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"
import { ref, defineProps } from 'vue'

const props = defineProps({
  agv_row: {
    type: clsAGVStateDto,
    default() { return new clsAGVStateDto() }
  }
})
</script>

<style>
</style>