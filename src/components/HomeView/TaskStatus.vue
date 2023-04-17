<template>
  <div class="task-status card-like">
    <div class="title">
      <i class="bi bi-list-task"></i>TASK STATUS
    </div>

    <b-tabs @activate-tab="TabActiveHandle" size>
      <b-tab title="未完成任務">
        <el-table
          :data="IncompletedTaskList"
          row-key="TaskName"
          size="small"
          empty-text="沒有任務"
          height="280px"
          style="z-index:1"
        >
          <el-table-column label="任務名稱" prop="TaskName" width="170"></el-table-column>
          <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="任務狀態" prop="StateName" width="80">
            <!-- <tempte #default="scope">
              <el-tag :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
            </tempte>-->
          </el-table-column>
          <el-table-column label="動作" prop="ActionName" width="80"></el-table-column>
          <el-table-column label="卡匣ID" prop="Carrier_ID" width="100"></el-table-column>
          <el-table-column label="起點">
            <el-table-column label="站點" prop="From_Station"></el-table-column>
            <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="終點">
            <el-table-column label="站點" prop="To_Station"></el-table-column>
            <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="執行AGV" prop="DesignatedAGVName"></el-table-column>
          <el-table-column label="派工人員" prop="DispatcherName"></el-table-column>
          <el-table-column fixed="right" width="100">
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
      <b-tab title="已完成任務">
        <el-table
          :data="CompletedTaskList"
          row-key="TaskName"
          size="small"
          height="280px"
          empty-text="沒有任務"
          style="z-index:1"
        >
          <el-table-column label="任務名稱" prop="TaskName" width="170"></el-table-column>
          <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="完成時間" prop="FinishTime_Formated" width="80"></el-table-column>
          <el-table-column label="任務狀態" prop="StateName" width="80">
            <template #default="scope">
              <el-tag :type="GetTaskStateType(scope.row.State)">{{ scope.row.StateName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="動作" prop="ActionName" width="80"></el-table-column>
          <el-table-column label="卡匣ID" prop="Carrier_ID"></el-table-column>
          <el-table-column label="起點">
            <el-table-column label="站點" prop="From_Station"></el-table-column>
            <el-table-column label="Port" prop="From_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="終點">
            <el-table-column label="站點" prop="To_Station"></el-table-column>
            <el-table-column label="Port" prop="To_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="執行AGV" prop="DesignatedAGVName"></el-table-column>
          <el-table-column label="派工人員" prop="DispatcherName"></el-table-column>
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
import WebSocketHelp from '@/api/WebSocketHepler'
import { TaskAllocation } from '@/api/TaskAllocation'
export default {
  data() {
    return {
      IncompletedTaskList: [
      ],
      CompletedTaskList: [
      ],
      wsHelper: new WebSocketHelp(''),
      showCancelTaskConfirm: false,
      cancelTaskName: ''
    }
  },
  mounted() {
    this.WsInit();
  },
  methods: {
    GetTaskStateType(state_code) {
      //success",", "info", "warning", "danger", ""],
      if (state_code == 0)      //wait
        return 'warning'
      else if (state_code == 1) //Running
        return ''
      else if (state_code == 2) //Finish
        return 'success'
      else
        return 'danger'         //Failure
    },
    WsInit() {
      this.wsHelper = new WebSocketHelp('/ws/TaskData');
      this.wsHelper.Connect();
      this.wsHelper.onclose = (ev) => {
        console.info('task status vue : ws closed!');
      }
      this.wsHelper.onmessage = (ev) => {
        var parsedArray = JSON.parse(ev.data);
        this.IncompletedTaskList = parsedArray.incompleteds.map(task => new clsTaskState(task));
        this.CompletedTaskList = parsedArray.completeds.map(task => new clsTaskState(task));

      }
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