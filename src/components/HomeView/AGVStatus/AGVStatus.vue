<template>
  <div class="agv-status card-like">
    <div class="title">
      <i class="bi bi-robot">AGV STATUS</i>
    </div>
    <el-table :data="AGVDatas" size="large" empty-text="沒有AGV">
      <el-table-column label="AGV Name" prop="BaseProps.AGV_Name" width="130px">
        <template #default="scope">
          <b>{{scope.row.BaseProps.AGV_Name }}</b>
        </template>
      </el-table-column>
      <!-- <el-table-column label="AGV ID" prop="AGV_ID"></el-table-column> -->
      <!-- <el-table-column label="通訊狀態"></el-table-column> -->
      <el-table-column label="上線狀態" prop="OnlineStatus">
        <template #default="scope">
          <div class="online-status-div">
            <el-tag
              effect="dark"
              @click="ShowOnlineStateChangeModal(scope.row.BaseProps.AGV_Name,scope.row.OnlineStatus)"
              :type="scope.row.OnlineStatus ==0?'danger':'success'"
            >
              <b>{{ scope.row.OnlineStatus==1?'ONLINE':'OFFLINE' }}</b>
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="運轉狀態" prop="RunningStatus.AGV_Status" :formatter="AGVStatusFormatter">
        <template #default="scope">
          <div>
            <el-tag effect="dark" :type="AGV_Status_TagType(scope.row.RunningStatus.AGV_Status)">
              <b>{{AGVStatusFormatter(scope.row)}}</b>
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="位置" prop="RunningStatus.Last_Visited_Node"></el-table-column>
      <el-table-column label="任務" prop="RunningStatus.Last_Visited_Node">
        <el-table-column prop="state" label="名稱" />
        <el-table-column prop="city" label="狀態" />
      </el-table-column>
      <el-table-column label="載物ID" prop="RunningStatus.CSTID"></el-table-column>
      <el-table-column label="電量" prop="RunningStatus.Electric_Volume[0]">
        <template #default="scope">
          <div>
            <el-progress :percentage="scope.row.RunningStatus.Electric_Volume[0]"></el-progress>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <div>
            <b-button
              class="w-100 my-1"
              @click="ShowTaskAllocationView(scope.row)"
              size="sm"
              variant="primary"
            >
              <i class="bi bi-bus-front"></i>任務
            </b-button>
            <b-button
              class="w-100"
              @click="ShowTaskAllocationView(scope.row)"
              size="sm"
              variant="info"
            >
              <i class="bi bi-lightning-charge-fill"></i>充電
            </b-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!--Modals-->
  <div class="modals">
    <b-modal
      v-model="ShowOnlineStateChange"
      title="Online/Offline Change"
      :centered="true"
      @ok="SendOnlineStateChangeRequest"
      :no-close-on-esc="true"
    >
      <p ref="online_status_change_noti_txt"></p>
    </b-modal>
  </div>
</template>

<script>
import { clsAgvStatus } from '@/ViewModels/WebViewModels.js'
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus';
import WebSocketHelp from '@/api/WebSocketHepler';
export default {
  mounted() {
    this.WebSocketInit();
  },
  data() {
    return {
      AGVDatas: [],
      ShowOnlineStateChange: false,
      OnlineStatusReq: {
        AGV_Name: '',
        Online_Status: '',
      }
    }
  },
  methods: {
    WebSocketInit() {
      var ws = new WebSocketHelp("ws/VMSStatus");
      ws.Connect();
      ws.wssocket.onmessage = (event) => {
        var data = JSON.parse(event.data);
        this.AGVDatas = Object.values(data);
        bus.emit('/agv_name_list', this.CreateMapAGVData());
      }
    },
    CreateMapAGVData() {
      var agv_data_for_map = [];
      this.AGVDatas.forEach(agvData => {
        agv_data_for_map.push({
          AGV_Name: agvData.BaseProps.AGV_Name,
          Current_Tag: agvData.RunningStatus.Last_Visited_Node
        })
      })
      return agv_data_for_map;
    },
    ShowTaskAllocationView(clsAgvStatus) {
      bus.emit('bus-show-task-allocation', clsAgvStatus);
    },
    ShowOnlineStateChangeModal(agv_name, current_online_status) {

      this.OnlineStatusReq.AGV_Name = agv_name;
      this.OnlineStatusReq.Online_Status = current_online_status == 0 ? 'Online' : 'Offline';
      var text_class = current_online_status == 0 ? 'text-success' : 'text-danger';
      this.$refs['online_status_change_noti_txt'].innerHTML = `<h4>確定要將 <span class='border-bottom'> ${this.OnlineStatusReq.AGV_Name}</span><b> <span class='${text_class}'>${this.OnlineStatusReq.Online_Status}</span></b>  ?</h4>`;
      this.ShowOnlineStateChange = true;
    },
    SendOnlineStateChangeRequest() {
      Notifier.Success(`${this.OnlineStatusReq.AGV_Name} - ${this.OnlineStatusReq.Online_Status} 請求已送出`, 'top', 3000);
    },
    AGV_Status_TagType(status_code) {
      if (status_code == 1)
        return "warning"
      else if (status_code == 2)
        return "success"
      else if (status_code == 3)
        return "danger"
      else if (status_code == 4)
        return "primary"
      else
        return "default"
    },
    AGVStatusFormatter(row, column) {
      //1. IDLE: active but no mission 
      // 2. RUN: executing mission
      // 3. DOWN: alarm or error
      // 4. Charging: in chargin
      var status_code = row.RunningStatus.AGV_Status;
      if (status_code == 1)
        return "IDLE"
      else if (status_code == 2)
        return "RUN"
      else if (status_code == 3)
        return "DOWN"
      else if (status_code == 4)
        return "Charging"
      else
        return "Unknown"
    }
  },
  computed: {
    AGV_Names() {

      var agv_name_list = [];
      this.AGVDatas.forEach(agvData => {
        agv_name_list.push(agvData.BaseProps.AGV_Name);
      });

      return agv_name_list
    }
  },
}
</script>

<style lang="scss" scoped>
.agv-status {
  height: 60%;

  .online-status-div:hover {
    cursor: pointer;
  }
}
</style>