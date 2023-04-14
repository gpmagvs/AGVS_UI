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
        >
          <el-table-column label="任務名稱" prop="TaskName" width="170"></el-table-column>
          <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="任務狀態" prop="StateName" width="80"></el-table-column>
          <el-table-column label="動作" prop="TaskDispatchData.ActionName" width="80"></el-table-column>
          <el-table-column label="卡匣ID" prop="TaskDispatchData.Carrier_ID" width="100"></el-table-column>
          <el-table-column label="起點">
            <el-table-column label="站點" prop="TaskDispatchData.From_Station"></el-table-column>
            <el-table-column label="Port" prop="TaskDispatchData.From_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="終點">
            <el-table-column label="站點" prop="TaskDispatchData.To_Station"></el-table-column>
            <el-table-column label="Port" prop="TaskDispatchData.To_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="執行AGV" prop="TaskDispatchData.DesignatedAGVName"></el-table-column>
          <el-table-column label="派工人員" prop="DispatcherName"></el-table-column>
        </el-table>
      </b-tab>
      <b-tab title="已完成任務">
        <el-table :data="CompletedTaskList" row-key="TaskName" size="small" empty-text="沒有任務">
          <el-table-column label="任務名稱" prop="TaskName" width="170"></el-table-column>
          <el-table-column label="接收時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="完成時間" prop="RecieveTime_Formated" width="80"></el-table-column>
          <el-table-column label="任務狀態" prop="StateName" width="80"></el-table-column>
          <el-table-column label="動作" prop="TaskDispatchData.ActionName" width="80"></el-table-column>
          <el-table-column label="卡匣ID" prop="TaskDispatchData.Carrier_ID"></el-table-column>
          <el-table-column label="起點">
            <el-table-column label="站點" prop="TaskDispatchData.From_Station"></el-table-column>
            <el-table-column label="Port" prop="TaskDispatchData.From_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="終點">
            <el-table-column label="站點" prop="TaskDispatchData.To_Station"></el-table-column>
            <el-table-column label="Port" prop="TaskDispatchData.To_Slot" width="50"></el-table-column>
          </el-table-column>
          <el-table-column label="執行AGV" prop="TaskDispatchData.DesignatedAGVName"></el-table-column>
          <el-table-column label="派工人員" prop="DispatcherName"></el-table-column>
        </el-table>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import clsTaskState from '@/ViewModels/TaskState.js'
import WebSocketHelp from '@/api/WebSocketHepler'
export default {
  data() {
    return {
      IncompletedTaskList: [
        new clsTaskState("*Test-202304120922333")
      ],
      CompletedTaskList: [
        new clsTaskState("*Test-202304120922333")
      ],
      wsHelper: new WebSocketHelp('')
    }
  },
  mounted() {
    this.WsInit();
  },
  methods: {
    WsInit() {
      this.wsHelper = new WebSocketHelp('/ws/InCompletedTaskList');
      this.wsHelper.Connect();
      this.wsHelper.onopen = (ev) => console.info('task status vue : ws connected!');
      this.wsHelper.onclose = (ev) => {
        console.info('task status vue : ws closed!');
      }
      this.wsHelper.onmessage = (ev) => {
        var parsedArray = JSON.parse(ev.data);
        this.IncompletedTaskList = parsedArray.map(task => new clsTaskState(task));

      }
    },

  },
}
</script>

<style lang="scss" scoped>
</style>