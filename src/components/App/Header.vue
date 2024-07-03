<template>
  <div class="app-header bg-primary text-light border-bottom border-left">
    <div class="d-flex flex-row py-1" style="z-index:5001">
      <i @click="ToggleMenu" class="menu-toggle-icon text-light px-2">
        <el-icon>
          <MenuExpandIcon class="menu-icon" v-if="MenuExpanded" />
          <MenuFoldIcon class="menu-icon" v-else />
        </el-icon>
      </i>
      <div class="flex-fill text-start">
        <div class="field-name"> {{ fieldName }} </div>
      </div>
      <div class="options d-flex justify-content-between">
        <i class="bi bi-three-dots-vertical pt-2"></i>
        <div class="op-mode-switch-container" v-for="(mode, key) in modes" :key="mode.name">
          <span class="mx-1">{{ $i18n.locale == 'zh-TW' ? mode.name : mode.name_eng }}</span>
          <el-switch v-model="mode.actived" active-color="rgb(95, 171, 80)" inactive-color="red"
            :active-text="mode.active_text" :inactive-text="mode.inactive_text" border-color="grey" inline-prompt
            :before-change="mode.beforeChangeHandler" :loading="mode.loading" size="large" width="75px"></el-switch>
        </div>
        <!-- <div v-if="modes.system_operation_mode.actived" class="op-mode-switch-container"> -->
        <div class="op-mode-switch-container">
          <span class="mx-1">{{ $t('App.Header.view_mode') }}</span>
          <el-switch v-model="isEasyMode" @change="HandleViewModeChanged" :before-change="CheckUserLoginState"
            active-color="rgb(95, 171, 80)" inactive-color="red" active-text="簡易模式" inactive-text="工程模式"
            border-color="grey" inline-prompt size="large" width="80px"></el-switch>
        </div>
        <!-- <div>
          <Switch darkBackground="#fff" lightBackground="#2D2D2D"></Switch>
        </div> -->
        <div>
          <el-popover placement="top" title width trigger="hover" content popper-class="bg-light">
            <template #reference>
              <b-button class="mx-1" style="border: none;background-color: transparent;color:white">
                <el-icon><i class="bi bi-translate"></i></el-icon> {{ $i18n.locale == 'zh-TW' ? $t('App.Header.chinese') : $t('App.Header.english') }} <i class="bi bi-caret-down-fill"></i>
              </b-button>
            </template>
            <template #default>
              <div class="d-flex flex-column">
                <b-button @click="LangSwitch('zh-TW')" :variant="$i18n.locale == 'zh-TW' ? 'primary' : 'light'">{{ $t('App.Header.chinese') }}</b-button>
                <b-button @click="LangSwitch('en-US')" :variant="$i18n.locale == 'en-US' ? 'primary' : 'light'">{{ $t('App.Header.english') }}</b-button>
              </div>
            </template>
          </el-popover>
        </div>
        <div @click="LoginClickHandler">
          <el-popover placement="top" title width trigger="hover" content popper-class="bg-light">
            <template #reference>
              <b-button style="border: none;background-color: transparent;color:white">
                <el-icon> <i class="bi bi-person-circle"></i>
                </el-icon> {{ UserName }} <i v-if="IsLogin" class="bi bi-caret-down-fill"></i>
              </b-button>
            </template>
            <template #default>
              <div class="d-flex flex-column">
                <b-button v-if="!IsLogin" @click="LoginClickHandler" variant="light">登入</b-button>
                <b-button v-if="IsLogin" @click="LogoutQickly" variant="danger">登出</b-button>
                <b-button v-if="IsLogin" class="my-1 bg-light text-dark"
                  @click="LoginClickHandler('switch')">切換使用者</b-button>
              </div>
            </template>
          </el-popover>
        </div>
      </div>
    </div>
    <!--Alarm-->
    <div v-show="showAlarm" class="alarm text-dark">
      <!-- <div v-if="system_alrm_text != ''" class="alarm-container" v-bind:class="system_alarms"> -->
      <div class="alarm-container" v-bind:class="system_alarms_classes">
        <div class="flex-fill">
          <span class="type-text">
            <!-- <i class="bi bi-three-dots-vertical pt-2"></i> --> 系統警報 </span>
          <span class="alarm-text">{{ system_alrm_text }}</span>
        </div>
        <div class="opt">
          <div>
            <b-button v-if="current_user_role != 0" @click="ResetSysAlarmsHandler" class="mb-0" size="sm" variant="danger">警報復歸</b-button>
          </div>
          <i class="bi bi-clock-history" @click="NavigateToAlarmView"></i>
        </div>
      </div>
      <!-- <div v-if="eq_alrm_text != ''" class="alarm-container" v-bind:class="equipment_alarms"> -->
      <div class="alarm-container" v-bind:class="equipment_alarms_classes">
        <div class="flex-fill">
          <span class="type-text">
            <!-- <i class="bi bi-three-dots-vertical pt-2"></i> --> 設備警報 </span>
          <span class="alarm-text">{{ eq_alrm_text }}</span>
        </div>
        <div class="opt">
          <div>
            <b-button v-if="false" @click="ResetEqpAlarmsHandler" class="mb-2" size="sm" variant="danger">警報復歸</b-button>
          </div>
          <i class="bi bi-clock-history" @click="NavigateToAlarmView"></i>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import bus from '@/event-bus.js'
import { GetOperationStates, RunMode, HostConnMode, HostOperationMode, TransferMode } from '@/api/SystemAPI';
import { IsLoginLastTime } from '@/api/AuthHelper';
import { ResetSystemAlarm, ResetEquipmentAlarm } from '@/api/AlarmAPI.js'
import moment from 'moment'
import { Switch } from 'vue-dark-switch'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { agvs_settings_store, userStore, UIStore, AlarmStore } from '@/store'
import { Expand as MenuExpandIcon, Fold as MenuFoldIcon, UserFilled } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus';
export default {
  components: {
    MenuExpandIcon, MenuFoldIcon, UserFilled, Switch
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
          name_eng: 'Operation Mode',
          actived: false,
          active_text: '運轉',
          inactive_text: '維護',
          loading: false,
          beforeChangeHandler: () => this.SysOptModeChangeRequest()
        },
        transfer_mode: {
          name: "派工模式",
          name_eng: 'Dispatch Mode',
          enabled: false,
          active_text: '自動',
          inactive_text: '手動',
          loading: false,
          beforeChangeHandler: () => this.TransferModeChangeRequest()
        },
        host_conn_mode: {
          name: 'HOST連線',
          name_eng: 'Host Connect',
          enabled: false,
          active_text: 'Online',
          inactive_text: 'Offline',
          loading: false,
          beforeChangeHandler: () => this.HostConnModeChangeRequest()
        },
        host_operation_mode: {
          name: 'HOST模式',
          name_eng: 'Host Mode',
          enabled: false,
          active_text: 'Remote',
          inactive_text: 'Local',
          loading: false,
          beforeChangeHandler: () => this.HostOptModeChangeRequest()
        }

      },
      system_alarms_classes: ['no-alarm'],
      equipment_alarms_classes: ['no-alarm'],
      system_alrm_text: '',
      eq_alrm_text: '',
      showAlarm: true,
      isEasyMode: false,
      systemAlarmInterval: undefined
    }
  },
  props: {
    MenuExpanded: {
      type: Boolean,
      default: false
    },
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
    unchecked_alarms() {
      return AlarmStore.getters.alarms;
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
    HasSystemAlarm() {
      return this.system_alrm_text != '';
    },
    HasEqpAlarm() {
      return this.eq_alrm_text != '';
    },
    fieldName() {
      return this.$store.getters.FieldName
    }

  },
  watch: {
    HasSystemAlarm(newVal) {
      this.$emit('update:HasSystemAlarm', newVal)
      UIStore.commit('IsSystemAlarmShowing', newVal)
    },
    HasEqpAlarm(newVal) {
      this.$emit('update:HasEqpAlarm', newVal)
      UIStore.commit('IsEqpAlarmShowing', newVal)
    }
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
        //this.showAlarm = newValue != "/alarm" && newValue != "/map" && newValue != "/sys_settings" && newValue != "/data";
      }
    )

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
        this.modes.transfer_mode.actived = settings.transfer_mode == 1
        // this.modes.system_operation_mode.loading = settings.system_run_mode == 2 || settings.system_run_mode == 3


      }, delay_ms);
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
      var currpath = this.$route.path;
      if (currpath.toLocaleLowerCase().includes('/login'))
        return;
      this.$router.push({
        path: '/Login',
        query: {
          pre: currpath
        }
      })
      // this.$refs['login'].Show(this.current_route_info.route_name);
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
      if (this.modes.system_operation_mode.actived == false) // 操作模式手動不可換派工模式
        return
      if (!this.CheckUserLoginState())
        return false;

      var response = await TransferMode(this.modes.transfer_mode.actived ? 0 : 1);
      var success = response.confirm;
      var mode_req_text = '搬運模式切換'
      if (!success) {
        this.ModeRequestFailHandler(`搬運模式`, '搬運模式切換');
      }
      else {
        this.ModeRequestSuccessHandler(mode_req_text);
        agvs_settings_store.commit('setTransferRemote', !this.modes.transfer_mode.actived)
      }

      return success;
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
      if (this.modes.system_operation_mode.actived) {
        this.modes.transfer_mode.actived = false
      }
      return success
    },
    /**This function handles the change of the host connection mode.  */
    async HostConnModeChangeRequest() {
      if (!this.CheckUserLoginState())
        return false;
      this.modes.host_conn_mode.loading = true;
      var mode_req_text = this.modes.host_conn_mode.actived ? 'HOST-OFFLINE' : 'HOST-ONLINE';
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
      var mode_req_text = this.modes.host_operation_mode.actived ? 'HOST-LOCAL' : 'HOST-REMOTE';
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
      ElNotification.success({
        message: `${action}-請求成功`,
        position: 'top-right',
        duration: 2000
      })
    },
    LangSwitch(lang) {
      this.$i18n.locale = lang;
    },
    async ResetSysAlarmsHandler() {
      await ResetSystemAlarm()
      ElNotification.success({
        message: `系統警報清除完成`,
        position: 'top-right',
        duration: 2000
      })
      this.ResetSystemAlarmTimer();
      this.system_alarms_classes = ['no-alarm'];
      this.system_alrm_text = "";
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
      return `${moment(alarm.Time).format('yyyy/MM/DD HH:mm:ss')} |Code:${alarm.AlarmCode}|Source:${alarm.Equipment_Name}|-${alarm.Description_Zh}(${alarm.Description_En})`
    },
    AlarmDisplayHandler() {
      var eq_alarm_inx = 0;
      this.ResetSystemAlarmTimer();

      setInterval(() => {
        if (!this.EquipmentAlarms || this.EquipmentAlarms.length == 0) {
          this.equipment_alarms_classes = ['no-alarm'];
          this.eq_alrm_text = '';
          return;
        }
        var eq_alarm = this.EquipmentAlarms[eq_alarm_inx]
        if (eq_alarm) {
          this.equipment_alarms_classes = [eq_alarm.Level == 1 ? 'alarm' : 'warning'];
          this.eq_alrm_text = this.CreateAlarmDisplayText(eq_alarm);
        } else {
          this.equipment_alarms_classes = [''];
          this.eq_alrm_text = '';
        }
        eq_alarm_inx += 1;
        if (eq_alarm_inx >= this.EquipmentAlarms.length)
          eq_alarm_inx = 0
      }, 2000);
    },
    ResetSystemAlarmTimer() {

      clearInterval(this.systemAlarmInterval)
      var sys_alarm_inx = 0;
      this.systemAlarmInterval = setInterval(() => {
        if (!this.SystemAlarms || this.SystemAlarms.length == 0) {
          this.system_alarms_classes = ['no-alarm'];
          this.system_alrm_text = '';
          return;
        }
        var sys_alarm = this.SystemAlarms[sys_alarm_inx]
        if (sys_alarm) {
          this.system_alarms_classes = [sys_alarm.Level == 1 ? 'alarm' : 'warning'];
          this.system_alrm_text = this.CreateAlarmDisplayText(sys_alarm);
        } else {
          this.system_alarms_classes = [''];
          this.system_alrm_text = '';
        }
        sys_alarm_inx += 1;
        if (sys_alarm_inx >= this.SystemAlarms.length)
          sys_alarm_inx = 0

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

  h3 {
    margin-left: 40px;
  }

  h3:hover {
    cursor: pointer;
  }

  .field-name {
    font-size: 23px;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .menu-toggle-icon {
    font-size: 26px;
    z-index: 3100;
    cursor: pointer;
  }

  .alarm {

    .alarm-container {
      display: flex;
      flex-direction: row;
      background-color: rgb(254, 199, 210);
      border: 1px solid rgb(255, 255, 255);

      .type-text,
      .alarm-text {
        margin: auto 5px;
        font-weight: bold;
        float: left;
      }

      .type-text {
        width: 85px;
        border-radius: 3px;
        background-color: rgb(255, 90, 90);
        color: white;
        margin-top: 4px;
        font-size: 14px;
        text-align: center;
        // text-decoration: underline;
      }

      .alarm-text {
        padding: 2px;
        font-weight: bold;
        font-size: 15px;
      }

      .opt {
        padding-inline: 3px;
        display: flex;
        flex-direction: row;
        z-index: 1;

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

    .no-alarm {
      background-color: rgb(229 229 239);
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

    0%,
    100% {
      background-color: rgb(255, 0, 51);
      color: rgb(255, 255, 255);
    }

    50% {
      background-color: rgb(255, 229, 234);
      color: red;
    }
  }

  @keyframes warning_blink {

    0%,
    100% {
      background-color: rgb(231, 197, 85);
      color: white;
    }

    50% {
      background-color: rgb(255, 229, 234);
      color: black;
    }
  }

  .matain-mode-notify {
    font-weight: bold;
    font-size: 20px;
    animation: blink 2s infinite;
    position: absolute;
    left: 200px;
    border-radius: 3px;
    border: 1px solid white;
    height: 44px;
    top: 1px;
  }

  @keyframes blink {

    0%,
    100% {
      background-color: red;
    }

    50% {
      background-color: grey;
    }

  }

  .page-name-display {
    font-size: 25px;
    font-weight: bold;
  }

  .user-account {}
}
</style>