<template>
  <div class="map-view h-100 d-flex flex-row my-1">
    <MapShow
      class="w-100"
      :key="map_station_data"
      :map_stations="map_station_data"
      @save="SaveMapClickHandle"
      :editable="true"
    ></MapShow>
  </div>
</template>

<script>
import MapShow from '@/components/Map/Map.vue';
import MapAPI from '@/api/MapAPI';
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus.js'
import { MapStore } from '@/store'

export default {
  components: {
    MapShow,
  },
  async mounted() {
    this.tags = await MapAPI.GetMapTags();
  },
  data() {
    return {
      path_plan_point_type: 'Tag',
      path_plan_point_from: 1,
      path_plan_point_to: 2,
      tags: [1, 2, 3, 59, 11],

      map_station_data: []
    }
  },
  computed: {
    IsEditable() {
      return this.mode_selected == '編輯'
    }
  },
  methods: {
    EditModeEnableChanged(e) {
      this.edit_mode_opts.enabled = e == '編輯'
    },
    EditActionChanged(action) {
      if (action == '無')
        this.edit_mode_opts.mode_selected = 'none';
      if (action == '編輯點位')
        this.edit_mode_opts.mode_selected = 'edit_point';
      if (action == '新增點位')
        this.edit_mode_opts.mode_selected = 'add_point';
      if (action == '移除點位')
        this.edit_mode_opts.mode_selected = 'remove_point';
      if (action == '新增路徑')
        this.edit_mode_opts.mode_selected = 'add_path';
      if (action == '移除路徑')
        this.edit_mode_opts.mode_selected = 'remove_path';
    },
    async SaveMapClickHandle(points_data) {
      debugger
      console.log(points_data);
      var mapData = MapStore.getters.MapData
      mapData.Points = points_data;
      var success = await MapAPI.SaveMap(mapData);
      if (success) {
        //Notifier.Success('圖資儲存成功');
        this.$swal.fire({
          title: '圖資儲存成功',
          icon: 'success',
          showCancelButton: false,
          showConfirmButton: false,
          customClass: 'my-sweetalert',
          timer: 1500,
        })
        bus.emit('on_map_save_success', '');
      }
      else {
        Notifier.Danger('圖資儲存失敗');
        this.$swal.fire({
          title: '圖資儲存失敗',
          icon: 'error',
          showCancelButton: false,
          showConfirmButton: true,
          customClass: 'my-sweetalert',
        })
      }
    },
    async GetPathPlanedFromServer() {
      var result = {}
      if (this.path_plan_point_type == 'Tag')
        result = await MapAPI.PathPlanByTag(this.path_plan_point_from, this.path_plan_point_to);

      if (result) {

        var tags = result.tags;
        this.$refs['map'].UpdatePathPlanRender(tags);
      }

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
.map-view {
  position: absolute;
  top: 50px;
  width: 100%;
  .opts-container {
    width: 30%;
  }
}
</style>