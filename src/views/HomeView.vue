<template>
<<<<<<< HEAD
  <div class="home-view h-100 custom-tabs-head" v-loading="loading">
    <div v-bind:style="{
    visibility: isEasyMode ? 'hidden' : 'visible'
  }" class="d-flex flex-row ">
      <div v-show="MenuExpanded" class="left-col  border-right left-panel">
        <AGVStatusVue></AGVStatusVue>
        <TaskStatusVue height="330px"></TaskStatusVue>
      </div>
      <div class="resizer text-primary d-flex flex-column">
        <div class="menu-icon">
          <el-icon v-if="!MenuExpanded">
            <MenuExpandIcon @click="() => { MenuExpanded = true; RestoreSizeOfRightSide() }" />
          </el-icon>
          <el-icon v-else>
            <MenuFoldIcon @click="() => { MenuExpanded = false; AdjustSizeOfRightSideFullPage(); }" />
          </el-icon>
        </div>
        <div class="flex-fill d-flex flex-column justify-content-center">
          <i class=" bi bi-three-dots-vertical"></i>
        </div>
      </div>
      <div class="right-panel flex-fill">
        <!-- <HomeMap style="width:100%"></HomeMap> -->
        <el-tabs v-model="right_side_tabSelected" tab-position="top" style="height: 100%" type="border-card">
          <el-tab-pane name="map" label="地圖">
            <HomeMap style="width:100%"></HomeMap>
          </el-tab-pane>
          <el-tab-pane label="設備狀態">
            <EQStatus></EQStatus>
          </el-tab-pane>
        </el-tabs>
      </div>
      <TaskAllocationVue></TaskAllocationVue>
    </div>
    <div v-bind:style="{
    visibility: isEasyMode ? 'visible' : 'hidden',
    position: 'absolute',
    top: '70px',
    width: '100%',
    height: '82vh'
  }" class="easy_mode d-flex">
      <div>
        <AGVStatusVue :IsEasyMode="true"></AGVStatusVue>
      </div>
      <div style="width:100%;" class="border">
        <HomeMap id="homemap-easymode"></HomeMap>
      </div>
    </div>
    <TaskDispatchNewUI class="new-dispatch-pnl" v-bind:class="show_new_dispatch_panel ? 'dispatch-show' : 'hide'" @close="() => { show_new_dispatch_panel = false }" v-show="show_new_dispatch_panel"></TaskDispatchNewUI>
    <TaskDispathActionButton @onTaskDispatch="() => {
    right_side_tabSelected = 'map';
  }" v-if="IsLogin" @on-click="() => { show_new_dispatch_panel = true }"></TaskDispathActionButton>
  </div>
</template>
<script>
import AGVStatusVue from '@/components/HomeView/AGVStatus/AGVStatus.vue'
import HomeMap from '@/components/HomeView/HomeMap.vue';
import TaskDispathActionButton from '@/components/TaskDispathActionButton.vue'
import TaskDispatchNewUI from '@/components/TaskDispatchNewUI.vue'
import EQStatus from '@/components/HomeView/EQStatus.vue'
import TaskStatusVue from '@/components/HomeView/TaskStatus.vue';
import TaskAllocationVue from '@/components/HomeView/TaskAllocation.vue';
import bus from '@/event-bus.js'
import { userStore, agvs_settings_store } from '@/store';
import { DArrowRight as MenuExpandIcon, DArrowLeft as MenuFoldIcon } from '@element-plus/icons-vue'

export default {
  components: {
    AGVStatusVue, TaskStatusVue, HomeMap, TaskAllocationVue, EQStatus, TaskDispathActionButton, TaskDispatchNewUI,
    MenuExpandIcon, MenuFoldIcon
  },
  methods: {
    AdjustSizeOfRightSideFullPage() {
      const rightPanel = this.$el.querySelector('.right-panel');
      var container_width = rightPanel.parentElement.offsetWidth;
      this.previousLeftSideWidth = container_width - rightPanel.offsetWidth
      rightPanel.style.width = `${container_width}px`;
    },
    RestoreSizeOfRightSide() {
      const rightPanel = this.$el.querySelector('.right-panel');
      const leftPanel = this.$el.querySelector('.left-panel');
      leftPanel.style.width = `${this.previousLeftSideWidth}px`;
    }
  },
  computed: {
    IsRunMode() { return agvs_settings_store.getters.IsRunMode; },
    IsLogin() { return userStore.getters.IsLogin; },
  },
  data() {
    return {
      isEasyMode: false,
      loading: false,
      show_new_dispatch_panel: false,
      right_side_tabSelected: 'map',
      MenuExpanded: true,
      previousLeftSideWidthStyle: ''
    }
  },
  mounted() {
    bus.on('view_mode_changed', (isEasyMode) => {
      this.loading = true
      this.isEasyMode = isEasyMode;
      setTimeout(() => {
        this.loading = false
      }, 300)

    });

    const resizer = this.$el.querySelector('.resizer');
    const leftPanel = this.$el.querySelector('.left-panel');
    const rightPanel = this.$el.querySelector('.right-panel');
    let isDragging = false;
    var window_width = leftPanel.parentElement.offsetWidth;
    leftPanel.style.width = `50vw`;
    rightPanel.style.width = `50vw`;
    var _this = this;
    resizer.addEventListener('mousedown', e => {
      isDragging = true;
      let startX = e.pageX;

      const onMove = (e) => {
        if (!isDragging || !_this.MenuExpanded) return;
        const dx = e.pageX - startX;
        const newLeftWidth = leftPanel.offsetWidth + dx;
        var newRightWidth = window_width - newLeftWidth;

        leftPanel.style.width = `${newLeftWidth}px`;
        rightPanel.style.width = `${newRightWidth}px`;
        _this.previousLeftSideWidth = newLeftWidth
        startX = e.pageX;
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        isDragging = false;
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
  },
}
</script>
<style lang="scss">
.home-view {
  .dispatch-show {
    animation: slideInFromLeft 0.2s ease-out forwards;

    z-index: 233;
  }


  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-100%);
    }

    100% {
      transform: translateX(0);
    }
  }

  .resizer {
    height: 99vh;
    width: 25px;
    text-align: center;
    cursor: ew-resize;

    .menu-icon {
      cursor: pointer;
      font-weight: bold;
      font-size: 20px;
    }
  }

  .resizer:hover {
    background-color: rgb(223, 223, 223);
  }

  .resizer:active {
    background-color: rgb(223, 237, 247);
  }

}
</style>
=======
  <div class="home h-100">
    <!-- Top Header  -->
    <AGVHeader :IsBackendDisconnected="back_end_server_err"></AGVHeader>
    <AGVLocalization ref="localization_dialog"></AGVLocalization>
    <div class="main-content">
      <div v-if="back_end_server_err" class="server-error py-1 border fixed-bottom">
        <div class="agv-name-in-alarm px-2">{{ VMSData.CarName }}</div>
        <i class="bi bi-exclamation-diamond"></i> {{ $t('backend_server_error') }}
      </div>
      <!-- 電量至頂顯示 -->
      <BatteryGroup :IsBackendDisconnected="back_end_server_err" :battery_states="VMSData.BatteryStatus"></BatteryGroup>
      <div class="d-flex flex-row h-100">
        <!--Side 左側邊-->
        <transition name="el-zoom-in-top">
          <div v-show="header_show" class="side h-100">
            <div class="opt-buttons px-1 py-1 d-flex flex-column">
              <b-button
                :disabled="back_end_server_err || VMSData.IsSystemIniting"
                @click="AGVInitialize()"
                class="mb-1 p-2"
                v-bind:class="VMSData.SubState == '' || (!VMSData.IsInitialized && VMSData.SubState != 'Initializing') ? 'down' : VMSData.SubState.toLowerCase()"
                block>
                <b v-if="VMSData.SubState != 'Initializing'">{{ $t('initialize') }}</b>
                <b v-else>{{ $t('initializing') }}</b>
              </b-button>
              <b-button
                :disabled="back_end_server_err"
                @click="AGVResetAlarm()"
                class="mb-1 p-2 border"
                block
                :variant="alarmResetBtnVariant">
                <b>{{ $t('reset_alarm') }}</b>
              </b-button>
              <b-button
                :disabled="back_end_server_err"
                @click="AGVBuzzerOff()"
                variant="light"
                class="mb-1 p-2 border"
                block>
                <b>
                  <i v-if="IsBuzzerMute" class="bi bi-volume-mute-fill"></i> {{ $t('buzzer_off') }} </b>
              </b-button>
              <b-button
                v-if="VMSData.Agv_Type != 2"
                :disabled="back_end_server_err"
                @click="ShowRemoveCstDialog()"
                variant="light"
                class="w-100 mb-1 p-2 border"
                v-bind:class="rm_cst_btn_class_bind"
                block>
                <b>{{ $t('cst-remove') }}</b>
              </b-button>
              <el-badge
                v-if="VMSData.Agv_Type != 2"
                @click="ShowRemoveCstDialog()"
                style="cursor:pointer;position: relative;bottom: 25px;left: 182px;"
                :value="cargo_status_text">
                <div @click="ShowRemoveCstDialog()" v-if="VMSData.Agv_Type != 2"></div>
              </el-badge>
              <b-button
                :disabled="back_end_server_err"
                :variant="IsLogin ? 'danger' : 'light'"
                class="mb-1 p-2 border"
                block
                @click="ShowLogin()">
                <i v-if="!IsLogin" class="bi bi-box-arrow-in-right mx-1"></i>
                <i v-else class="bi bi-box-arrow-left mx-1"></i>
                <b>{{ LoginBtnText }}</b>
              </b-button>
              <login ref="login"></login>
            </div>
            <el-divider style="margin:auto"></el-divider>
            <!--模式切換Switch-->
            <div class="modes border rounded m-1 p-3 py-1 px-3 text-start">
              <div class="d-flex flex-row">
                <div class="mode-item-label py-2">Online Mode</div>
                <el-switch
                  v-model="IsOnlineMode"
                  @click.prevent="OnlineModeSwitchHandle()"
                  :disabled="back_end_server_err || VMSData.IsSystemIniting"
                  width="75"
                  size="large"
                  inline-prompt
                  inactive-text="Offline"
                  active-text="Online"
                  active-color="rgb(13, 110, 253)"
                  inactive-color="rgb(220, 53, 69)"></el-switch>
              </div>
              <div class="d-flex flex-row">
                <div class="mode-item-label py-2">Auto Mode</div>
                <el-switch
                  v-model="IsAutoMode"
                  @click.stop.prevent="AutoModeSwitchHandle()"
                  :disabled="back_end_server_err || VMSData.IsSystemIniting"
                  width="75"
                  size="large"
                  inline-prompt
                  inactive-text="Manual"
                  active-text="Auto"
                  active-color="rgb(13, 110, 253)"
                  inactive-color="rgb(220, 53, 69)"></el-switch>
              </div>
            </div>
            <el-divider style="margin:auto"></el-divider>
            <div class="connection-status border rounded m-1 p-3 py-1">
              <div class="state-title"><i class="bi bi-ethernet mx-1"></i> {{ $t('connection-states') }}</div>
              <connection_state></connection_state>
            </div>
            <el-divider style="margin:auto"></el-divider>
            <!-- 當前座標資訊 -->
            <div class="coordination border rounded m-1 p-3 py-1">
              <div class="py-1 d-flex justify-content-center">
                <div class="m-1" v-if="!Is_TSMC_MiniAGV">
                  <div class="state-title">Tag</div>
                  <b-form-input
                    size="sm"
                    style="width:70px"
                    disabled
                    v-model="VMSData.BCR_State_MoveBase.tagID"
                    :state="VMSData.BCR_State_MoveBase.tagID > 0"></b-form-input>
                </div>
                <div class="m-1" v-else>
                  <div class="state-title">Location</div>
                  <b-form-input
                    size="sm"
                    style="width:70px"
                    disabled
                    v-model="VMSData.Last_Visited_Tag"></b-form-input>
                </div>
                <div class="m-1">
                  <div class="state-title">{{ $t('coordination') }}</div>
                  <b-form-input
                    size="sm"
                    style="width:120px"
                    disabled
                    :state="VMSData.LocStatus == 10"
                    v-model="Coordination"></b-form-input>
                </div>
              </div>
              <el-button
                v-if="Is_TSMC_MiniAGV"
                effect="dark"
                size="small"
                @click="HandleLocalizationClick">定位</el-button>
            </div>
            <el-divider style="margin:auto"></el-divider>
            <!-- 里程 -->
            <div class="mileage border rounded m-1 p-1 py-1">
              <div class="w-100 d-flex">
                <div class="w-100" v-if="Is_Fork_AGV">
                  <div @click="HandleForkHeightTitleClick" class="state-title"><i class="bi bi-arrow-down-up"></i>牙叉高度</div>
                  <fork_height></fork_height>
                </div>
                <div class="w-100">
                  <div class="state-title"><i class="bi bi-mastodon mx-1"></i>{{ $t('mileage') }}</div>
                  <mileage></mileage>
                </div>
              </div>
            </div>
            <!-- <div>{{ time }}</div> -->
            <div class="m-2 p-3 py-1">
              <emo :disabled="back_end_server_err"></emo>
            </div>
          </div>
        </transition>
        <!--主要內容 TabControl-->
        <transition name="el-zoom-in-bottom">
          <MainContent v-show="header_show" :VMSData="VMSData"></MainContent>
        </transition>
        <div v-if="showOrderInfo && IsShowOrderStatus && !IsHandshaking" style="z-index:9999" v-bind:style="orderInfoContinerStyle">
          <el-alert
            id="order-go-alert"
            :class="order_info_title_class"
            show-icon
            :type="VMSData.MainState == 'DOWN' ? 'error' : 'success'"
            :title="`派車系統任務-[${GetActionName}]`"
            :description="GetOrderDescription"
            :closable="false"></el-alert>
        </div>
      </div>
      <!--對話框們-->
      <div class="modals">
        <!--等待上線動作完成對話框 -->
        <b-modal
          v-model="wait_online_request_dialog_show"
          title="AGV Online Requesting"
          :centered="true"
          :hideFooter="true"
          :noCloseOnBackdrop="true"
          :noCloseOnEsc="true"
          :hideHeaderClose="true"
          header-bg-variant="primary"
          header-text-variant="light">
          <p class="py-3">{{ $t('wait_online_text') }}</p>
        </b-modal>
      </div>
    </div>
    <div v-if="IsLDULD_NO_Entry_Actived" class="w-100 bg-warning fixed-bottom p-2">
      <span class="text-danger" style="font-weight:bold">空取空放模式運行中</span>
      <b-button variant="danger" size="sm" @click="HandleCloseLDULD_No_Entry_BtnClick">關閉</b-button>
    </div>
  </div>
</template>
<script>
import AGVHeader from '@/components/AGVHeader.vue'
import battery from '@/components/Battery/Battery.vue'
import BatteryGroup from '@/components/Battery/BatteryGroup.vue'
import mileage from '@/components/Mileage.vue'
import fork_height from '@/components/ForkHeight.vue'
import emo from '@/components/EMOButton.vue'
import login from '@/components/Login.vue'
import connection_state from '@/components/ConnectionStates.vue'
import { Initialize, CancelInitProcess, ResetAlarm, BuzzerOff, RemoveCassette, MODESwitcher, CloseLDULD_No_Entry } from '@/api/VMSAPI'
import bus from '@/event-bus.js'
import VMSData from '@/ViewModels/VMSData.js'
import Notifier from "@/api/NotifyHelper.js"
import { ElNotification } from 'element-plus'
import { UserStore, UIStore, SystemSettingsStore, AGVStatusStore } from '@/store'
import moment from 'moment'
import MainContent from '@/components/MainContent/TabContainer.vue'
import AGVLocalization from '@/components/AGVLocalization.vue'
import { watch } from 'vue'
// @ is an alias to /src
export default {
  name: 'HomeView',
  components: {
    AGVHeader, BatteryGroup, battery, mileage, emo, login, connection_state, MainContent, AGVLocalization, fork_height
  },
  data() {
    return {
      IsUseChinese: true,
      time: '2022/12/12 19:00:09',
      version_text_click_count: 0,
      trigger_admin_dialog_count: 7,
      back_end_server_err: true,
      back_end_server_connecting: true,
      loading: true,
      dialogTableVisible: false,
      isInitializing: false,
      cancelInitComfirmDialogShow: false,
      StartInitComfirmDialogShow: false,
      wait_online_request_dialog_show: false,
      remove_CstData_ComfirmDialog_Show: false,
      ShowOnlineFailDialog: false,
      moduleInformation: {},
      server_err_state_text: '連線中...',
      init_btn_blink_timer: null,
      mode_switch_data: {
        type: 'online', //auto
        state: false
      },
      currentTabs: 0,
      previous_tagID: -99,
      ws: null,
      previousAGVPoseIsError: false,
      ShowAGVPoseErrorModel: false,
      header_show: false,
      showOrderInfo: false
    }
  },
  methods: {
    ShowLogin() {
      if (this.IsLogin) {
        this.$swal.fire({
          title: `Logout Confirm`,
          text: this.$t('logout-confirm'),
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then((result) => {
          if (result.isConfirmed) {
            UserStore.dispatch('Logout')
          }
        })
      }
      else {
        this.$refs.login.Show();
      }
    },
    async AGVInitialize() {
      if (VMSData.isInitializing) {
        this.cancelInitComfirmDialogShow = true;
      }
      else {
        this.$swal.fire({
          title: 'AGV Initialize',
          text: `${this.$t(this.Is_Fork_AGV ? this.VMSData.ForkHasLoading ? 'start_init_action_notify_fork_has_loading' : 'start_init_action_notify' : 'start_init_action_notify_submarin_agv')}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (result) => {
          if (result.isConfirmed) {
            this.isInitializing = true;
            var result = await Initialize();
            if (!result.confirm) {
              this.$swal.fire({
                title: 'AGV Initialize Fail',
                text: result.message,
                icon: 'error',
                showCancelButton: false,
                customClass: 'my-sweetalert'
              })
            }
          }
        })

        /***************************************** */
      }
    },
    ShowRemoveCstDialog() {
      this.$swal.fire({
        title: `${this.$t('cst-remove')}`,
        text: `${this.$t('cst-remove-confirm-text')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      }).then((result) => {
        if (result.isConfirmed) {
          this.AGVRemoveCassette();
        }
      })

    },
    async CancelInitProcessWorker() {
      await CancelInitProcess()
      clearInterval(this.init_btn_blink_timer);
      this.isInitializing = false;

    },
    async AGVResetAlarm() {
      await ResetAlarm();
    },
    async AGVBuzzerOff() {
      await BuzzerOff();
    },
    async AGVRemoveCassette() {

      var success = await RemoveCassette();
      var swal_title = "";
      var swal_text = "";
      var swal_icon = "";

      if (success) {
        swal_title = swal_text = "移除卡匣成功";
        swal_icon = "success";
      } else {
        swal_title = swal_text = "移除卡匣失敗";
        swal_icon = "error";
      }

      this.$swal.fire({
        title: swal_title,
        text: swal_text,
        icon: swal_icon,
        showCancelButton: false,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      })

    },
    ShowMaxSpeedLimitNotification(tag, speed_limit) {
      if (speed_limit == -1)
        return;
      ElNotification({
        title: '限速',
        message: `Tag[${tag}] AGV 速度限制 : ${speed_limit} `,
        type: 'warning',
        duration: 1000
      })
    },
    AGVPoseErrorHandler() {
      if (this.VMSData.IsAGVPoseError != this.previousAGVPoseIsError) {
        //this.ShowAGVPoseErrorModel = this.VMSData.IsAGVPoseError;
        if (this.VMSData.IsAGVPoseError) {
          ElNotification({
            title: 'POSE ERROR',
            message: 'TAG讀取角度異常:與導航角度不同',
            type: 'warning',
            duration: 3000
          })
        }
        this.previousAGVPoseIsError = this.VMSData.IsAGVPoseError;
      }
    },
    BusPublishDataOut() {
      bus.emit('/vms_data', this.VMSData);
      bus.emit('/agv_current_tag', this.VMSData.Tag);
      bus.emit('/battery', this.VMSData.BatteryStatus);
      bus.emit('/mileage', this.VMSData.Mileage);
      bus.emit('/zaxis_driver_state', this.VMSData.ZAxisDriverState)
      bus.emit('/drivers_state', this.VMSData.DriversStates)
      bus.emit('/z_axis_position', this.VMSData.ZAxisDriverState.position)
    },
    AutoModeSwitchHandle() {

      if (!this.IsAutoMode && this.VMSData.MainState != 'IDLE') {
        this.$swal.fire(
          {
            text: '當前狀態無法切換為自動模式',
            title: '',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }

      this.mode_switch_data.type = 'auto'
      this.mode_switch_data.state = !this.IsAutoMode;

      this.$swal.fire({
        title: `${this.$t('agv-auto-mode')}`,
        text: `${this.mode_switch_data.state ? this.$t('agv-auto-mode-alert') : this.$t('agv-manual-mode-alert')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ModeSwitchHandler();
        }
      })


    },
    OnlineModeSwitchHandle() {
      if (!this.IsOnlineMode && this.VMSData.MainState.toUpperCase() != 'IDLE' && this.VMSData.MainState.toUpperCase() != 'CHARGING') {

        this.$swal.fire(
          {
            text: `當前狀態無法上線(${this.VMSData.MainState})`,
            title: '',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }

      this.mode_switch_data.type = 'online'
      this.mode_switch_data.state = !this.IsOnlineMode;

      this.$swal.fire({
        title: `${this.$t('agv-online')}`,
        text: `${this.mode_switch_data.state ? this.$t('agv-online-alert') : this.$t('agv-offline-alert')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ModeSwitchHandler();
        }
      })


    },
    async ModeSwitchHandler() {
      if (this.mode_switch_data.type == 'auto') {
        var ret = await MODESwitcher.AutoModeSwitch(this.IsAutoMode ? 0 : 1)
      } else {
        this.wait_online_request_dialog_show = true;
        var ret = await MODESwitcher.OnlineModeSwitch(this.IsOnlineMode ? 0 : 1)
        if (!ret.Success) {
          this.$swal.fire(
            {
              text: '',
              title: `上線請求失敗－${ret.Message}`,
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }

        setTimeout(() => {
          this.wait_online_request_dialog_show = false;
          if (ret.Success) {
            this.$swal.fire(
              {
                text: '',
                title: this.IsOnlineMode ? 'AGV已上線' : 'AGV已下線',
                icon: 'success',
                showCancelButton: false,
                showConfirmButton: false,
                confirmButtonText: 'OK',
                customClass: 'my-sweetalert',
                timer: 1500
              })
          }
        }, 700);
      }
    },
    HandleLocalizationClick() {
      this.$refs.localization_dialog.Show();
    },
    MapDataPublishOut() {
      bus.emit('/agv_name_list', [{
        AGV_Name: this.VMSData.CarName,
        Current_Tag: this.VMSData.Tag,
        State: this.VMSData.MainState,
        IsOnline: this.VMSData.OnlineMode == 1,
      }])
    },
    async HandleCloseLDULD_No_Entry_BtnClick() {
      await CloseLDULD_No_Entry()
      Notifier.Success(`空取空放功能已關閉`, 'bottom', 1500);

    },
    HandleForkHeightTitleClick() {
      bus.emit('on-fork-height-click')
    }
  },
  computed: {
    Is_TSMC_MiniAGV() {
      return AGVStatusStore.getters.IsInspectionAGV;
    },
    Is_Fork_AGV() {
      return AGVStatusStore.getters.IsForkAGV;
    },
    is_god_mode_now() {
      return UserStore.getters.IsGodUser
    },
    IsLogin() {
      return UserStore.getters.CurrentUserRole != 0;
    },
    LoginBtnText() {
      return this.IsLogin ? this.$t('logout') : this.$t('login');
    },
    alarmResetBtnVariant() {
      return (this.VMSData.AlarmCodes.length > 0) ? 'danger' : 'light'
    },

    IsAutoMode() {
      return this.VMSData.AutoMode == 1;
    },
    IsOnlineMode() {
      return this.VMSData.OnlineMode == 1;
    },
    NewestAlarm() {
      if (this.VMSData.NewestAlarm == undefined) {
        return undefined
      }
      if (this.VMSData.NewestAlarm.EAlarmCode == 0)
        return undefined

      return this.VMSData.NewestAlarm
    },
    ModeSwitchDisplay() {
      if (this.mode_switch_data.type == 'online') {
        return this.IsOnlineMode ? 'Offline' : 'Online'
      } else {
        return this.IsAutoMode ? 'Manual' : 'Auto'
      }
    },
    UserName() {
      return UserStore.getters.CurrentUserName
    },
    Coordination() {
      return `(${this.VMSData.Pose.position.x.toFixed(2)},${this.VMSData.Pose.position.y.toFixed(2)})`;
    },
    VMSData() {
      return AGVStatusStore.getters.AGVStatus;
    },
    IsBuzzerMute() {
      return !SystemSettingsStore.getters.Settings.BuzzerOn
    },
    IsShowOrderStatus() {
      return this.OrderInfo.ActionName != 999;
    },
    IsLDULD_NO_Entry_Actived() {
      return this.VMSData.IsLDULD_No_Entry
    },
    cargo_status_text() {
      var _hascargo = this.VMSData.CargoExist
      var _hascargo_id = this.VMSData.CST_Data != ''
      if (_hascargo && _hascargo_id)
        return ''
      if (!_hascargo && !_hascargo_id)
        return ''
      if (_hascargo && !_hascargo_id)
        return '有料無帳'
      if (!_hascargo && _hascargo_id)
        return '有帳無料'

    },
    rm_cst_btn_class_bind() {
      var _hascargo = this.VMSData.CargoExist
      var _hascargo_id = this.VMSData.CST_Data != ''
      if (_hascargo && _hascargo_id)
        return ''
      if (!_hascargo && !_hascargo_id)
        return ''
      if (_hascargo && !_hascargo_id)
        return ''
      if (!_hascargo && _hascargo_id)
        return 'has-id-but-cargo-not-exist'
    },
    /**
     *  DestineName ,
  SourceName,
  ActionName */
    OrderInfo() {
      return this.VMSData.OrderInfo;
    },
    GetOrderDescription() {
      return this.OrderInfo.DisplayText;
    },
    GetActionName() {
      switch (this.OrderInfo.ActionName) {
        case 0:
          return '移動'
        case 1:
          return '取貨'
        case 2:
          return '放貨/停車'
        case 3:
          return '放貨/停車'
        case 6:
          return '量測'
        case 7:
          return '放貨'
        case 8:
          return '充電'
        case 9:
          return '搬運'
        case 10:
          return '退出充電站'
        case 12:
          return '停車'
        case 13:
          return '退出停車點'
        case 14:
          return '交換電池'
        default:
          return `Unknown(${this.ActionName})`
      }
    },
    order_info_title_class() {
      if (this.VMSData.MainState == 'DOWN') {
        return "order-info-title-error"
      } else
        return "order-info-title-normal"
    },
    orderInfoContinerStyle() {
      //position:absolute;right: 9px;bottom: 0;
      var isAlarmShow = AGVStatusStore.getters.AlarmCodes.length > 0;
      var isHomeViewShow = UIStore.getters.CurrentTabSelected == 0;
      if (isAlarmShow) {
        return {
          position: 'absolute',
          right: '9px',
          top: '73px'
        }
      } else
        return {
          position: 'absolute',
          right: '9px',
          bottom: '0'
        }
    },
    IsHandshaking() {
      return AGVStatusStore.getters.AGVStatus.HandshakeStatus.IsHandshaking
    },

  },
  mounted() {

    setInterval(() => {
      this.time = moment(Date.now()).format('yyyy/MM/DD HH:mm:ss');

    }, 1000);
    setInterval(() => {
      bus.emit('/agv_position', {
        AGV_Name: this.VMSData.CarName,
        Current_Tag: this.VMSData.Tag,
        Rotation: 0,
        Current_Tag: this.VMSData.Tag,
        State: this.VMSData.MainState,
        IsOnline: this.VMSData.OnlineMode == 1,
        Coordination: [this.VMSData.Pose.position.x, this.VMSData.Pose.position.y]
      })

    }, 200);

    setTimeout(() => {
      this.header_show = true;
      var handlerDataChanged = () => {
        this.back_end_server_err = false;
        this.back_end_server_connecting = false;
        if (this.VMSData.Tag > 0) {
          //this.MapDataPublishOut();
          if (this.VMSData.Tag != this.previous_tagID) {
            Notifier.Primary(`Tag Detected:${this.VMSData.Tag}`, 'bottom', 1500);
          }
        }
        this.previous_tagID = this.VMSData.Tag;
        this.AGVPoseErrorHandler();
        this.BusPublishDataOut();
      }
      watch(() => this.VMSData, (new_data, old_data) => {
        if (!new_data)
          return;
        handlerDataChanged();
      }, {
        immediate: true,
        deep: true,
      })
      bus.on('ws_disconnect', () => {
        this.back_end_server_err = true;
        this.back_end_server_connecting = true;
      })
      bus.on('local-task-view-shown', () => {
        handlerDataChanged();
      })
    }, 900);


  },
  destroyed() {
    alert('destroy')
    if (this.ws) {
      this.ws.Close();
    }
  }
}
</script>
<style lang="scss">
.main-content {
  padding-top: 38px;
}

#waiting-go-alert {
  .el-alert__title {
    font-size: 25px;
    position: relative;
    left: -2rem;
  }

  .el-alert__description {
    font-size: 32px;
    position: relative;
    color: rgb(13, 110, 253);
    font-weight: bold;
  }

  .el-alert__icon {
    font-size: 60px;
    width: 60px;
  }
}

#order-go-alert {
  .el-alert__title {
    font-size: 25px;
    position: relative;
    left: 1rem;
    letter-spacing: 2px;
    font-weight: bold;
  }

  .el-alert__description {
    font-size: 32px;
    position: relative;
    color: rgb(41, 99, 187);
  }

  .el-alert__icon {
    font-size: 40px;
    width: 40px;
  }
}

.order-info-title-normal {
  .el-alert__title {
    color: seagreen;
  }
}

.order-info-title-error {
  .el-alert__title {
    color: red;
  }
}

.simulation-mode {
  font-size: 20px;
  animation: color-change 1s infinite;
}

.server-connecting {
  animation: server-connectingcolor-change 1s infinite;
}

.battery-fill-width {
  i {
    position: absolute;
    left: 8px;
    color: white;
    font-weight: bold;
    font-size: 24px;
    top: 28px;
  }
}

.server-error {
  height: 50px;
  font-size: 25px;
  animation: server-errorcolor-change 2s infinite;
  letter-spacing: 0.4rem;
  font-weight: bold;
}

@keyframes server-errorcolor-change {

  0%,
  100% {
    background-color: red;
    color: white;
  }

  50% {
    background-color: rgb(255, 255, 255);
    color: red;
  }
}


.has-id-but-cargo-not-exist {
  animation: remove-cst-btn-flicker 1s infinite;
}

@keyframes remove-cst-btn-flicker {

  0%,
  100% {
    background-color: #f8f9fa;
    color: black;
  }

  50% {
    background-color: rgb(255, 193, 22);
    color: rgb(255, 49, 49);
  }

}


@keyframes server-connectingcolor-change {
  0% {
    background-color: rgb(255, 193, 22);
    color: white;
  }

  50% {
    background-color: rgb(255, 237, 156);
    color: black;
  }

  100% {
    background-color: rgb(255, 193, 22);
    color: white;
  }
}

.alarm-show {
  background-color: rgb(248, 215, 218);
  font-weight: bold;
  color: white;
}

.agv-name-in-alarm {
  font-weight: bold;
  position: absolute;
}

.modes {
  .mode-item-label {
    width: 120px;
    font-weight: bold;
  }
}

.side {
  width: 250px;
  background: rgb(175 175 175 / 6%);
  margin-top: 3px;

  .mileage,
  .modes,
  .coordination,
  .connection-status {
    background: #e8e8e85e;
  }

  .state-title {
    font-weight: bold;
    font-size: 18px;
  }

  .opt-buttons {
    font-weight: bold;

    button {
      letter-spacing: 2px;
    }
  }
}
</style>
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
