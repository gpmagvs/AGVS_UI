<template>
  <div
    class="d-flex flex-row"
    v-loading="loading"
    element-loading-text="GPM AGVS"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(31, 31, 31, 0.9)">
    <div>
      <Header v-show="!loading" @onMenuToggleClicked="ToggleMenu"></Header>
    </div>
    <SideMenu></SideMenu>
    <div class="flex-fill" v-bind:style="router_view_style">
      <router-view v-show="!loading" v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
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
    <ConnectionState></ConnectionState>
  </div>
  <SideMenuDrawer @close="SideMenuCloseHandler" ref="side_menu"></SideMenuDrawer>
</template>

<script>
import SideMenuDrawer from '@/views/SideMenuDrawer.vue'
import SideMenu from '@/views/SideMenu.vue'
import Header from '@/components/App/Header.vue'
import AlarmDisplayVue from '@/components/App/AlarmDisplay.vue'
import ConnectionState from '@/components/App/ConnectionState.vue'
import bus from '@/event-bus.js'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { IsLoginLastTime } from '@/api/AuthHelper.js'
import { userStore } from '@/store'
import MoveAGVNotifty from '@/components/Traffic/MoveAGVNotify.vue'

export default {
  components: {
    Header, AlarmDisplayVue, SideMenuDrawer, SideMenu, ConnectionState, MoveAGVNotifty
  },
  data() {
    return {
      loading: true,
      showMenuToggleIcon: true,
      ShowOKOnlyModal: false,
      okOnlyModalProps: {
        title: '',
        content: '',
        title_variant: 'primary'
      },
      router_view_style: {
        //style="height:100vh;padding-top:150px;"
        position: 'relative',
        height: '100vh',
        paddingTop: '140px',
        paddingRight: '95px',
        left: '70px'
      }
    }
  },
  methods: {

    OpenLoading() {
      this.$vs.loading()
      setTimeout(() => {
        this.$vs.loading.close()
      }, 400);
    },
    ToggleMenu() {
      this.showMenuToggleIcon = false;
      this.$refs.side_menu.Show();
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
        this.OpenLoading();
        if (newValue == "/alarm") {
          this.router_view_style.paddingTop = '50px';
        }
        else
          this.router_view_style.paddingTop = '150px';
      }
    )
    setTimeout(() => {
      this.loading = false
    }, 2000)
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
.menu-toggle-icon {
  position: absolute;
  left: 0;
  font-size: 26px;
  z-index: 3100;
  cursor: pointer;
}

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
