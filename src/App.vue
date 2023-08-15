<template>
  <div class="d-flex flex-row">
    <div>
      <Header @onMenuToggleClicked="ToggleMenu"></Header>
    </div>

    <SideMenu></SideMenu>

    <div class="flex-fill" v-bind:style="router_view_style">
      <router-view v-slot="{ Component }">
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
      headerTextVariant="light"
    >
      <p>{{ okOnlyModalProps.content }}</p>
    </b-modal>

    <!-- <AlarmDisplayVue></AlarmDisplayVue> -->
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
export default {
  components: {
    Header, AlarmDisplayVue, SideMenuDrawer, SideMenu, ConnectionState
  },
  data() {
    return {
      showMenuToggleIcon: true,
      ShowOKOnlyModal: false,
      okOnlyModalProps: {
        title: '',
        content: '',
        title_variant: 'primary'
      },
      router_view_style: {
        //style="height:100vh;padding-top:150px;"
        height: '100vh',
        paddingTop: '140px',
        paddingLeft: '70px'
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
    document.title = "AGVSystem";
    let login_states = IsLoginLastTime();

    //嘗試存取前次的登入狀態，並更新 userStore的值
    if (login_states.isLogin) {
      console.info(login_states);
      userStore.commit('setUser', login_states.login_info)
    }

    bus.on('/ShowOKOnlyModal', (props) => {
      this.okOnlyModalProps = props;
      this.ShowOKOnlyModal = true;
    });

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
  height: 100%;
  -webkit-user-select: none; /* Chrome, Safari, Opera */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE 10+ */
  user-select: none;
  //overflow-x: hidden;
  // overflow-y: hidden;
}
</style>
