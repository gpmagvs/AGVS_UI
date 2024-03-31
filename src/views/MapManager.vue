<template>
  <div class="map-view h-100 d-flex flex-row my-1">
    <div></div>
    <Map
      id="editable_map"
      :agv_upload_coordi_data="agv_upload_data"
      @save="SaveMapClickHandle"
      :editable="true"
      :agv_show="true"
      canva_height="750px"
      ref="map_editing"
    ></Map>
  </div>
</template>
<script>
import Map from '@/components/Map/Map.vue';
import MapAPI from '@/api/MapAPI';
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus.js'
import { MapStore } from '@/components/Map/store'
import { UIStore } from '@/store'

export default {
  components: {
    Map,
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
    StyleBiding() {

      var _sysAlarmShowing = UIStore.getters.SystemAlarmShowState;
      var _eqpAlarmShowing = UIStore.getters.EqpAlarmShowState;

      if (!_sysAlarmShowing && !_eqpAlarmShowing)
        return {
          top: '-10px'
        }
      else if (_sysAlarmShowing && _eqpAlarmShowing)
        return {
          top: '50px'
        }
      else {
        return {
          top: '12px'
        }
      }
    },
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

    async SaveMapClickHandle(mapDataSave) {
      console.log(mapDataSave);
      var mapData = JSON.parse(JSON.stringify(MapStore.getters.MapData))
      mapData.Points = mapDataSave.Points;
      mapData.Segments = mapDataSave.Pathes;
      mapData.Regions = mapDataSave.Regions;
      mapData.Map_Image_Boundary = mapDataSave.ImageExtent;
      var _check_result = this.CheckMapContentHasAnyError(mapData);
      if (!_check_result.correct) {
        this.$swal.fire(
          {
            text: _check_result.message,
            title: '',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }
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


      var success = await MapStore.dispatch('SaveMap', { data: mapData, file: mapDataSave.ImageFile });
      this.map_saving = false;
      if (success) {
        bus.emit('/map_save');
        //Notifier.Success('圖資儲存成功');
        this.$swal.fire({
          title: '圖資儲存成功',
          icon: 'success',
          showCancelButton: false,
          showConfirmButton: false,
          customClass: 'my-sweetalert',
          timer: 1500,
        })

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
    CheckMapContentHasAnyError(mapData) {
      var _tags_settings = Object.values(mapData.Points).map(pt => { return pt.TagNumber })
      var non_repeat_tags = [...new Set(_tags_settings)]
      if (non_repeat_tags.length != _tags_settings.length) {
        const duplicatesTags = []
        const seen = {}
        _tags_settings.forEach((item, index) => {
          if (seen.hasOwnProperty(item)) {
            duplicatesTags.push(item)
          } else {
            seen[item] = index
          }
        });
        var _error_set = [...new Set(duplicatesTags)].map(tag => {
          var _points_same_tag = Object.values(mapData.Points).filter(pt => pt.TagNumber == tag);
          return `Tag-${tag}於 ${_points_same_tag.map(pt => { return pt.Graph.Display }).join("、")}重複設置`
        })
        return { correct: false, message: `${_error_set.join(";")} ，\n請再檢查圖資設定` }
      }
      return { correct: true, message: '' }
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
  width: 100%;
}
</style>