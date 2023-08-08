<template>
  <div class="task-dialog">
    <el-dialog v-model="show" :title="`${action_name}任務`">
      <div class>
        <el-form style="font-size: 25px;">
          <el-form-item label="選擇車輛"></el-form-item>
        </el-form>
        <Map
          class="border rounded"
          id="task-dispatch-used-map"
          :map_stations="map_station_data"
          :task_dispatch_menu_show="true"
        ></Map>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Map from './Map.vue'
import { MapStore } from '@/store'
import { MapPointModel } from './mapjs.js'

export default {
  components: {
    Map,
  },
  data() {
    return {
      show: false,
      action_name: '',
      station_data: new MapPointModel(),
      map_station_data: []
    }
  },
  computed: {
    IsTransferTask() {
      return this.action_name == '搬運'
    },
  },
  methods: {
    ShowDialog(actionname = '', station_data) {
      setTimeout(() => {
        this.map_station_data = MapStore.getters.MapStations
        this.show = true;
        this.action_name = actionname
        this.station_data = station_data
      }, 200);
    }
  },
  mounted() {
  }
}
</script>

<style lang="scss" >
.task-dialog {
  z-index: 9999;
  .el-dialog.is-fullscreen {
    padding-left: 75px;
  }
}
</style>