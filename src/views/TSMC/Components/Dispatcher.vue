<template>
  <div class="dispatcher border rounded p-2">
    <b-tabs>
      <b-tab title="排程派車">
        <div class="d-flex p-2 border">
          <div>
            <b-button
              @click="() => {
                $refs.schedule_add_helper.ShowDialog = true
              }"
              variant="primary">新增排程</b-button>
          </div>
          <div class="border mx-2">
            <label class="bg-primary text-light w-100">排程列表({{ SecheulData.length }})</label>
            <el-table
              style="height:350px"
              :data="SecheulData"
              highlight-current-row
              @row-click="(row, column, event) => { selectedScheduleData = row }">
              <!-- <el-table-column label="No" width="80">
                <template #default="scope">排程-{{ GetRowIndex(scope.row) + 1 }}</template>
              </el-table-column> -->
              <el-table-column label="時間" min-width="160" prop="Time"></el-table-column>
              <el-table-column label="車輛" min-width="160" prop="AGVName"></el-table-column>
              <el-table-column label="Bay數量" min-width="160" prop="Bays">
                <template #default="scope"> {{ scope.row.Bays.length }} </template>
              </el-table-column>
              <el-table-column label="操作" min-width="150">
                <template #default="scope">
                  <el-button size="small" type="primary" @click="EditBtnClickHandler">檢視</el-button>
                  <el-button size="small" type="danger">刪除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </b-tab>
      <b-tab title="即時派車">
        <div class=" p-2 border"></div>
      </b-tab>
    </b-tabs>
    <NewScheduleHelper ref="schedule_add_helper"></NewScheduleHelper>
    <NewScheduleHelper :edit_mode="true" ref="schedule_edit_helper"></NewScheduleHelper>
  </div>
</template>

<script>
import NewScheduleHelper from './NewScheduleHelper.vue'
import moment from 'moment'
import { GetSchedules } from '@/api/MeasureResultAPI.js'
export default {
  components: {
    NewScheduleHelper,
  },
  data() {
    return {
      SecheulData: [
        {
          Time: '1991/12/20 12:10:20',
          Bays: [],
          AGVName: 'AGV_001',
          ScriptName: 'script_name',
        },
      ],
      selectedScheduleData: {},
      ShowScheduleDetail: false
    }
  },
  methods: {
    GetRowIndex(row) {
      return this.SecheulData.indexOf(row)
    },
    EditBtnClickHandler() {
      setTimeout(() => {
        var dateStr = moment(Date.now()).format('yyyy/MM/DD')
        var clone_ = JSON.parse(JSON.stringify(this.selectedScheduleData))

        clone_.Time = dateStr + ' ' + clone_.Time;
        this.$refs.schedule_edit_helper.EditorMode(clone_)
      }, 0.5);
    },
    FormatTime(row, column, cellValue, index) {
      return moment(cellValue).format("HH:mm")
    },
    async GetSchedulesFromBackend() {
      this.SecheulData = await GetSchedules()
    }
  },
  mounted() {
    this.GetSchedulesFromBackend();
  },
}
</script>

<style lang="scss" scoped>
.dispatcher {
  .sech-setting {
    label {
      width: 72px;
    }
  }
}
</style>