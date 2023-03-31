<template>
  <div class="map-view h-100 d-flex flex-row my-4">
    <div class="opts-container mx-3 p-3 border">
      <el-form label-width="80px" label-position="left">
        <el-form-item label="模式">
          <el-radio-group v-model="mode_selected">
            <el-radio-button label="檢視" />
            <el-radio-button label="編輯" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="編輯動作">
          <el-radio-group v-model="action_selected">
            <el-radio-button label="無" />
            <el-radio-button label="新增點位" />
            <el-radio-button label="移除點位" />
            <el-radio-button label="編輯點位" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label>
          <b-button variant="primary" @click="SaveMapClickHandle">儲存圖資</b-button>
          <b-button variant="danger">重新載入</b-button>
        </el-form-item>
      </el-form>

      <!--路徑規劃-->

      <div class="border rounded text-start p-3 w-100">
        <h4 class="border-bottom">路徑規劃</h4>
        <el-form class="my-3" label-width="80px" label-position="left">
          <el-form-item label="類型">
            <el-select v-model="path_plan_point_type">
              <el-option label="Tag" value="Tag"></el-option>
              <el-option label="Index" value="Index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="起點 Tag">
            <el-select v-model="path_plan_point_from">
              <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="終點 Tag">
            <el-select v-model="path_plan_point_to">
              <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag"></el-option>
            </el-select>
          </el-form-item>
          <b-button @click="GetPathPlanedFromServer" class="w-100" variant="primary">PLAN</b-button>
        </el-form>
      </div>
    </div>
    <MapShow ref="map" :edit_mode="mode_selected=='編輯'" style="height:100%;width: 100%;"></MapShow>
  </div>
</template>

<script>
import MapShow from '@/components/MapShow.vue';
import MapAPI from '@/api/MapAPI';
import Notifier from '@/api/NotifyHelper';
import bus from '@/event-bus.js'
export default {
  components: {
    MapShow,
  },
  async mounted() {
    this.tags = await MapAPI.GetMapTags();
  },
  data() {
    return {
      mode_selected: '檢視',
      action_selected: '無',
      path_plan_point_type: 'Tag',
      path_plan_point_from: 1,
      path_plan_point_to: 2,
      tags: [1, 2, 3, 59, 11]
    }
  },
  methods: {
    async SaveMapClickHandle() {
      var data = this.$refs["map"].map_data
      console.log(data);
      var success = await MapAPI.SaveMap(data);
      if (success) {
        Notifier.Success('圖資儲存成功');
        bus.emit('on_map_save_success', '');
      }
      else {
        Notifier.Danger('圖資儲存失敗');
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
}
</script>

<style lang="scss" scoped>
.map-view {
  .opts-container {
    width: 40%;
  }
}
</style>