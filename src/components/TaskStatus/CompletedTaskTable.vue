<template>
  <div>
    <el-table
      :header-cell-style="{color:'black',backgroundColor:'rgb(241, 241, 241)'}"
      :data="CompletedTaskList"
      row-key="TaskName"
      size="small"
      :height="height"
      empty-text="沒有任務"
    >
      <el-table-column fixed="left" label="任務名稱" prop="TaskName" width="170"></el-table-column>
      <el-table-column fixed="left" label="執行AGV" prop="DesignatedAGVName"></el-table-column>
      <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
      <el-table-column label="結束時間" prop="FinishTime_Formated" width="80"></el-table-column>
      <el-table-column label="任務狀態" prop="StateName" width="80">
        <template #default="scope">
          <el-tag effect="dark" :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="動作" prop="ActionName" width="60"></el-table-column>
      <el-table-column label="卡匣ID" prop="Carrier_ID"></el-table-column>
      <el-table-column label="起點">
        <el-table-column label="站點" prop="From_Station"></el-table-column>
        <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>
      </el-table-column>
      <el-table-column label="終點">
        <el-table-column label="站點" prop="To_Station"></el-table-column>
        <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column>
      </el-table-column>
      <el-table-column fixed="right" label="派工人員" prop="DispatcherName"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { GetTaskStateType } from './TaskStatus'
export default {
  props: {
    CompletedTaskList: {
      type: Array,
      default() {
        return []
      }
    },
    height: {
      type: String,
      default() {
        return '260px'
      }
    }
  },
  methods: {
    GetTaskStateType(State) {
      return GetTaskStateType(State);
    }
  },
}
</script>

<style lang="scss" scoped>
</style>