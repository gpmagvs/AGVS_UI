<template>
  <div class="side-menu-fixed h-100 fixed-left">
    <div class>
      <!--  -->
      <el-tooltip placement="right" content="Home">
        <div
          v-bind:style="Selected('/admin')"
          class="side-item"
          @click="PageSwitch('/admin','Home')"
        >
          <div class="logo-text">
            GPM
            <div class="log-sub-text">AGV</div>
          </div>
        </div>
      </el-tooltip>

      <!--  -->
      <el-tooltip placement="right" content="控制器">
        <div
          v-bind:style="Selected('/admin/controller')"
          class="side-item"
          @click="PageSwitch('/admin/controller','控制器')"
        >
          <div class="menu-icon">
            <img src="images/controller.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <el-tooltip placement="right" content="圖資管理">
        <div
          v-bind:style="Selected('/admin/map')"
          v-show="IsUserLogin"
          class="side-item"
          @click="PageSwitch('/admin/map','圖資管理')"
        >
          <div class="menu-icon">
            <img src="images/map.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <el-tooltip placement="right" content="資料">
        <div
          v-bind:style="Selected('/admin/data')"
          class="side-item"
          @click="PageSwitch('/admin/data','資料')"
        >
          <div class="menu-icon">
            <img src="images/database.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <el-tooltip placement="right" content="系統設定">
        <div
          v-bind:style="Selected('/admin/sys_settings')"
          v-show="IsUserLogin"
          class="side-item"
          @click="PageSwitch('/admin/sys_settings','系統設定')"
        >
          <div class="menu-icon">
            <img src="images/settings.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
    </div>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import { watch } from 'vue'
import { userStore } from '@/store'
import { useRoute } from 'vue-router'
export default {
  data() {
    return {
      icon_size: 35,
      active_item: '/admin'
    }
  },
  computed: {
    IsUserLogin() {
      return true
    }
  },
  methods: {
    CLoseEventHandle() {
      this.$emit('close', "");
      bus.emit('/alarm_footer_send_to_back', false);
    },
    PageSwitch(route_name, display_name = '') {
      var current_route = this.$router.currentRoute.value.path;
      if (route_name != current_route) {
        setTimeout(() => {
          this.$router.push(route_name);
          bus.emit('/router-change', { route_display_name: display_name, route_name: route_name });
        }, 100);
      }
    },
    Selected(name) {
      return {
        backgroundColor: this.active_item == name ? 'rgb(13, 110, 253)' : ''
      }
    }
  },
  mounted() {
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        this.active_item = newValue;
      }
    )

  },
}
</script>

<style scoped lang="scss">
.side-menu-fixed {
  z-index: 99999;
  width: 70px;
  background-color: black;
  color: white;
  position: fixed;
  padding: 0;

  .side-item {
    padding: 10px 5px;
    position: relative;
    cursor: pointer;
    height: 80px;
    width: 100%;
    .menu-icon {
      background-color: white;
      margin: 5px 5px;
      width: 50px;
      height: 50px;
      padding: 10px;
      border-radius: 50px;
      img {
        position: relative;
        right: 3px;
        bottom: 3px;
      }
    }
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      padding: 0;
      .log-sub-text {
        font-size: 20px;
        position: relative;
        top: -8px;
        color: grey;
      }
    }
  }
  .side-item:hover {
    background-color: rgb(13, 110, 253);
    border: 1px solid rgb(211, 208, 208);
  }
}
</style>