<template>
  <div class="agv-status card-like">
    <div class="title">
      <i class="bi bi-robot"></i>AGV STATUS
    </div>
    <el-table
      :header-cell-style="{color:'black',backgroundColor:'rgb(241, 241, 241)'}"
      :data="AGVDatas"
      size="small"
      height="93%"
      empty-text="沒有AGV"
      :row-class-name="connected_class"
      default-expand-all
    >
      <!-- <el-table-column type="expand">
        <template #default="scope">
          <div>
            <b-progress class="flex-fill" :max="100" :min="0" animated>
              <b-progress-bar
                :animated="true"
                v-bind:class="BatteryClass(scope.row.BatteryLevel)"
                :value="scope.row.BatteryLevel"
                :label="`${((scope.row.BatteryLevel / 100) * 100).toFixed(2)}%`"
              ></b-progress-bar>
            </b-progress>
          </div>
        </template>
      </el-table-column>-->
      <el-table-column label="車輛名稱" prop="AGV_Name" width="80px">
        <template #default="scope">
          <b>{{scope.row.AGV_Name.toUpperCase() }}</b>
        </template>
      </el-table-column>
      <!-- <el-table-column label="AGV ID" prop="AGV_ID"></el-table-column> -->
      <!-- <el-table-column label="通訊狀態"></el-table-column> -->
      <el-table-column label="上線狀態" prop="OnlineStatus" align="center">
        <template #default="scope">
          <div class="online-status-div">
            <el-tag
              effect="dark"
              @click="ShowOnlineStateChangeModal(scope.row.AGV_Name,scope.row.OnlineStatus)"
              :type="scope.row.OnlineStatus ==0?'danger':'success'"
            >
              <b>{{ scope.row.OnlineStatus==1?'ONLINE':'OFFLINE' }}</b>
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="運轉狀態"
        prop="MainStatus"
        :formatter="AGVStatusFormatter"
        align="center"
      >
        <template #default="scope">
          <div>
            <el-tag effect="dark" :type="AGV_Status_TagType(scope.row.MainStatus)">
              <b>{{AGVStatusFormatter(scope.row)}}</b>
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="位置" prop="StationName" align="center">
        <template #default="scope">
          <div>
            <b>{{ scope.row.StationName }}</b>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="任務">
        <el-table-column prop="TaskName" label="名稱" />
        <el-table-column prop="TaskRunStatus" label="狀態">
          <template #default="scope">
            <div
              v-show="scope.row.TaskName!=''"
            >{{ this.GetTaskRunStatusString(scope.row.TaskRunStatus) }}</div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="載物ID" prop="CurrentCarrierID"></el-table-column>
      <el-table-column label="電量" prop="BatteryLevel">
        <template #default="scope">
          <div>
            <b-progress class="flex-fill" :max="100" :min="0" animated>
              <b-progress-bar
                :animated="true"
                v-bind:class="BatteryClass(scope.row.BatteryLevel)"
                :value="scope.row.BatteryLevel"
                :label="`${((scope.row.BatteryLevel / 100) * 100).toFixed(2)}%`"
              ></b-progress-bar>
            </b-progress>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!IsRunMode" label="操作" fixed="right">
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
              @click="ShowAGVChargeConfirmDialog(scope.row)"
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
      title="ONLINE / OFFLINE REQUEST CONFIRM."
      :centered="true"
      @ok="SendOnlineStateChangeRequest"
      :no-close-on-esc="true"
      header-bg-variant="warning"
      header-text-variant="light"
    >
      <p ref="online_status_change_noti_txt"></p>
    </b-modal>
    <b-modal
      v-model="ShowChargeConfirmDialog"
      :centered="true"
      title="AGV Charge"
      @ok="AGVChargeTask"
    >
      <p ref="charge_confirm_noti_text"></p>
    </b-modal>
  </div>
</template>

<script>
import clsAGVStateDto from "@/ViewModels/clsAGVStateDto.js"
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus';
import WebSocketHelp from '@/api/WebSocketHepler';
import { IsLoginLastTime } from '@/api/AuthHelper';
import { OnlineRequest, OfflineRequest } from '@/api/VMSAPI';
import { TaskAllocation, clsChargeTaskData } from '@/api/TaskAllocation.js'
import { userStore, agvs_settings_store } from '@/store'
import param from '@/gpm_param';
export default {
  mounted() {
    this.WebSocketInit();
  },
  data() {
    return {
      AGVDatas: [
        new clsAGVStateDto()
      ],
      ShowOnlineStateChange: false,
      ShowChargeConfirmDialog: false,
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
      ws.onmessage = (event) => {
        var data = JSON.parse(event.data);
        this.AGVDatas = Object.values(data).map(d => new clsAGVStateDto(d));
        bus.emit('/agv_name_list', this.CreateMapAGVData());
      }
      ws.onclose = (ev) => {
        console.info('[AGVStatus]vue Websocket closed');
      }
    },
    CreateMapAGVData() {
      var agv_data_for_map = [];
      this.AGVDatas.forEach(agvData => {
        agv_data_for_map.push({
          AGV_Name: agvData.AGV_Name,
          Current_Tag: agvData.CurrentLocation,
          Rotation: Math.PI / 180 * (agvData.Theta - 90),
          State: this.GetAGVStatusString(agvData.MainStatus),
          IsOnline: agvData.OnlineStatus == 1
        })
      })
      return agv_data_for_map;
    },
    ShowTaskAllocationView(clsAgvStatus) {

      if (!IsLoginLastTime().isLogin) {

        this.$swal.fire({
          title: '權限不足',
          text: '您沒有指派任務的權限，請先進行登入。',
          icon: 'warning',
          showCancelButton: true
        }).then((confirm) => {
          if (confirm.isConfirmed)
            bus.emit('/show-login-view-invoke', '');
        });
        return;
      }

      bus.emit('bus-show-task-allocation', clsAgvStatus);
    },
    ShowOnlineStateChangeModal(agv_name, current_online_status) {

      this.OnlineStatusReq.AGV_Name = agv_name;
      this.OnlineStatusReq.Online_Status = current_online_status == 0 ? 'Online' : 'Offline';
      var online_text = this.OnlineStatusReq.Online_Status == 'Online' ? '上線' : '下線';
      var text_class = current_online_status == 0 ? 'text-success' : 'text-danger';
      this.$refs['online_status_change_noti_txt'].innerHTML = `<h4>確定要將 <span > ${this.OnlineStatusReq.AGV_Name}</span><b> <span class='${text_class}'>${online_text}</span></b>  ?</h4>`;
      this.ShowOnlineStateChange = true;
    },
    async SendOnlineStateChangeRequest() {
      var response = null
      if (this.OnlineStatusReq.Online_Status == 'Online') {
        var res = await OnlineRequest(this.OnlineStatusReq.AGV_Name);
        response = res.data;
      } else {
        var res = response = await OfflineRequest(this.OnlineStatusReq.AGV_Name);
        response = res.data;
      }
      console.log(response.Success)
      if (response.Success)
        Notifier.Success(`${this.OnlineStatusReq.AGV_Name} 已經 ${this.OnlineStatusReq.Online_Status}`, 'top', 3000);
      else
        Notifier.Danger(`${this.OnlineStatusReq.AGV_Name} ${this.OnlineStatusReq.Online_Status} 失敗:${response.Message}`, 'top', 3000);
    },
    ShowAGVChargeConfirmDialog(agv_status) {

      if (!IsLoginLastTime().isLogin) {
        this.$swal.fire({
          title: '權限不足',
          text: '您沒有指派AGV充電的權限，請先進行登入。',
          icon: 'warning',
          showCancelButton: true

        }).then((confirm) => {
          if (confirm.isConfirmed)
            bus.emit('/show-login-view-invoke', '');
        });
        return;
      }

      this.Agv_Selected = agv_status.AGV_Name;
      this.$refs["charge_confirm_noti_text"].innerHTML = `確定要將 <b>${agv_status.AGV_Name}</b> 派送至充電站充電?`;
      this.ShowChargeConfirmDialog = true;
    },
    AGVChargeTask() {
      TaskAllocation.ChargeTask(new clsChargeTaskData(this.Agv_Selected, -1))
    },
    AGV_Status_TagType(status_code) {
      if (status_code == 1)
        return "warning"
      else if (status_code == 2)
        return "success"
      else if (status_code == 3)
        return "danger"
      else if (status_code == 4)
        return ""
      else
        return ""
    },
    GetTaskRunStatusString(status_code) {
      if (status_code == 1)
        return "等待"
      else if (status_code == 2)
        return "執行中"
      else if (status_code == 3)
        return "完成"
      else if (status_code == 4)
        return "失敗"
      else
        return "Unknown"
    },
    GetAGVStatusString(status_code) {

      //1. IDLE: active but no mission 
      // 2. RUN: executing mission
      // 3. DOWN: alarm or error
      // 4. Charging: in chargin

      if (status_code == 1)
        return "IDLE"
      else if (status_code == 2)
        return "RUN"
      else if (status_code == 3)
        return "DOWN"
      else if (status_code == 4)
        return "充電"
      else
        return "Unknown"
    },
    AGVStatusFormatter(row, column) {
      if (row == undefined)
        return this.GetAGVStatusString(999)

      var status_code = row.MainStatus;
      return this.GetAGVStatusString(status_code)
    },
    connected_class({ row, rowIndex }) {
      var agv_row_class = this.IsRunMode ? 'agv-row-no-operation' : 'agv-row';
      return row.Connected ? `${agv_row_class} connect` : `${agv_row_class} disconnect`
    }
    ,
    BatteryClass(level) {
      if (level >= 30) {
        return 'batter-full-level'
      }
      else if (level > 10 && level < 30) {
        return 'batter-mid-level'
      }
      else {
        return 'batter-low-level'
      }
    }
  },
  computed: {
    IsLogin() {
      return userStore.getters.IsLogin;
    },
    IsRunMode() {
      return agvs_settings_store.getters.IsRunMode;
    },
    AGV_Names() {
      var agv_name_list = [];
      this.AGVDatas.forEach(agvData => {
        agv_name_list.push(agvData.AGV_Name);
      });
      return agv_name_list
    }
  },
}
</script>

<style lang="scss" >
.agv-status {
  height: 50%;

  .online-status-div:hover {
    cursor: pointer;
  }
  .agv-row-no-operation {
    .cell {
      padding: 8px 11px;
    }
  }
  .connect {
    background-color: rgb(229, 255, 240);
  }
  .disconnect {
    background-color: rgb(255, 184, 182);
  }

  .batter-full-level {
    background-color: rgb(57, 194, 57);
  }
  .batter-mid-level {
    background-color: orange;
  }
  .batter-low-level {
    background-color: red;
  }
}
</style>