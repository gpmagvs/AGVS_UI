<template>
  <div class="agv-locus border rounded">
    <div class="w-100 d-flex">
      <el-row class="w-100">
        <el-col :lg="10">
          <div class="menu-container bg-light p-2 border" ref="menuContainer">
            <div class="resize-handle" @mousedown="startResize"></div>
            <b-tabs v-model="activeTab" @activate-tab="handleTabChange">
              <b-tab title="單次任務軌跡查詢" name="single-task-traj-query">
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
                      style="height:30px;font-size: large;width:120px;position:relative;top:30px"
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
                  style="width:100%"
                  height="720"
                  highlight-current-row
                  size="small"
                  border
                >
                  <el-table-column align="center" label="No" width="50">
                    <template #default="scope">
                      <div>{{ GetNo(scope.row) }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('AGVLocus.TaskID') "
                    prop="task_id"
                    show-overflow-tooltip
                  ></el-table-column>
                  <el-table-column
                    :label="$t('AGVLocus.State')"
                    prop="state"
                    align="center"
                    width="80"
                  >
                    <template #default="scope">
                      <span
                        :style="{
                color: scope.row.state === '完成' ? '#67C23A' : 
                       scope.row.state === '失敗' ? '#F56C6C' : 
                       '#909399'
              }"
                      >{{ scope.row.state }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('AGVLocus.FromStation')" prop="from_station"></el-table-column>
                  <el-table-column :label="$t('AGVLocus.ToStation')" prop="to_station"></el-table-column>
                  <el-table-column :label="$t('AGVLocus.AGV')" prop="agv_name"></el-table-column>
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
                    min-width="80"
                  >
                    <template #default="scope">
                      <div>
                        <el-tag effect="dark" type="info">{{ CalculatTimeSpend(scope.row) }}</el-tag>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    fixed="right"
                    align="center"
                    :label="$t('AGVLocus.ShowTrack')"
                    min-width="70"
                  >
                    <template #default="scope">
                      <div class="w-100" @click="ShowLocusHandler(scope.row)">
                        <i class="view-icon bi bi-eye-fill"></i>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </b-tab>
              <b-tab active title="軌跡回顧" name="trajecort-review">
                <div class="p-3">
                  <div class="time-pick text-start d-flex">
                    <div>
                      <div class="label">{{ $t('AGVLocus.StartTime') }}</div>
                      <el-date-picker
                        v-model="timePick_TrajPlayer.start_time"
                        type="datetime"
                        placeholder="選擇開始時間"
                        format="YYYY/MM/DD HH:mm:ss"
                      />
                    </div>
                    <div>
                      <div class="label">{{ $t('AGVLocus.EndTime') }}</div>
                      <el-date-picker
                        v-model="timePick_TrajPlayer.end_time"
                        type="datetime"
                        placeholder="選擇結束時間"
                        format="YYYY/MM/DD HH:mm:ss"
                      />
                    </div>
                    <el-button
                      @click="HandleSearchTrajOnlyWithTimeRangeBtnClicked"
                      style="height:30px;font-size: large;width:120px;position:relative;top:30px"
                      type="primary"
                    >{{ $t('AGVLocus.Search') }}</el-button>
                  </div>
                  <!--  -->
                  <el-divider></el-divider>
                  <div class>
                    <div class="text-start">範圍選取</div>
                    <el-slider
                      class="w-100 px-3"
                      range
                      :format-tooltip="FormatSliderToolTip"
                      v-model="trajPlayTimeOffset"
                      :max="totalSecOfTrajRePlay"
                      @change="HandleRecordPlaySliderChanged"
                    ></el-slider>
                    <div class="d-flex justify-content-between">
                      <label>{{ recordPlayStartTimeMoment.format('YYYY/MM/DD HH:mm:ss') }}</label>
                      <label>{{ recordPlayEndTimeMoment.format('YYYY/MM/DD HH:mm:ss') }}</label>
                    </div>
                    <el-divider></el-divider>
                    <div class="d-flex align-items-center mb-2">
                      <el-checkbox
                        class="ms-auto"
                        v-model="showAllTracks"
                        :indeterminate="isIndeterminate"
                        @change="handleShowAllChange"
                      >{{ showAllTracks ? '全部隱藏' : '全部顯示' }}</el-checkbox>
                    </div>
                    <el-table :data="trajPlayWindowDatas" border height="700" style="width:100%">
                      <el-table-column label="時間" prop="Time">
                        <template #default="scope">
                          <div>{{ FormatTime(scope.row.Time) }}</div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="TaskName" label="任務名稱" show-overflow-tooltip></el-table-column>
                      <el-table-column prop="AGVName" label="車輛名稱"></el-table-column>
                      <!-- <el-table-column prop="Coordinations" label="軌跡"></el-table-column> -->
                      <el-table-column label="Action">
                        <template #default="scope">
                          <div>
                            <el-icon
                              :size="20"
                              v-if="scope.row.isShowing"
                              @click="ToggleLocus(scope.row)"
                            >
                              <View />
                            </el-icon>
                            <el-icon :size="20" v-else @click="ToggleLocus(scope.row)">
                              <Hide />
                            </el-icon>
                            <el-button
                              type="text"
                              @click="HandlePlayFromThisTime(scope.row)"
                            >從此時間開始播放</el-button>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                    <!-- <pre>
                  {{trajPlayWindowDatas}}
                    </pre>-->
                  </div>
                </div>
              </b-tab>
            </b-tabs>
          </div>
        </el-col>
        <el-col :lg="14" class="d-flex flex-column">
          <player
            ref="player"
            :disabled="activeTab != 1"
            @onplay="HandlePlayerPlay"
            @onstop="HandlePlayerStop"
            @onpause="HandlePlayerPause"
            @onskipstart="HandlePlayerSkipStart"
            @onskipend="HandlePlayerSkipEnd"
          ></player>
          <div class="bg-light border flex-fill">
            <div class="locus-settings bg-dark text-light d-flex py-1 px-3">
              <div class="d-flex">
                <span style="white-space: nowrap">{{ $t('AGVLocus.TrackColor') }}</span>
                <el-color-picker @change="HandleLocusSettingChange" v-model="locus_settings.color" />
              </div>
              <div class="d-flex">
                <span style="white-space: nowrap">{{ $t('AGVLocus.TrackWidth') }}</span>
                <el-select
                  v-model="locus_settings.width"
                  @change="HandleLocusSettingChange"
                  style="width: 80px"
                >
                  <el-option v-for="width in 32" :key="width" :value="width"></el-option>
                </el-select>
              </div>
              <div class="ms-auto">
                <el-button type="primary" @click="saveMapImage">{{ $t('AGVLocus.SaveTrackMap') }}</el-button>
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
              :eq_lduld_status_show="false"
            ></Map>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import AGVSelector from '@/components/AGVSelector'
import Map from '@/components/Map/Map.vue'
import { GetTasks, GetTrajectory, GetTrajectorysWithTimeRange } from '@/api/TaskAPI.js'
import { agv_states_store } from '@/store'
import { MapStore } from '@/components/Map/store'
import moment from 'moment'
import { View, Hide } from '@element-plus/icons-vue'
import player from '../General/Player.vue'
export default {
  components: {
    Map, AGVSelector, View, Hide, player
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
      activeTab: 0,
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
      timePick_TrajPlayer: {
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
      locus_painting: false,
      trajPlayDataStore: [{
        TaskName: "",
        AGVName: "",
        Coordinations: [{ Time: '', X: 0, Y: 0 }]
      }],
      trajPlayWindowDatas: [{
        TaskName: "",
        AGVName: "",
        Time: '',
        Coordinations: [{ Time: '', X: 0, Y: 0 }]
      }],
      trajPlayTimeOffset: [0, 0],
      totalSecOfTrajRePlay: 0,
      debunceTimeout: null,
      recordPlayStartTimeMoment: moment(),
      recordPlayEndTimeMoment: moment(),
      taskColors: {},
      menuContainerWidth: 820,
      menuContainerResize: false,
      menuContainerResizeStartX: 0,
      menuContainerResizeStartY: 0,
      menuContainerResizeStartWidth: 0,
      menuContainerResizeStartHeight: 0,
      showAllTracks: true,
      isIndeterminate: false,
      playInterval: undefined,
      isPlayPause: false

    }
  },
  methods: {
    handleTabChange(current, previous) {
      if (current != 1 && this.$refs.player) {
        this.$refs.player.stop();
        clearInterval(this.playInterval);
      }
    },
    handleShowAllChange(val) {
      this.isIndeterminate = false;
      this.trajPlayWindowDatas.forEach(item => {
        item.isShowing = val;
        if (item.isShowing)
          this.$refs.map.ShowLocusByID(item.TaskName)
        else
          this.$refs.map.HideLocusByID(item.TaskName)
      });
    },

    startResize(event) {
      this.menuContainerResize = true;
      this.menuContainerResizeStartX = event.clientX;
      this.menuContainerResizeStartY = event.clientY;
      this.menuContainerResizeStartWidth = this.$refs.menuContainer.clientWidth;
      this.menuContainerResizeStartHeight = this.$refs.menuContainer.clientHeight;
    },

    async handleTaskNameQuery(taskName, agvName) {
      this.loading = true;
      this.$refs.map?.ClearLocus();

      setTimeout(async () => {
        this.timePick.end_time = Date.now() + 1000 * 60 * 60 * 24;
        this.tableData = [];
        this.conditions.taskID = taskName;
        this.agvname = agvName;
        await this.HandleSearchBtnClicked();

        const checkLoading = () => {
          if (!this.loading && this.tableData.length > 0) {
            this.ShowLocusHandler(this.tableData[0]);
          } else if (this.loading) {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      }, 400);
    },
    saveMapImage() {
      this.$refs.map.saveMapImage(`AGV_Locus_Map_${this.agvname}_${this.showing_row_data.task_id}_${Date.now()}.png`);
    },
    SetDefaultTimeInterval() {
      this.timePick_TrajPlayer.end_time = moment(Date.now()).format('YYYY/MM/DD HH:mm:ss')
      this.timePick_TrajPlayer.start_time = moment(Date.now()).add(-1, 'days').format('YYYY/MM/DD HH:mm:ss')
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

            this.$refs.map.ClearLocus();
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
    FormatSliderToolTip(value) {
      try {
        return moment(this.timePick_TrajPlayer.start_time).add(value, "second").format('YYYY/MM/DD HH:mm:ss')
      } catch (error) {
        return 'error'
      }
    },
    HandleLocusSettingChange() {
      this.SaveLocusSettingsToLocalStroage();
      try {
        this.$refs.map.ShowLocus(this.showing_row_data.corrdinations, this.locus_settings.color, this.locus_settings.width)
      } catch (error) {
        console.log(error);
      }
    },
    async HandleSearchTrajOnlyWithTimeRangeBtnClicked() {
      this.$refs.player.stop();
      clearInterval(this.playInterval);
      this.trajPlayWindowDatas = [];
      var startTimeMoment = moment(this.timePick_TrajPlayer.start_time);
      var startTimeQuery = startTimeMoment.format('YYYY/MM/DD HH:mm:ss')
      var endTimeMoment = moment(this.timePick_TrajPlayer.end_time);
      var endTimeQuery = endTimeMoment.format('YYYY/MM/DD HH:mm:ss')

      this.trajPlayTimeOffset = [0, 0];
      this.totalSecOfTrajRePlay = endTimeMoment.diff(startTimeMoment) / 1000;
      this.trajPlayDataStore = await GetTrajectorysWithTimeRange(startTimeQuery, endTimeQuery)
      if (this.trajPlayDataStore && this.trajPlayDataStore.length > 0) {
        // Get first timestamp from first coordination point of first trajectory
        const firstTraj = this.trajPlayDataStore[0];
        if (firstTraj.Coordinations && firstTraj.Coordinations.length > 0) {
          const firstTimestamp = moment(firstTraj.Coordinations[0].Time);
          this.trajPlayTimeOffset[0] = firstTimestamp.diff(startTimeMoment) / 1000;
          this.trajPlayTimeOffset[1] = this.totalSecOfTrajRePlay;
          console.log('First timestamp:', firstTimestamp.format('YYYY/MM/DD HH:mm:ss'));
          setTimeout(() => {
            this.HandleRecordPlaySliderChanged();
          }, 500);
        }
      }
    },
    ToggleLocus(row) {
      row.isShowing = !row.isShowing;
      if (row.isShowing)
        this.$refs.map.ShowLocusByID(row.TaskName)
      else
        this.$refs.map.HideLocusByID(row.TaskName)
    },
    HandleRecordPlaySliderChanged() {
      if (this.debunceTimeout)
        clearTimeout(this.debunceTimeout)
      this.debunceTimeout = setTimeout(() => {
        //alert('Debunce')
        this.ShowLocusByTimeOffset();
      }, 100);
    },
    ShowLocusByTimeOffset() {
      var startTimeMoment = moment(this.timePick_TrajPlayer.start_time);
      this.recordPlayStartTimeMoment = startTimeMoment.clone();
      this.recordPlayStartTimeMoment.add(this.trajPlayTimeOffset[0], "second");
      this.recordPlayEndTimeMoment = startTimeMoment.clone();
      this.recordPlayEndTimeMoment.add(this.trajPlayTimeOffset[1], "second")

      this.trajPlayWindowDatas = this.trajPlayDataStore.filter(item => {
        return item.Coordinations.some(pt =>
          moment(pt.Time) >= this.recordPlayStartTimeMoment &&
          moment(pt.Time) <= this.recordPlayEndTimeMoment
        );
      }).map(item => {
        return {
          TaskName: item.TaskName,
          AGVName: item.AGVName,
          Time: item.Coordinations.filter(pt => moment(pt.Time) >= this.recordPlayStartTimeMoment && moment(pt.Time) <= this.recordPlayEndTimeMoment)[0].Time,
          Coordinations: item.Coordinations.filter(pt => moment(pt.Time) >= this.recordPlayStartTimeMoment && moment(pt.Time) <= this.recordPlayEndTimeMoment).map(pt => ([pt.X, pt.Y])),
          isShowing: true
        }
      });
      // Sort trajPlayWindowDatas by Time
      this.trajPlayWindowDatas.sort((a, b) => moment(a.Time).valueOf() - moment(b.Time).valueOf());
      this.$refs.map.ClearLocus();
      // Create a map to store task colors if it doesn't exist
      if (!this.taskColors) {
        this.taskColors = {};
      }

      this.trajPlayWindowDatas.forEach(element => {
        if (element.Coordinations.length > 0) {
          // Get existing color or generate random color for task
          let taskColor = this.taskColors[element.TaskName];
          if (!taskColor) {
            // Generate random hex color
            taskColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
            this.taskColors[element.TaskName] = taskColor;
          }
          this.$refs.map.ShowLocus(element.Coordinations, taskColor, this.locus_settings.width, taskColor, element.TaskName)
        }
      });
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
      this.$refs.map.ClearLocus();
      this.loading = true;
      setTimeout(async () => {
        tasklist = await GetTasks(startTime, endTime, this.agvname, this.conditions.taskID)
        this.tableData = tasklist
          .sort((a, b) => new Date(b.RecieveTime) - new Date(a.RecieveTime))
          .map(obj => ({
            task_id: obj.TaskName,
            agv_name: obj.DesignatedAGVName,
            start_time: obj.RecieveTime,
            end_time: obj.FinishTime,
            duration: 0,
            state: obj.StateName,
            from_station: this.GetStationName(obj.From_Station_Tag),
            to_station: this.GetStationName(obj.To_Station_Tag),
            corrdinations: undefined
          }));
        this.loading = false
      }, 200);

    },
    GetStationName(tagNumber) {
      const stations = Object.values(MapStore.state.MapData.Points);
      const station = stations.find(station => station.TagNumber == tagNumber);
      if (station && station.Graph)
        return station.Graph.Display;
      else
        return '';
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
    },
    HandlePlayerPlay() {
      this.playInterval = setInterval(() => {
        this.trajPlayTimeOffset[1] = this.trajPlayTimeOffset[1] + 1;
        console.log('play', this.trajPlayTimeOffset)
        this.ShowLocusByTimeOffset();
        if (this.trajPlayTimeOffset[1] >= this.totalSecOfTrajRePlay) {
          clearInterval(this.playInterval);
          this.$refs.player.stop();
        }
      }, 100);
      this.isPlayPause = false;
    },
    HandlePlayerStop() {
      clearInterval(this.playInterval);
      this.trajPlayTimeOffset[1] = this.trajPlayTimeOffset[0] + 1;
      this.isPlayPause = false;
    },
    HandlePlayerPause() {
      this.isPlayPause = true;
      clearInterval(this.playInterval);
    },
    HandlePlayerSkipStart() {
      this.isPlayPause = false;
    },
    HandlePlayerSkipEnd() {
      this.isPlayPause = false;
    },
    HandlePlayFromThisTime(row) {
      this.trajPlayTimeOffset[0] = moment(row.Time).diff(moment(this.timePick_TrajPlayer.start_time)) / 1000;
      this.trajPlayTimeOffset[1] = this.trajPlayTimeOffset[0] + 1;
      this.$refs.player.stop();
      this.$refs.player.play();
    },
  },

  mounted() {
    this.SetDefaultTimeInterval();
    this.ReloadLocusSettingsFromLocalStorage();
    if (this.$route.query.taskName) {
      this.handleTaskNameQuery(this.$route.query.taskName, this.$route.query.agvName);
    }
  },

  watch: {
    '$route.query': {
      handler(newVal) {
        if (newVal.taskName) {
          this.handleTaskNameQuery(newVal.taskName, newVal.agvName);
        }
      },
      deep: true
    },

    '$route'(to, from) {
      if (to.path !== from.path) {
        this.$refs.map.HiddenAgvLayer();
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.agv-locus {
  .menu-container {
    width: 100%;
    .time-pick {
      .label {
        font-weight: bold;
        letter-spacing: 2px;
        margin-bottom: 0.32rem;
      }
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