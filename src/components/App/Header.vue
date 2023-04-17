<template>
  <div class="app-header text-light border-bottom fixed-top">
    <div class="bg-primary d-flex flex-row py-1">
      <h3 @click="LogoClickHandler">
        <b>GPM AGVS</b>
      </h3>
      <p class="px-2">V1</p>
      <div
        v-if="!modes.system_operation_mode.actived"
        class="matain-mode-notify py-2 px-3"
      >維護模式:自動派車、充電功能已關閉。</div>
      <div class="page-name-display mx-4">{{current_route_info.route_display_name}}</div>
      <div class="flex-fill"></div>
      <div class="options d-flex justify-content-between">
        <i class="bi bi-three-dots-vertical pt-2"></i>
        <div class="op-mode-switch-container" v-for="(mode,key) in modes" :key="key">
          <span class="mx-1">{{mode.name}}</span>
          <el-switch
            v-model="mode.actived"
            active-color="rgb(95, 171, 80)"
            inactive-color="red"
            :active-text="mode.active_text"
            :inactive-text=" mode.inactive_text "
            border-color="grey"
            inline-prompt
            :before-change="mode.beforeChangeHandler"
            :loading="mode.loading"
            size="large"
            width="75px"
          ></el-switch>
        </div>

        <div class="pt-1">
          <el-popover placement="top" title width trigger="hover" content popper-class="bg-light">
            <template #reference>
              <b-button size="sm" variant="primary">
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
      </div>
      <div class="user-account" @click="LoginClickHandler">
        <span>{{ RoleDisplay }}</span>
        <i class="bi bi-person-circle"></i>
      </div>
      <Login ref="login" :IsLogin="IsLogin" @RoleChanged="(role)=>{current_user_role=role}"></Login>
    </div>
    <div class="alarm text-dark">
      <div class="alarm-container" v-bind:class="system_alarms">
        <div class="flex-fill">
          <span class="type-text">
            <i class="bi bi-three-dots-vertical pt-2"></i>
            系統警報
          </span>
          <span class="alarm-text">{{ system_alrm_text }}</span>
        </div>
        <div class="opt">
          <i class="bi bi-clock-history"></i>
          <b-button class="mb-2" size="sm" variant="danger">警報復歸</b-button>
        </div>
      </div>
      <div class="alarm-container" v-bind:class="equipment_alarms">
        <div class="flex-fill">
          <span class="type-text">
            <i class="bi bi-three-dots-vertical pt-2"></i>
            設備警報
          </span>
          <span class="alarm-text">{{ eq_alrm_text }}</span>
        </div>
        <div class="opt">
          <i class="bi bi-clock-history"></i>
          <b-button @click="openAlert" class="mb-2" size="sm" variant="danger">警報復歸</b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Login from '@/views/Login.vue';
import bus from '@/event-bus.js'
import { IsLoginLastTime } from '@/api/AuthHelper';
import WebSocketHelp from '@/api/WebSocketHepler';
import moment from 'moment'
export default {
  components: {
    Login
  },
  data() {
    return {
      current_route_info: {
        route_display_name: 'Home',
        route_name: '/'
      },
      current_user_role: 0,
      maintain_mode: true,
      modes: {
        system_operation_mode: {
          name: '操作模式',
          actived: true,
          active_text: '運轉',
          inactive_text: '維護',
          loading: false,
          beforeChangeHandler: this.SysOptModeChangeRequest
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
      unchecked_alarms: []
    }
  },
  computed: {
    IsLogin() {
      return this.current_user_role != 0;
    },
    RoleDisplay() {
      if (this.current_user_role == 0)
        return 'VISITORRRR'

      else if (this.current_user_role == 1)
        return 'ENG'

      else if (this.current_user_role == 2)
        return 'DEVELOPER'
      else
        return 'VISITOR'
    },
    SystemAlarms() {
      return this.unchecked_alarms.filter(alarm => alarm.Source == 0)
    },
    EquipmentAlarms() {
      return this.unchecked_alarms.filter(alarm => alarm.Source == 1)
    }
  },
  mounted() {
    bus.on('/router-change', (new_rotue) => {
      // {route_display_name:display_name,route_name:route_name}
      this.current_route_info = new_rotue
    });

    var login_state = IsLoginLastTime();
    if (login_state.isLogin) {
      this.current_user_role = login_state.login_info.Role;
    }

    var _alarm_ws = new WebSocketHelp('/ws/UncheckedAlarm');
    _alarm_ws.Connect();
    _alarm_ws.onmessage = (evt) => {

      this.unchecked_alarms = JSON.parse(evt.data);

    }
    // var sys_alrms = ['2023/04/17 19:22:22 異常碼[0023]-路徑規劃模組異常', '2023/04/18 19:22:22 異常碼[0043]-腦袋異常', '2023/04/19 19:22:22 異常碼[0053]排泄模組異常']
    // this.system_alarms = ['alarm']
    this.AlarmDisplayHandler();
  },
  methods: {
    LogoClickHandler() {
      this.$router.push('/');
      this.current_route_info = {
        route_display_name: 'AGVS',
        route_name: '/'
      }
    },
    LoginClickHandler() {
      this.$refs['login'].Show(this.current_route_info.route_name);
    },
    SysOptModeChangeRequest() {
      this.modes.system_operation_mode.loading = true;
      //TODO　詢問後端是否可切換系統操作模式(Run/Maintain)
      setTimeout(() => {
        this.modes.system_operation_mode.loading = false;
      }, 200);

      return true;
    },
    /**This function handles the change of the host connection mode.  */
    HostConnModeChangeRequest() {
      this.modes.host_conn_mode.loading = true;
      //TODO　詢問後端是否可切換HOST連線模式(Online/Offline) 
      setTimeout(() => {
        this.modes.host_conn_mode.loading = false;
      }, 200);

      return true;
    },
    HostOptModeChangeRequest() {
      this.modes.host_operation_mode.loading = true;
      //TODO　詢問後端是否可切換HOST操作模式(Remote/Local)
      setTimeout(() => {
        this.modes.host_operation_mode.loading = false;
      }, 200);

      return true;
    },
    LangSwitch(lang) {
      this.$i18n.locale = lang;

    },
    openAlert() {
      this.$vs.notify({
        color: 'danger',
        title: 'Accept Selected',
        text: 'Lorem ipsum dolor sit amet, consectetur'
      })
      setTimeout(() => {
        this.$vs.notify({
          color: 'danger',
          title: 'Accept Selected',
          text: 'Lorem ipsum dolor sit amet, consectetur'
        })
      }, 1000);
      setTimeout(() => {
        this.$vs.notify({
          color: 'danger',
          title: 'Accept Selected',
          text: 'Lorem ipsum dolor sit amet, consectetur'
        })
      }, 2000);


    },
    CreateAlarmDisplayText(alarm) {
      return `${moment(alarm.Time).format('yyyy/MM/DD HH:mm:ss')} 異常碼[${alarm.AlarmCode}]-${alarm.Description_Zh}(${alarm.Description_En})]`
    },
    AlarmDisplayHandler() {
      var sys_alarm_inx = 0;
      var eq_alarm_inx = 0;

      setInterval(() => {
        var sys_alarm = this.SystemAlarms[sys_alarm_inx]
        if (sys_alarm) {
          this.system_alarms = [sys_alarm.Level == 0 ? 'alarm' : 'warning'];
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
        var eq_alarm = this.EquipmentAlarms[eq_alarm_inx]
        if (eq_alarm) {
          this.equipment_alarms = [eq_alarm.Level == 0 ? 'alarm' : 'warning'];
          this.eq_alrm_text = this.CreateAlarmDisplayText(eq_alarm);
        } else {
          this.equipment_alarms = [''];
          this.eq_alrm_text = '';
        }
        eq_alarm_inx += 1;
        if (eq_alarm_inx >= this.EquipmentAlarms.length)
          eq_alarm_inx = 0
      }, 2000);
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
  .alarm {
    height: 48px;

    .alarm-container {
      display: flex;
      flex-direction: row;
      background-color: rgb(255, 229, 234);
      border: 2px solid white;
      .type-text,
      .alarm-text {
        margin: auto 5px;
        font-weight: bold;
        float: left;
      }
      .type-text {
        width: 99px;
        text-align: left;
        text-decoration: underline;
      }
      .alarm-text {
        padding: 3px;
        font-weight: normal;
        font-size: 20px;
      }
      .opt {
        padding-inline: 3px;

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
      animation: alarm_blink 1s infinite;
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
      background-color: red;
      color: white;
    }
    50% {
      background-color: rgb(255, 229, 234);
      color: red;
    }
    100% {
      background-color: red;
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
    animation: blink 1s linear infinite;
    position: absolute;
    left: 250px;
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
    padding-right: 8px;
    :hover {
      cursor: pointer;
    }
    span {
      font-size: 20px;
      margin-right: 10px;
    }
    i {
      font-size: 28px;
      // background-color: green;
    }
  }
}
</style>