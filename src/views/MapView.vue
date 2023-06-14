<template>
  <div class="map-view h-100 d-flex flex-row my-1">
    <div class="opts-container mx-1 p-2 border">
      <div class="border-bottom mb-2 py-2 text-start">
        <b-button
          class="mx-1"
          variant="primary"
          @click="SaveMapClickHandle"
          :disabled="!IsEditable"
        >儲存圖資</b-button>
        <b-button class="mx-1" variant="danger" :disabled="!IsEditable">重新載入</b-button>
        <!-- <b-button class="mx-1" variant="info">產生新地圖</b-button> -->
      </div>

      <el-form class="px-2 pt-3" label-width="80px" label-position="left">
        <el-form-item label="模式">
          <el-radio-group v-model="mode_selected" @change="EditModeEnableChanged">
            <el-radio-button label="檢視" />
            <el-radio-button label="編輯" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="編輯動作">
          <el-radio-group v-model="edit_mode_opts.action_selected" @change="EditActionChanged">
            <el-radio-button :disabled="!IsEditable" label="無" />
            <el-radio-button :disabled="!IsEditable" label="編輯點位" />
            <el-radio-button :disabled="!IsEditable" label="新增點位" />
            <el-radio-button :disabled="!IsEditable" label="移除點位" />
            <el-radio-button :disabled="!IsEditable" label="新增路徑" />
            <el-radio-button :disabled="!IsEditable" label="移除路徑" />
          </el-radio-group>
        </el-form-item>
      </el-form>

      <!--路徑規劃-->
      <!-- 
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
      </div>-->
    </div>
    <MapShow
      ref="map"
      :only_view="false"
      :show_agv="false"
      :edit_mode="edit_mode_opts"
      style="height:100%;width: 100%;"
    ></MapShow>
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
      edit_mode_opts: {
        enabled: false,
        action_selected: '無',
        mode_selected: 'point'
      },
      mode_selected: '檢視',
      path_plan_point_type: 'Tag',
      path_plan_point_from: 1,
      path_plan_point_to: 2,
      tags: [1, 2, 3, 59, 11]
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
    async SaveMapClickHandle() {
      var data = this.$refs["map"].map_data
      console.log(data);
      var success = await MapAPI.SaveMap(data);
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