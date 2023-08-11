<template>
  <div class="side-menu-fixed fixed-left">
    <div class>
      <!--  -->

      <el-tooltip placement="right" content="Home">
        <div v-bind:style="Selected('/')" class="side-item" @click="PageSwitch('/','Home')">
          <div class="logo-text">
            GPM
            <div class="log-sub-text">AGVS</div>
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <el-tooltip placement="right" content="系統警報">
        <div
          v-bind:style="Selected('/alarm')"
          class="side-item"
          @click="PageSwitch('/alarm','系統警報')"
        >
          <div class="menu-icon round">
            <img src="images/alarm.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <!-- <el-tooltip placement="right" content="帳籍管理">
        <div
          v-if="false"
          v-bind:style="Selected('/racks_status')"
          class="side-item"
          @click="PageSwitch('/racks_status','帳籍管理')"
        >
          <div class="menu-icon round">
            <img src="images/rack.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip> -->
      <!--  -->
      <el-tooltip placement="right" content="圖資管理">
        <div
          v-bind:style="Selected('/map')"
          v-show="IsUserLogin"
          class="side-item"
          @click="PageSwitch('/map','圖資管理')"
        >
          <div class="menu-icon round">
            <img src="images/map.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <el-tooltip placement="right" content="資料">
        <div v-bind:style="Selected('/data')" class="side-item" @click="PageSwitch('/data','資料')">
          <div class="menu-icon round">
            <img src="images/database.png" :height="icon_size" alt />
          </div>
        </div>
      </el-tooltip>
      <!--  -->
      <el-tooltip placement="right" content="系統設定">
        <div
          v-bind:style="Selected('/sys_settings')"
          v-show="IsUserLogin"
          class="side-item"
          @click="PageSwitch('/sys_settings','系統設定')"
        >
          <div class="menu-icon round">
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
      active_item: '/'
    }
  },
  computed: {
    IsUserLogin() {
      return userStore.getters.IsLogin
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
  background-color: rgb(31, 31, 31);
  color: white;
  padding: 0;
  position: fixed;
  left: 0;
  height: 100%;
  border-right: 2px solid rgb(192, 191, 191);

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
  }
}
</style>