<template>
  <div class="map card-like">
    <!-- <div class="title">
      <i class="bi bi-map"></i>MAP SHOW
    </div>-->
    <Map @onTransferRequst="HandleTransferReq" :id="id" class="w-100" :task_dispatch_menu_show="true"></Map>
    <CargoTransferDialog ref="transfer_dialog"></CargoTransferDialog>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/components/Map/store'
import CargoTransferDialog from './CargoTransferDialog.vue'
import { AGVOption, clsAGVDisplay, clsMapStation } from '@/components/Map/mapjs';

export default {
  props: {
    id: {
      type: String,
      default: "homemap"
    },
  },
  components: {
    Map, CargoTransferDialog
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
  },
  methods: {
    HandleTransferReq(data = { station_data: {}, action: 'load' }) {
      // alert(JSON.stringify(station_data))
      this.$refs.transfer_dialog.ShowDialog(data.station_data, data.action);
    }
  },
}
</script>

<style lang="scss" scoped>
.map {
  height: 100%;
}
</style>