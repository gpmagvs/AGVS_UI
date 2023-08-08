<template>
  <div class="map card-like">
    <!-- <div class="title">
      <i class="bi bi-map"></i>MAP SHOW
    </div>-->
    <Map
      class="w-100"
      :task_dispatch_menu_show="true"
      :map_stations="map_station_data"
      :agv_option="agvs_info"
    ></Map>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
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
        '#42c2f5',
        'limegreen',
        'orange',
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
      return MapStore.getters.AGVNavInfo;
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