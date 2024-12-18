<template>
  <div class="alarm-display w-100 fixed-bottom" v-bind:style="dynamic_style_setting">
    <transition name="el-zoom-in-bottom">
      <div v-show="mode=='show'" class="show-mode border">
        <div class="d-flex flex-row">
          <b-button squared variant="secondary" @click="mode='hidden'">
            <i class="bi bi-chevron-double-down"></i>
          </b-button>
          <div class="alarm-display-container d-flex flex-row w-100">
            <div class="h-50 w-100 border d-flex flex-row">
              <div class="alarm-type">設備異常</div>
              <div>a</div>
            </div>
            <div class="h-50 w-100 border d-flex flex-row">
              <div class="alarm-type">AGV警報</div>
              <div>b</div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div v-show="mode=='hidden'" class="hidden-mode">
      <b-button squared variant="danger" @click="mode='show'">
        Alarms
        <i class="bi bi-chevron-double-up"></i>
      </b-button>
    </div>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import { watch, ref } from 'vue';
import { useRoute } from 'vue-router'
export default {
  setup() {

  },
  data() {
    return {
      mode: 'show', //hidden;show
      dynamic_style_setting: {
        zIndex: 20000
      }
    }
  },
  mounted() {
    const currentRoute = ref('')
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        if (newValue != "/") {
          this.mode = 'hidden'
        }
        else this.mode = 'show'
      }
    )
    bus.on('/alarm_footer_send_to_back', (enable) => {
      this.dynamic_style_setting.zIndex = enable ? 2 : 20000;
    });
  },
}
</script>

<style lang="scss" scoped>
.alarm-display {
  z-index: 22333;
  .alarm-display-container {
    border: 2px solid white;
    height: 85px;
    margin-left: 8px;
    .alarm-type {
      width: 130px;
      border: 2px solid rgb(174, 174, 174);
      background-color: orange;
      color: white;
      margin-right: 5px;
    }
  }
  .show-mode {
    background: pink;
    // box-shadow: 4px 8px 25px 2px black;
  }
  .hidden-mode {
    background-color: transparent;
    text-align: left;
  }
  button,
  .hidden-mode,
  .show-mode {
    height: 40px;
  }

  .show-mode {
    height: 45px;
  }
}
</style>