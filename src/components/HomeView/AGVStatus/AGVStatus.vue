<template>
  <div class="agv-status card-like">
    <div class="title d-flex flex-row">
      <div class="flex-fill">
        <i class="bi bi-three-dots-vertical"></i> {{ $t('HomeView.AGVStatus.AGVStatus.vehicle-status') }}
      </div>
      <div
        class="text-danger"
        v-if="!IsVMSConnect">{{ $t('HomeView.AGVStatus.AGVStatus.vms_disconnect') }}</div>
    </div>
    <el-table
      v-if="!IsEasyMode"
      :header-cell-style="{ color: 'white', border: '1px solid rgb(222, 226, 230)', backgroundColor: IsVMSConnect ? 'rgb(13, 110, 253)' : 'red' }"
      :data="AGVDatas"
      size="small"
      height="93%"
      empty-text="尚無AGV"
      :row-class-name="connected_class"
      style="width:100%"
      row-key="AGV_Name"
      border
      @row-click="HandleRowClick">
      <el-table-column
        :label="$t('HomeView.AGVStatus.AGVStatus.vehicle-name')"
        prop="AGV_Name"
        align="center"
        min-width="130px"
        type="index">
        <template #default="scope">
          <div class="d-flex flex-column">
            <div style="font-size: 18px;">
              <!-- <b>{{ scope.row.AGV_Name.toUpperCase() }}</b> -->
              <b>{{ GetDisplayName(scope.row.AGV_Name) }}</b>
            </div>
            <div
              class="agv-color-display"
              v-bind:style="StyleOfAGVDisplayColor(scope.row.AGV_Name)"></div>
            <b-button
              v-if="!IsRunMode"
              class="w-20 my-1 mx-2"
              @click="ShowOnlineStateChangeModal(scope.row.AGV_Name, scope.row.OnlineStatus, scope.row.Model)"
              size="sm"
              v-bind:style="{ backgroundColor: scope.row.OnlineStatus == 1 ? 'red' : '#0d6efd' }"> {{ scope.row.OnlineStatus == 1 ? $t('HomeView.AGVStatus.AGVStatus.OfflineRequest') : $t('HomeView.AGVStatus.AGVStatus.OnlineRequest') }} </b-button>
            <b-button
              v-if="!IsRunMode"
              class="w-20 my-1 mx-2"
              @click="ShowAGVChargeConfirmDialog(scope.row)"
              size="sm"
              variant="warning">
              <i class="bi bi-lightning-charge-fill"></i> {{ scope.row.Model == 2 ? $t('Exchange Battery') : $t('Charge') }} </b-button>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="AGV ID" prop="AGV_ID"></el-table-column> -->
      <!-- <el-table-column label="通訊狀態"></el-table-column> -->
      <el-table-column :label="$t('HomeView.AGVStatus.AGVStatus.vehicle-statuslist')" prop="AGV_Status" align="left" width="340">
        <template #default="scope">
          <div class="w-100" style="position: absolute; top:0;left:0">
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="h-100 border px-1 py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.status') }}</div>
              </el-col>
              <el-col :span="6">
                <div class="h-100 border p-1">
                  <el-tag
                    class="h-100 w-100"
                    effect="dark"
                    :type="AGV_Status_TagType(scope.row.MainStatus)">
                    <b>{{ AGVStatusFormatter(scope.row) }}</b>
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="4">
                <div
                  class="h-100 border py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.carrierid') }}</div>
              </el-col>
              <el-col :span="11">
                <div class="h-100 w-100 border p-2">
                  <b>{{ scope.row.CurrentCarrierID }}</b>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <el-col :span="3">
                <div class="h-100 border px-1 py-2 text-center bg-light"> {{ $t('HomeView.AGVStatus.AGVStatus.vehicleconn') }} </div>
              </el-col>
              <el-col :span="6">
                <div class="h-100 border p-1">
                  <el-tag
                    class="h-100 w-100"
                    effect="dark"
                    @click="ShowOnlineStateChangeModal(scope.row.AGV_Name, scope.row.OnlineStatus, scope.row.Model)"
                    :type="scope.row.OnlineStatus == 0 ? 'info' : 'success'">
                    <b>{{ scope.row.OnlineStatus == 1 ? $t('HomeView.AGVStatus.AGVStatus.Online') : $t('HomeView.AGVStatus.AGVStatus.Offline') }}</b>
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="4">
                <div
                  class="h-100 border py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.position') }}</div>
              </el-col>
              <el-col :span="11" class>
                <div class="w-100 h-100 border p-1 d-flex flex-row">
                  <div class="flex-fill">
                    <i
                      class="bi bi-geo-alt-fill"
                      style="font-size:20px;cursor:pointer"
                      @click="HandleShowAGVInMapCenter(scope.row.AGV_Name)"></i>
                    <b>{{ scope.row.StationName }}</b>
                  </div>
                  <el-button
                    class
                    v-show="scope.row.Model == 2 || scope.row.Simulation"
                    @click="HandleAGVLocatingClick(scope.row)">{{ $t('HomeView.AGVStatus.AGVStatus.Location') }}</el-button>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="h-100 border px-1 py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.power') }}</div>
              </el-col>
              <el-col :span="21">
                <div class="h-100 border px-2 py-1 d-flex">
                  <b-progress class="flex-fill" :max="100" :min="0" animated>
                    <i
                      v-if="scope.row.IsCharging && IsVMSConnect"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_1, IsVMSConnect ? scope.row.IsCharging : false)"
                      style="color:white"
                      class="bi bi-lightning-charge battery-icon"></i>
                    <b-progress-bar
                      :animated="true"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_1, IsVMSConnect ? scope.row.IsCharging : false)"
                      :value="!IsVMSConnect ? 0 : scope.row.BatteryLevel_1"
                      :label="`${((!IsVMSConnect ? 0 : scope.row.BatteryLevel_1 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                  </b-progress>
                  <b-progress
                    v-if="scope.row.BatteryLevel_2 != -1.0"
                    class="flex-fill mx-1"
                    :max="100"
                    :min="0"
                    animated>
                    <i
                      v-if="scope.row.IsCharging && IsVMSConnect"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_2, IsVMSConnect ? scope.row.IsCharging : false)"
                      style="color:white"
                      class="bi bi-lightning-charge battery-icon"></i>
                    <b-progress-bar
                      :animated="true"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_2, IsVMSConnect ? scope.row.IsCharging : false)"
                      :value="!IsVMSConnect ? 0 : scope.row.BatteryLevel_2"
                      :label="`${((!IsVMSConnect ? 0 : scope.row.BatteryLevel_2 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                  </b-progress>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('HomeView.AGVStatus.AGVStatus.task-status')" prop="Task_Status" align="left" min-width="380">
        <template #default="scope">
          <div class="w-100" style="position: absolute; top:0;left:0">
            <el-row class="h-50">
              <el-col :span="3">
                <div class="h-100 border p-2 text-center bg-light">ID</div>
              </el-col>
              <el-col :span="21">
                <div class="h-100 border p-1">
                  <b>{{ scope.row.TaskName }}</b>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="h-100 border px-1 py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.From') }}</div>
              </el-col>
              <el-col :span="9">
                <div class="h-100 border p-1">
                  <el-tag class="h-100 w-100" effect="light">
                    <b>{{ scope.row.TaskSourceStationName }}</b>
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="3">
                <div
                  class="h-100 border py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.To') }}</div>
              </el-col>
              <el-col :span="9">
                <div class="h-100 border p-1">
                  <el-tag class="h-100 w-100" effect="light">
                    <b>{{ scope.row.TaskDestineStationName }}</b>
                  </el-tag>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="h-100 border px-1 py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.action') }}</div>
              </el-col>
              <el-col :span="9">
                <div class="h-100 border p-1 d-flex">
                  <el-tag class="h-100 w-100" effect="light">
                    <b> {{ GetTransferProcessDescription(scope.row, scope.row.TransferProcess, scope.row.CurrentAction, scope.row.TaskRunAction) }} </b>
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="3">
                <div
                  class="h-100 border px-1 py-2 text-center bg-light">{{ $t('HomeView.AGVStatus.AGVStatus.Time') }}</div>
              </el-col>
              <el-col :span="9">
                <div class="h-100 border px-1 py-2 text-center bg-light"> {{ scope.row.TaskName == '' ? '' : '預計抵達時間:' + Timeformat(scope.row.TaskETA, 'HH:mm:ss') }} </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <el-table-column width="1">
        <template #default="scope">
          <div v-bind:style="{ height: IsRunMode ? '110px' : '125px' }" class="d-flex flex-column"></div>
        </template>
      </el-table-column>
    </el-table>
    <div v-else class="easy-mode">
      <div v-for="state in AGVDatas" :key="state.AGV_Name" class="easy-mode-car-card border rounded my-2 p-2" v-bind:style="{ backgroundColor: state.Connected ? 'rgb(229, 255, 240)' : 'rgb(255, 184, 182)' }">
        <!-- {{ state.AGV_Name }} -->
        <div class="d-flex">
          <div class="mx-1 border-end px-1">
            <span class="border-bottom" style="font-weight:bolder">{{ state.AGV_Name }}</span>
            <div class="py-1">
              <img src="agv.png" @click="HandleShowAGVInMapCenter(state.AGV_Name)" />
              <el-tag effect="dark" @click="ShowOnlineStateChangeModal(state.AGV_Name, state.OnlineStatus, state.Model)" :type="state.OnlineStatus == 0 ? 'danger' : 'success'">
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
                    <b-progress-bar :animated="true" v-bind:class="BatteryClass(state.BatteryLevel_1)" :value="state.BatteryLevel_1" :label="`${((state.BatteryLevel_1 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                  </b-progress>
                  <b-progress v-if="state.BatteryLevel_2 != -1.0" class="flex-fill my-1" :max="100" :min="0" animated>
                    <b-progress-bar :animated="true" v-bind:class="BatteryClass(state.BatteryLevel_2)" :value="state.BatteryLevel_2" :label="`${((state.BatteryLevel_2 / 100) * 100).toFixed(2)}%`"></b-progress-bar>
                  </b-progress>
                </div>
              </div>
            </div>
            <div class="d-flex w-100 my-1">
              <div class="item-title">位置</div>
              <div class="w-100 text-start" style="font-size:14px;">
                <b>{{ state.StationName }}</b>
                <i class="bi bi-geo-alt-fill" style="font-size:20px;cursor:pointer" @click="HandleShowAGVInMapCenter(state.AGV_Name)"></i>
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
  </div>
  <!--Modals-->
  <div class="modals">
    <b-modal v-model="ShowOnlineStateChange" title="ONLINE / OFFLINE REQUEST CONFIRM." :centered="true" @ok="SendOnlineStateChangeRequest" :no-close-on-esc="true" header-bg-variant="warning" header-text-variant="light">
      <p ref="online_status_change_noti_txt"></p>
    </b-modal>
  </div>
  <el-dialog v-model="ShowAGVLocatingDialog" width="400" draggable :modal="false" :close-on-click-modal="false" :title="AGVLocatingPayload.Name + '-定位'">
    <!-- <el-checkbox-group>
      <el-checkbox></el-checkbox>
      <el-checkbox></el-checkbox>
    </el-checkbox-group>-->
    <div v-if="AGVLocatingPayload.isAMCAGV">AMC</div>
    <el-form>
      <el-form-item label="Point ID">
        <el-input type="number" :min="0" clearable placeholder="0" ref="locating-tag-input" v-model="AGVLocatingPayload.currentID"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="ShowAGVLocatingDialog = false">Cancel</el-button>
        <el-button type="primary" @click="HandleAGVLocatingCinfirm">定位</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script>
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus';
import { IsLoginLastTime } from '@/api/AuthHelper';
import { OnlineRequest, OfflineRequest, AGVLocating } from '@/api/VMSAPI';
import { TaskAllocation, clsChargeTaskData, clsExangeBatteryTaskData } from '@/api/TaskAllocation.js'
import { userStore, agvs_settings_store, agv_states_store, UIStore } from '@/store'
import moment from 'moment'
import { MapStore } from '@/components/Map/store';
export default {
  mounted() {
  },
  data() {
    return {

      ShowOnlineStateChange: false,
      ShowChargeConfirmDialog: false,
      ShowAGVLocatingDialog: false,
      OnlineStatusReq: {
        AGV_Name: '',
        Online_Status: '',
        Model: 0
      },
      AGVLocatingPayload: {
        Name: "",
        currentID: 100,
        x: 0,
        y: 0,
        theata: 0,
        isAMCAGV: false
      }
    }
  },
  props: {
    IsEasyMode: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    StyleOfAGVDisplayColor(agv_name) {
      var color = 'blue'
      if (MapStore.getters.CustomAGVStyles[agv_name])
        color = MapStore.getters.CustomAGVStyles[agv_name].DisplayColor
      return {
        backgroundColor: color
      }
    },
    GetDisplayName(agv_name) {
      if (MapStore.getters.CustomAGVStyles[agv_name])
        return MapStore.getters.CustomAGVStyles[agv_name].DisplayText
      else
        return agv_name;
    },
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
    HandleAGVLocatingClick(agv) {
      console.log(agv)
      this.AGVLocatingPayload.currentID = Number.parseInt(agv.CurrentLocation)
      this.AGVLocatingPayload.Name = agv.AGV_Name
      this.AGVLocatingPayload.isAMCAGV = agv.Model == 2
      this.ShowAGVLocatingDialog = true;
      setTimeout(() => {
        this.$refs['locating-tag-input'].focus();
        this.$refs['locating-tag-input'].select();
      }, 500)
    },
    async HandleAGVLocatingCinfirm() {
      this.ShowAGVLocatingDialog = false;
      var agv_name = this.AGVLocatingPayload.Name
      var result = await AGVLocating(agv_name, this.AGVLocatingPayload);
      console.log(result)

      if (!result || !result.confirm) {
        this.$swal.fire(
          {
            text: `${agv_name}-定位失敗`,
            title: '',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        this.ShowAGVLocatingDialog = true;
      } else {
        this.$swal.fire(
          {
            text: `${agv_name}-定位完成!`,
            title: '',
            icon: 'success',
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

      var isInspectionAGV = agv_status.Model == 2;
      this.$swal.fire(
        {
          title: `確定要將${agv_status.AGV_Name}${isInspectionAGV ? '派送至交換戰站交換電池?' : '派送至充電站充電?'}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            this.AGVChargeTask(isInspectionAGV)
          }
        })
    },
    async AGVChargeTask(exchangeBattery = false) {
      var result = {};
      if (exchangeBattery) {
        result = await TaskAllocation.ExangeBatteryTask(new clsExangeBatteryTaskData(this.Agv_Selected, -1))
      } else {
        result = await TaskAllocation.ChargeTask(new clsChargeTaskData(this.Agv_Selected, -1))

      }
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
              text: 'Error Code: ' + result.data.alarm_code,
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
      else if (status_code == 13)
        return "避車"
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
      return row.Connected && this.IsVMSConnect ? `${agv_row_class} connect` : `${agv_row_class} disconnect`
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
    },
    IsVMSConnect() {
      return UIStore.getters.VMSAlive;
    }
  },
}
</script>
<style lang="scss">
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

  .agv-color-display {
    height: 6px;
    border-radius: 3px;
    border: 1px solid grey;
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