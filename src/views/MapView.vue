<template>
  <div class="map-view h-100 d-flex flex-row my-1">
    <div></div>
    <MapShow
      id="editable_map"
      :agv_upload_coordi_data="agv_upload_data"
      @save="SaveMapClickHandle"
      :editable="true"
      :agv_show="false"
    ></MapShow>
  </div>
</template>

<script>
import MapShow from '@/components/Map/Map.vue';
import MapAPI from '@/api/MapAPI';
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus.js'
import { MapStore } from '@/components/Map/store'

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
      map_saving: false
    }
  },
  computed: {
    IsEditable() {
      return this.mode_selected == '編輯'
    },
    map_station_data() {
      return MapStore.getters.MapStations
    },
    agv_upload_data() {
      return MapStore.getters.AGVLocUpload
    },
    loadingText() {
      return "圖資儲存中..."
    }
  },
  methods: {

    async SaveMapClickHandle(points_data) {
      console.log(points_data);
      var mapData = MapStore.getters.MapData
      mapData.Points = points_data;
      this.map_saving = true;
      this.$swal.fire(
        {
          text: '',
          title: '圖資儲存中...',
          icon: 'warning',
          showCancelButton: false,
          showConfirmButton: false,
          customClass: 'my-sweetalert',
        })
      var success = await MapAPI.SaveMap(mapData);
      this.map_saving = false;
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
  },
}
</script>

<style lang="scss" scoped>
.map-view {
  position: absolute;
  top: 50px;
  width: 96%;
}
</style>