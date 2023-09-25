<template>
  <div class="dispatcher border rounded p-2">
    <b-tabs>
      <b-tab title="排程派車">
        <div class="d-flex p-2 border">
          <div>
            <b-button
              @click="() => {
                $refs.schedule_add_helper.Show()
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
                  <el-button size="small" type="danger" @click="HandleDeleteScheduleClick(scope.row)">刪除</el-button>
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
    <NewScheduleHelper @on_submit="HandleSchedulesChanged" ref="schedule_add_helper"></NewScheduleHelper>
    <NewScheduleHelper @on_submit="HandleSchedulesChanged" :edit_mode="true" ref="schedule_edit_helper"></NewScheduleHelper>
  </div>
</template>

<script>
import NewScheduleHelper from './NewScheduleHelper.vue'
import moment from 'moment'
import { GetSchedules, DeleteSchedule } from '@/api/MeasureResultAPI.js'
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
    async HandleDeleteScheduleClick(row) {
      this.$swal.fire(
        {
          html: `<b>時間:</b>${row.Time} <br/><b>AGV:</b>${row.AGVName} `,
          title: '確定要刪除此排程?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (ret) => {
          if (ret.isConfirmed) {
            await DeleteSchedule(row.Time, row.AGVName)
            this.GetSchedulesFromBackend();
          }
        })

    },
    FormatTime(row, column, cellValue, index) {
      return moment(cellValue).format("HH:mm")
    },
    async GetSchedulesFromBackend() {
      this.SecheulData = await GetSchedules()
    },
    HandleSchedulesChanged() {
      this.GetSchedulesFromBackend();
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