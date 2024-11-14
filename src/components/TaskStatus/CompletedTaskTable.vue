<template>
  <div class="completed-task-table">
    <el-table
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="CompletedTaskList"
      row-key="TaskName"
      border
      :height="height"
      :row-class-name="row_class_name"
      :empty-text="$t('TaskTable.NoTasks')"
    >
      <el-table-column
        :label="$t('TaskTable.TaskName')"
        prop="TaskName"
        width="180"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('TaskTable.ExcuteAgvName')"
        prop="DesignatedAGVName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('TaskTable.RecievedTime')" prop="RecieveTime_Formated" width="80"></el-table-column>
      <el-table-column :label="$t('TaskTable.FinishTime')" prop="FinishTime_Formated" width="80"></el-table-column>
      <el-table-column :label="$t('TaskTable.TaskStatus')" prop="StateName" width="80">
        <template #default="scope">
          <el-tag effect="dark" :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Action')" prop="ActionName" width="60">
        <template #default="scope">
          <el-tag
            effect="dark"
            :type="scope.row.Action == 8 || scope.row.Action == 14 ? 'warning' : 'primary'"
          >
            <b>{{ scope.row.ActionName }}</b>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.CstID')" prop="Carrier_ID">
        <template #default="scope">{{ scope.row.Carrier_ID == "-1" ? "" : scope.row.Carrier_ID }}</template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Source') " show-overflow-tooltip>
        <template #default="scope">{{ GetStationName(scope.row.From_Station) }}</template>
        <!-- <el-table-column label="站點" prop="From_Station"></el-table-column>
        <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>-->
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Destine')" show-overflow-tooltip>
        <template #default="scope">{{ GetStationName(scope.row.To_Station) }}</template>
        <!-- <el-table-column label="站點" prop="To_Station"></el-table-column>
        <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column>-->
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Dispatcher')" prop="DispatcherName"></el-table-column>
      <el-table-column label="Action" prop="DispatcherName" fixed="right" width="100">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="RedoTask(scope.row)"
          >{{ $t('TaskTable.Reassign') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { GetTaskStateType } from './TaskStatus'
import { MapStore } from '@/components/Map/store'
import clsTaskState from '@/ViewModels/TaskState';
import { TaskAllocation } from '@/api/TaskAllocation';

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
    },
    async RedoTask(row = new clsTaskState({})) {
      let _canSettingChooseVehicleOrNot = row.Action == 1 || row.Action == 9;
      let html_content = `
          <div class="w-100 text-start text-primary">${this.$t('TaskTable.TaskName')}</div>
          <div class="w-100 text-start my-2 px-3 font-weight-bold">${row.TaskName}</div>
          <div class="w-100 text-start text-primary">${this.$t('TaskTable.Action')}</div>
          <div class="w-100 text-start my-2 px-3 font-weight-bold">${row.ActionName}</div>
          <div class="w-100 text-start text-primary">${this.$t('TaskTable.ExcuteAgvName')}</div>
          <div class="w-100 text-start my-2 px-3 font-weight-bold">${row.DesignatedAGVName}</div>
          <div class="w-100 text-start text-primary">${this.$t('TaskTable.Source')}</div>
          <div class="w-100 text-start my-2 px-3 font-weight-bold">${this.GetStationName(row.From_Station)} _Slot: ${row.From_Slot}</div>
          <div class="w-100 text-start text-primary">${this.$t('TaskTable.Destine')}</div>
          <div class="w-100 text-start my-2 px-3 font-weight-bold">${this.GetStationName(row.To_Station)} _Slot: ${row.To_Slot}</div>`;
      if (_canSettingChooseVehicleOrNot) {
        html_content += `<div class="w-100 text-end mt-3 border-top pt-2">
            <input type="checkbox" id="autoSelectVehicle" class="me-1" style="height:24px; width:24px; cursor:pointer;">
            <label for="autoSelectVehicle" style="font-size:25px; cursor:pointer;">${this.$t('TaskTable.AutoSelectVehicle')}</label>
          </div>`;
      }
      const result = await this.$swal.fire({
        title: this.$t('ConfirmRedoTask'),
        html: `<div class="border rounded p-2">
          ${html_content}
        </div>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: this.$t('Confirm'),
        cancelButtonText: this.$t('Cancel'),
        customClass: 'dispatch-fail-swal',
        preConfirm: () => {
          const checkBoxDom = document.getElementById('autoSelectVehicle');
          return {
            autoSelectVehicle: checkBoxDom ? checkBoxDom.checked : false
          }
        }
      });

      if (!result.isConfirmed) {
        return;
      }
      const response = await TaskAllocation.RedoTask(row, result.value.autoSelectVehicle);
      if (response.status == 200 && response.data.confirm) {
        this.$swal.fire({
          title: this.$t('RedoTaskSuccess'),
          icon: 'success',
        })
      } else {
        this.$swal.fire({
          title: this.$t('RedoTaskFail'),
          icon: 'error',
          html: `<div class="text-danger">${response.data.message}</div> <div class="text-danger border-top pt-2">${response.data.message_en}</div>`,
          customClass: 'dispatch-fail-swal',
        })
      }
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
    color: rgb(61, 61, 61);
  }
}
</style>