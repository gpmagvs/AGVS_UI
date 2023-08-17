<template>
  <div class="agv-status card-like">
    <div class="title">
      <i class="bi bi-three-dots-vertical"></i>車輛狀態 STATUS
    </div>

    <el-tabs class="px-1" tab-position="top">
      <el-tab-pane
        v-for="group in Groups"
        :key="group.group"
        :label=" `${group.group_name}(${group.agv_states.length})`"
      >
        <el-table
          :header-cell-style="{color:'black',backgroundColor:'rgb(241, 241, 241)'}"
          :data="group.agv_states"
          size="small"
          height="93%"
          empty-text="沒有AGV"
          :row-class-name="connected_class"
          highlight-current-row
          style="width:100%"
          @row-click="HandleRowClick"
        >
          <el-table-column label="車輛名稱" prop="AGV_Name" width="90px" type="index">
            <template #default="scope">
              <b>{{scope.row.AGV_Name.toUpperCase() }}</b>
            </template>
          </el-table-column>
          <!-- <el-table-column label="AGV ID" prop="AGV_ID"></el-table-column> -->
          <!-- <el-table-column label="通訊狀態"></el-table-column> -->
          <el-table-column label="上線狀態" prop="OnlineStatus" align="center" width="80">
            <template #default="scope">
              <div class="online-status-div">
                <el-tag
                  effect="dark"
                  @click="ShowOnlineStateChangeModal(scope.row.AGV_Name,scope.row.OnlineStatus,scope.row.Model)"
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
            width="130"
          >
            <template #default="scope">
              <div>
                <el-tag effect="dark" :type="AGV_Status_TagType(scope.row.MainStatus)">
                  <b>{{AGVStatusFormatter(scope.row)}}</b>
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="位置" prop="StationName" align="left">
            <template #default="scope">
              <div>
                <i
                  class="bi bi-geo-alt-fill"
                  style="font-size:20px;cursor:pointer"
                  @click="HandleShowAGVInMapCenter(scope.row.AGV_Name)"
                ></i>
                <b>{{ scope.row.StationName }}</b>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="TaskName" label="任務名稱" />
          <!-- <el-table-column label="任務">
            <el-table-column prop="TaskName" label="名稱" />
            <el-table-column prop="TaskRunStatus" label="狀態">
              <template #default="scope">
                <div
                  v-show="scope.row.TaskName!=''"
                >{{ this.GetTaskRunStatusString(scope.row.TaskRunStatus) }}</div>
              </template>
            </el-table-column>
          </el-table-column>
          -->
          <el-table-column label="載物ID" prop="CurrentCarrierID"></el-table-column>
          <el-table-column label="電量" prop="BatteryLevel" width="120">
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
          <el-table-column v-if="!IsRunMode" label="操作" fixed="right" width="110">
            <template #default="scope">
              <div class="d-flex flex-column">
                <b-button
                  class="w-100 m-1"
                  @click="ShowTaskAllocationView(scope.row)"
                  size="sm"
                  variant="primary"
                >
                  <i class="bi bi-bus-front"></i>任務
                </b-button>
                <b-button
                  class="w-100 m-1"
                  @click="ShowAGVChargeConfirmDialog(scope.row)"
                  size="sm"
                  variant="success"
                >
                  <i class="bi bi-lightning-charge-fill"></i>充電
                </b-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
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
import { userStore, agvs_settings_store, agv_states_store } from '@/store'
import param from '@/gpm_param';
export default {
  mounted() {
  },
  data() {
    return {

      ShowOnlineStateChange: false,
      ShowChargeConfirmDialog: false,
      OnlineStatusReq: {
        AGV_Name: '',
        Online_Status: '',
        Model: 0
      }
    }
  },
  methods: {
    HandleRowClick(row, row_) {
      this.HandleShowAGVInMapCenter(row.AGV_Name)
    },
    HandleShowAGVInMapCenter(agv_name) {
      bus.emit('/show_agv_at_center', agv_name)
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

      bus.emit('bus-show-task-allocation', { agv_name: clsAgvStatus.AGV_Name, action: '', station_data: undefined });
    },
    ShowOnlineStateChangeModal(agv_name, current_online_status, Model) {

      this.OnlineStatusReq.AGV_Name = agv_name;
      this.OnlineStatusReq.Online_Status = current_online_status == 0 ? 'Online' : 'Offline';
      this.OnlineStatusReq.Model = Model;
      var online_text = this.OnlineStatusReq.Online_Status == 'Online' ? '上線' : '下線';
      this.$swal.fire(
        {
          text: `確定要將 ${this.OnlineStatusReq.AGV_Name} ${online_text}?`,
          title: `${this.OnlineStatusReq.AGV_Name} - ${online_text}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            this.SendOnlineStateChangeRequest()
          }
        })

    },
    async SendOnlineStateChangeRequest() {
      Notifier.Primary(`${this.OnlineStatusReq.AGV_Name} ${this.OnlineStatusReq.Online_Status} 請求已送出`, 'top', 2000);
      var response = null
      try {


        if (this.OnlineStatusReq.Online_Status == 'Online') {
          var res = await OnlineRequest(this.OnlineStatusReq.AGV_Name, this.OnlineStatusReq.Model);
          response = res.data;
        } else {
          var res = await OfflineRequest(this.OnlineStatusReq.AGV_Name, this.OnlineStatusReq.Model);
          response = res.data;
        }
        if (response.ReturnCode != 0) {
          this.$swal.fire(
            {
              text: `${this.OnlineStatusReq.AGV_Name} ${this.OnlineStatusReq.Online_Status} 失敗:${response.Message}`,
              title: '',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
      } catch (error) {
        this.$swal.fire(
          {
            title: 'VMS系統通訊異常',
            text: `${error.message} , Please confirm that the VMS is currently in service.`,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }

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


      this.$swal.fire(
        {
          title: `確定要將${agv_status.AGV_Name}派送至充電站充電?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            this.AGVChargeTask()
          }
        })
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
      if (status_code == 1)
        return "待命中/IDLE"
      else if (status_code == 2)
        return "執行中/RUN"
      else if (status_code == 3)
        return "當機/DOWN"
      else if (status_code == 4)
        return "充電中/Charging"
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
    AGVDatas() {
      return agv_states_store.getters.AGVStatesData;
    },
    Groups() {

      function GetGroupName(group_enum) {
        if (group_enum == 0)
          return 'GPM AGV'
        else if (group_enum == 1)
          return 'GPM AGV'
        else if (group_enum == 2)
          return 'YUNTECH AGV'
        else
          return 'GROUP'
      }

      var groups = this.AGVDatas.map(agv => agv.Group)
      const uniqueGroups = [...new Set(groups)];
      var output = [];
      for (let index = 0; index < uniqueGroups.length; index++) {
        const group = uniqueGroups[index];
        var agvlist = this.AGVDatas.filter(agv => agv.Group == group)
        output.push({ group: group, group_name: GetGroupName(group), agv_states: agvlist })
      }

      return output;
    },
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