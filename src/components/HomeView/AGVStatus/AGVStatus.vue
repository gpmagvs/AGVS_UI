<template>
  <div class="agv-status card-like">
    <div class="title">
      <i class="bi bi-three-dots-vertical"></i>車輛狀態 STATUS
    </div>
    <el-tabs class="px-1" tab-position="top">
      <el-tab-pane
        v-for="group in Groups"
        :key="group.group"
        :label="`${group.group_name}(${group.agv_states.length})`">
        <el-table
          v-if="!IsEasyMode"
          :header-cell-style="{ color: 'white', border: '1px solid rgb(222, 226, 230)', backgroundColor: 'rgb(13, 110, 253)' }"
          :data="group.agv_states"
          size="small"
          height="93%"
          empty-text="沒有AGV"
          :row-class-name="connected_class"
          style="width:100%"
          row-key="AGV_Name"
          border
          @row-click="HandleRowClick">
          <el-table-column label="車輛名稱" prop="AGV_Name" align="center" min-width="100px" type="index">
            <template #default="scope">
              <div class="">
                <b>{{ scope.row.AGV_Name.toUpperCase() }}</b>
                <b-button v-if="!IsRunMode"
                  class="w-20 my-1 mx-2"
                  @click="ShowAGVChargeConfirmDialog(scope.row)"
                  size="sm"
                  variant="warning">
                  <i class="bi bi-lightning-charge-fill"></i> {{ group.group == 3 ? '交換電池' : '充電' }} </b-button>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="AGV ID" prop="AGV_ID"></el-table-column> -->
          <!-- <el-table-column label="通訊狀態"></el-table-column> -->
          <el-table-column label="AGV 狀態" align="left" width="300">
            <template #default="scope">
              <div class="w-100" style="position: absolute; top:0;left:0">
                <el-row class="h-50">
                  <el-col :span="3">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">狀態</div>
                  </el-col>
                  <el-col :span="6">
                    <div class="h-100 border p-1">
                      <el-tag class="h-100 w-100" effect="dark" :type="AGV_Status_TagType(scope.row.MainStatus)">
                        <b>{{ AGVStatusFormatter(scope.row) }}</b>
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :span="4">
                    <div class="h-100 border py-2 text-center  bg-light">載物ID </div>
                  </el-col>
                  <el-col :span="11">
                    <div class="h-100 w-100 border p-2"> <b> {{ scope.row.CurrentCarrierID }}</b></div>
                  </el-col>
                </el-row>
                <el-row class="h-50">
                  <el-col :span="3">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">派車</div>
                  </el-col>
                  <el-col :span="6">
                    <div class="h-100 border p-1">
                      <el-tag class="h-100 w-100 "
                        effect="dark"
                        @click="ShowOnlineStateChangeModal(scope.row.AGV_Name, scope.row.OnlineStatus, scope.row.Model)"
                        :type="scope.row.OnlineStatus == 0 ? 'info' : 'success'">
                        <b>{{ scope.row.OnlineStatus == 1 ? '已上線' : '離線中' }}</b>
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :span="4">
                    <div class="h-100 border py-2 text-center bg-light">位置 </div>
                  </el-col>
                  <el-col :span="11">
                    <div class="w-100 h-100 border p-1">
                      <i
                        class="bi bi-geo-alt-fill"
                        style="font-size:20px;cursor:pointer"
                        @click="HandleShowAGVInMapCenter(scope.row.AGV_Name)"></i>
                      <b>{{ scope.row.StationName }}</b>
                    </div>
                  </el-col>
                </el-row>
                <el-row class="h-50">
                  <el-col :span="3">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">電量</div>
                  </el-col>
                  <el-col :span="21">
                    <div class="h-100 border px-2 py-1 d-flex">
                      <b-progress class="flex-fill" :max="100" :min="0" animated>
                        <i
                          v-if="scope.row.IsCharging"
                          v-bind:class="BatteryClass(scope.row.BatteryLevel_1, scope.row.IsCharging)"
                          style="color:white"
                          class="bi bi-lightning-charge battery-icon"></i>
                        <b-progress-bar
                          :animated="true"
                          v-bind:class="BatteryClass(scope.row.BatteryLevel_1, scope.row.IsCharging)"
                          :value="scope.row.BatteryLevel_1"
                          :label="`${((scope.row.BatteryLevel_1 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                      </b-progress>
                      <b-progress
                        v-if="scope.row.BatteryLevel_2 != -1.0"
                        class="flex-fill mx-1"
                        :max="100"
                        :min="0"
                        animated>
                        <i
                          v-if="scope.row.IsCharging"
                          v-bind:class="BatteryClass(scope.row.BatteryLevel_2, scope.row.IsCharging)"
                          style="color:white"
                          class="bi bi-lightning-charge battery-icon"></i>
                        <b-progress-bar
                          :animated="true"
                          v-bind:class="BatteryClass(scope.row.BatteryLevel_2, scope.row.IsCharging)"
                          :value="scope.row.BatteryLevel_2"
                          :label="`${((scope.row.BatteryLevel_2 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                      </b-progress>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="任務狀態" align="left" min-width="420">
            <template #default="scope">
              <div class="w-100" style="position: absolute; top:0;left:0">
                <el-row class="h-50">
                  <el-col :span="3">
                    <div class="h-100 border p-2 text-center  bg-light">ID</div>
                  </el-col>
                  <el-col :span="21">
                    <div class="h-100 border p-1">
                      <b>{{ scope.row.TaskName }} </b>
                    </div>
                  </el-col>
                </el-row>
                <el-row class="h-50">
                  <el-col :span="3">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">起點</div>
                  </el-col>
                  <el-col :span="9">
                    <div class="h-100 border p-1">
                      <el-tag class="h-100 w-100 "
                        effect="light">
                        <b>{{ scope.row.TaskSourceStationName }}</b>
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :span="3">
                    <div class="h-100 border py-2 text-center bg-light">目的地 </div>
                  </el-col>
                  <el-col :span="9">
                    <div class="h-100 border p-1">
                      <el-tag class="h-100 w-100 "
                        effect="light">
                        <b>{{ scope.row.TaskDestineStationName }}</b>
                      </el-tag>
                    </div>
                  </el-col>
                </el-row>
                <el-row class="h-50">
                  <el-col :span="3">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">動作</div>
                  </el-col>
                  <el-col :span="9">
                    <div class="h-100 border p-1 d-flex">
                      <el-tag class="h-100 w-100 "
                        effect="light"> <b> {{ GetTransferProcessDescription(scope.row, scope.row.TransferProcess, scope.row.CurrentAction, scope.row.TaskRunAction) }}</b>
                      </el-tag>
                    </div>
                  </el-col>
                  <el-col :span="3">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">時間</div>
                  </el-col>
                  <el-col :span="9">
                    <div class="h-100 border px-1 py-2 text-center  bg-light">{{ scope.row.TaskName == '' ? '' : '預計抵達時間:' + Timeformat(scope.row.TaskETA, 'HH:mm:ss') }}</div>
                  </el-col>
                </el-row>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="1">
            <template #default="scope">
              <div v-bind:style="{ height: IsRunMode ? '110px' : '125px' }" class="d-flex flex-column">
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class=" easy-mode">
          <div
            v-for="state in group.agv_states"
            :key="state.AGV_Name"
            class="easy-mode-car-card border rounded my-2 p-2"
            v-bind:style="{ backgroundColor: state.Connected ? 'rgb(229, 255, 240)' : 'rgb(255, 184, 182)' }">
            <!-- {{ state.AGV_Name }} -->
            <div class="d-flex">
              <div class="mx-1 border-end px-1">
                <span class="border-bottom" style="font-weight:bolder">{{ state.AGV_Name }}</span>
                <div class="py-1">
                  <img src="agv.png" @click="HandleShowAGVInMapCenter(state.AGV_Name)" />
                  <el-tag
                    effect="dark"
                    @click="ShowOnlineStateChangeModal(state.AGV_Name, state.OnlineStatus, state.Model)"
                    :type="state.OnlineStatus == 0 ? 'danger' : 'success'">
                    <b>{{ state.OnlineStatus == 1 ? 'ONLINE' : 'OFFLINE' }}</b>
                  </el-tag>
                </div>
              </div>
              <div style="padding-top:5px" class="w-100">
                <div class="d-flex w-100">
                  <div class="item-title">狀態</div>
                  <div class="w-100 text-start">
                    <el-tag effect="dark" :type="AGV_Status_TagType(state.MainStatus)">
                      <b>{{ AGVStatusFormatter(state) }}</b>
                    </el-tag>
                  </div>
                </div>
                <div class="d-flex w-100 my-2">
                  <div class="item-title">電量</div>
                  <div class="w-100 px-1 text-start">
                    <div style="width:110px">
                      <b-progress class="flex-fill" :max="100" :min="0" animated>
                        <b-progress-bar
                          :animated="true"
                          v-bind:class="BatteryClass(state.BatteryLevel_1)"
                          :value="state.BatteryLevel_1"
                          :label="`${((state.BatteryLevel_1 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                      </b-progress>
                      <b-progress
                        v-if="state.BatteryLevel_2 != -1.0"
                        class="flex-fill my-1"
                        :max="100"
                        :min="0"
                        animated>
                        <b-progress-bar
                          :animated="true"
                          v-bind:class="BatteryClass(state.BatteryLevel_2)"
                          :value="state.BatteryLevel_2"
                          :label="`${((state.BatteryLevel_2 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                      </b-progress>
                    </div>
                  </div>
                </div>
                <div class="d-flex w-100 my-1">
                  <div class="item-title">位置</div>
                  <div class="w-100 text-start" style="font-size:font-size: 14px;">
                    <b>{{ state.StationName }}</b>
                    <i
                      class="bi bi-geo-alt-fill"
                      style="font-size:20px;cursor:pointer"
                      @click="HandleShowAGVInMapCenter(state.AGV_Name)"></i>
                  </div>
                </div>
                <div class="d-flex w-100 my-1">
                  <div class="item-title">載物ID</div>
                  <div class="w-100 text-start">
                    <b>{{ state.Cst }}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      header-text-variant="light">
      <p ref="online_status_change_noti_txt"></p>
    </b-modal>
  </div>
</template>

<script>
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus';
import { IsLoginLastTime } from '@/api/AuthHelper';
import { OnlineRequest, OfflineRequest } from '@/api/VMSAPI';
import { TaskAllocation, clsChargeTaskData } from '@/api/TaskAllocation.js'
import { userStore, agvs_settings_store, agv_states_store } from '@/store'
import moment from 'moment'
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
      },
    }
  },
  props: {
    IsEasyMode: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    Timeformat(time, format = 'YYYY/MM/DD HH:mm:ss') {
      return moment(time).format(format)
    },
    HandleRowClick(row, row_) {
      //alert(row.IP + `:${row.Port}`)
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
      bus.emit('bus-show-task-allocation', { agv_name: clsAgvStatus.AGV_Name, agv_type: clsAgvStatus.Model, action: '', station_data: undefined });
    },
    ShowOnlineStateChangeModal(agv_name, current_online_status, Model) {

      if (!this.IsLogin) {
        this.$swal.fire(
          {
            text: '',
            title: '沒有請求車子上下線的權限，請先進行登入',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '登入',
            cancelButtonText: '取消',
            customClass: 'my-sweetalert'
          }).then(response => {
            if (response.isConfirmed) {
              bus.emit('/show-login-view-invoke', '');
            }
          })
        return;
      }
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
        }).then(async (res) => {
          if (res.isConfirmed) {
            var resp = await this.SendOnlineStateChangeRequest()
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

      if (userStore.getters.level < 0) {
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
    async AGVChargeTask() {
      var result = await TaskAllocation.ChargeTask(new clsChargeTaskData(this.Agv_Selected, -1))
      console.log(result)
      this.HandleChargeTaskDispatchResult(result);
    },
    HandleChargeTaskDispatchResult(result) {
      if (!result.data.confirm) {
        if (result.data.alarm_code == 82) {
          this.$swal.fire(
            {
              text: '是否要改為指派新的充電任務',
              title: result.data.message,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            }).then(async (response) => {
              if (response.isConfirmed) {
                var _result = await TaskAllocation.CancelChargeTask(this.Agv_Selected);
                if (!_result.confirm) {
                  this.$swal.fire(
                    {
                      text: '',
                      title: _result.message,
                      icon: 'error',
                      showCancelButton: false,
                      confirmButtonText: 'OK',
                      customClass: 'my-sweetalert'
                    })
                }
                else {
                  this.AGVChargeTask()
                }
              }
            })
        } else {
          this.$swal.fire(
            {
              text: result.data.alarm_code,
              title: result.data.message,
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }

      }
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
        return "閒置中"
      else if (status_code == 2)
        return "執行中"
      else if (status_code == 3)
        return "當機"
      else if (status_code == 4)
        return "充電中"
      else
        return "Unknown"
    },
    GetTransferProcessDescription(agv_data, status_code, CurrentAction = 0, TaskRunAction = 0) {
      if (!agv_data.IsExecutingOrder || status_code == 0 || status_code == 500)
        return ""
      else if (status_code == 1)
        return "移動中"
      else if (status_code == 2)
        return "前往來源設備"
      else if (status_code == 3) {
        if (TaskRunAction == 8)
          return "前往充電站"
        else if (TaskRunAction == 7 || TaskRunAction == 9)
          return "前往終點設備放貨"
        else if (TaskRunAction == 1)
          return "前往終點設備取貨"
      }
      else if (status_code == 4)
        return "取貨中"
      else if (status_code == 5) {
        if (CurrentAction == 7)
          return "放貨中"
        else if (CurrentAction == 1)
          return "取貨中"
      }
      else if (status_code == 6)
        return "停車-充電站"
      else if (status_code == 7)
        return "退出設備中"
      else if (status_code == 8)
        return "退出停車點/充電站"
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
    BatteryClass(level, isCharging = false) {

      if (isCharging)
        return 'batter-charging'
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
          return 'Fork AGV'
        else if (group_enum == 1)
          return '潛盾 AGV'
        else if (group_enum == 2)
          return 'YUNTECH AGV'
        else if (group_enum == 3)
          return '巡檢 AGV'
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
  .easy-mode {
    font-size: 18px;

    .easy-mode-car-card {
      width: 316px;

      .item-title {
        width: 90px;
        font-size: small;
      }
    }
  }

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
    background-color: rgb(13, 110, 253);
  }

  .batter-mid-level {
    background-color: orange;
  }

  .batter-low-level {
    background-color: red;
  }

  .batter-charging {
    background-color: rgb(57, 194, 57);
  }

  .battery-icon {
    font-size: 16px;
    position: relative;
    top: -5px;
    height: 25px;
    padding-left: 3px;
  }
}
</style>