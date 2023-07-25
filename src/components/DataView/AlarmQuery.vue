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
      <b-button @click="QueryAlarm()" :QueryAlarm="QueryAlarm" class="Select-Query" variant="primary" size="sm"
        style="float:right">搜尋</b-button>
    </div>
    <div>
      <el-table :data="alarms" empty-text="No Alarms" row-class-name="row_state_class_name" size="small"
        style="width: 100%" aria-current="currentpage" id="alarmtable">
        <el-table-column label="發生時間" prop="Time" width="140">
          <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
        </el-table-column>
        <el-table-column label="AGV名稱" prop="Equipment_Name" width="80"></el-table-column>
        <el-table-column label="警報碼" prop="AlarmCode" width="60"></el-table-column>
        <el-table-column label="警報描述" prop="Description_En" min-width="420">
          <template #default="scope">
            <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
          </template>
        </el-table-column>
        <el-table-column label="警報類型" prop="Level" width="100">
          <template #default="scope">
            <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="任務名稱" prop="Task_Name" width="210"></el-table-column>
        <el-table-column label="發生地點" prop="OccurLocation" width="80"></el-table-column>
        <el-table-column label="持續時間" prop="Duration" width="80"></el-table-column>
        <el-table-column label="清除警報人員" prop="ResetAalrmMemberName" min-width="120"></el-table-column>
      </el-table>
      <b-pagination :per-page="per_page_num" :total-rows="rows" aria-controls="alarmtable"
        class="pagination justify-content-center" v-model="currentpage" @click="PageChnageHandle"></b-pagination>
    </div>
  </div>
</template>

<script>
import { QueryAlarm } from '@/api/AlarmAPI.js'
import moment from 'moment'
import Notifier from '@/api/NotifyHelper'
export default {
  data() {
    return {
      start_time: '2023-06-01 00:00:00',
      end_time: '2023-06-03 00:00:00',
      AGVSelected: 'ALL',
      alarms: [],
      per_page_num: 10,
      rows: 1,
      currentpage: 1,
      loading: false,
    }
  },
  mounted() {
    QueryAlarm(this.currentpage, this.start_time, this.end_time, this.AGVSelected).then(retquery => {
          this.alarms = retquery.alarms
          this.rows = retquery.count;
          this.currentpage = retquery.currentpage;
        }).catch(er => {
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
    async QueryAlarm() {
      this.loading = true;
      this.alarms = [];
      this.rows = 1;
      this.currentpage = 1;
      this.payload=2;
      setTimeout(() => {
        QueryAlarm(this.currentpage, this.start_time, this.end_time, this.AGVSelected).then(retquery => {
          this.alarms = retquery.alarms
          this.rows = retquery.count;
          this.currentpage = retquery.currentpage;
        }).catch(er => {
          this.loading = false;
          Notifier.Danger('警報查詢失敗後端服務異常')
        });
      }, 300);

    },
    PageChnageHandle(payload) {
      QueryAlarm(this.currentpage,this.start_time, this.end_time, this.AGVSelected).then(retquery => {
        this.alarms = retquery.alarms;
      }
      ).catch(er => {
        Notifier.Danger('警報查詢失敗後端服務異常')
      });
    }
  },
}
</script>

<style lang="scss" scoped>
.alarm-query {
  overflow-y: scroll;
  padding: 0px;

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