<template>
  <div class="app-header bg-primary text-light border-bottom border-left fixed-top">
    <div class="d-flex flex-row py-1">
      <!-- <i @click="ToggleMenu" class="bi bi-list menu-toggle-icon text-light px-2"></i>
      <h3 @click="LogoClickHandler">
        <b>GPM AGVS</b>
      </h3>-->
      <div
        v-if="!modes.system_operation_mode.actived"
        class="matain-mode-notify py-2 px-3"
      >維護模式:自動派車、充電功能已關閉。</div>
      <b-button
        v-else
        class="mx-2"
        @click="HandleAutoDispatchBtnClick"
        style="width:100px;font-weight: bold; font-size:large;text-decoration: underline;"
        variant="light"
        size="sm"
      >自動派工</b-button>
      <div class="page-name-display mx-2">{{ current_route_info.route_display_name }}</div>
      <div class="flex-fill"></div>
      <div class="options d-flex justify-content-between">
        <i class="bi bi-three-dots-vertical pt-2"></i>
        <div class="op-mode-switch-container" v-for="(mode, key) in modes" :key="key">
          <span class="mx-1">{{ mode.name }}</span>
          <el-switch
            v-model="mode.actived"
            active-color="rgb(95, 171, 80)"
            inactive-color="red"
            :active-text="mode.active_text"
            :inactive-text="mode.inactive_text"
            border-color="grey"
            inline-prompt
            :before-change="mode.beforeChangeHandler"
            :loading="mode.loading"
            size="large"
            width="75px"
          ></el-switch>
        </div>
        <!-- <div v-if="modes.system_operation_mode.actived" class="op-mode-switch-container"> -->
        <div class="op-mode-switch-container">
          <span class="mx-1">檢視模式</span>
          <el-switch
            v-model="isEasyMode"
            @change="HandleViewModeChanged"
            :before-change="CheckUserLoginState"
            active-color="rgb(95, 171, 80)"
            inactive-color="red"
            active-text="簡易模式"
            inactive-text="工程模式"
            border-color="grey"
            inline-prompt
            size="large"
            width="80px"
          ></el-switch>
        </div>
        <div>
          <el-popover placement="top" title width trigger="hover" content popper-class="bg-light">
            <template #reference>
              <b-button size="sm" class="mx-1" variant="light">
                中文
                <i class="bi bi-caret-down-fill"></i>
              </b-button>
            </template>
            <template #default>
              <div class="d-flex flex-column">
                <b-button @click="LangSwitch('zh-TW')" variant="light">中文</b-button>
                <b-button @click="LangSwitch('en-US')" variant="light">ENGLISH</b-button>
              </div>
            </template>
          </el-popover>
        </div>
        <div @click="LoginClickHandler">
          <el-popover placement="top" title width trigger="hover" content popper-class="bg-light">
            <template #reference>
              <b-button size="sm" variant="light">
                {{ UserName }}
                <i v-if="IsLogin" class="bi bi-caret-down-fill"></i>
              </b-button>
            </template>
            <template #default>
              <div class="d-flex flex-column">
                <b-button v-if="!IsLogin" @click="LoginClickHandler" variant="light">登入</b-button>
                <b-button v-if="IsLogin" @click="LogoutQickly" variant="danger">登出</b-button>
                <b-button
                  v-if="IsLogin"
                  class="my-1 bg-light text-dark"
                  @click="LoginClickHandler('switch')"
                >切換使用者</b-button>
              </div>
            </template>
          </el-popover>
        </div>
      </div>
      <Login ref="login" :IsLogin="IsLogin"></Login>
    </div>
    <!--Alarm-->
    <div v-show="showAlarm" class="alarm text-dark">
      <div class="alarm-container" v-bind:class="system_alarms">
        <div class="flex-fill">
          <span class="type-text">
            <!-- <i class="bi bi-three-dots-vertical pt-2"></i> -->
            系統警報
          </span>
          <span class="alarm-text">{{ system_alrm_text }}</span>
        </div>
        <div class="opt">
          <div>
            <b-button
              v-if="current_user_role != 0"
              @click="ResetSysAlarmsHandler"
              class="mb-2"
              size="sm"
              variant="danger"
            >警報復歸</b-button>
          </div>
          <i class="bi bi-clock-history" @click="NavigateToAlarmView"></i>
        </div>
      </div>
      <div class="alarm-container" v-bind:class="equipment_alarms">
        <div class="flex-fill">
          <span class="type-text">
            <!-- <i class="bi bi-three-dots-vertical pt-2"></i> -->
            設備警報
          </span>
          <span class="alarm-text">{{ eq_alrm_text }}</span>
        </div>
        <div class="opt">
          <div>
            <b-button
              v-if="false"
              @click="ResetEqpAlarmsHandler"
              class="mb-2"
              size="sm"
              variant="danger"
            >警報復歸</b-button>
          </div>
          <i class="bi bi-clock-history" @click="NavigateToAlarmView"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Login from '@/views/Login.vue';
import bus from '@/event-bus.js'
import { GetOperationStates, RunMode, HostConnMode, HostOperationMode } from '@/api/SystemAPI';
import { IsLoginLastTime } from '@/api/AuthHelper';
import { ResetSystemAlarm, ResetEquipmentAlarm, AlarmHelper } from '@/api/AlarmAPI.js'
import moment from 'moment'

import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { agvs_settings_store, userStore } from '@/store'
export default {
  components: {
    Login
  },
  data() {
    return {
      current_route_info: {
        route_display_name: '派車系統',
        route_name: '/'
      },

      maintain_mode: true,
      modes: {
        system_operation_mode: {
          name: '操作模式',
          actived: false,
          active_text: '運轉',
          inactive_text: '維護',
          loading: false,
          beforeChangeHandler: this.SysOptModeChangeRequest
        },
        transfer_mode: {
          name: "派工模式",
          enabled: false,
          active_text: '手動',
          inactive_text: '自動',
          loading: false,
          beforeChangeHandler: this.TransferModeChangeRequest
        },
        host_conn_mode: {
          name: 'HOST連線',
          enabled: false,
          active_text: 'Online',
          inactive_text: 'Offline',
          loading: false,
          beforeChangeHandler: this.HostConnModeChangeRequest
        },
        host_operation_mode: {
          name: 'HOST模式',
          enabled: false,
          active_text: 'Remote',
          inactive_text: 'Local',
          loading: false,
          beforeChangeHandler: this.HostOptModeChangeRequest
        }

      },
      system_alarms: [''],
      equipment_alarms: [''],
      system_alrm_text: '',
      eq_alrm_text: '',
      unchecked_alarms: [],
      showAlarm: true,
      isEasyMode: false
    }
  },
  computed: {
    IsLogin() {
      return userStore.getters.IsLogin;
    },
    current_user_role() {
      return userStore.getters.level;
    },
    UserName() {
      var level = userStore.getters.level;
      var username = userStore.getters.UserName.toUpperCase();
      if (level == -1)
        return '訪客'
      else if (level == 0)
        return `${username}(OP)`

      else if (level == 1)
        return `${username}(ENG)`

      else if (level == 2)
        return `${username}(DEV)`
      else if (level == 3)
        return `${username}(GOD)`
      else
        return 'VISITOR'
    },
    SystemAlarms() {
      if (!this.unchecked_alarms)
        return [];
      return this.unchecked_alarms.filter(alarm => alarm.Source == 0)
    },
    EquipmentAlarms() {

      if (!this.unchecked_alarms)
        return [];
      return this.unchecked_alarms.filter(alarm => alarm.Source == 1)
    },


  },
  mounted() {
    this.DownloadSystemOperationsSettings();
    bus.on('/router-change', (new_rotue) => {
      this.current_route_info = new_rotue
    });
    bus.on('/show-login-view-invoke', () => {
      this.LoginClickHandler();
    })
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        this.showAlarm = newValue != "/alarm" && newValue != "/map" && newValue != "/sys_settings" && newValue != "/data";
      }
    )

    var alarmHelper = new AlarmHelper(this.on_alarm_message);
    this.AlarmDisplayHandler();
  },
  methods: {
    HandleAutoDispatchBtnClick() {
      if (!userStore.getters.IsLogin) {
        this.$swal.fire(
          {
            text: '',
            title: '權限不足 請先登入',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }
      bus.emit('bus-show-task-allocation', { agv_name: "", agv_type: "", action: '', station_data: undefined });
    },
    async DownloadSystemOperationsSettings(delay_ms = 1000) {
      setTimeout(async () => {
        var settings = await GetOperationStates()
        agvs_settings_store.commit('setOperations', settings)
        this.modes.system_operation_mode.actived = settings.system_run_mode == 1;
        this.modes.host_conn_mode.actived = settings.host_online_mode == 1;
        this.modes.host_operation_mode.actived = settings.host_remote_mode == 1;
        // this.modes.system_operation_mode.loading = settings.system_run_mode == 2 || settings.system_run_mode == 3


      }, delay_ms);
    },
    on_alarm_message(ev) {
      this.unchecked_alarms = JSON.parse(ev.data)
    },
    ToggleMenu() {
      this.$emit('onMenuToggleClicked', '')
    },
    LogoClickHandler() {
      this.$router.push('/');
      this.current_route_info = {
        route_display_name: 'Home',
        route_name: '/'
      }
    },
    LoginClickHandler(action = '') {
      if (!this.IsLogin | action == 'switch')
        this.$refs['login'].Show(this.current_route_info.route_name);
    },
    LogoutQickly() {

      this.$swal.fire({
        title: 'Logout!',
        text: '確定要登出?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes'
      }).then(ret => {
        if (ret.isConfirmed) {
          userStore.commit('setUser', null)

          if (this.$route.meta.isAdminUse) {
            this.$router.push('/')
          }
          this.$swal.fire({ title: '登出成功!', icon: 'success', timer: 3000 })

        }
      })

    },
    async TransferModeChangeRequest() {

      if (!this.CheckUserLoginState())
        return false;
      return success
    },
    HandleViewModeChanged(isEasyMode) {
      bus.emit('view_mode_changed', isEasyMode)
    },
    async SysOptModeChangeRequest(force = false) {
      if (!this.CheckUserLoginState())
        return false;
      this.modes.system_operation_mode.loading = true;
      var mode_req_text = this.modes.system_operation_mode.actived ? '操作模式-MAINTAIN' : '操作模式-RUN';
      var response = await RunMode(this.modes.system_operation_mode.actived ? 0 : 1, force);
      var success = response.confirm;
      var msg = response.message;
      if (!success) {
        var isGodOrDevLogin = userStore.getters.level == 2 || userStore.getters.level == 3;
        this.ModeRequestFailHandler("操作模式", msg, (msg == '尚有任務在執行中' && isGodOrDevLogin) ? '強制切換' : '', async () => {
          setTimeout(() => {
            this.SysOptModeChangeRequest(true);
            this.DownloadSystemOperationsSettings(100);
          }, 500)

        });
      }
      else {
        agvs_settings_store.commit('setRunMode', !this.modes.system_operation_mode.actived)
        this.ModeRequestSuccessHandler(mode_req_text);
      }
      this.modes.system_operation_mode.loading = false;
      return success
    },
    /**This function handles the change of the host connection mode.  */
    async HostConnModeChangeRequest() {
      if (!this.CheckUserLoginState())
        return false;
      this.modes.host_conn_mode.loading = true;
      var mode_req_text = this.modes.host_conn_mode.actived ? 'OFFLINE' : 'ONLINE';
      var response = await HostConnMode(this.modes.host_conn_mode.actived ? 0 : 1);
      var success = response.confirm;
      var msg = response.message;
      if (!success) {
        this.ModeRequestFailHandler(`HOST ${mode_req_text}`, msg);
      }
      else {
        this.ModeRequestSuccessHandler(mode_req_text);
        agvs_settings_store.commit('setHostOnline', !this.modes.host_conn_mode.actived)
      }
      this.modes.host_conn_mode.loading = false;
      return success;
    },
    async HostOptModeChangeRequest() {
      if (!this.CheckUserLoginState())
        return false;
      this.modes.host_operation_mode.loading = true;
      var mode_req_text = this.modes.host_operation_mode.actived ? 'LOCAL' : 'REMOTE';
      var response = await HostOperationMode(this.modes.host_operation_mode.actived ? 0 : 1);
      var success = response.confirm;
      var msg = response.message;
      if (!success) {
        this.ModeRequestFailHandler(`HOST ${mode_req_text}`, msg);
      }
      else {
        this.ModeRequestSuccessHandler(mode_req_text);
        agvs_settings_store.commit('setHostRemote', !this.modes.host_operation_mode.actived)
      }
      this.modes.host_operation_mode.loading = false;

      return success;
    },
    CheckUserLoginState() {
      if (!this.IsLogin) {
        this.$swal.fire(
          {
            text: '',
            title: '權限不足 請先登入',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
      return this.IsLogin;
    },
    ModeRequestFailHandler(action, message, action1_text = '', action_1 = () => { }) {
      var hasActions = action1_text != "";
      this.$swal.fire({
        title: `${action} 切換失敗`,
        text: message + '，請稍後再嘗試切換。',
        icon: 'error',
        showCancelButton: hasActions,
        cancelButtonText: action1_text,
        allowOutsideClick: !hasActions
      }).then((ret) => {
        if (!ret.isConfirmed && hasActions) {
          action_1();
        }
      })
    },
    ModeRequestSuccessHandler(action) {
      this.$vs.notify({
        color: 'success',
        title: `${action}請求`,
        text: `${action}請求成功`,
        position: 'bottom-right',
        time: 2000
      })
    },
    LangSwitch(lang) {
      this.$i18n.locale = lang;

    },
    async ResetSysAlarmsHandler() {
      await ResetSystemAlarm()
      this.$vs.notify({
        color: 'primary',
        title: '警報復歸請求',
        text: '系統警報復歸請求完成',
        position: 'bottom-right',
        time: 1400
      })
    },
    async ResetEqpAlarmsHandler() {
      await ResetEquipmentAlarm()
      this.$vs.notify({
        color: 'primary',
        title: '警報復歸請求',
        text: '設備警報復歸請求完成',
        position: 'bottom-right',
        time: 1400
      })
    },
    CreateAlarmDisplayText(alarm) {
      return `${moment(alarm.Time).format('yyyy/MM/DD HH:mm:ss')} |${alarm.AlarmCode}|${alarm.Equipment_Name}|-${alarm.Description_Zh}(${alarm.Description_En})`
    },
    AlarmDisplayHandler() {
      var sys_alarm_inx = 0;
      var eq_alarm_inx = 0;

      setInterval(() => {
        if (!this.SystemAlarms || this.SystemAlarms.length == 0)
          return;
        var sys_alarm = this.SystemAlarms[sys_alarm_inx]
        if (sys_alarm) {
          this.system_alarms = [sys_alarm.Level == 1 ? 'alarm' : 'warning'];
          this.system_alrm_text = this.CreateAlarmDisplayText(sys_alarm);
        } else {
          this.system_alarms = [''];
          this.system_alrm_text = '';
        }
        sys_alarm_inx += 1;
        if (sys_alarm_inx >= this.SystemAlarms.length)
          sys_alarm_inx = 0

      }, 2000);

      setInterval(() => {
        if (!this.EquipmentAlarms || this.EquipmentAlarms.length == 0)
          return;
        var eq_alarm = this.EquipmentAlarms[eq_alarm_inx]
        if (eq_alarm) {
          this.equipment_alarms = [eq_alarm.Level == 1 ? 'alarm' : 'warning'];
          this.eq_alrm_text = this.CreateAlarmDisplayText(eq_alarm);
        } else {
          this.equipment_alarms = [''];
          this.eq_alrm_text = '';
        }
        eq_alarm_inx += 1;
        if (eq_alarm_inx >= this.EquipmentAlarms.length)
          eq_alarm_inx = 0
      }, 2000);
    },
    NavigateToAlarmView() {
      this.$router.push('/alarm');
    }
  },
}
</script>

<style scoped lang="scss">
.app-header {
  z-index: 2;
  padding-left: 70px;

  h3 {
    margin-left: 40px;
  }

  h3:hover {
    cursor: pointer;
  }

  .alarm {
    height: 48px;

    .alarm-container {
      display: flex;
      flex-direction: row;
      background-color: rgb(255, 229, 234);
      border: 2px solid rgb(248, 195, 195);

      .type-text,
      .alarm-text {
        margin: auto 5px;
        font-weight: bold;
        float: left;
      }

      .type-text {
        width: 99px;
        border-radius: 13px;
        background-color: rgb(255, 62, 62);
        color: white;
        margin-top: 4px;
        text-align: center;
        // text-decoration: underline;
      }

      .alarm-text {
        padding: 3px;
        font-weight: bold;
        font-size: 18px;
      }

      .opt {
        padding-inline: 3px;
        display: flex;
        flex-direction: row;

        div {
          width: 85px;
          padding-top: 3px;
        }

        i {
          font-size: 25px;
          margin-right: 5px;
        }

        i:hover {
          cursor: pointer;
        }
      }
    }

    .alarm {
      animation: alarm_blink 2s infinite;
    }

    .warning {
      animation: warning_blink 1s infinite;
    }
  }

  .options {
    position: relative;
    top: 5px;
    margin-right: 10px;

    .op-mode-switch-container {
      margin-right: 5px;
      font-weight: bold;

      .is-text {
        font-size: 16px;
      }
    }
  }

  @keyframes alarm_blink {
    0% {
      background-color: rgb(242, 76, 76);
      color: white;
    }

    50% {
      background-color: rgb(255, 229, 234);
      color: red;
    }

    100% {
      background-color: rgb(242, 76, 76);
      color: white;
    }
  }

  @keyframes warning_blink {
    0% {
      background-color: rgb(231, 197, 85);
      color: white;
    }

    50% {
      background-color: rgb(255, 229, 234);
      color: black;
    }

    100% {
      background-color: rgb(231, 197, 85);
      color: white;
    }
  }

  .matain-mode-notify {
    font-weight: bold;
    font-size: 20px;
    animation: blink 3s linear infinite;
    position: absolute;
    left: 200px;
    border-radius: 3px;
    border: 1px solid white;
    height: 44px;
    top: 1px;
  }

  @keyframes blink {
    0% {
      background-color: red;
    }

    50% {
      background-color: red;
    }

    100% {
      background-color: grey;
    }
  }

  .page-name-display {
    font-size: 25px;
    font-weight: bold;
  }

  .user-account {
  }
}
</style>