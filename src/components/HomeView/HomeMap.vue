<template>
  <div class="map card-like">
    <!-- <div class="title">
      <i class="bi bi-map"></i>MAP SHOW
    </div>-->
    <Map class="w-100" :key="map_station_data" :map_stations="map_station_data"></Map>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import bus from '@/event-bus.js'
import WebSocketHelp from '@/api/WebSocketHepler.js'
import param from '@/gpm_param';
import { MapStore } from '@/store'
export default {
  components: {
    Map
  },
  data() {
    return {
      navPathDisplayData: {},
      map_station_data: []
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
    var timer = setInterval(() => {
      var mapStations = MapStore.getters.MapStations
      if (mapStations) {
        clearInterval(timer);
        this.map_station_data = mapStations;
      }
    }, 1000);
  },
}
</script>

<style lang="scss" scoped>
.map {
  height: 100%;
}
</style>