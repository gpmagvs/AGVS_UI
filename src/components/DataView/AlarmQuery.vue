<template>
  <div class="alarm-query">
    <div class="query-options bg-light d-flex border-bottom w-100 py-2">
      <label>{{ $t('Search.Start_Time') }}</label>
      <input type="datetime-local" v-model="start_time" prop="Start Time" />
      <label>{{ $t('Search.End_Time') }}</label>
      <input type="datetime-local" v-model="end_time" prop="End Time" />
      <label>{{ $t('AlarmTable.Alarm_Type') }}</label>
      <select
        v-bind:class="AlarmTypeSelected == 'ALL' ? '' : AlarmTypeSelected == 'Alarm' ? 'bg-danger text-light' : 'bg-warning text-light'"
        prop="EQ Name" v-model="AlarmTypeSelected">
        <option>ALL</option>
        <option class="bg-danger text-light">Alarm</option>
        <option class="bg-warning text-light">Warning</option>
      </select>
      <label>{{ $t('AlarmTable.EQ_Name') }}</label>
      <select prop="EQ Name" v-model="AGVSelected">
        <option>ALL</option>
        <option v-for="name in AgvNameList" :key="name">{{ name }}</option>
      </select>
      <label>{{ $t('AlarmTable.TaskName') }}</label>
      <input type="text" v-model="TaskName" placeholder="ALL" size="20" />
      <b-button @click="QueryAlarm()" :QueryAlarm="QueryAlarm" class="Select-Query" variant="primary" size="sm"
        style="float:right">{{ $t('Search.Search') }}</b-button>
      <b-button @click="SaveTocsv()" :SaveTocsv="SaveTocsv" class="SaveTocsv mx-2" variant="primary" size="sm"
        style="float:right">{{ $t('Search.Output_csv_file') }}</b-button>
    </div>
    <div>
      <el-table border :data="alarms" empty-text="No Alarms" :row-class-name="row_state_class_name" size="small"
        style="width: 100%; height: 770px;font-weight: bold;" aria-current="currentpage" id="alarmtable">
        <el-table-column :label="$t('AlarmTable.Occur_Time')" prop="Time" width="140">
          <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.EQ_Name')" prop="Equipment_Name" width="80"
          align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Alarm_code')" prop="AlarmCode" width="60"
          align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Alarm_description')" prop="Description_En" min-width="320">
          <template #default="scope">
            <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.Alarm_Type')" prop="Level" width="100" align="center">
          <template #default="scope">
            <el-tag style="width:80px" effect="dark" :type="scope.row.Level == 1 ? 'danger' : 'warning'">{{
        scope.row.Level == 1 ? 'Alarm' : 'Warning' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.TaskName')" prop="Task_Name" width="210">
          <template #default="scope">
            <div> {{ scope.row.Task_Name }} <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i v-if="scope.row.Task_Name != ''" @click="CopyText(scope.row.Task_Name)"
                  class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.Occur_Tag')" prop="OccurLocation" width="120"
          align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Solution')" prop="TrobleShootingMethod" width="320" align="center">
          <template #default="scope">
            <div>
              <span v-if="scope.row.TrobleShootingReference == ''">{{ scope.row.TrobleShootingMethod }}</span>
              <a v-else :href="getFullFilePath(scope.row.TrobleShootingReference)" target="_blank"> 📕 {{
        scope.row.TrobleShootingMethod }} </a>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.Duration')" prop="Duration" width="90" align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Clear_OP')" prop="ResetAalrmMemberName"
          min-width="120"></el-table-column>
      </el-table>
      <div class="d-flex flex-row justify-content-center fixed-bottom py-4">
        <b-pagination :per-page="per_page_num" :total-rows="rows" aria-controls="alarmtable"
          class="pagination justify-content-center" v-model="currentpage" @click="PageChnageHandle"></b-pagination>
        <div class="mx-3 py-2"> {{ $t('Search.Total_First') }} <span style="font-weight: bold; font-size: large;">{{
        rows
      }}</span>{{ $t('Search.Total_Last') }} </div>
      </div>
    </div>
  </div>
</template>
<script>
import { QueryAlarm } from "@/api/AlarmAPI.js";
import { SaveTocsv } from "@/api/AlarmAPI.js";
import moment from "moment";
import Notifier from "@/api/NotifyHelper";
import { CopyText } from "@/api/Common/UtilityTools";
import param from '@/gpm_param.js'

import { userStore, agv_states_store } from "@/store";
export default {
  data() {
    return {
      start_time: "2023-06-01 00:00:00",
      end_time: "2023-06-03 00:00:00",
      AGVSelected: "ALL",
      AlarmTypeSelected: "ALL",
      TaskName: "",
      alarms: [],
      per_page_num: 19,
      rows: 1,
      currentpage: 1,
      loading: false,
    };
  },

  computed: {
    AgvNameList() {
      return agv_states_store.getters.AGVNameList;
    },
  },
  mounted() {
    const EndDate = new Date();
    this.end_time = EndDate.toISOString().substring(0, 10) + " 23:59:59";
    this.start_time = moment(this.end_time, "YYYY-MM-DD HH:mm:ss")
      .subtract(7, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    setTimeout(() => {
      QueryAlarm(
        this.currentpage,
        this.start_time,
        this.end_time,
        this.AGVSelected,
        this.TaskName
      )
        .then((retquery) => {
          this.alarms = retquery.alarms;
          this.rows = retquery.count;
          this.currentpage = retquery.currentpage;
        })
        .catch((er) => {
          Notifier.Danger("警報查詢失敗後端服務異常");
        });
    }, 500);
  },
  methods: {
    formatTime(_time) {
      return moment(_time).format("yyyy-MM-DD HH:mm:ss");
    },
    onmessage(ev) {
      this.alarms = JSON.parse(ev.data);
    },
    row_state_class_name({ row, rowIndex }) {
      if (row.rowIndex < 0) {
        return "";
      }
      var level = this.alarms[rowIndex].Level;
      return level == 1 ? "alarm-row" : "warning-row";
    },
    async QueryAlarm() {
      this.loading = true;
      this.alarms = [];
      this.rows = 1;
      this.currentpage = 1;
      this.payload = 2;
      setTimeout(() => {
        QueryAlarm(
          this.currentpage,
          this.start_time,
          this.end_time,
          this.AGVSelected,
          this.TaskName,
          this.AlarmTypeSelected
        )
          .then((retquery) => {
            this.alarms = retquery.alarms;
            this.rows = retquery.count;
            this.currentpage = retquery.currentpage;
          })
          .then((dat) => {
            //window.open('http://localhost:5216/MapFiles/test.csv')
          })
          .catch((er) => {
            this.loading = false;
            Notifier.Danger("警報查詢失敗後端服務異常");
          });
      }, 300);
    },
    async SaveTocsv() {
      await SaveTocsv(
        this.start_time,
        this.end_time,
        this.AGVSelected,
        this.TaskName
      );
      Notifier.Primary("檔案儲存成功");
    },
    PageChnageHandle(payload) {
      QueryAlarm(
        this.currentpage,
        this.start_time,
        this.end_time,
        this.AGVSelected,
        this.TaskName,
        this.AlarmTypeSelected
      )
        .then((retquery) => {
          this.alarms = retquery.alarms;
        })
        .catch((er) => {
          Notifier.Danger("警報查詢失敗後端服務異常");
        });
    },
    CopyText(text) {
      CopyText(text);
    },
    getFullFilePath(filePath) {
      const baseURL = param.backend_host;
      return baseURL + "/TrobleShootingFiles/" + filePath; // 構建完整的 URL
    }
  },
};
</script>
<style lang="scss">
.alarm-query {
  overflow-y: scroll;
  padding: 0px;

  .query-options {
    label {
      margin: auto 10px;
      font-weight: bold;
    }
  }

  .el-table .warning-row {
    background-color: rgb(255, 237, 186);
    /* --el-table-tr-bg-color: var(--el-color-warning-light-9); */
  }

  .el-table .alarm-row {
    background-color: rgb(245, 198, 206);
  }
}
</style>
