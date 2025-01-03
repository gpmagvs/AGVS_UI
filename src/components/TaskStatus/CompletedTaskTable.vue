<template>
  <div class="completed-task-table">
    <el-table
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="SortedOrders"
      row-key="TaskName"
      border
      :height="height"
      :row-class-name="row_class_name"
      :empty-text="$t('TaskTable.NoTasks')"
      @filter-change="handleFilterChange"
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
        width="100"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('TaskTable.RecievedTime')"
        prop="RecieveTime_Formated"
        width="100"
      ></el-table-column>
      <el-table-column :label="$t('TaskTable.FinishTime')" prop="FinishTime_Formated" width="100"></el-table-column>
      <el-table-column
        :label="$t('TaskTable.TaskStatus')"
        prop="StateName"
        :filters="CompletedTaskStateOptions"
        column-key="State"
        :filter-method="filterTaskState"
        width="80"
      >
        <template #default="scope">
          <el-tooltip :content="scope.row.State+''" placement="top">
            <el-tag
              effect="dark"
              :type="GetTaskStateType(scope.row.State)"
            >{{ scope.row.StateName }}</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('TaskTable.Action')"
        prop="ActionName"
        :filters="TaskActionFileterOptions"
        :filter-method="filterTaskAction"
        width="80"
      >
        <template #default="scope">
          <el-tag :type="TaskActionTagTypes[scope.row.Action] || TaskActionTagTypes.default">
            <b>{{ scope.row.ActionName }}</b>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.CstID')" prop="Carrier_ID">
        <template #default="scope">{{ scope.row.Carrier_ID == "-1" ? "" : scope.row.Carrier_ID }}</template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Source') ">
        <template #default="scope">
          <el-tooltip
            :content="'Tag:'+scope.row.From_Station+''"
            placement="right"
            popper-class="bg-primary"
          >
            <div>{{ GetStationName(scope.row.From_Station) }}</div>
          </el-tooltip>
          <div v-if="scope.row.From_Slot!='-1'">(Slot:{{ scope.row.From_Slot }})</div>
        </template>
        <!-- <el-table-column label="站點" prop="From_Station"></el-table-column>
        <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>-->
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Destine')">
        <template #default="scope">
          <el-tooltip
            :content="'Tag:'+scope.row.To_Station+''"
            placement="right"
            popper-class="bg-primary"
          >
            <div>{{ GetStationName(scope.row.To_Station) }}</div>
          </el-tooltip>
          <div v-if="scope.row.To_Slot!='-1'">(Slot:{{ scope.row.To_Slot }})</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Dispatcher')" prop="DispatcherName" width="100"></el-table-column>
      <el-table-column
        v-if="IsUserLogined"
        label="Action"
        prop="DispatcherName"
        fixed="right"
        width="100"
      >
        <template #default="scope">
          <!-- 重新指派任務按鈕:: 當任務Action為9且任務名稱開頭為m時按鈕會被禁用 -->
          <el-button
            :disabled="scope.row.Action ==9 &&scope.row.TaskName.toLowerCase().startsWith('m')"
            type="primary"
            size="small"
            @click="RedoTask(scope.row)"
          >{{ $t('TaskTable.Reassign') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="false" class="h-100">
      <MissionCard v-for="mission in SortedOrders" :key="mission.TaskName" :mission="mission" />
    </div>
  </div>
</template>
<script>
import { GetTaskStateType, CompletedTaskStateOptions, TaskActionFileterOptions, TaskActionTagTypes } from './TaskStatus'
import { MapStore } from '@/components/Map/store'
import clsTaskState from '@/ViewModels/TaskState';
import { TaskAllocation } from '@/api/TaskAllocation';
import { userStore } from '@/store';
import MissionCard from './MissionCard.vue';
export default {
  components: {
    MissionCard
  },
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
  data() {
    return {
      selectedStateFilters: [],
      selectedActionFilters: [],
      CompletedTaskStateOptions,
      TaskActionFileterOptions,
      TaskActionTagTypes
    }
  },
  computed: {
    MapPoints() {
      return Object.values(MapStore.getters.MapData.Points)
    },
    /**用戶是否登入 */
    IsUserLogined() {
      return userStore.state.user.Role != -1;
    },
    SortedOrders() {
      let filteredList = this.CompletedTaskList;
      if (this.selectedStateFilters.length > 0) {
        filteredList = filteredList.filter(item => this.selectedStateFilters.includes(item.State));
      }
      if (this.selectedActionFilters.length > 0) {
        filteredList = filteredList.filter(item => this.selectedActionFilters.includes(item.Action));
      }
      return filteredList;
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
    },
    filterTaskState(value, row) {
      return row.State === value;
    },
    filterTaskAction(value, row) {
      return row.Action === value;
    },
    handleFilterChange(filters) {
      this.selectedStateFilters = filters.State || []; // 因為我們的 column-key 是 "State"
      this.selectedActionFilters = filters.Action || []; // 因為我們的 column-key 是 "Action"
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