<template>
  <div>
    <div class="d-flex">
      <AGVStatusVue></AGVStatusVue>
      <Map
        class="flex-fill border rounded"
        :key="map_station_data"
        :map_stations="map_station_data"
        :editable="false"
      ></Map>
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/store'
import AGVStatusVue from '@/components/HomeView/AGVStatus/AGVStatus.vue'

export default {
  components: {
    Map, AGVStatusVue
  },
  data() {
    return {
      map_station_data: []

    }
  },
  mounted() {
    var timer = setInterval(() => {
      debugger
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
</style>