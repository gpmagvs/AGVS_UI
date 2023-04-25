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
import Header from '@/components/App/Header.vue'
import AlarmDisplayVue from '@/components/App/AlarmDisplay.vue'
import ConnectionState from '@/components/App/ConnectionState.vue'
import bus from '@/event-bus.js'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
export default {
  components: {
    Header, AlarmDisplayVue, SideMenuDrawer, ConnectionState
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
        paddingTop: '150px'
      }
    }
  },
  methods: {

    OpenLoading() {
      this.$vs.loading()
      setTimeout(() => {
        this.$vs.loading.close()
      }, 800);
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
    bus.on('/ShowOKOnlyModal', (props) => {
      this.okOnlyModalProps = props;
      this.ShowOKOnlyModal = true;
    });

    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        console.info(newValue);
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
