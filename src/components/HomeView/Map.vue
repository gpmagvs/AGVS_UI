<template>
  <div class="map card-like">
    <div class="title">
      <i class="bi bi-map"></i>MAP SHOW
    </div>
    <MapShow ref="home-map" :task_allocatable="true" style="height:90%" :zoom="5.5"></MapShow>
  </div>
</template>

<script>
import MapShow from '../MapShow.vue';
import bus from '@/event-bus.js'
import WebSocketHelp from '@/api/WebSocketHepler.js'
import param from '@/gpm_param';
export default {
  components: {
    MapShow
  },
  data() {
    return {
      navPathDisplayData: {}
    }
  },
  mounted() {
    // bus.emit('on_map_save_success', '');
    bus.on('on_map_save_success', () => {
      this.$refs['home-map'].Reload();
    });

    var ws = new WebSocketHelp('ws/AGVNaviPathsInfo', param.vms_ws_host);
    ws.Connect();
    ws.onmessage = (evt) => {
      var navPathDisplayData = JSON.parse(evt.data);
      Object.keys(navPathDisplayData).forEach(agv_name => {
        var newtags = navPathDisplayData[agv_name];
        var oldtags = this.navPathDisplayData[agv_name]
        const emitAction = () => {
          bus.emit('/nav_path_update', { name: agv_name, tags: newtags })
        }
        if (oldtags) {
          if (newtags.length != oldtags.length) {
            emitAction()
          }
        } else {
          emitAction()
        }
      });
      this.navPathDisplayData = navPathDisplayData;
    }
  },
}
</script>

<style lang="scss" scoped>
.map {
}
</style>