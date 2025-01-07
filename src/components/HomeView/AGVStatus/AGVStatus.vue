<template>
  <div class="agv-status border my-1">
    <div class="title d-flex flex-row">
      <!-- <div class="flex-fill">
        <i class="bi bi-three-dots-vertical"></i>
        {{ $t('HomeView.AGVStatus.AGVStatus.vehicle-status') }}
      </div>-->
      <div
        class="text-danger"
        v-if="!IsVMSConnect"
      >{{ $t('HomeView.AGVStatus.AGVStatus.vms_disconnect') }}</div>
    </div>
    <el-table
      v-if="DisplayMode=='table'"
      :header-cell-style="{fontSize:'20px', color: 'white', border: '1px solid rgb(222, 226, 230)', backgroundColor: IsVMSConnect ? 'rgb(13, 110, 253)' : 'red' }"
      :data="AGVDatas"
      size="large"
      height="93%"
      empty-text="尚無AGV"
      :row-class-name="connected_class"
      style="width:100%"
      row-key="AGV_Name"
      border
      @row-click="HandleRowClick"
    >
      <!-- 模擬器 column -->
      <el-table-column type="expand" :min-width="AnyAGVIsSimulation?40:1">
        <template #default="scope">
          <b-card title="模擬器操作">
            <div class="d-flex">
              <b-button variant="primary" @click="EmulatorInitialize(scope.row.AGV_Name)">初始化</b-button>
              <b-button class="mx-1" @click="EmulatorRemoveCargo(scope.row.AGV_Name)">移除卡匣</b-button>
              <b-button class="mx-1" variant="danger" @click="EmulatorEMO(scope.row.AGV_Name)">EMO</b-button>
            </div>
          </b-card>
        </template>
      </el-table-column>
      <!-- 車輛名稱 column -->
      <el-table-column
        :label="$t('HomeView.AGVStatus.AGVStatus.vehicle-name')"
        prop="AGV_Name"
        align="center"
        min-width="185px"
        type="index"
      >
        <template #default="scope">
          <div class="d-flex">
            <div
              class="agv-color-display"
              v-bind:style="StyleOfAGVDisplayColor(scope.row.AGV_Name)"
            ></div>

            <div class="d-flex flex-column flex-fill">
              <el-tooltip content="點擊顯示車載頁面" placement="top">
                <div class="agv-name-container" @click="HandleAGVNameClicked(scope.row)">
                  <!-- <b>{{ scope.row.AGV_Name.toUpperCase() }}</b> -->
                  <b>{{ GetDisplayName(scope.row.AGV_Name) }}</b>
                </div>
              </el-tooltip>
              <b-button
                v-if="!IsRunMode"
                class="w-20 my-1 mx-2"
                @click="ShowOnlineStateChangeModal(scope.row.AGV_Name, scope.row.OnlineStatus, scope.row.Model)"
                v-bind:style="{ backgroundColor: scope.row.OnlineStatus == 1 ? 'red' : '#0d6efd' }"
              >{{ scope.row.OnlineStatus == 1 ? $t('HomeView.AGVStatus.AGVStatus.OfflineRequest') : $t('HomeView.AGVStatus.AGVStatus.OnlineRequest') }}</b-button>
              <el-popover width="150" placement="right">
                <template #reference>
                  <b-button
                    v-if="!IsRunMode"
                    class="w-20 my-1 mx-2"
                    @click="ShowAGVChargeConfirmDialog(scope.row)"
                    v-bind:class="getChargeButtnClass(scope.row)"
                  >
                    <i class="bi bi-lightning-charge-fill"></i>
                    {{ scope.row.Model == 2 ? $t('Exchange Battery') : $t('Charge') }}
                  </b-button>
                </template>
                <template #default>
                  <div class="charge-button-container d-flex flex-column">
                    <b-button
                      variant="warning"
                      style="width: 100%; margin-bottom: 8px;"
                      @click="ShowAGVChargeConfirmDialog(scope.row)"
                    >一般充電</b-button>
                    <b-button
                      variant="success"
                      style="width: 100%; margin-bottom: 8px;"
                      @click="ShowAGVChargeConfirmDialog(scope.row, true)"
                    >深度充電</b-button>
                    <b-button
                      variant="light"
                      style="width: 100%; margin-bottom: 8px;"
                      @click="StopDeepCharge(scope.row.AGV_Name)"
                    >解除深度充電</b-button>
                  </div>
                </template>
              </el-popover>
            </div>
          </div>
        </template>
      </el-table-column>
      <!-- 車輛狀態 column -->
      <el-table-column
        :label="$t('HomeView.AGVStatus.AGVStatus.vehicle-statuslist')"
        prop="AGV_Status"
        align="left"
        min-width="480"
      >
        <template #default="scope">
          <div class="w-100" style="position: absolute; top:0;left:0">
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="tb-label h-100 border px-1 py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.status') }}</div>
              </el-col>
              <el-col :span="6">
                <div class="h-100 border p-1">
                  <el-tag
                    class="h-100 w-100"
                    effect="dark"
                    :type="AGV_Status_TagType(scope.row.MainStatus)"
                  >
                    <b>{{ AGVStatusFormatter(scope.row) }}</b>
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="4">
                <div
                  class="h-100 border py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.carrierid') }}</div>
              </el-col>
              <el-col :span="11">
                <div class="h-100 w-100 border p-2">
                  <b>{{ scope.row.CurrentCarrierID }}</b>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="tb-label h-100 border px-1 py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.vehicleconn') }}</div>
              </el-col>
              <el-col :span="6">
                <div class="h-100 border p-1" style="cursor: pointer">
                  <el-tag
                    class="h-100 w-100"
                    @click="ShowOnlineStateChangeModal(scope.row.AGV_Name, scope.row.OnlineStatus, scope.row.Model)"
                    :type="scope.row.OnlineStatus == 0 ? 'danger' : 'success'"
                  >
                    <b>{{ scope.row.OnlineStatus == 1 ? $t('HomeView.AGVStatus.AGVStatus.Online') : $t('HomeView.AGVStatus.AGVStatus.Offline') }}</b>
                  </el-tag>
                </div>
              </el-col>
              <el-col :span="4">
                <div
                  class="h-100 border py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.position') }}</div>
              </el-col>
              <el-col :span="11" class>
                <div class="w-100 h-100 border p-1 d-flex flex-row">
                  <div class="flex-fill">
                    <el-tooltip content="點一下跳至AGV當前位置" placement="top">
                      <i
                        class="bi bi-geo-alt-fill"
                        style="font-size:20px;cursor:pointer"
                        @click="HandleShowAGVInMapCenter(scope.row.AGV_Name)"
                      ></i>
                    </el-tooltip>

                    <b>{{ scope.row.StationName }}</b>
                  </div>
                  <el-tooltip content="追隨AGV，AGV將保持顯示於地圖中央" placement="top">
                    <i
                      v-if="!IsOpUsing"
                      @click="TrackingVehicle(scope.row.AGV_Name)"
                      style="cursor: pointer;height: 22px;position: relative;top: 2px;border-radius: 30px;width: 22px;padding-left: 4px;font-size: 18px;"
                      class="bi bi-eyeglasses"
                      v-bind:style="TrackingAGV == scope.row.AGV_Name? {
                      backgroundColor:'rgb(13, 110, 253)',
                      color:'white'
                    }:{}"
                    ></i>
                  </el-tooltip>
                  <el-button
                    class
                    v-show="scope.row.Model == 2 || scope.row.Simulation"
                    @click="HandleAGVLocatingClick(scope.row)"
                  >定位</el-button>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <el-col :span="3">
                <div
                  class="tb-label h-100 border px-1 py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.power') }}</div>
              </el-col>
              <el-col :span="21">
                <div class="h-100 border px-2 py-1 d-flex">
                  <b-progress class="flex-fill" :max="100" :min="0" animated>
                    <i
                      v-if="scope.row.IsCharging && IsVMSConnect"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_1, IsVMSConnect ? scope.row.IsCharging : false)"
                      style="color:white"
                      class="bi bi-lightning-charge battery-icon"
                    ></i>
                    <b-progress-bar
                      :animated="true"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_1, IsVMSConnect ? scope.row.IsCharging : false)"
                      :value="!IsVMSConnect ? 0 : scope.row.BatteryLevel_1"
                      :label="`${((!IsVMSConnect ? 0 : scope.row.BatteryLevel_1 / 100) * 100).toFixed(2)}%`"
                    ></b-progress-bar>
                  </b-progress>
                  <b-progress
                    v-if="scope.row.BatteryLevel_2 != -1.0"
                    class="flex-fill mx-1"
                    :max="100"
                    :min="0"
                    animated
                  >
                    <i
                      v-if="scope.row.IsCharging && IsVMSConnect"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_2, IsVMSConnect ? scope.row.IsCharging : false)"
                      style="color:white"
                      class="bi bi-lightning-charge battery-icon"
                    ></i>
                    <b-progress-bar
                      :animated="true"
                      v-bind:class="BatteryClass(scope.row.BatteryLevel_2, IsVMSConnect ? scope.row.IsCharging : false)"
                      :value="!IsVMSConnect ? 0 : scope.row.BatteryLevel_2"
                      :label="`${((!IsVMSConnect ? 0 : scope.row.BatteryLevel_2 / 100) * 100).toFixed(2)}%`"
                    ></b-progress-bar>
                  </b-progress>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <!-- 任務狀態 column -->
      <el-table-column
        v-if="!IsOpUsing"
        :label="$t('HomeView.AGVStatus.AGVStatus.task-status')"
        prop="Task_Status"
        align="left"
        min-width="380"
      >
        <template #default="scope">
          <div class="w-100" style="position: absolute; top:0;left:0">
            <el-row class="h-50">
              <el-col :span="4">
                <div class="tb-label h-100 border p-2 text-center bg-light">ID</div>
              </el-col>
              <el-col :span="20">
                <div class="h-100 border p-1">
                  <b>{{ scope.row.TaskName }}</b>
                </div>
              </el-col>
            </el-row>
            <el-row class="h-50">
              <!-- From Station Display -->
              <el-col :span="4">
                <div
                  class="tb-label h-100 border px-1 py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.From') }}</div>
              </el-col>
              <el-col :span="8">
                <div class="h-100 border p-1">
                  <el-tag size="large" class="h-100 w-100" effect="light">
                    <b class="val-label">{{ scope.row.TaskSourceStationName }}</b>
                  </el-tag>
                </div>
              </el-col>
              <!-- From Station Display End -->

              <!-- Action Display -->
              <el-col :span="4">
                <div
                  class="tb-label h-100 border px-1 py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.action') }}</div>
              </el-col>
              <el-col :span="8">
                <div class="h-100 border p-1 d-flex">
                  <el-tag class="h-100 w-100" effect="light">
                    <b
                      class="val-label"
                    >{{ GetTransferProcessDescription(scope.row, scope.row.TransferProcess, scope.row.CurrentAction, scope.row.TaskRunAction) }}</b>
                  </el-tag>
                </div>
              </el-col>
              <!-- Action Display End -->
            </el-row>
            <el-row class="h-50">
              <!-- To Station Display -->
              <el-col :span="4">
                <div
                  class="tb-label h-100 border py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.To') }}</div>
              </el-col>
              <el-col :span="8">
                <div class="h-100 border p-1">
                  <el-tag class="h-100 w-100" effect="light">
                    <b class="val-label">{{ scope.row.TaskDestineStationName }}</b>
                  </el-tag>
                </div>
              </el-col>
              <!-- To Station Display End -->

              <el-col :span="4">
                <div
                  class="tb-label h-100 border px-1 py-2 text-center bg-light"
                >{{ $t('HomeView.AGVStatus.AGVStatus.Time') }}</div>
              </el-col>
              <el-col :span="8">
                <!-- <div class="h-100 border px-1 py-2 text-center bg-light"> {{ scope.row.TaskName == '' ? '' : '預計抵達時間:' + Timeformat(scope.row.TaskETA, 'HH:mm:ss') }} </div> -->
                <div class="h-100 border px-1 py-2 text-center bg-light"></div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-table-column>
      <!-- 空間 column -->
      <el-table-column width="1">
        <template #default="scope">
          <div v-bind:style="{ height: IsRunMode ? '110px' : '125px' }" class="d-flex flex-column"></div>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="DisplayMode=='cards'" style="height:90vh;overflow-y: auto;" class="py-1">
      <vehicle-info-card
        v-for="vehicleState in AGVDatas"
        :key="vehicleState.AGV_Name"
        :vehicleStateData="vehicleState"
        :isMapViewTracking="TrackingAGV == vehicleState.AGV_Name"
        @OnOnlineBtnClicked="(vstate)=>{
          ShowOnlineStateChangeModal(vstate.AGV_Name,vstate.OnlineStatus,vstate.Model)
        }"
        @OnLocateClicked="(agvName)=>{HandleShowAGVInMapCenter(agvName)}"
        @OnTagLocatingClicked="(vstate)=>{HandleAGVLocatingClick(vstate)}"
        @OnTrackingVehicleClick="(agvName)=>{TrackingVehicle(agvName)}"
        @OnWebSiteIconClicked="(vstate)=>{HandleAGVNameClicked(vstate)}"
        @ShowAGVChargeConfirmDialog="(vstate)=>ShowAGVChargeConfirmDialog(vstate)"
        @ShowAGVDeepChargeConfirmDialog="(vstate)=>ShowAGVChargeConfirmDialog(vstate,true)"
        @StopDeepCharge="(agvName)=>StopDeepCharge(agvName)"
        @onTaskIdClick="taskid=>{$emit('onTaskIDClicked',taskid)}"
      ></vehicle-info-card>
      <div class="admin-actions-container">
        <el-tooltip placement="right-start" effect="light">
          <template #content>
            <div style="width: 120px;" class="d-flex flex-column align-items-center">
              <el-button class="w-100 mx-1 mb-3" type="primary" @click="HandleOnlineAllAGV">上線所有車輛</el-button>
              <el-button class="w-100 mx-1 mb-1" type="danger" @click="HandleOfflineAllAGV">下線所有車輛</el-button>
            </div>
          </template>
          <el-button circle>
            <i class="bi bi-three-dots"></i>
          </el-button>
        </el-tooltip>
      </div>
    </div>
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
  <el-dialog
    v-model="ShowAGVLocatingDialog"
    width="400"
    draggable
    :modal="false"
    :close-on-click-modal="false"
    :title="AGVLocatingPayload.Name + '-定位'"
  >
    <!-- <el-checkbox-group>
      <el-checkbox></el-checkbox>
      <el-checkbox></el-checkbox>
    </el-checkbox-group>-->
    <div v-if="AGVLocatingPayload.isAMCAGV">AMC</div>
    <el-form>
      <el-form-item label="Point ID">
        <el-input
          type="number"
          :min="0"
          clearable
          placeholder="0"
          ref="locating-tag-input"
          v-model="AGVLocatingPayload.currentID"
        ></el-input>
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
import { OnlineRequest, OfflineRequest, AGVLocating, EmuAPI, VehicleBatteryAPI } from '@/api/VMSAPI';
import { TaskAllocation, clsChargeTaskData, clsExangeBatteryTaskData } from '@/api/TaskAllocation.js'
import { userStore, agvs_settings_store, agv_states_store, UIStore } from '@/store'
import moment from 'moment'
import { MapStore } from '@/components/Map/store';
import clsAGVStateDto from '@/ViewModels/clsAGVStateDto';
import VehicleInfoCard from '@/components/Vehicle/VehicleInfoCard.vue';
import { ElNotification } from 'element-plus';
export default {
  components: {
    VehicleInfoCard,
  },
  mounted() {
    bus.on('/cancel_tracking_agv', () => {
      this.TrackingAGV = '';
      bus.emit('tracking_agv', this.TrackingAGV)
    })
    bus.on('invoke-agv-lock', (agvName) => {
      this.TrackingVehicle(agvName)
    })

  },
  data() {
    return {

      ShowOnlineStateChange: false,
      ShowChargeConfirmDialog: false,
      ShowAGVLocatingDialog: false,
      TrackingAGV: "",
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
    /**table | cards */
    DisplayMode: {
      type: String,
      /**table or cards */
      default: 'table'
    }
  },
  methods: {
    async HandleOnlineAllAGV() {
      this.AGVDatas.forEach(async (agv) => {
        setTimeout(async () => {
          var res = await OnlineRequest(agv.AGV_Name, agv.Model);
          if (res.data.ReturnCode != 0) {
            ElNotification.error(`${agv.AGV_Name} 上線失敗:${res.data.Message}`);
          } else {
            ElNotification.success(`${agv.AGV_Name} 上線成功`);
          }
        }, 100)
      });
    },
    async HandleOfflineAllAGV() {
      this.AGVDatas.forEach(async (agv) => {
        setTimeout(async () => {
          var res = await OfflineRequest(agv.AGV_Name, agv.Model);
          if (res.data.ReturnCode != 0) {
            ElNotification.error(`${agv.AGV_Name} 下線失敗:${res.data.Message}`);
          } else {
            ElNotification.success(`${agv.AGV_Name} 下線成功`);
          }
        }, 100)
      });
    },
    HandleAGVNameClicked(agvInfo) {
      const vcsHost = `http://${agvInfo.IP}:${agvInfo.Port}`;
      window.open(vcsHost);
    },
    async EmulatorInitialize(agv_name) {
      EmuAPI.Initialize(agv_name)
    },
    async EmulatorRemoveCargo(agv_name) {
      EmuAPI.RemoveCargo(agv_name)
    },
    async EmulatorEMO(agv_name) {
      EmuAPI.EMO(agv_name)
    },
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
    TrackingVehicle(agvName) {
      if (this.TrackingAGV == agvName) {
        this.TrackingAGV = '';
      } else {
        this.HandleShowAGVInMapCenter(agvName);
        this.TrackingAGV = agvName;
      }
      bus.emit('/tracking_agv', this.TrackingAGV)
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
    /**由狀態取得充電按鈕的類別 */
    getChargeButtnClass(agv_states = new clsAGVStateDto()) {
      var battery_status = agv_states_store.getters.VehicleBatteryStatus(agv_states.AGV_Name);
      if (battery_status == 1)
        return 'charge-deep-charging';
      return 'charge-normal'; //TODO: 由狀態取得充電按鈕的類別
      if (agv_states.MainStatus == 1)
        return 'charge-normal';
      else if (agv_states.MainStatus == 3)
        return 'charge-deep-charge-raising';
      else
        return 'charge-deep-charging';
    },
    ShowAGVChargeConfirmDialog(agv_status, deepCharge = false) {

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
      const _chargeTaskConfirmMessage = (deepCharge) => {
        if (isInspectionAGV)
          return `確定要將 ${agv_status.AGV_Name} 派送至交換站交換電池?`
        else
          return deepCharge ? `確定要將 ${agv_status.AGV_Name} 派送至充電站進行深度充電?` : `確定要將 ${agv_status.AGV_Name} 派送至充電站充電?`
      }
      this.$swal.fire(
        {
          title: _chargeTaskConfirmMessage(deepCharge),
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            this.AGVChargeTask(isInspectionAGV, deepCharge)
          }
        })


    },
    async StopDeepCharge(agv_name) {
      var result = await VehicleBatteryAPI.StopDeepCharge(agv_name)
      console.log(result)
      //TODO confirm response 
      this.$swal.fire(
        {
          title: `已解除 [${agv_name}] 電池深度充電`,
          text: '',
          icon: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    },
    async AGVChargeTask(exchangeBattery = false, deepCharge = false) {
      var result = {};
      if (exchangeBattery) {
        result = await TaskAllocation.ExangeBatteryTask(new clsExangeBatteryTaskData(this.Agv_Selected, -1))
      } else {
        if (deepCharge)
          result = await TaskAllocation.DeepCharge(this.Agv_Selected)
        else
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
        return "success"
      else
        return "info"
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
        return this.$t('AGVStatus.IDLE')
      else if (status_code == 2)
        return this.$t('AGVStatus.RUN')
      else if (status_code == 3)
        return this.$t('AGVStatus.DOWN')
      else if (status_code == 4)
        return this.$t('AGVStatus.CHARGING')
      else
        return "Unknown"
    },
    GetTransferProcessDescription(agv_data, status_code, CurrentAction = 0, TaskRunAction = 0) {
      if (!agv_data.IsExecutingOrder || status_code == 0 || status_code == 500)
        return ""
      else if (status_code == 1)
        return "移動中"
      else if (status_code == 2)
        return this.$t('TaskAction.GoToSource')
      else if (status_code == 3) {
        if (TaskRunAction == 8)
          return this.$t('TaskAction.GoToChargeStation')
        else if (TaskRunAction == 7 || TaskRunAction == 9)
          return this.$t('TaskAction.GoToDestineload')
        else if (TaskRunAction == 1)
          return this.$t('TaskAction.GoToDestineUnload')
      }
      else if (status_code == 4)
        return this.$t('TaskAction.Unloading')
      else if (status_code == 5) {
        if (CurrentAction == 7)
          return this.$t('TaskAction.Loading')
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
    AnyAGVIsSimulation() {
      var simulations = this.AGVDatas.filter(agv => agv.Simulation)
      return simulations.length != 0;
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
    IsOpUsing() {
      return userStore.getters.IsOPLogining;
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

  .agv-name-container {
    cursor: pointer;
    font-size: 22px;
  }
  .agv-name-container:hover {
    background-color: rgb(13, 110, 253);
    border-radius: 8px;
    color: white;
  }
  .agv-name-container:active {
    padding: 2px;
  }
  .agv-color-display {
    height: auto;
    width: 12px;
    border-radius: 3px;
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

  .connect-name-cell {
    background-color: rgb(175, 255, 208);
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
  .tb-label,
  .val-label {
    font-size: 16px;
  }
  .charge-normal,
  .charge-deep-charging {
    background-color: var(--charge-button-normal-color);
  }
  .charge-deep-charge-raising {
    background-color: var(--charge-button-deep-charge-raising-color);
    animation: charge-btn-deep-charge-raising-flash 2s infinite;
  }
  .charge-deep-charging {
    animation: charge-btn-deep-charging-flash 2s infinite;
  }

  @keyframes charge-btn-deep-charge-raising-flash {
    0%,
    100% {
      background-color: var(--charge-button-deep-charge-raising-color);
    }
    50% {
      background-color: rgb(136, 136, 136);
    }
  }

  @keyframes charge-btn-deep-charging-flash {
    0%,
    100% {
      background-color: var(--charge-button-normal-color);
    }
    50% {
      background-color: rgb(136, 136, 136);
    }
  }
  .admin-actions-container {
    position: fixed;
    bottom: 46px;
    left: 80px;

    button {
      color: #a9a9a9a5;
      &:hover {
        color: #000000a5;
      }
    }
  }
}
</style>