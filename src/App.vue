<template>
  <div class="d-flex flex-row">
    <div>
      <i
        @click="ToggleMenu"
        v-show="showMenuToggleIcon"
        class="bi bi-list menu-toggle-icon text-light"
      ></i>
      <Header></Header>
    </div>
    <div class="flex-fill" style="height:100vh;padding-top:48px;">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <AlarmDisplayVue></AlarmDisplayVue>
  </div>
  <SideMenuDrawer @close="SideMenuCloseHandler" ref="side_menu"></SideMenuDrawer>
</template>

<script>
import bus from '@/event-bus.js'
import SideMenuDrawer from '@/views/SideMenuDrawer.vue'
import Header from '@/components/App/Header.vue'

import AlarmDisplayVue from '@/components/App/AlarmDisplay.vue'
export default {
  components: {
    Header, AlarmDisplayVue, SideMenuDrawer,
  },
  data() {
    return {
      showMenuToggleIcon: true,
    }
  },
  methods: {
    ToggleMenu() {
      this.showMenuToggleIcon = false;
      this.$refs.side_menu.Show();
    },
    SideMenuCloseHandler() {
      this.showMenuToggleIcon = true;
    }
  },
  mounted() {
    // bus.on('/god_mode_changed', (is_god_mode_now) => {
    //   this.showMenuToggleIcon = is_god_mode_now
    // });
    // if (process.env.NODE_ENV != 'production') {
    //   this.showMenuToggleIcon = true;
    // }
  },
};
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
}
</style>
