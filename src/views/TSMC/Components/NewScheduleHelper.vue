<template>
  <el-dialog
    v-model="ShowDialog"
    :show-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
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
            <el-time-picker format="HH:mm" v-model="schedule_settigs.Time" type="time" placeholder="選擇量測時間" />
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
                      <el-select @click="HandlePointsColumnClick(scope.row)" v-model="scope.row.SelectedPointNames" multiple style="width: 100%" @change="HandlePointsSelectedChange">
                        <el-option v-for="pt in scope.row.PointNames" :key="pt" :label="pt" :value="pt"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="量測順序">
                    <template #default="scope">
                      <el-select v-model="scope.row.Sequence" @click="HandlePointsColumnClick(scope.row)" @change="HandleSequenceChange">
                        <el-option v-for="Sequence in SequenceList" :key="Sequence" :label="Sequence" :value="Sequence"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
          <b-button :disabled="IsNoBaySelected || schedule_settigs.AGVName == '' || schedule_settigs.Time == ''" @click="HandleAddNewScheduleClick" style="cursor: pointer;" class="w-100 my-3" variant="primary"> {{ edit_mode ? '修改' : '新增排程' }} </b-button>
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
import { AddNewMeasureSchedule, ModifyMeasureSchedule } from '@/api/MeasureResultAPI.js'

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
      selected_row: {},
      previous_seq: 0,
      modified: {
        Time: '',
        AGVName: ''
      },
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
    },
    IsNoBaySelected() {
      return this.BayTableData.every(row => row.Selected == false);
    }

  },
  methods: {
    async Show() {
      this.ShowDialog = true;
      this.CreateDafualt(true);
    },
    EditorMode(data) {
      this.CreateDafualt(false);
      var time = moment(data.Time).format('HH:mm');
      this.Title = `排程量測 - ${time}`;
      this.modified.Time = time
      this.modified.AGVName = data.AGVName
      this.schedule_settigs = data;
      //決定要勾選哪幾個Row
      setTimeout(() => {
        var selected_baynames = data.Bays.map(bay => bay.BayName)

        this.BayTableData.forEach(row => {
          var selected = selected_baynames.includes(row.BayName)
          debugger
          row.Selected = selected;
          if (selected) {
            var bay = data.Bays.find(b => b.BayName == row.BayName)
            row.SelectedPointNames = bay.SelectedPointNames
            row.Sequence = bay.Sequence

          }
          this.$refs["table_ref"].toggleRowSelection(row, selected);
        })
      }, 420);

      this.ShowDialog = true;
    },
    CreateDafualt(default_selcted) {
      GetBayTable().then(dat => {
        this.BayTableData = dat;
        this.SequenceList = []
        var bays_count = this.BayTableData.length;
        for (let index = 0; index < bays_count; index++) {
          this.SequenceList.push(index + 1)
        }
        setTimeout(() => {
          this.BayTableData.forEach(row => {
            if (row) {
              row.Selected = default_selcted
              this.$refs["table_ref"].toggleRowSelection(row, default_selcted);
            }
          });
        }, 200);
      })
    },
    HandlePointsColumnClick(row) {
      this.selected_row = row;
      this.previous_seq = row.Sequence;
    },
    async HandleAddNewScheduleClick() {
      debugger
      this.schedule_settigs.Bays = this.BayTableData.filter(row => row.Selected)
      var submit_data = JSON.parse(JSON.stringify(this.schedule_settigs));
      submit_data.Time = moment(submit_data.Time).format('HH:mm')
      this.ShowDialog = false;
      this.$swal.fire(
        {
          html: `<b>時間:</b>${submit_data.Time} <br/><b>AGV:</b>${submit_data.AGVName} <br/><b>量測Bay數量:</b>${submit_data.Bays.length}`,
          title: this.edit_mode ? '確定要修改此排程' : '確定要新增此排程?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (ret) => {
          if (ret.isConfirmed) {

            var result = { result: false, message: '' }
            if (this.edit_mode)
              result = await ModifyMeasureSchedule(this.modified.Time, this.modified.AGVName, submit_data)
            else
              result = await AddNewMeasureSchedule(submit_data)
            this.$swal.fire(
              {
                text: '',
                title: this.edit_mode ? (result.result ? '修改成功' : '修改失敗') : (result.result ? '新增成功' : '新增失敗'),
                icon: result.result ? 'success' : 'error',
                showCancelButton: false,
                confirmButtonText: 'OK',
                customClass: 'my-sweetalert'
              }).then(() => {
                this.ShowDialog = true;
              })
            this.$emit('on_submit', '')
          } else {

            this.ShowDialog = true;
          }
        })


    },
    HandlePointsSelectedChange(points) {
      this.selected_row.SelectedPointNames = points
    },
    HandleSequenceChange(seq) {
      var row_seq_ocuupy = this.BayTableData.find(row => row.Sequence == seq)
      row_seq_ocuupy.Sequence = this.previous_seq;
      this.selected_row.Sequence = seq
    },
    handleSelectionChange(rows_seclted) {
      debugger
      var baynames = rows_seclted.map(row => row.BayName)
      this.BayTableData.forEach(row => {
        row.Selected = baynames.includes(row.BayName)
      })
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

      i {
        margin-right: 4px;
      }
    }
  }
}
</style>