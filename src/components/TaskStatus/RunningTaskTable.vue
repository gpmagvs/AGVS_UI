<template>
  <div class="running-task-table">
    <el-table
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="IncompletedTaskList"
      row-key="TaskName"
      size="large"
      :row-class-name="row_class_name"
      :empty-text="$t('TaskTable.NoTasks')"
      @header-dragend="HandleHeaderDragEnd"
      border
      fit
      :height="height">
      <el-table-column :label="$t('TaskTable.TaskName')" width="180" prop="TaskName"></el-table-column>
      <el-table-column :label="$t('TaskTable.Time')" align="center" prop="RecieveTime_Formated" width="80"></el-table-column>
      <el-table-column :label="$t('TaskTable.Action')" align="center" prop="ActionName" width="60">
        <template #default="scope">
          <el-tag effect="dark" :type="scope.row.Action == 8 || scope.row.Action == 14 ? 'warning' : ''"> <b>{{ scope.row.ActionName }}</b></el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.TaskStatus')" align="center" prop="StateName" :width="getColumnSize('StateName', 80)">
        <template #default="scope">
          <el-tag effect="dark" :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.ExcuteAgvName')" align="center" :width="getColumnSize('DesignatedAGVName', 120)" prop="DesignatedAGVName">
        <template #default="scope">
          <div class="agv-name">{{ scope.row.DesignatedAGVName }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Source')" align="center" prop="From_Station" :width="getColumnSize('From_Station', 110)">
        <template #default="scope"> {{ GetStationName(scope.row.From_Station) }}</template>
        <!-- <el-table-column label="站點" prop="From_Station"></el-table-column> -->
        <!-- <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column> -->
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Destine')" align="center" prop="To_Station" :width="getColumnSize('To_Station', 110)" min-width="100%">
        <template #default="scope">{{ GetStationName(scope.row.To_Station) }}</template>
        <!-- <el-table-column label="站點" prop="To_Station"></el-table-column> -->
        <!-- <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column> -->
      </el-table-column>
      <el-table-column :label="$t('TaskTable.CstID')" align="center" :width="getColumnSize('Carrier_ID', 120)" prop="Carrier_ID">
        <template #default="scope">{{ scope.row.Carrier_ID == "-1" ? "" : scope.row.Carrier_ID }}</template>
      </el-table-column>
      <el-table-column :label="$t('TaskTable.Dispatcher')" :width="getColumnSize('DispatcherName')" prop="DispatcherName"></el-table-column>
      <el-table-column v-show="taskCancelable" fixed="right" width="100">
        <template #default="scope">
          <div>
            <b-button size="sm" variant="danger" @click="CancelTaskHandler(scope.row.TaskName)">取消任務</b-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { userStore } from '@/store'
import { TaskAllocation } from '@/api/TaskAllocation'
import { GetTaskStateType } from './TaskStatus'
import { MapStore } from '@/components/Map/store'
import { TableColumnSize, ReStoreTableColumnSizeSettingsFromStorage, SaveTableColumnSizeSettingsToStorage } from '@/ViewModels/UI/TableColumnSize.js'
import bus from '@/event-bus';

export default {
  props: {
    IncompletedTaskList: {
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
  data() {
    return {
      showCancelTaskConfirm: false,
      cancelTaskName: '',
      columnsSizeSetting: [
        new TableColumnSize('From_Station', 100),
        new TableColumnSize('To_Station', 100)
      ],

    }
  },
  computed: {
    taskCancelable() {
      return userStore.getters.IsLogin;
    },
    MapPoints() {
      return Object.values(MapStore.getters.MapData.Points)
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
      return 'task-row'
      if (row.DispatcherName.toUpperCase() == 'TRAFFIC')
        return 'traffic-task-row'
      if (row.Action == 8 || row.Action == 14)
        return 'charge-task-row'
      if (row.Action == 9)
        return 'carry-task-row'

      return ''
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
    color: rgb(9, 30, 87);
    cursor: pointer;
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
      color: rgb(13, 110, 253)
    }
  }
}
</style>