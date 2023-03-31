<template>
  <div class="side-menu">
    <el-drawer
      v-model="show_draw"
      direction="ltr"
      title="GPM VMS"
      size="25%"
      @close="CLoseEventHandle"
    >
      <div @click="PageSwitch('/','AGVS')" class="menu-item-container">AGVS</div>
      <div @click="PageSwitch('/map','MAP')" class="menu-item-container">MAP</div>
      <div @click="PageSwitch('/','帳籍管理')" class="menu-item-container">帳籍管理</div>
      <div @click="PageSwitch('/rd_test','TEST')" class="menu-item-container">TEST</div>
      <div class="menu-item-container">SETTINGS</div>
    </el-drawer>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
export default {
  data() {
    return {
      show_draw: false
    }
  },
  methods: {
    Show() {
      this.show_draw = true
    },
    CLoseEventHandle() {
      this.$emit('close', "");
    },
    PageSwitch(route_name, display_name = '') {
      var current_route = this.$router.currentRoute.value.path;
      if (route_name != current_route) {
        this.$router.push(route_name);
        bus.emit('/router-change', display_name);
      }
      this.show_draw = false;
    }
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