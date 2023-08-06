<template>
  <div class="map card-like">
    <!-- <div class="title">
      <i class="bi bi-map"></i>MAP SHOW
    </div>-->
    <Map class="w-100" :map_stations="map_station_data" :agv_option="agvs_info"></Map>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import bus from '@/event-bus.js'
import WebSocketHelp from '@/api/WebSocketHepler.js'
import param from '@/gpm_param';
import { MapStore } from '@/store'
import { AGVOption, clsAGVDisplay, clsMapStation } from '@/components/Map/mapjs';

export default {
  components: {
    Map
  },
  data() {
    return {
      navPathDisplayData: {},
      agv_colors: [
        'blue',
        'orange',
        'green',
        'pink',
        'red',
        'purple',
      ]
    }
  },
  computed: {
    map_station_data() {
      return MapStore.getters.MapStations
    },
    agvs_info() {
      var agv_nav_info = MapStore.getters.AGVDynamicPathInfo;
      if (agv_nav_info == undefined) {
        return new AGVOption(0, [])
      }
      var agv_num = Object.keys(agv_nav_info).length;
      var agvDataLs = [];
      var index = 0;
      Object.keys(agv_nav_info).forEach(name => {
        var data = agv_nav_info[name]
        var pathtags = data.nav_path
        var pathCoordinations = []

        if (pathtags) {

          pathtags.forEach(tag => {
            var pt = this.map_station_data.find(st => st.tag == tag)
            pathCoordinations.push(pt.coordination)
          })
        }

        agvDataLs.push(new clsAGVDisplay(name, this.agv_colors[index], [data.currentCoordication.X, data.currentCoordication.Y], pathCoordinations))
        index += 1;
      })
      var _AGVOption = new AGVOption(agv_num, agvDataLs)
      return _AGVOption;
    }
  },
  mounted() {
  }
}
</script>

<style lang="scss" scoped>
.map {
  height: 100%;
}
</style>