<template>
<<<<<<< HEAD
  <div
    v-show="!isNoPermission"
    class="d-flex flex-row"
    v-loading="loading"
    element-loading-text="GPM AGVS"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(31, 31, 31, 0.9)">
    <el-container>
      <el-aside class="border" style="width:auto">
        <Menu :isCollapse="menu_collapse"></Menu>
      </el-aside>
      <el-container>
        <el-header style="padding:0;">
          <Header ref="header" :MenuExpanded="menu_collapse" v-show="!loading"
            @update:HasSystemAlarm="(val) => { HeaderShowSysAlarm = val; }"
            @update:HasEqpAlarm="(val) => { HeaderShowEqpAlarm = val; }"
            @onMenuToggleClicked="ToggleMenu"></Header>
        </el-header>
        <el-main style="padding:0;overflow-y: hidden;" v-bind:style="router_view_style"><router-view v-show="!loading" v-slot="{ Component }"> <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view></el-main>
      </el-container>
    </el-container>
    <b-modal
      v-model="ShowOKOnlyModal"
      :title="`${okOnlyModalProps.title}`"
      :centered="true"
      :okOnly="true"
      :headerBgVariant="okOnlyModalProps.title_variant"
      headerTextVariant="light">
      <p>{{ okOnlyModalProps.content }}</p>
    </b-modal>
    <!-- <AlarmDisplayVue></AlarmDisplayVue> -->
    <MoveAGVNotifty></MoveAGVNotifty>
    <!-- <AGVAlarmMessageDisplay></AGVAlarmMessageDisplay> -->
    <ConnectionState :IsMenuExpanded="!menu_collapse"></ConnectionState>
  </div>
  <SideMenuDrawer @close="SideMenuCloseHandler" ref="side_menu"></SideMenuDrawer>
</template>
<script>
import Menu from '@/components/Menu.vue'
import Header from '@/components/App/Header.vue'
import AlarmDisplayVue from '@/components/App/AlarmDisplay.vue'
import ConnectionState from '@/components/App/ConnectionState.vue'
import bus from '@/event-bus.js'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { IsLoginLastTime } from '@/api/AuthHelper.js'
import { userStore } from '@/store'
import MoveAGVNotifty from '@/components/Traffic/MoveAGVNotify.vue'
import AGVAlarmMessageDisplay from '@/components/App/AGVAlarmUI/AGVAlarmMessageDisplay.vue'

export default {
  components: {
    Header, Menu, AlarmDisplayVue, ConnectionState, MoveAGVNotifty, AGVAlarmMessageDisplay,

  },
  data() {
    return {
      loading: true,
      isNoPermission: false,
      showMenuToggleIcon: true,
      ShowOKOnlyModal: false,
      menu_collapse: true,
      okOnlyModalProps: {
        title: '',
        content: '',
        title_variant: 'primary'
      },
      HeaderShowSysAlarm: false,
      HeaderShowEqpAlarm: false
    }
  },
  computed: {
    router_view_style() {

      var _paddingTop = '18px';
      if (this.HeaderShowEqpAlarm && this.HeaderShowSysAlarm)
        _paddingTop = '60px'
      else if (!this.HeaderShowEqpAlarm && !this.HeaderShowSysAlarm)
        _paddingTop = '1px';
      else
        _paddingTop = '30px';

      return {
        position: 'relative',
        paddingTop: _paddingTop,
      }
    }
  },
  methods: {

    OpenLoading() {
      this.$vs.loading()
      setTimeout(() => {
        this.$vs.loading.close()
      }, 200);
    },
    ToggleMenu() {
      this.menu_collapse = !this.menu_collapse;
      // this.$refs.side_menu.Show();
    },
    SideMenuCloseHandler() {
      this.showMenuToggleIcon = true;
    }
  },
  mounted() {
    document.title = "GPM 派車系統";
    let login_states = IsLoginLastTime();

    //嘗試存取前次的登入狀態，並更新 userStore的值
    if (login_states.isLogin) {
      userStore.commit('setUser', login_states.login_info)
    }

    bus.on('/ShowOKOnlyModal', (props) => {
      this.okOnlyModalProps = props;
      this.ShowOKOnlyModal = true;
    });
    bus.on('auto_logout_notify_invoke', () => {
      this.$swal.fire(
        {
          text: '',
          title: '因閒置太久，已自動登出。',
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(() => {
          window.location.href = '/';

        })
    })
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        if ((newValue == '/sys_settings' || newValue == '/map') && userStore.getters.level <= 0) {
          this.$vs.loading.close();
          this.loading = false;
          this.isNoPermission = true;
          this.$swal.fire(
            {
              text: '',
              title: '您沒有足夠的權限訪問此頁面!',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'full-sweetalert'
            }).then(() => {
              window.location.href = '/'
            })
          return;
        } else {

          this.OpenLoading();
          // if (newValue == "/alarm") {
          //   this.router_view_style.paddingTop = '50px';
          // }
          // else
          //   this.router_view_style.paddingTop = '150px';

          setTimeout(async () => {
            var result = await userStore.dispatch('user_route_change', newValue);
            if (newValue == '/map' && result.isOtherUserEditingMap) {
              this.$swal.fire(
                {
                  text: '',
                  title: '注意!目前有其他使用者正在地圖編輯頁面',
                  icon: 'warning',
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                  customClass: 'my-sweetalert'
                })
            }
          }, 100)
        }
      }
    )
    setTimeout(() => {
      this.loading = false
    }, 1000)
  },
};

/**ResizeObserver loop completed with undelivered notifications. */
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay);
  }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16);
    super(callback)
  }
}
</script>
<style lang="scss">
=======
  <!--<div class="appcontainer" v-bind:style="AppBorderStyle" style="width:100vw">-->
  <div class="appcontainer" style="width:100vw;height:100vh" v-loading.fullscreen.lock="loading" element-loading-text="GPM AGV"
    element-loading-background="rgba(0,0,0, 0.8)">
    <div
      class="fixed-bottom text-right"
      v-if="CurrentAlarms != undefined && CurrentAlarms.length > 0"
      id="vcs-alarms">
      <div v-for="(alarmObj, code) in AlarmCodesGroup" :key="code">
        <el-alert
          @click="HandleAlarmSheetClick(code)"
          show-icon
          :type="alarmObj.Alarm.ELevel == 0 ? 'warning' : 'error'"
          :title="`Alarm Code=${code} [${Timeformat(alarmObj.Alarm.Time)}]`"
          :description="`${alarmObj.Alarm.CN == '' ? alarmObj.Alarm.Description : alarmObj.Alarm.CN}(${alarmObj.Alarm.Description})`"></el-alert>
      </div>
    </div>
    <i @click="ToggleMenu" v-show="false" class="bi text-primary bi-list menu-toggle-icon"></i>
    <SideMenuDrawer ref="side_menu"></SideMenuDrawer>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <SystemSettingsView></SystemSettingsView>
    <EQHandshakingNotify></EQHandshakingNotify>
    <WaitAGVsNextMoveActionNotify></WaitAGVsNextMoveActionNotify>
    <AGVInitalizingNotify></AGVInitalizingNotify>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import SideMenuDrawer from '@/views/SideMenuDrawer.vue'
import { SystemMsgStore, AGVStatusStore } from '@/store'
import { ElNotification } from 'element-plus'
import moment from 'moment'
import SystemSettingsView from '@/views/SystemSettingsView.vue'
import EQHandshakingNotify from '@/components/EQHandshakingNotify.vue'
import WaitAGVsNextMoveActionNotify from "@/components/WaitAGVsNextMoveActionNotify.vue"
import AGVInitalizingNotify from "@/components/AGVInitalizingNotify.vue"
export default {
  components: {
    SideMenuDrawer, SystemSettingsView, EQHandshakingNotify, WaitAGVsNextMoveActionNotify, AGVInitalizingNotify
  },
  data() {
    return {
      showMenuToggleIcon: false,
      loading: true
    }
  },
  methods: {
    ToggleMenu() {
      this.$refs.side_menu.Show();
    },
    Timeformat(time, format = 'yyyy-MM-DD HH:mm:ss') {
      return moment(time).format(format)
    },
    async HandleAlarmSheetClick(code) {
      await AGVStatusStore.dispatch('clear_alarm_with_code', code)
    }
  },
  computed: {
    CurrentSystemMsg() {
      return SystemMsgStore.getters.SysMessages
    },
    CurrentAlarms() {

      return AGVStatusStore.getters.AlarmCodes
    },
    AlarmCodesGroup() {
      return AGVStatusStore.getters.AlarmGroup;
    },
    VehicleName() {
      return AGVStatusStore.getters.AGVName;
    },
    AppBorderStyle() {

      if (this.AlarmCodesGroup) {

        var alarms = Object.values(this.AlarmCodesGroup)
        var any_alarm = alarms.filter(al => al.Alarm.ELevel != 0).length != 0
        return {
          border: alarms.length == 0 ? '' : any_alarm ? '5px solid red' : '5px solid gold'
        }
      }
    },

  },
  watch: {
    VehicleName(newValue, oldValue) {
      document.title = 'GPM-' + newValue;
    }
  },
  mounted() {
    document.title = "GPM AGV";
    bus.on('/god_mode_changed', (is_god_mode_now) => {
      this.showMenuToggleIcon = is_god_mode_now
    });
    bus.on('idle', (arg) => {
      this.$router.push('/idle')
      // alert('idle 5 ^_^')
    })
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  },
};
</script>

<style lang="scss">
.menu-toggle-icon {
  position: absolute;
  left: 0;
  font-size: 26px;
  cursor: pointer;
}

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
#app {
  //font-family: Avenir, Helvetica, Arial, sans-serif;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
<<<<<<< HEAD
  color: #2c3e50;
  height: 100%;
  overflow-x: hidden;
=======
  height: 100%;
  overflow: hidden;
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

body,
html {
<<<<<<< HEAD
  width: 100vw;
=======
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
  height: 100%;
  // -webkit-user-select: none;
  // /* Chrome, Safari, Opera */
  // -moz-user-select: none;
  // /* Firefox */
  // -ms-user-select: none;
<<<<<<< HEAD
  // /* IE 10+ */
  // user-select: none;
  // //overflow-x: hidden;
  // // overflow-y: hidden;
=======
  /* IE 10+ */
  //user-select: none;
}

#vcs-alarms {
  position: absolute;
  left: 42%;
  z-index: 2027;
  bottom: 3px;
  width: 57%;

  span {
    // color: rgb(0, 123, 255);
    color: rgb(182, 179, 179);
  }

  p {
    text-align: left;
    font-weight: bold;
    font-size: 20px;
    padding: 0 auto;
  }

  .el-alert {
    margin: 3px auto;
    text-align: left;
    --el-alert-icon-large-size: 37px;

    .el-alert__close-btn {
      font-size: 30px;
    }
  }
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
}
</style>
