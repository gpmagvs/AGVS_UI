<template>
  <el-dialog
    v-model="ShowDialog"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal="false"
    draggable
    width="800"
    fullscreen
    style="z-index:29900"
  >
    <template #header="{titleId, login_title }">
      <div class="login-header">
        <h3 :id="titleId" :class="login_title">新增排程</h3>
        <el-divider></el-divider>
      </div>
    </template>
    <div class="copntent">
      <div class="d-flex text-start p-1">
        <el-form class="border px-2" style="width:545px">
          <el-form-item label="時間設定">
            <el-date-picker v-model="time" type="datetime" placeholder="選擇量測時間" />
          </el-form-item>
          <el-form-item label="區域設定">
            <div class="d-flex flex-column">
              <div>
                <el-radio-group v-model="region_mode">
                  <el-radio label="全部區域"></el-radio>
                  <el-radio label="局部選擇"></el-radio>
                </el-radio-group>
              </div>
              <div class="mx-3">已選擇Bay數量:{{ selectedBays.length }}</div>
              <div
                v-loading="region_mode!='局部選擇'"
                class="border rounded"
                element-loading-spinner="''"
                element-loading-svg-view-box="-10, -10, 50, 50"
                element-loading-background="rgba(122, 122, 122, 0.1)"
              >
                <b-tabs card>
                  <b-tab v-for="area in 1" :key="area" :title="`Area-${area}`">
                    <div class style="height:250px">
                      <el-checkbox :indeterminate="!IsAllSeclted" @change="handleSelectAll">全選</el-checkbox>
                      <el-checkbox-group v-model="selectedBays">
                        <el-checkbox
                          class="m-1"
                          v-for="bay_name in BayNames"
                          :key="bay_name"
                          :label="bay_name"
                        ></el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </b-tab>
                </b-tabs>
              </div>
            </div>
          </el-form-item>
        </el-form>
        <Map
          class="flex-fill bg-light border rounded px-1 mx-1"
          id="schedule_map"
          :agv_show="false"
        ></Map>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/components/Map/store'

export default {
  components: {
    Map,
  },
  data() {
    return {
      ShowDialog: false,
      time: '',
      region_mode: '局部選擇',
      selectedBays: []
    }
  },
  computed: {
    map_station_data() {
      return MapStore.getters.MapStations
    },
    BaysData() {
      return MapStore.getters.BaysData
    },
    BayNames() {
      return Object.keys(MapStore.getters.BaysData)
      //   return ['Bay1', 'Bay2', 'Bay3', 'Bay4', 'Bay5', 'Bay6', 'Bay7', 'Bay8', 'Bay9', 'Bay10']
    },
    IsAllSeclted() {
      return this.BayNames.length == this.selectedBays.length | this.selectedBays.length == 0;
    }

  },
  methods: {
    EditorMode(data) {
      this.time = data.time;
      this.selectedBays = data.bays;
      this.ShowDialog = true;
    },
    handleSelectAll(check) {
      if (check)
        this.selectedBays = this.BayNames;
      else
        this.selectedBays = []
    }
  },
  mounted() {
  },

}
</script>

<style lang="scss" scoped>
.copntent {
  position: relative;
  top: -50px;
  left: 70px;
  overflow: hidden;
}
</style>