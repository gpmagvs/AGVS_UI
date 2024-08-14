<template>
  <div
    v-show="!isNoPermission"
    class="d-flex flex-row"
    v-loading="loading"
    element-loading-text="GPM AGVS"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(31, 31, 31, 0.9)"
  >
    <el-container>
      <el-aside class="border" style="width:auto">
        <Menu :isCollapse="menu_collapse"></Menu>
      </el-aside>
      <el-container>
        <el-header v-if="!IsOpUsing" style="padding:0;">
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
    <ConnectionState v-if="!IsOpUsing" :IsMenuExpanded="!menu_collapse"></ConnectionState>
  </div>
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
import { tableHeaderStyle } from '@/ViewModels/GlobalStyles'
import param from './gpm_param'
import { ElNotification } from 'element-plus'
export default {
  components: {
    Header, Menu, AlarmDisplayVue, ConnectionState, MoveAGVNotifty, AGVAlarmMessageDisplay,

  },
  provide() {
    return {
      tableHeaderStyle
    }
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
      HeaderShowSysAlarm: true,
      HeaderShowEqpAlarm: true
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
    },
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
    }
  },
  mounted() {

    const isDevelopment = process.env.NODE_ENV === 'development';


    this.$store.dispatch('GetDynamicWebsiteData').then(response => {
      var fieldName = response.FieldName;
      if (isDevelopment)
        document.title = `[DEBUG]-[${fieldName}]-GPM AGVS`
      else
        document.title = `[${fieldName}]-GPM AGVS`
    });

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
        }
      }
    )
    setTimeout(() => {
      this.loading = false
    }, 1000)
    this.RegistNotifies();
    this.changeLangFromLocalStorage();
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
</style>
