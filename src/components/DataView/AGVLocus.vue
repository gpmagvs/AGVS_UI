<template>
  <div class="agv-locus border rounded">
    <div class="w-100 d-flex">
      <div class="menu-container bg-light p-2 border">
        <div class="border-bottom my-1 py-2">
          <div class="time-pick text-start d-flex">
            <div>
              <div class="label">{{ $t('AGVLocus.SelectAGV') }}</div>
              <AGVSelector style="width:120px;" v-model="agvname"></AGVSelector>
            </div>
            <div>
              <div class="label">{{ $t('AGVLocus.StartTime') }}</div>
              <el-date-picker
                v-model="timePick.start_time"
                type="datetime"
                placeholder="選擇開始時間"
                format="YYYY/MM/DD HH:mm:ss"
              />
            </div>
            <div>
              <div class="label">{{ $t('AGVLocus.EndTime') }}</div>
              <el-date-picker
                v-model="timePick.end_time"
                type="datetime"
                placeholder="選擇結束時間"
                format="YYYY/MM/DD HH:mm:ss"
              />
            </div>
            <el-button
              @click="HandleSearchBtnClicked"
              style="height:30px;font-size: large;width:120px;position:relative;top:16px"
              class="my-2"
              type="primary"
            >{{ $t('AGVLocus.Search') }}</el-button>
          </div>
          <!-- Row-2 -->
          <div class="time-pick text-start d-flex my-3">
            <div>
              <div class="label">{{ $t('AGVLocus.taskID') }}</div>
              <el-input v-model="conditions.taskID" clearable></el-input>
            </div>
          </div>
        </div>
        <el-table
          v-loading="loading"
          :data="tableData"
          style="width:720px"
          height="700"
          highlight-current-row
          size="small"
        >
          <el-table-column align="center" label="No" width="50">
            <template #default="scope">
              <div>{{ GetNo(scope.row) }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('AGVLocus.TaskID')" prop="task_id"></el-table-column>
          <el-table-column :label="$t('AGVLocus.StartTime')" prop="start_time">
            <template #default="scope">{{ FormatTime(scope.row.start_time) }}</template>
          </el-table-column>
          <el-table-column :label="$t('AGVLocus.EndTime')" prop="end_time">
            <template #default="scope">{{ FormatTime(scope.row.end_time) }}</template>
          </el-table-column>
          <el-table-column
            align="center"
            :label="$t('AGVLocus.CostTime')"
            prop="duration"
            min-width="60"
          >
            <template #default="scope">
              <div>
                <el-tag effect="dark" type="info">{{ CalculatTimeSpend(scope.row) }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('AGVLocus.ShowTrack')" min-width="50">
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
            <span>{{ $t('AGVLocus.TrackColor') }}</span>
            <el-color-picker @change="HandleLocusSettingChange" v-model="locus_settings.color" />
          </div>
          <div>
            <span>{{ $t('AGVLocus.TrackWidth') }}</span>
            <el-select v-model="locus_settings.width" @change="HandleLocusSettingChange">
              <el-option v-for="width in 12" :key="width" :value="width"></el-option>
            </el-select>
          </div>
          <div class="flex-fill text-end">
            <el-button type="primary">{{ $t('AGVLocus.SaveTrackMap') }}</el-button>
          </div>
        </div>
        <Map
          v-loading="locus_painting"
          class="bg-light border"
          ref="map"
          id="locus_map"
          :editable="false"
          :agv_show="false"
          :station_show="true"
          :rackInfoShow="false"
        ></Map>
      </div>
    </div>
  </div>
</template>

<script>
import AGVSelector from '@/components/AGVSelector'

import Map from '@/components/Map/Map.vue'
import { GetTasks, GetTrajectory } from '@/api/TaskAPI.js'
import { agv_states_store } from '@/store'
import { MapStore } from '@/components/Map/store'
import moment from 'moment'
export default {
  components: {
    Map, AGVSelector
  },
  computed: {
    agvNameList() {
      return agv_states_store.getters.AGVNameList;
    },
    map_station_data() {
      return MapStore.getters.MapStations
    },
  },
  data() {
    return {
      tableData: [
        {
          task_id: '',
          start_time: '2023-08-03 12:00:00',
          end_time: '2023-08-03 12:10:00',
          duration: 600,
          corrdinations: [[0, 0], [-1.2, 2.2], [-1.3, 2.3], [-1.4, 3]]
        },

      ],
      agvname: 'AGV_001',
      timePick: {
        start_time: '2023-08-03 12:00:00',
        end_time: '2023-08-04 12:00:00'
      },
      conditions: {
        taskID: ''
      },
      locus_settings: {
        color: 'red',
        width: 7,
      },
      showing_row_data: {},
      loading: false,
      locus_painting: false
    }
  },
  methods: {
    SetDefaultTimeInterval() {

    },
    GetNo(row) {
      return this.tableData.indexOf(row) + 1;
    },
    async ShowLocusHandler(row_data) {

      try {
        this.locus_painting = true;
        setTimeout(async () => {
          if (row_data.corrdinations == undefined || row_data.corrdinations.length == 0) {
            var trajData = await GetTrajectory(row_data.task_id)
            if (trajData) {
              row_data.corrdinations = trajData.coordinations.map(data => ([data.X, data.Y]))
              this.showing_row_data = row_data;
            }
          }

          try {
            if (row_data.corrdinations.length > 0)
              this.$refs.map.ShowLocus(row_data.corrdinations, this.locus_settings.color, this.locus_settings.width)
          } catch (error) {
            this.$swal.fire(
              {
                text: error.message,
                title: 'Something Wrong...',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'OK',
                customClass: 'my-sweetalert'
              })
          }
          this.locus_painting = false;
        }, 300);
      } catch (error) {
        this.$swal.fire(
          {
            text: error.response.data,
            title: '後端服務異常',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }

    },
    FormatTime(time) {
      return moment(time).format('YYYY/MM/DD HH:mm:ss')
    },
    HandleLocusSettingChange() {
      this.SaveLocusSettingsToLocalStroage();
      try {
        this.$refs.map.ShowLocus(this.showing_row_data.corrdinations, this.locus_settings.color, this.locus_settings.width)
      } catch (error) {
        console.log(error);
      }
    },
    async HandleSearchBtnClicked() {

      this.SaveLocusSettingsToLocalStroage();
      if (this.agvname == '') {
        this.$swal.fire(
          {
            text: '',
            title: '請選擇車輛',
            icon: 'warning',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }

      var startTime = moment(this.timePick.start_time).format('YYYY/MM/DD HH:mm:ss')
      var endTime = moment(this.timePick.end_time).format('YYYY/MM/DD HH:mm:ss')
      var tasklist = []
      this.loading = true;
      setTimeout(async () => {
        tasklist = await GetTasks(startTime, endTime, this.agvname, this.conditions.taskID)
        this.tableData = tasklist.map(obj => ({
          task_id: obj.TaskName,
          start_time: obj.RecieveTime,
          end_time: obj.FinishTime,
          duration: 0,
          corrdinations: undefined
        }))
        this.loading = false
      }, 200);

    },

    SaveLocusSettingsToLocalStroage() {
      localStorage.setItem('locus', JSON.stringify({ locus_paint: this.locus_settings, time: this.timePick }))
    },
    ReloadLocusSettingsFromLocalStorage() {
      var settings_json = localStorage.getItem('locus')
      if (settings_json) {
        var store = JSON.parse(settings_json);
        if (store.locus_paint)
          this.locus_settings = store.locus_paint
        if (store.time)
          this.timePick = store.time
        else {
          this.timePick.start_time = this.timePick.end_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
        }
      }
    },
    CalculatTimeSpend(row) {
      return moment(row.end_time).unix() - moment(row.start_time).unix();
    }
  },
  mounted() {
    this.SetDefaultTimeInterval();
    this.ReloadLocusSettingsFromLocalStorage();
    //假資料 
    this.tableData = []
    // for (let index = 1; index < 51; index++) {
    //   var coordinates = []
    //   for (let n = 1; n < 100; n++) {
    //     coordinates.push([(n / 50.0) + (n % index * (n % 2 == 0 ? 0.1 : -1)), n / 10])
    //   }
    //   this.tableData.push({
    //     start_time: `2022-08-03 12:${index}:00`,
    //     end_time: '2022-08-03 12:10:00',
    //     duration: 600,
    //     corrdinations: coordinates
    //   })

    // }
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
      margin-bottom: 0.32rem;
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