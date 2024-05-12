<template>
  <div class="completed-task-table">
    <el-table
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="CompletedTaskList"
      row-key="TaskName"
      size="small"
      border
      :height="height"
      :row-class-name="row_class_name"
      empty-text="沒有任務">
      <el-table-column label="任務名稱" prop="TaskName" width="180"></el-table-column>
      <el-table-column label="執行AGV" prop="DesignatedAGVName"> </el-table-column>
      <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
      <el-table-column label="結束時間" prop="FinishTime_Formated" width="80"></el-table-column>
      <el-table-column label="任務狀態" prop="StateName" width="80">
        <template #default="scope">
          <el-tag effect="dark" :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="動作" prop="ActionName" width="60">
        <template #default="scope">
          <el-tag effect="dark" :type="scope.row.Action == 8 || scope.row.Action == 14 ? 'warning' : 'primary'"> <b>{{ scope.row.ActionName }}</b></el-tag>
        </template>
      </el-table-column>
      <el-table-column label="卡匣ID" prop="Carrier_ID">
        <template #default="scope"> {{ scope.row.Carrier_ID == "-1" ? "" : scope.row.Carrier_ID }} </template>
      </el-table-column>
      <el-table-column label="起點">
        <template #default="scope">{{ GetStationName(scope.row.From_Station) }}</template>
        <!-- <el-table-column label="站點" prop="From_Station"></el-table-column>
        <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>-->
      </el-table-column>
      <el-table-column label="終點">
        <template #default="scope">{{ GetStationName(scope.row.To_Station) }}</template>
        <!-- <el-table-column label="站點" prop="To_Station"></el-table-column>
        <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column>-->
      </el-table-column>
      <el-table-column label="派工人員" prop="DispatcherName"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import { GetTaskStateType } from './TaskStatus'
import { MapStore } from '@/components/Map/store'

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
        return '210px'
      }
    }
  },
  computed: {
    MapPoints() {
      return Object.values(MapStore.getters.MapData.Points)
    }
  },
  methods: {
    GetTaskStateType(State) {
      return GetTaskStateType(State);
    }
    ,
    GetStationName(tag) {
      if (tag == -1) return "-";
      var station = this.MapPoints.find(station => station.TagNumber + '' == tag)
      if (station)
        return station.Graph.Display
      return tag
    },
    row_class_name({ row, rowIndex }) {
      return 'task-row'
      if (row.DispatcherName.toUpperCase() == 'TRAFFIC')
        return 'traffic-task-row'
      if (row.Action == 8 || row.Action == 14)
        return 'charge-task-row'
      return ''
    }
  },
}
</script>
<style lang="scss">
.completed-task-table {

  .el-table .traffic-task-row {
    background-color: rgb(169, 223, 238);
    /* --el-table-tr-bg-color: var(--el-color-warning-light-9); */
  }

  .el-table .charge-task-row {
    background-color: rgb(255, 235, 83);
  }

  .task-row {
    color: rgb(61, 61, 61)
  }
}
</style>