<template>
  <div class="agv-locus border rounded">
    <div class="w-100 d-flex">
      <div class="menu-container bg-light p-2 border">
        <div class="border-bottom my-1 py-2" style="width:550px">
          <div class="time-pick text-start d-flex">
            <div>
              <div class="label">車輛選擇</div>
              <el-select></el-select>
            </div>
            <div>
              <div class="label">開始時間</div>
              <el-date-picker v-model="timePick.start_time" type="datetime" placeholder="選擇開始時間" />
            </div>
            <div>
              <div class="label">結束時間</div>
              <el-date-picker v-model="timePick.end_time" type="datetime" placeholder="選擇結束時間" />
            </div>
          </div>
          <el-button style="height:50px;font-size: large;" class="w-100 my-2" type="primary">搜尋</el-button>
        </div>
        <el-table :data="tableData" style="width:560px" height="600" highlight-current-row>
          <el-table-column align="center" label="No" width="50">
            <template #default="scope">
              <div>{{GetNo(scope.row)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="開始時間" prop="start_time"></el-table-column>
          <el-table-column label="結束時間" prop="end_time"></el-table-column>
          <el-table-column align="center" label="巡檢時間(秒)" prop="duration" min-width="60">
            <template #default="scope">
              <div>
                <el-tag effect="dark" type="info">{{ scope.row.duration }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="顯示軌跡" min-width="50">
            <template #default="scope">
              <div class="w-100" @click="ShowLocusHandler(scope.row)">
                <i class="view-icon bi bi-eye-fill"></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bg-light border flex-fill">
        <div class="locus-settings bg-dark text-light d-flex py-1 px-3">
          <div>
            <span>軌跡顏色</span>
            <el-color-picker @change="HandleLocusSettingChange" v-model="locus_settings.color" />
          </div>
          <div>
            <span>軌跡寬度</span>
            <el-select v-model="locus_settings.width" @change="HandleLocusSettingChange">
              <el-option v-for="width in 12" :key="width" :value="width"></el-option>
            </el-select>
          </div>
          <div class="flex-fill text-end">
            <el-button type="primary">儲存軌跡圖</el-button>
          </div>
        </div>
        <Map
          class="bg-light border"
          ref="map"
          :editable="false"
          :agv_show="false"
          :station_show="false"
        ></Map>
      </div>
    </div>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
export default {
  components: {
    Map,
  },
  data() {
    return {
      tableData: [
        {
          start_time: '2022-08-03 12:00:00',
          end_time: '2022-08-03 12:10:00',
          duration: 600,
          corrdinations: [[0, 0], [-1.2, 2.2], [-1.3, 2.3], [-1.4, 3]]
        },
        {
          start_time: '2022-08-03 12:00:00',
          end_time: '2022-08-03 12:10:00',
          duration: 600,
          corrdinations: [[0, 0], [5.2, 2.2], [5, 15.3], [-21.4, -2.3]]
        },
        {
          start_time: '2022-08-03 12:00:00',
          end_time: '2022-08-03 12:10:00',
          duration: 600,
          corrdinations: [[0, 0], [-4.2, 2.2], [-3.3, 5.3], [31.4, 1]]
        }
      ],
      timePick: {
        start_time: '2022-08-03 12:00:00',
        end_time: '2022-08-04 12:00:00'
      },
      locus_settings: {

        color: 'red',
        width: 1,
      },
      showing_row_data: {}
    }
  },
  methods: {
    GetNo(row) {
      return this.tableData.indexOf(row) + 1;
    },
    ShowLocusHandler(row_data) {
      this.showing_row_data = row_data;
      this.$refs.map.ShowLocus(row_data.corrdinations, this.locus_settings.color, this.locus_settings.width)
    },
    HandleLocusSettingChange() {
      this.SaveLocusSettingsToLocalStroage();
      this.$refs.map.ShowLocus(this.showing_row_data.corrdinations, this.locus_settings.color, this.locus_settings.width)
    },
    SaveLocusSettingsToLocalStroage() {
      localStorage.setItem('locus', JSON.stringify(this.locus_settings))
    },
    ReloadLocusSettingsFromLocalStorage() {
      var settings_json = localStorage.getItem('locus')
      if (settings_json) {
        this.locus_settings = JSON.parse(settings_json)
      }
    }
  },
  mounted() {

    this.ReloadLocusSettingsFromLocalStorage();
    //假資料 
    this.tableData = []
    for (let index = 1; index < 51; index++) {
      var coordinates = []
      for (let n = 1; n < 100; n++) {
        coordinates.push([(n / 50.0) + (n % index * (n % 2 == 0 ? 0.1 : -1)), n / 10])
      }
      this.tableData.push({
        start_time: `2022-08-03 12:${index}:00`,
        end_time: '2022-08-03 12:10:00',
        duration: 600,
        corrdinations: coordinates
      })

    }
  },
}
</script>

<style lang="scss" scoped>
.agv-locus {
  padding-right: 3%;
  .time-pick {
    .label {
      font-weight: bold;
      letter-spacing: 2px;
    }
  }
  .view-icon:hover {
    cursor: pointer;
    font-size: large;
  }

  .locus-settings {
    span {
      font-weight: bold;
    }
    span,
    div {
      margin-right: 10px;
    }
  }
}
</style>