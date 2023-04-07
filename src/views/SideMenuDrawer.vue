<template>
  <div class="side-menu">
    <el-drawer
      v-model="show_draw"
      direction="ltr"
      title="GPM AGVS"
      size="25%"
      @close="CLoseEventHandle"
    >
      <div @click="PageSwitch('/','AGVS')" class="menu-item-container">AGVS</div>
      <div
        @click="PageSwitch('/map','圖資管理')"
        v-show="auth_confirmed"
        class="menu-item-container"
      >圖資管理</div>
      <div @click="PageSwitch('/','帳籍管理')" class="menu-item-container">帳籍管理</div>
      <div
        @click="PageSwitch('/sys_settings','系統設定')"
        v-show="auth_confirmed"
        class="menu-item-container"
      >SETTINGS</div>
    </el-drawer>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import { IsLoginLastTime } from '@/api/AuthHelper'
export default {
  data() {
    return {
      show_draw: false,
      auth_confirmed: false
    }
  },
  methods: {
    Show() {
      bus.emit('/alarm_footer_send_to_back', true);
      this.show_draw = true
    },
    CLoseEventHandle() {
      this.$emit('close', "");
      bus.emit('/alarm_footer_send_to_back', false);
    },
    PageSwitch(route_name, display_name = '') {
      var current_route = this.$router.currentRoute.value.path;
      if (route_name != current_route) {
        this.$router.push(route_name);
        bus.emit('/router-change', { route_display_name: display_name, route_name: route_name });
      }
      this.show_draw = false;
    }
  },
  mounted() {

    var login_state = IsLoginLastTime();
    if (login_state.isLogin) {
      this.auth_confirmed = login_state.login_info.Role == 2;
    }

    bus.on("/login_success", user => {
      this.auth_confirmed = user.Role == 2;
    });
    bus.on("/logout", () => {
      this.auth_confirmed = false;
    });
  },
}
</script>

<style scoped lang="scss">
.side-menu {
  .menu-item-container {
    // border: 1px solid black;
    padding: 3px;
    font-size: 30px;
    margin: 1px;
  }
  .menu-item-container:hover {
    background-color: rgb(23, 162, 184);
    color: white;
    cursor: pointer;
    border-radius: 8px;
  }
}
</style>