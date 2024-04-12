<template>
  <div class="py-5" style="height:680px;width:100%;padding-inline:5px">
    <div class="d-flex flex-row">
      <div class="switch-btn">
        <div v-if="currentRoute=='/v2/controller/fork'">
          <img
            @click="controllSwitch('move')"
            class="border bg-dark"
            src="/images/move.png"
            width="90"
            alt
          />
        </div>
        <div v-if="isForkAGV&&currentRoute=='/v2/controller/move'">
          <img
            @click="controllSwitch('fork')"
            class="border bg-dark"
            src="/images/lift.png"
            width="90"
            alt
          />
        </div>
      </div>
      <div
        class="controller-route-view flex-fill mx-2 px-2 rounded border"
        v-loading="!isUseable"
        :element-loading-text="OptForbidNotifyText"
        element-loading-spinner="''"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="rgba(155, 175, 193,.2)"
        :element-loading-z-index="1"
      >
        <router-view
          class="d-flex flex-fill flex-column justify-content-center w-100"
          v-slot="{ Component }"
        >
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script>
import AdminForkVue from './AdminFork.vue'
import { UIStore, UserStore, AGVStatusStore } from '@/store'
export default {
  components: {
    AdminForkVue,
  },
  data() {
    return {
      action: 'move'
    }
  },
  methods: {
    controllSwitch(action) {
      this.action = action;
      this.$router.push(action);
      UIStore.commit('SetPreviousControllerRoute', action)
    }
  },
  computed: {
    currentRoute() {
      var route = this.$route.path;
      return route
    },
    isForkAGV() {
      return AGVStatusStore.getters.IsForkAGV;
    },
    isUseable() {
      if (this.isGodUser)
        return true;
      return this.isUserLogin && !this.isAnyModeON;
    },
    isAnyModeON() {
      var agv_data = AGVStatusStore.getters.AGVStatus;
      return agv_data.OnlineMode != 0 | agv_data.AutoMode != 0
    },
    isUserLogin() {
      return UserStore.getters.CurrentUserRole != 0;
    },
    isGodUser() {
      return UserStore.getters.IsGodUser;
    },
    OptForbidNotifyText() {
      return '操作時需登入權限並將模式變更為OFFLINE/MANUAL'
    }
  }
}
</script>

<style lang="scss" >
img {
  cursor: pointer;
}
.switch-btn {
  img {
    border-radius: 100px;
  }
}
</style>