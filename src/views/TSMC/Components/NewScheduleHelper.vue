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
    style="z-index:29900">
    <template #header="{ titleId, login_title }">
      <div class="login-header">
        <h3 :id="titleId" :class="login_title">{{ Title }}</h3>
        <el-divider></el-divider>
      </div>
    </template>
    <div class="copntent">
      <div class="d-flex text-start p-1">
        <div class="options border p-2" style="width:545px">
          <div class="label"><i class="bi bi-clock"></i>時間設定</div>
          <el-time-picker format="HH:mm" v-model="schedule_settigs.time" type="datetime" placeholder="選擇量測時間" />
          <div class="label"><i class="bi bi-truck-front"></i>指派車輛</div>
          <el-select format="HH:mm" v-model="schedule_settigs.agv_name" placeholder="選擇車輛">
            <el-option
              v-for="agv_name in AgvNameList"
              :key="agv_name"
              :label="agv_name"
              :value="agv_name"></el-option>
          </el-select>
          <div class="label"><i class="bi bi-geo"></i>量測Bay選取</div>
          <div class="d-flex flex-column">
            <!-- <div>
                <el-radio-group v-model="region_mode">
                  <el-radio label="全部區域"></el-radio>
                  <el-radio label="局部選擇"></el-radio>
                </el-radio-group>
              </div> -->
            <div
              v-loading="region_mode != '局部選擇'"
              class="border rounded"
              element-loading-spinner="''"
              element-loading-svg-view-box="-10, -10, 50, 50"
              element-loading-background="rgba(122, 122, 122, 0.1)">
              <div class style="height:250px">
                <el-checkbox :indeterminate="!IsAllSeclted" @change="handleSelectAll">全選</el-checkbox>
                <el-checkbox-group v-model="schedule_settigs.bays">
                  <el-checkbox
                    class="m-1"
                    v-for="bay_name in BayNames"
                    :key="bay_name"
                    :label="bay_name"></el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <Map
          class="flex-fill bg-light border rounded px-1 mx-1"
          id="schedule_map"
          :agv_show="false"
          style="padding-right: 10px;"></Map>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/components/Map/store'
import { agv_states_store } from '@/store'
import moment from 'moment'
export default {
  components: {
    Map,
  },
  data() {
    return {
      ShowDialog: false,
      Title: '新增量測排程',
      region_mode: '局部選擇',
      schedule_settigs: {
        time: '',
        agv_name: '',
        bays: []
      }
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
      return this.BayNames.length == this.schedule_settigs.bays.length | this.schedule_settigs.bays.length == 0;
    },
    AgvNameList() {
      return agv_states_store.getters.AGVNameList
    },

  },
  methods: {
    EditorMode(data) {
      this.Title = '排程量測 : ' + moment(data.time).format('HH:mm')
      this.schedule_settigs = data;
      this.ShowDialog = true;
    },
    handleSelectAll(check) {
      if (check)
        this.schedule_settigs.bays = this.BayNames;
      else
        this.schedule_settigs.bays = []
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

  .options {
    .label {
      font-weight: bold;
      font-size: 20px;
      letter-spacing: 3px;
      margin: 10px auto;
    }
  }
}
</style>