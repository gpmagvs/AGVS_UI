<template>
  <div>
    <el-table
      :header-cell-style="{color:'black',backgroundColor:'rgb(241, 241, 241)'}"
      :data="IncompletedTaskList"
      row-key="TaskName"
      size="small"
      empty-text="沒有任務"
      :height="height"
    >
      <el-table-column fixed="left" label="任務名稱" prop="TaskName" width="170"></el-table-column>
      <el-table-column fixed="left" label="執行AGV" prop="DesignatedAGVName"></el-table-column>
      <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
      <el-table-column label="任務狀態" prop="StateName" width="80">
        <template #default="scope">
          <el-tag effect="dark" :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="動作" prop="ActionName" width="60"></el-table-column>
      <el-table-column label="卡匣ID" prop="Carrier_ID" width="100"></el-table-column>
      <el-table-column label="起點">
        <el-table-column label="站點" prop="From_Station"></el-table-column>
        <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>
      </el-table-column>
      <el-table-column label="終點">
        <el-table-column label="站點" prop="To_Station"></el-table-column>
        <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column>
      </el-table-column>
      <el-table-column fixed="right" label="派工人員" prop="DispatcherName"></el-table-column>
      <el-table-column v-if="taskCancelable" fixed="right" width="100">
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
      cancelTaskName: ''
    }
  },
  computed: {
    taskCancelable() {
      return userStore.getters.IsLogin;
    }
  },
  methods: {
    CancelTaskHandler(task_name) {
      this.cancelTaskName = task_name;
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
      await TaskAllocation.Cancel(this.cancelTaskName);
    },
    GetTaskStateType(State) {
      return GetTaskStateType(State);
    }
  },
}
</script>

<style lang="scss" scoped>
</style>