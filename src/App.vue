<template>
  <div
    v-show="!isNoPermission"
    class="d-flex flex-row"
    v-loading="loading"
    element-loading-text="GPM AGVS"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(31, 31, 31, 0.9)"
  >
    <RegularULDHotRunStateView></RegularULDHotRunStateView>
    <el-container>
      <el-aside class="border" style="width:auto">
        <Menu :isCollapse="menu_collapse"></Menu>
      </el-aside>
      <el-container>
        <el-header style="padding:0;">
          <Header
            ref="header"
            :MenuExpanded="menu_collapse"
            v-show="!loading"
            @update:HasSystemAlarm="(val) => { HeaderShowSysAlarm = true; }"
            @update:HasEqpAlarm="(val) => { HeaderShowEqpAlarm = true; }"
            @onMenuToggleClicked="ToggleMenu"
          ></Header>
        </el-header>
        <el-main style="padding:0;overflow-y: hidden;" v-bind:style="router_view_style">
          <router-view v-show="!loading" v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    <b-modal
      v-model="ShowOKOnlyModal"
      :title="`${okOnlyModalProps.title}`"
      :centered="true"
      :okOnly="true"
      :headerBgVariant="okOnlyModalProps.title_variant"
      headerTextVariant="light"
    >
      <p>{{ okOnlyModalProps.content }}</p>
    </b-modal>
    <!-- <AlarmDisplayVue></AlarmDisplayVue> -->
    <!-- <MoveAGVNotifty></MoveAGVNotifty> -->
    <!-- <AGVAlarmMessageDisplay></AGVAlarmMessageDisplay> -->
    <b-alert
      class="fixed-bottom mb-3 mcs-message"
      v-model="showMCSMessage"
      :variant="mcsMessgeType"
      dismissible
    >
      <div class="d-flex">
        <div>{{ mcsMessageDto.time }}</div>
        <div
          class="flex-fill"
          v-bind:class="'msg-text-' + mcsMessgeType"
        >{{ mcsMessageDto.message }}</div>
      </div>
    </b-alert>
    <el-transition name="el-fade-in-linear">
      <b-alert
        class="fixed-bottom mb-3"
        v-model="showAGVSDissconnectDismissibleAlert"
        variant="danger"
        dismissible
      >派車系統斷線-AGVS Disconnect</b-alert>
    </el-transition>
    <FixFooter v-if="!IsOpUsing" :IsMenuExpanded="!menu_collapse"></FixFooter>
    <WindowTopNotify ref="topNotify"></WindowTopNotify>
  </div>
</template>
<script>
import store from '@/store';
import { EqStore, agvs_settings_store } from '@/store';
import Menu from '@/components/Menu.vue'
import Header from '@/components/App/Header.vue'
import AlarmDisplayVue from '@/components/App/AlarmDisplay.vue'
import FixFooter from '@/components/App/FixFooter.vue'
import bus from '@/event-bus.js'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { IsLoginLastTime } from '@/api/AuthHelper.js'
import { userStore } from '@/store'
import MoveAGVNotifty from '@/components/Traffic/MoveAGVNotify.vue'
import AGVAlarmMessageDisplay from '@/components/App/AGVAlarmUI/AGVAlarmMessageDisplay.vue'
import { tableHeaderStyle } from '@/ViewModels/GlobalStyles'
import param from './gpm_param'
import { ElNotification } from 'element-plus'
import RegularULDHotRunStateView from './components/RegularULDHotRunStateView.vue';
import { CheckMapPointsIsEqTypeButNoEqSetup } from './api/EquipmentAPI';
import { Startup, StopSignalIRHubsConnections } from '@/BackendDataFetchWorker'
import { ElementClickLog } from './api/WebSiteAPI';
import WindowTopNotify from './components/Notifiers/WindowTopNotify.vue';
export default {
  components: {
    Header, Menu, AlarmDisplayVue, FixFooter, MoveAGVNotifty, AGVAlarmMessageDisplay, RegularULDHotRunStateView, WindowTopNotify

  },
  provide() {
    return {
      tableHeaderStyle
    }
  },
  data() {
    return {
      showAGVSDissconnectDismissibleAlert: false,
      secsInfoMsgAutoDispearTimeout: null,
      showMCSMessage: false,
      mcsMessageDto: {
        time: '',
        message: '',
        type: 'info'
      },
      mcsMessgeType: '',
      loading: false,
      isNoPermission: false,
      showMenuToggleIcon: true,
      ShowOKOnlyModal: false,
      menu_collapse: true,
      okOnlyModalProps: {
        title: '',
        content: '',
        title_variant: 'primary'
      },
      HeaderShowSysAlarm: true,
      HeaderShowEqpAlarm: true,
      reloadAfterBackToHome: false
    }
  },
  computed: {
    router_view_style() {

      var _paddingTop = '18px';
      if (this.IsOpUsing) {
        return '10px';
      }
      if (this.HeaderShowEqpAlarm && this.HeaderShowSysAlarm)
        _paddingTop = '65px'
      else if (!this.HeaderShowEqpAlarm && !this.HeaderShowSysAlarm)
        _paddingTop = '1px';
      else
        _paddingTop = '30px';

      return {
        position: 'relative',
        paddingTop: _paddingTop,
      }
    },
    IsOpUsing() {
      return userStore.getters.IsOPLogining;
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
    },
    RegistNotifies() {
      const eqMaintainNotify = new EventSource(param.agvsystem_notify_url);
      eqMaintainNotify.addEventListener('Equipment_Maintain', (event) => {
        var eqname = event.data;
        ElNotification.warning({
          message: `設備 ${eqname} 維修中!`
        })

      })
    },
    changeLangFromLocalStorage() {
      var _lang = localStorage.getItem('lang');
      if (_lang) {
        this.$i18n.locale = _lang;
      }
    },
    async CheckEqPointsNoSetup() {
      if (userStore.state.user.Role < 1)
        return;

      var notifyStateStr = localStorage.getItem('GPMAGVS-NO-NOTIFY-STATE')
      if (notifyStateStr) {
        const notifyState = JSON.parse(notifyStateStr);
        const isTimePassed = Date.now() > notifyState.nextNofityTime;
        //alert(isTimePassed)
        if (!isTimePassed)
          return;
      }

      CheckMapPointsIsEqTypeButNoEqSetup().then(result => {
        //template 
        //{
        //   "isNormal": false,
        //   "noBuildPointInfo":[{tag:44,name:''}]
        //}
        if (!result.isNormal) {
          let _htmlBuild = '<div>'
          result.noBuildPointInfo.forEach(element => {
            _htmlBuild += `<div class="text-start" style="padding-left:30px"> <label style="margin-right:30px">Tag ${element.tag} : </label> <b>[${element.name}]</b> </div>`
          });
          _htmlBuild += '<div>'
          var result = this.$swal.fire(
            {
              html: _htmlBuild,
              title: '注意!有站點未設置設備',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'OK',
              cancelButtonText: '稍後再提醒我',
              customClass: 'my-sweetalert'
            }).then(res => {
              //alert(JSON.stringify(res))
              if (res.dismiss == 'cancel') {
                // alert('真叛逆...');
                const _nextNofityTime = new Date(Date.now() + 1 * 60 * 60 * 1000).getTime();
                localStorage.setItem('GPMAGVS-NO-NOTIFY-STATE', JSON.stringify({
                  nextNofityTime: _nextNofityTime
                }))
              }
            })
        }

      })
    }
  },
  mounted() {
    Startup();
    bus.on('/map_save', () => {
      this.mapSaved = true;
    });
    bus.on('agvs-disconnected', () => this.showAGVSDissconnectDismissibleAlert = true)
    bus.on('MCSMessage', (messageDto) => {
      console.info(messageDto);
      const isSucess = messageDto.type != 'error';
      this.mcsMessageDto = messageDto;
      this.mcsMessgeType = !isSucess ? 'danger' : 'info';
      this.showMCSMessage = true;
      if (isSucess) {
        clearTimeout(this.secsInfoMsgAutoDispearTimeout);
        this.secsInfoMsgAutoDispearTimeout = setTimeout(() => this.showMCSMessage = false, 5000);
      }

    })
    bus.on('on-data-fetch-delay-detected', (message) => {
      const notifyStateStr = localStorage.getItem('AGVS-DISCONNECTED-NO-NOTIFY-STATE')
      if (notifyStateStr) {
        const notifyState = JSON.parse(notifyStateStr);
        const isTimePassed = Date.now() > notifyState.nextNofityTime;
        if (!isTimePassed)
          return;
      }
      this.$swal.fire(
        {
          text: message,
          title: '',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Reload',
          cancelButtonText: this.$t('App.LaterRemindMe'),
          customClass: 'my-sweetalert'
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.reload();
          }
          if (res.dismiss == 'cancel') {
            // 稍後提醒我
            const _nextNofityTime = new Date(Date.now() + 5 * 60 * 1000).getTime();
            localStorage.setItem('AGVS-DISCONNECTED-NO-NOTIFY-STATE', JSON.stringify({
              nextNofityTime: _nextNofityTime
            }))
          }
        })
    })
    document.addEventListener('click', evt => {
      ElementClickLog(evt.target.innerText, evt.target.parentElement + '')
    })
    document.addEventListener('keydown', (evt) => {
      if (evt.key && evt.key.toLowerCase() == 'control')
        store.commit('setCtrlKeyPressing', true)
    })
    document.addEventListener('keyup', (evt) => {
      store.commit('setCtrlKeyPressing', false)
    })
    const isDevelopment = process.env.NODE_ENV === 'development';
    this.$store.dispatch('GetDynamicWebsiteData').then(response => {
      var fieldName = response.FieldName;
      if (isDevelopment)
        document.title = `[DEBUG]-[${fieldName}]-GPM AGVS`
      else
        document.title = `[${fieldName}]-GPM AGVS`
    });
    this.$store.dispatch('DownloadSystemConfigs');
    this.$store.dispatch('DownloadVMSAppInfo');
    EqStore.dispatch('FetchWIPSlotOptions')
    let login_states = IsLoginLastTime();

    //嘗試存取前次的登入狀態，並自動登入
    if (login_states.isLogin) {
      userStore.commit('setUser', login_states.login_info)
    }
    bus.on('menuToggle', () => {
      this.ToggleMenu();
    })
    bus.on('swal-notify-invoke', notifyOption => {
      this.$swal.fire(
        notifyOption)
    })
    bus.on('/ShowOKOnlyModal', (props) => {
      this.okOnlyModalProps = props;
      this.ShowOKOnlyModal = true;
    });
    bus.on('auto_logout_notify_invoke', () => {
      StopSignalIRHubsConnections();
      const _isUserLogined = userStore.getters.IsLogin;

      if (_isUserLogined) {
        userStore.dispatch('logout')
      }

      bus.emit('stop_render', '');
      document.title = "[Idle For Long Time...]"
      document.close();
      this.$swal.fire(
        {
          text: '',
          title: _isUserLogined ? this.$t('App.AutoLogoutNotify') : this.$t('App.PushOkToRefreshPage'),
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(() => {

          window.location.href = _isUserLogined ? '/login' : '/';

        })
    })

    bus.on('secs-host-message', (message) => {
      this.$swal.fire(
        {
          text: message,
          title: 'HOST MESSAGE',
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    })

    bus.on('home-reload-request', (reason) => {
      this.reloadAfterBackToHome = true;
    })
    bus.on('rack_has_data_not_cargo', _mesg => {
      this.$swal.fire(
        {
          text: _mesg,
          title: '注意!有儲格有帳籍但貨物不存在',
          icon: 'warning',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    })
    bus.on('ZoneUsableCarrierNotEnoughNotify', message => {
      // alert(message)
      let topNotify = this.$refs['topNotify'];
      if (topNotify) {
        topNotify.ShowMessage(message, 'danger');
      }
    })
    bus.on('SystemMaintainNotify', () => {
      agvs_settings_store.commit('setIsMaintain', true)
      this.$router.push('/maintaining')
    })

    bus.on('FinishSystemMaintain', () => {
      agvs_settings_store.commit('setIsMaintain', false)
      this.$router.push('/')
    })

    bus.on('TrySwitchToRemoteWhenHostReConnectedButConditionNotAllow', (message) => {
      //message 分號隔開
      const messages = message.split(';');
      this.$swal.fire(
        {
          title: '未完成自動 Remote',
          html: `<ul class="list-unstyled">
            ${messages.map(msg => `<li class="text-danger my-1">${msg}</li>`).join('')}
            <li class="mt-3">確認後再手動切換為 Remote 模式</li>
          </ul>`,
          icon: 'warning',
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    })

    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        if (newValue == '/' && this.reloadAfterBackToHome) {
          location.reload();
        }
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
        }

        const isRackStatusPage = newValue == '/racks_status';
        const isHomePage = newValue == '/';
        if (isRackStatusPage || isHomePage) {
          if (oldValue != newValue) {
            // Handle route change to A or B
            if (isRackStatusPage) {
              EqStore.dispatch('downloadRackStatusData')
            }
            if (isHomePage) {
              EqStore.dispatch('downloadEQData')
            }
          }
        }
        if (newValue == '/maintaining' && !agvs_settings_store.state.sys_settings.operations.isMaintaining) {
          this.$router.push('/')
        }
      }
    )

    if (location.pathname == '/' && !this.IsOpUsing) {
      this.loading = true;
    }
    setTimeout(() => {
      this.loading = false;
    }, 800)
    setTimeout(() => {
      this.CheckEqPointsNoSetup();
    }, 3000);
    this.RegistNotifies();
    this.changeLangFromLocalStorage();
  },
  created() {

    // console.log(this.$router.query.noLoading);
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
      try {
        fn.apply(context, args)
      } catch (error) {
      }
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
#app {
  //font-family: Avenir, Helvetica, Arial, sans-serif;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  overflow-x: hidden;
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
  width: 100vw;
  height: 100%;
  // -webkit-user-select: none;
  // /* Chrome, Safari, Opera */
  // -moz-user-select: none;
  // /* Firefox */
  // -ms-user-select: none;
  // /* IE 10+ */
  // user-select: none;
  // //overflow-x: hidden;
  // // overflow-y: hidden;
}

.mcs-message {
  font-size: 1.2rem;
  font-weight: bold;

  .msg-text-danger {
    color: red;
  }
}
</style>
