<template>
  <div>
    <div class="d-flex">
      <AGVStatusVue></AGVStatusVue>
      <Map
        id="birdview_map"
        class="flex-fill border rounded"
        :key="map_station_data"
        :editable="false"
      ></Map>
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/components/Map/store'
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