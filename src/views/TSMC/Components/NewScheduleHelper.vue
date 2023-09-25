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
        <div class="options border p-2" style="width:700px">
          <div class="border rounded p-2 my-2">
            <div class="label"><i class="bi bi-clock"></i>時間設定</div>
            <el-time-picker format="HH:mm" v-model="schedule_settigs.Time" type=" time" placeholder="選擇量測時間" />
          </div>
          <div class="border rounded  p-2 my-2">
            <div class="label"><i class="bi bi-truck-front"></i>指派車輛</div>
            <el-select v-model="schedule_settigs.AGVName" placeholder="選擇車輛" style="width: 220px">
              <el-option
                v-for="agv_name in AgvNameList"
                :key="agv_name"
                :label="agv_name"
                :value="agv_name"></el-option>
            </el-select>
          </div>
          <div class="border rounded  p-2 my-2">
            <div class="label"><i class="bi bi-geo"></i>量測Bay選取</div>
            <div class="d-flex flex-column">
            </div>
            <div>
              <div class style="height:350px">
                <el-table border :data="BayTableData" ref="table_ref" @selection-change="handleSelectionChange">
                  <el-table-column type="selection" label="選取">
                  </el-table-column>
                  <el-table-column prop="BayName" label="Bay名稱" width="100"></el-table-column>
                  <el-table-column prop="BayName" label="量測點" width="400">
                    <template #default="scope">
                      <el-select v-model="scope.row.SelectedPointNames" multiple style="width: 100%" @change="HandlePointsSelectedChange">
                        <el-option v-for="pt in scope.row.PointNames" :key="pt" :label="pt" :value="pt"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="量測順序">
                    <template #default="scope">
                      <el-select v-model="scope.row.Sequence">
                        <el-option v-for="Sequence in SequenceList" :key="Sequence" :label="Sequence" :value="Sequence"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <b-button :disabled="schedule_settigs.AGVName == '' || schedule_settigs.Time == ''" @click="HandleAddNewScheduleClick" style="cursor: pointer;" class="w-100 my-3" variant="primary"> {{ edit_mode ? '修改' : '新增排程' }} </b-button>
        </div>
        <Map
          class=" bg-light border rounded px-1 mx-1"
          id="schedule_map"
          :agv_show="false"
          style="padding-right: 10px;width: 900px;"></Map>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { MapStore } from '@/components/Map/store'
import { agv_states_store } from '@/store'
import moment from 'moment'
import { GetBayTable } from '@/api/MeasureScript'
export default {
  components: {
    Map,
  },
  props: {
    edit_mode: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      ShowDialog: false,
      Title: '新增量測排程',
      region_mode: '局部選擇',
      schedule_settigs: {
        Time: '1991/12/20 12:10:20',
        Bays: [],
        AGVName: 'AGV_001',
        ScriptName: 'script_name',
      },
      BayTableData: [
        {
          BayName: 'Bay1',
          PointNames: ['AAA12', '2', '3'],
          SelectedPointNames: ['AAA12', '3'],
          Sequence: 1
        },
        {
          BayName: 'Bay2',
          PointNames: ['1', '2', '3'],
          SelectedPointNames: ['1', '3'],
          Sequence: 2
        }
      ],
      SequenceList: []

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
      return this.BayNames.length == this.schedule_settigs.Bays.length | this.schedule_settigs.Bays.length == 0;
    },
    AgvNameList() {
      return agv_states_store.getters.AGVNameList
    }

  },
  methods: {
    EditorMode(data) {
      this.Title = `排程量測 - ${moment(data.Time).format('HH:mm')}`;
      this.schedule_settigs = data;

      //決定要勾選哪幾個Row
      setTimeout(() => {
        data.Bays.forEach(bay => {
          var bay_name = bay.BayName;
          var row = this.BayTableData.find(bay_row => bay_row.BayName == bay_name)
          if (row) {
            row.SelectedPointNames = bay.SelectedPointNames
            row.Sequence = bay.Sequence
            this.$refs["table_ref"].toggleRowSelection(row, true);
          }
        });


      }, 200);

      this.ShowDialog = true;
    },
    handleSelectAll(check) {
      if (check)
        this.schedule_settigs.Bays = this.BayNames;
      else
        this.schedule_settigs.Bays = []
    },
    HandleSelectionChange(selection) {
      alert(JSON.stringify(selection))

    },
    HandleRowClick(row, column, cell, event) {
      alert(JSON.stringify(row))

    },
    HandleAddNewScheduleClick() {
      alert(JSON.stringify(this.schedule_settigs))
    },
    handleSelectionChange(vals) {
      //this.SelectedBays = vals;

      this.schedule_settigs.Bays = []
      vals.forEach(row => {
        this.schedule_settigs.Bays.push(row)
      })
      debugger
    },
    HandlePointsSelectedChange(points) {
      alert(JSON.stringify(points))
    }
  },
  mounted() {
    GetBayTable().then(dat => {
      this.BayTableData = dat;
      this.SequenceList = []
      var bays_count = this.BayTableData.length;
      for (let index = 0; index < bays_count; index++) {
        this.SequenceList.push(index + 1)
      }
    })
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

      i {
        margin-right: 4px;
      }
    }
  }
}
</style>