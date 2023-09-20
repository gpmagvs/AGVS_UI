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
              <el-table-column label="No" width="80">
                <template #default="scope">排程-{{ GetRowIndex(scope.row) + 1 }}</template>
              </el-table-column>
              <el-table-column label="時間" min-width="160" prop="time" :formatter="FormatTime"></el-table-column>
              <el-table-column label="車輛" min-width="160" prop="agv_name"></el-table-column>
              <el-table-column label="Bay數量" min-width="160" prop="bay_num"></el-table-column>
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
    <NewScheduleHelper ref="schedule_edit_helper"></NewScheduleHelper>
  </div>
</template>

<script>
import NewScheduleHelper from './NewScheduleHelper.vue'
import moment from 'moment'
export default {
  components: {
    NewScheduleHelper,
  },
  data() {
    return {
      SecheulData: [
        {
          time: '1991/12/20 12:10:20',
          bays: ['Bay1'],
          bay_num: 1,
          agv_name: 'AGV_001'
        },
        {
          time: '2023/08/01 12:23:23',
          bays: ['Bay1', 'Bay2'],
          bay_num: 2,
          agv_name: 'AGV_001'
        },
        {
          time: '1997/04/18 00:00:33',
          bays: ['Bay1', 'Bay2', 'Bay3'],
          bay_num: 3,
          agv_name: 'AGV_001'
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
        this.$refs.schedule_edit_helper.EditorMode(this.selectedScheduleData)
      }, 0.5);
    },
    FormatTime(row, column, cellValue, index) {
      return moment(cellValue).format("HH:mm")
    }
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