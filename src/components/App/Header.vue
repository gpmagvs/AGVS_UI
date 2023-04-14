<template>
  <div class="app-header bg-primary text-light border-bottom fixed-top d-flex flex-row">
    <h2 @click="LogoClickHandler">
      <b>GPM AGVS</b>
    </h2>
    <p class="px-2">V1</p>
    <div
      v-if="!modes.system_operation_mode.actived"
      class="matain-mode-notify py-2 px-3"
    >維護模式:自動派車、充電功能已關閉。</div>
    <div class="page-name-display flex-fill">{{current_route_info.route_display_name}}</div>
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
</template>

<script>
import Login from '@/views/Login.vue';
import bus from '@/event-bus.js'
import { IsLoginLastTime } from '@/api/AuthHelper';
export default {
  components: {
    Login
  },
  data() {
    return {
      current_route_info: {
        route_display_name: 'AGVS',
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

      }
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

    }
  },
}
</script>

<style scoped lang="scss">
.app-header {
  z-index: 2;
  h2 {
    margin-left: 40px;
  }
  h2:hover {
    cursor: pointer;
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