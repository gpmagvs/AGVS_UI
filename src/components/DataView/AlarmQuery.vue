<template>
  <div class="alarm-query">
    <div class="query-options bg-light d-flex border-bottom w-100 py-2">
      <label>Start Time</label>
      <input type="datetime-local" v-model="start_time" prop="Start Time" />
      <label>End Time</label>
      <input type="datetime-local" v-model="end_time" prop="End Time" />
      <label>EQ Name</label>
      <select prop="EQ Name" v-model="AGVSelected">
        <option>ALL</option>
        <option>AGV_1</option>
        <option>AGV_2</option>
        <option>AGV_3</option>>
      </select>
      <b-button @click="Query()" :Query="Query" class="Select-Query" variant="primary" size="sm">搜尋</b-button>
    </div>
    <div>
      <el-table
        :data="alarms"
        empty-text="No Alarms"
        row-class-name="row_state_class_name"
        size="small"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="發生時間" prop="Time" width="160">
          <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
        </el-table-column>
        <el-table-column label="AGV名稱" prop="Equipment_Name" width="100"></el-table-column>
        <el-table-column label="警報碼" prop="AlarmCode" width="60"></el-table-column>
        <el-table-column label="警報描述" prop="Description_En" min-width="400">
          <template #default="scope">
            <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
          </template>
        </el-table-column>
        <el-table-column label="警報類型" prop="Level" width="120">
          <template #default="scope">
            <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="任務名稱" prop="Task_Name" width="160"></el-table-column>
        <el-table-column label="發生地點" prop="OccurLocation" width="80"></el-table-column>
        <el-table-column label="持續時間" prop="Duration" width="80"></el-table-column>
        <el-table-column label="清除警報人員" prop="ResetAalrmMemberName" min-width="120"></el-table-column>
      </el-table>
      <b-pagination
        href="#"
        tabindex="-1"
        aria-disabled="true"
        class="pagination justify-content-center"
      ></b-pagination>
    </div>
  </div>
</template>

<script>
import { QueryALL, Query } from '@/api/AlarmAPI.js'
import moment from 'moment'
import Notifier from '@/api/NotifyHelper'
export default {
  data() {
    return {
      start_time: '2023-06-30 00:00:00',
      end_time: '2023-06-30 00:00:00',
      AGVSelected: 'ALL',
      alarms: [],
      per_page_num: 20,
      loading: false
    }
  },
  mounted() {

    /**Use to gen fake alarm data  */
    for (let index = 0; index < 20; index++) {
      this.alarms.push({
        Time: "2023-05-29T13:57:19.0723227",
        Level: 1,
        Source: 0,
        AlarmCode: 2,
        Description_Zh: "車載管理系統斷線",
        Description_En: "VMS Disconnect",
        OccurLocation: "",
        Equipment_Name: "VMS",
        Task_Name: "",
        Duration: 43,
        Checked: true,
        ResetAalrmMemberName: "AliveChecker"
      })

    }

    QueryALL().then(alarms => this.alarms = alarms).catch(er => {
      Notifier.Danger('警報查詢失敗後端服務異常')
    });
  },
  methods: {
    formatTime(_time) {
      return moment(_time).format('yyyy-MM-DD HH:mm:ss');
    },
    onmessage(ev) {
      this.alarms = JSON.parse(ev.data)
    },
    row_state_class_name({ row, rowIndex }) {
      return row.Level == 1 ? 'ALARM' : 'WARNING';
    },
    async Query() {
      this.loading = true;
      this.alarms = [];
      setTimeout(() => {
        Query(this.start_time, this.end_time, this.AGVSelected).then(ret => {
          this.alarms = ret.data
          this.loading = false;
        }).catch(er => {
          this.loading = false;
          Notifier.Danger('警報查詢失敗後端服務異常')
        });
      }, 300);

    }
  },
}
</script>

<style lang="scss" scoped>
.alarm-query {
  overflow-y: scroll;
  padding: 5px;
  .query-options {
    label {
      margin: auto 10px;
      font-weight: bold;
    }
  }
  .el-table {
    .WARNING {
      background: rgb(255, 210, 6);
      color: black;
    }

    .ALARM {
      background: rgb(250, 72, 72);
      color: white;
    }
  }
}
</style>