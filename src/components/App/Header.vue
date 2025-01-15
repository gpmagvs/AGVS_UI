<template>
  <div class="app-header bg-primary text-light border-bottom border-left">
    <div class="d-flex flex-row py-1" style="z-index:5001">
      <i @click="ToggleMenu" class="menu-toggle-icon text-light px-2">
        <el-icon>
          <MenuExpandIcon class="menu-icon" v-if="MenuExpanded" />
          <MenuFoldIcon class="menu-icon" v-else />
        </el-icon>
      </i>
      <div class="flex-fill text-start d-flex">
        <div class="field-name">{{ fieldName }}</div>
        <div v-if="!IsOpUsing" class="field-name mx-3">- {{ current_route_info.route_display_name }}</div>
      </div>
      <div class="options d-flex justify-content-between">
        <i class="bi bi-three-dots-vertical pt-2"></i>

        <div
          class="op-mode-switch-container"
          v-for="(mode, key) in modes"
          :key="mode.name"
          v-show="GetModeVisible(key)"
          :id="mode.id"
        >
          <span class="mx-1">{{ $i18n.locale == 'zh-TW' ? mode.name : mode.name_eng }}</span>
          <el-switch
            v-model="mode.actived"
            :disabled="!IsLogin"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
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
        <div v-if="false" class="op-mode-switch-container">
          <span class="mx-1">{{ $t('App.Header.view_mode') }}</span>
          <el-switch
            v-model="isEasyMode"
            @change="HandleViewModeChanged"
            :before-change="CheckUserLoginState"
            active-color="rgb(95, 171, 80)"
            inactive-color="red"
            :active-text="$t('App.Header.Simple mode')"
            :inactive-text="$t('App.Header.ENG mode')"
            border-color="grey"
            inline-prompt
            size="large"
            width="80px"
          ></el-switch>
        </div>

        <div class="helpers-container">
          <b-button
            ref="helpButton"
            type="text"
            style="border: none;background-color: transparent;color:white"
            @click="openPlatformOperationHelper = true"
          >Help</b-button>
        </div>
        <div>
          <!-- <el-popover placement="top" title width trigger="hover" content popper-class="bg-light">
          <template #reference>-->
          <b-button
            class="mx-1"
            style="border: none;background-color: transparent;color:white"
            @click="LangSwitch($i18n.locale == 'zh-TW' ? 'en-US' : 'zh-TW')"
          >
            <el-icon>
              <i class="bi bi-translate"></i>
            </el-icon>
            {{ $i18n.locale == 'zh-TW' ? 'ENGLISH' : "中文" }}
          </b-button>
        </div>
        <div id="user-login-container" class="user-login-container" @click="LoginClickHandler">
          <el-popover
            placement="bottom"
            title
            width
            trigger="hover"
            content
            popper-class="bg-light"
          >
            <template #reference>
              <b-button style="border: none;background-color: transparent;color:white">
                <el-icon>
                  <i class="bi bi-person-circle"></i>
                </el-icon>
                {{ UserName }}
                <i v-if="IsLogin" class="bi bi-caret-down-fill"></i>
              </b-button>
            </template>
            <template #default>
              <div class="d-flex flex-column">
                <b-button v-if="!IsLogin" @click="LoginClickHandler" variant="light">
                  {{ $t('App.Header.LOGIN')
                  }}
                </b-button>
                <b-button
                  v-if="IsLogin"
                  @click="LogoutQickly"
                  variant="danger"
                >{{ $t('App.Header.LOGOUT') }}</b-button>
                <b-button
                  v-if="IsLogin"
                  class="my-1 bg-light text-dark"
                  @click="SwitchUserBtnClick"
                >
                  {{
                  $t('App.Header.Switch user') }}
                </b-button>
              </div>
            </template>
          </el-popover>
        </div>
      </div>
    </div>
    <!--Alarm-->
    <div v-show="showAlarm && !IsOpUsing" class="alarm text-dark">
      <!-- <div v-if="system_alrm_text != ''" class="alarm-container" v-bind:class="system_alarms"> -->
      <div class="alarm-container" v-bind:class="system_alarms_classes">
        <div class="flex-fill">
          <span class="type-text">
            <!-- <i class="bi bi-three-dots-vertical pt-2"></i> -->
            {{ $t('App.Header.systemalarm') }}
          </span>
          <span class="alarm-text">{{ system_alrm_text }}</span>
        </div>
        <div v-if="IsLogin" class="opt d-flex">
          <b-button @click="StopBuzzerHandler" class="mb-0 mx-1" variant="danger">
            {{
            $t('App.Header.Turnoffbuzzer') }}
          </b-button>
          <b-button @click="ResetSysAlarmsHandler" class="mb-0 mx-1" variant="danger">
            {{
            $t('App.Header.alarmreset') }}
          </b-button>
          <i class="bi bi-clock-history" @click="NavigateToAlarmView"></i>
        </div>
      </div>
      <!-- <div v-if="eq_alrm_text != ''" class="alarm-container" v-bind:class="equipment_alarms"> -->
      <div class="alarm-container" v-bind:class="equipment_alarms_classes">
        <div class="flex-fill">
          <span class="type-text">
            <!-- <i class="bi bi-three-dots-vertical pt-2"></i> -->
            {{ $t('App.Header.eqalarm') }}
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
            >
              {{
              $t('App.Header.alarmreset') }}
            </b-button>
          </div>
          <i class="bi bi-clock-history" @click="NavigateToAlarmView"></i>
        </div>
      </div>
    </div>

    <el-drawer title="平台操作說明" v-model="openPlatformOperationHelper" direction="ltr" size="30%">
      <PlatformOperationHelper
        @onCloseDrawerRequested="openPlatformOperationHelper = false"
        @onOpenDrawerRequested="openPlatformOperationHelper = true"
      />
    </el-drawer>
  </div>
</template>
<script>
import bus from '@/event-bus.js'
import { GetOperationStates, RunMode, HostConnMode, HostOperationMode, TransferMode } from '@/api/SystemAPI';
import { IsLoginLastTime } from '@/api/AuthHelper';
import { ResetSystemAlarm, ResetEquipmentAlarm, StopBuzzer } from '@/api/AlarmAPI.js'
import moment from 'moment'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { agvs_settings_store, userStore, UIStore, AlarmStore } from '@/store'
import { Expand as MenuExpandIcon, Fold as MenuFoldIcon, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus';
import PlatformOperationHelper from '@/components/App/PlatformOperationHelper.vue'
export default {
  components: {
    MenuExpandIcon, MenuFoldIcon, UserFilled, PlatformOperationHelper
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
          id: 'system_operation_mode',
          name: '操作模式',
          name_eng: 'Operation Mode',
          actived: false,
          active_text: this.$i18n.locale == 'zh-TW' ? '運轉' : 'RUN',
          inactive_text: this.$i18n.locale == 'zh-TW' ? '維護' : 'MAINTAIN',
          loading: false,
          visible: true,
          beforeChangeHandler: () => this.SysOptModeChangeRequest()
        },
        transfer_mode: {
          id: 'transfer_mode',
          name: "派工模式",
          name_eng: 'Dispatch Mode',
          enabled: false,
          active_text: this.$i18n.locale == 'zh-TW' ? '自動' : 'AUTO',
          inactive_text: this.$i18n.locale == 'zh-TW' ? '手動' : 'MANUAL',
          loading: false,
          visible: true,
          beforeChangeHandler: () => this.TransferModeChangeRequest()
        },
        host_conn_mode: {
          id: 'host_conn_mode',
          name: 'HOST連線',
          name_eng: 'Host Connect',
          enabled: false,
          active_text: this.$i18n.locale == 'zh-TW' ? 'Online' : 'Online',
          inactive_text: this.$i18n.locale == 'zh-TW' ? 'Offline' : 'Offline',
          loading: false,
          visible: true,
          beforeChangeHandler: () => this.HostConnModeChangeRequest()
        },
        host_operation_mode: {
          id: 'host_operation_mode',
          name: 'HOST模式',
          name_eng: 'Host Mode',
          enabled: false,
          active_text: this.$i18n.locale == 'zh-TW' ? 'Remote' : 'Remote',
          inactive_text: this.$i18n.locale == 'zh-TW' ? 'Local' : 'Local',
          loading: false,
          visible: true,
          beforeChangeHandler: () => this.HostOptModeChangeRequest()
        }

      },
      modeRenderKey: 0,
      modeVisible: true,
      system_alarms_classes: ['no-alarm'],
      equipment_alarms_classes: ['no-alarm'],
      system_alrm_text: '',
      eq_alrm_text: '',
      showAlarm: true,
      isEasyMode: false,
      systemAlarmInterval: undefined,
      openPlatformOperationHelper: false,
      openLoginTour: false,
      openOperationSwitchTour: false,
      openMapTour: false
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
      return userStore.state.user.Role != -1;
    },
    IsOpUsing() {
      return userStore.getters.IsOPLogining;
    },
    current_user_role() {
      return userStore.getters.level;
    },
    UserName() {
      var level = userStore.getters.level;
      var username = userStore.getters.UserName.toUpperCase();
      if (level == -1)
        return this.$t('visitor');
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
    },
    '$route'(to, from) {
      this.current_route_info.route_display_name = this.$i18n.locale == 'zh-TW' ?
        (to.meta?.Display || to.name) :
        (to.meta?.Display_Eng || to.name)
    }
  },
  mounted() {
    this.DownloadSystemOperationsSettings();
    bus.on('/show-login-view-invoke', () => {
      this.LoginClickHandler();
    })
    bus.on('reload-system-modes-from-server', () => {
      this.DownloadSystemOperationsSettings(100);
    })
    bus.on('secs-offline-by-agvs-disoneect', () => {
      if (!this.modes.host_conn_mode.actived)
        return;
      this.modes.host_conn_mode.actived = false;
      this.modes.host_operation_mode.actived = false;
      this.$swal.fire(
        {
          text: '因派車系統已斷線，SECS/GEM現在為OFFLINE',
          title: '',
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
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
    handleHelpItemsClicked() {
      this.$refs.helpPopover.hide();
    },
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
    /** */
    GetModeVisible(modeKey) {
      // modeKey: system_operation_mode, transfer_mode, host_conn_mode, host_operation_mode
      // 權限設定
      var permission = userStore.state.user.Permission;
      switch (modeKey) {
        case 'system_operation_mode':
          return permission.systemModesOperations.RunModeSwitch == 1;
        case 'transfer_mode':
          return userStore.state.user.Role != -1 && permission.systemModesOperations.AutoTransferModeSwitch == 1;
        case 'host_conn_mode':
          return permission.systemModesOperations.HostOnlineSwitch == 1;
        case 'host_operation_mode':
          return permission.systemModesOperations.HostRemoteSwitch == 1;
      }
      return false;
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
      //this.$emit('onMenuToggleClicked', '')
      bus.emit('menuToggle')
    },
    LogoClickHandler() {
      this.$router.push('/');
    },
    LoginClickHandler() {
      var currpath = this.$route.path;
      if (currpath.toLocaleLowerCase().includes('/login'))
        return;
      this.$router.push({
        path: '/Login',
        query: {
          pre: currpath,
        }
      })
      // this.$refs['login'].Show(this.current_route_info.route_name);
    },
    SwitchUserBtnClick() {
      var currpath = this.$route.path;
      if (currpath.toLocaleLowerCase().includes('/login'))
        return;
      this.$router.push({
        path: '/Login',
        query: {
          pre: currpath,
          action: 'switch'
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
          userStore.dispatch('logout')
          this.$swal.fire({ title: '登出成功!', icon: 'success', timer: 1000 })
            .then(() => {
              location.href = '/'
            })

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
          }, 200)
          setTimeout(() => {
            this.DownloadSystemOperationsSettings(100);
          }, 500);
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
      localStorage.setItem('lang', lang);
      // location.reload();
    },
    async StopBuzzerHandler() {
      await StopBuzzer();
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
    text-wrap: nowrap;
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
        width: 110px;
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

        button {
          width: 120px;
        }

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
    .helper-bottoms-container {
      button {
        text-align: left !important;
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

  .user-account {
  }
}
</style>