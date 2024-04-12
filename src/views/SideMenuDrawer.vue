<template>
  <div class="side-menu">
    <el-drawer v-model="show_draw" direction="ltr" title="GPM VMS" size="30%">
      <div @click="PageSwitch('/')" class="menu-item-container">VMS</div>
      <div @click="PageSwitch('/rd_test')" class="menu-item-container">TEST</div>
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
    PageSwitch(route_name) {
      var current_route = this.$router.currentRoute.value.path;
      if (route_name != current_route) {
        this.$router.push(route_name);
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