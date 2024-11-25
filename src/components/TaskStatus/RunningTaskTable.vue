<template>
  <div class="running-task-table">
    <el-table
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="taskWithSorted"
      row-key="TaskName"
      size="large"
      :row-class-name="row_class_name"
      :empty-text="$t('TaskTable.NoTasks')"
      @header-dragend="HandleHeaderDragEnd"
      border
      fit
      :height="height"
      @filter-change="handleFilterChange"
    >
      <el-table-column
        :label="$t('TaskTable.TaskName')"
        width="100"
        prop="TaskName"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('TaskTable.Time')"
        align="center"
        prop="RecieveTime_Formated"
        width="90"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('TaskTable.Action')"
        align="center"
        :filters="TaskActionFileterOptions"
        column-key="Action"
        :filter-method="filterTaskAction"
        width="80"
      >
        <template #default="scope">
          <el-tag
            effect="dark"
            :type="scope.row.Action == 8 || scope.row.Action == 14 ? 'warning' : 'primary'"
          >
            <b>{{ scope.row.ActionName }}</b>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('TaskTable.TaskStatus')"
        align="center"
        prop="StateName"
        width="80"
        :filters="RunningTaskStateOptions"
        column-key="State"
        :filter-method="filterTaskState"
      >
        <template #default="scope">
          <el-tag effect="dark" :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('TaskTable.ExcuteAgvName')"
        align="center"
        width="120"
        prop="DesignatedAGVName"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="agv-name">{{ scope.row.DesignatedAGVName }}</div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('TaskTable.Source')"
        align="center"
        prop="From_Station"
        width="110"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div>{{ GetStationName(scope.row.From_Station) }}</div>
          <div v-if="scope.row.From_Slot!='-1'">(Slot:{{ scope.row.From_Slot }})</div>
        </template>
        <!-- <el-table-column label="站點" prop="From_Station"></el-table-column> -->
        <!-- <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column> -->
      </el-table-column>
      <el-table-column
        :label="$t('TaskTable.Destine')"
        align="center"
        prop="To_Station"
        width="110"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div>{{ GetStationName(scope.row.To_Station) }}</div>
          <div v-if="scope.row.To_Slot!='-1'">(Slot:{{ scope.row.To_Slot }})</div>
        </template>
        <!-- <el-table-column label="站點" prop="To_Station"></el-table-column> -->
        <!-- <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column> -->
      </el-table-column>
      <el-table-column :label="$t('TaskTable.CstID')" align="center" width="120" prop="Carrier_ID">
        <template #default="scope">{{ scope.row.Carrier_ID == "-1" ? "" : scope.row.Carrier_ID }}</template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Dispatcher')" width="100" prop="DispatcherName"></el-table-column>
      <el-table-column v-show="taskCancelable" fixed="right" min-width="125">
        <template #default="scope">
          <div>
            <b-button variant="danger" @click="CancelTaskHandler(scope.row.TaskName)">取消任務</b-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { userStore } from '@/store'
import { TaskAllocation } from '@/api/TaskAllocation'
import { GetTaskStateType, RunningTaskStateOptions, TaskActionFileterOptions } from './TaskStatus'
import { MapStore } from '@/components/Map/store'
import { TableColumnSize, ReStoreTableColumnSizeSettingsFromStorage, SaveTableColumnSizeSettingsToStorage } from '@/ViewModels/UI/TableColumnSize.js'
import bus from '@/event-bus';
import clsTaskState from '@/ViewModels/TaskState'


export default {
  props: {
    IncompletedTaskList: {
      type: Array,
      default() {
        return new clsTaskState({})
      }
    },
    height: {
      type: String,
      default() {
        return '260px'
      }
    }
  },
  data() {
    return {
      showCancelTaskConfirm: false,
      cancelTaskName: '',
      columnsSizeSetting: [
        new TableColumnSize('From_Station', 100),
        new TableColumnSize('To_Station', 100)
      ],
      selectedStateFilters: [],
      selectedActionFilters: [],
      RunningTaskStateOptions,
      TaskActionFileterOptions
    }
  },
  computed: {
    taskCancelable() {
      return userStore.getters.IsLogin;
    },
    MapPoints() {
      return Object.values(MapStore.state.MapData.Points);
    },
    taskWithSorted() {
      let filteredList = this.IncompletedTaskList;
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
    getColumnSize(propName = '', defaultVal = 100) {
      var setting = this.columnsSizeSetting.find(item => item.propName == propName)
      if (setting) {
        return setting.width
      } else {
        return defaultVal
      }
    },
    HandleHeaderDragEnd(newWidth, oldWidth, column, event) {
      // console.log(newWidth, oldWidth, column)
      let propName = column.property;
      let existProp = this.columnsSizeSetting.find(p => p.propName == propName)
      if (!existProp) {
        this.columnsSizeSetting.push(new TableColumnSize(propName, newWidth))
      } else {
        existProp.width = newWidth
      }

      SaveTableColumnSizeSettingsToStorage('runningTaskTable-column-size', this.columnsSizeSetting)

    },
    filterTaskState(value, row, column) {
      console.log(row['State'], value);
      return row['State'] === value
    },
    CancelTaskHandler(task_name) {
      this.cancelTaskName = task_name;
      var isHotRunTask = task_name.includes('HR')
      this.$swal.fire(
        {
          title: '確定要取消任務?',
          text: '任務ID ' + task_name,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            this.SendCancelTaskRequest()
          }
        })
    },
    async SendCancelTaskRequest() {
      try {
        await TaskAllocation.Cancel(this.cancelTaskName);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access. Please log in again.");
          userStore.commit('setUser', null);
          // bus.emit('/show-login-view-invoke')
          this.$swal.fire(
            {
              text: '',
              title: '請先進行登入',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            }).then(() => {

              bus.emit('/show-login-view-invoke')
            })
        }
      }
    },
    GetTaskStateType(State) {
      return GetTaskStateType(State);
    },
    GetStationName(tag) {
      if (tag == -1) return "-";
      var station = this.MapPoints.find(station => station.TagNumber + '' == tag)
      if (station)
        return station.Graph.Display
      return tag
    },
    row_class_name({ row, rowIndex }) {

      if (row.IsHighestPriorityTask)
        return 'highest-priority-task-row'
      return 'task-row'
      if (row.DispatcherName.toUpperCase() == 'TRAFFIC')
        return 'traffic-task-row'
      if (row.Action == 8 || row.Action == 14)
        return 'charge-task-row'
      if (row.Action == 9)
        return 'carry-task-row'

      return ''
    },
    handleFilterChange(filters) {
      this.selectedStateFilters = filters.State || []; // 因為我們的 column-key 是 "State"
      this.selectedActionFilters = filters.Action || []; // 因為我們的 column-key 是 "Action"
    }
  },
  mounted() {
    this.columnsSizeSetting = ReStoreTableColumnSizeSettingsFromStorage('runningTaskTable-column-size')
  }
}
</script>
<style lang="scss">
.running-task-table {
  .agv-name {
    text-decoration: underline;
    font-size: larger;
    font-weight: bold;
    color: rgb(0, 102, 255);
    cursor: pointer;
  }

  .el-table .highest-priority-task-row {
    background: linear-gradient(45deg, #ff4d4d, #f5afaf);
    color: white;
    &:hover {
      background: linear-gradient(45deg, #ff854d, #facdcd) !important;
      color: black !important;
    }
  }

  .el-table .traffic-task-row {
    background-color: rgb(169, 223, 238);
    /* --el-table-tr-bg-color: var(--el-color-warning-light-9); */
  }

  .el-table {
    .charge-task-row {
      background-color: rgb(255, 230, 36);
    }

    .carry-task-row {
      //background-color: rgb(124, 82, 82);
    }

    .task-row {
      color: rgb(13, 110, 253) !important;
    }
  }
}
</style>