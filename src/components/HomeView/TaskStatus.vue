<template>
  <div class="task-status card-like">
    <div class="title">
      <i class="bi bi-three-dots-vertical"></i>TASK STATUS
    </div>

    <b-tabs @activate-tab="TabActiveHandle" size>
      <b-tab title="未完成任務">
        <el-table
          :header-cell-style="{color:'black',backgroundColor:'rgb(241, 241, 241)'}"
          :data="IncompletedTaskList"
          row-key="TaskName"
          size="small"
          empty-text="沒有任務"
          height="260px"
        >
          <el-table-column fixed="left" label="任務名稱" prop="TaskName" width="170"></el-table-column>
          <el-table-column fixed="left" label="執行AGV" prop="DesignatedAGVName"></el-table-column>
          <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="任務狀態" prop="StateName" width="80">
            <template #default="scope">
              <el-tag
                effect="dark"
                :type="GetTaskStateType(scope.row.State)"
              >{{ scope.row.StateName }}</el-tag>
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
                <b-button
                  size="sm"
                  variant="danger"
                  @click="CancelTaskHandler(scope.row.TaskName)"
                >取消任務</b-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </b-tab>
      <b-tab title="已結束任務">
        <el-table
          :header-cell-style="{color:'black',backgroundColor:'rgb(241, 241, 241)'}"
          :data="CompletedTaskList"
          row-key="TaskName"
          size="small"
          height="260px"
          empty-text="沒有任務"
        >
          <el-table-column fixed="left" label="任務名稱" prop="TaskName" width="170"></el-table-column>
          <el-table-column fixed="left" label="執行AGV" prop="DesignatedAGVName"></el-table-column>
          <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="結束時間" prop="FinishTime_Formated" width="80"></el-table-column>
          <el-table-column label="任務狀態" prop="StateName" width="80">
            <template #default="scope">
              <el-tag
                effect="dark"
                :type="GetTaskStateType(scope.row.State)"
              >{{ scope.row.StateName }}</el-tag>
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
      </b-tab>
    </b-tabs>

    <!--Modal-->
    <b-modal
      title="任務取消"
      :centered="true"
      header-bg-variant="warning"
      v-model="showCancelTaskConfirm"
      @ok="SendCancelTaskRequest"
    >
      <p ref="cancel-task-diaglog-text">確定要取消該任務?({{ cancelTaskName}})</p>
    </b-modal>
  </div>
</template>

<script>
import clsTaskState from '@/ViewModels/TaskState.js'
import { TaskAllocation } from '@/api/TaskAllocation'
import param from '@/gpm_param'
import { userStore } from '@/store'
export default {
  data() {
    return {
      IncompletedTaskList: [
      ],
      CompletedTaskList: [
      ],
      showCancelTaskConfirm: false,
      cancelTaskName: ''
    }
  },
  mounted() {
    this.WsInit();
  },
  computed: {
    taskCancelable() {
      return userStore.getters.IsLogin;
    }
  },
  methods: {
    GetTaskStateType(state_code) {
      //success",", "info", "warning", "danger", ""],
      if (state_code == 1 || state_code == 2 || state_code == 3) //Running
        return 'warning'
      else if (state_code == 4) //等待
        return 'success'
      else if (state_code == 6 | state_code == 7) //FAILURE
        return 'danger'
      else
        return 'info'         //Failure
    },
    WsInit() {
      const worker = new Worker('websocket_worker.js')
      worker.onmessage = (event) => {
        var parsedArray = event.data;
        this.IncompletedTaskList = parsedArray.incompleteds.map(task => new clsTaskState(task));
        this.CompletedTaskList = parsedArray.completeds.map(task => new clsTaskState(task));
      }
      debugger
      worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + '/ws/TaskData' });
    },
    CancelTaskHandler(task_name) {
      this.cancelTaskName = task_name;

      this.showCancelTaskConfirm = true;
    },
    async SendCancelTaskRequest() {
      await TaskAllocation.Cancel(this.cancelTaskName);
    }
  },
}
</script>

<style lang="scss" scoped>
</style>