<template>
  <div class="alarm-query">
    <div class="bg-light d-flex border-bottom py-2">
      <div class="query-option-container">
        <label>{{ $t('Search.Start_Time') }}</label>
        <el-date-picker
          v-model="start_time"
          type="datetime"
          :placeholder="$t('Search.Start_Time')"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :clearable="false" />
      </div>
      <div class="query-option-container">
        <label>{{ $t('Search.End_Time') }}</label>
        <el-date-picker
          v-model="end_time"
          type="datetime"
          :placeholder="$t('Search.End_Time')"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :clearable="false" />
      </div>
      <div class="query-option-container">
        <label>{{ $t('AlarmTable.Alarm_Type') }}</label>
        <el-select style="width: 100px;" v-model="AlarmTypeSelected" placeholder="">
          <el-option label="ALL" value="ALL">
          </el-option>
          <el-option label="Alarm" value="Alarm">
            <span class="text-danger">Alarm</span>
          </el-option>
          <el-option label="Warning" value="Warning">
            <span class="text-warning">Warning</span>
          </el-option>
        </el-select>
        <!-- <select
          v-bind:class="AlarmTypeSelected == 'ALL' ? '' : AlarmTypeSelected == 'Alarm' ? 'bg-danger text-light' : 'bg-warning text-light'"
          prop="EQ Name" v-model="AlarmTypeSelected">
          <option>ALL</option>
          <option class="bg-danger text-light">Alarm</option>
          <option class="bg-warning text-light">Warning</option>
        </select> -->
      </div>
      <div class="query-option-container">
        <label>{{ $t('AlarmTable.AGV_Name') }}</label>
        <el-select style="width: 100px;" v-model="AGVSelected" placeholder="">
          <el-option label="ALL" value="ALL">
          </el-option>
          <el-option v-for="name in AgvNameList" :key="name" :label="name" :value="name">
          </el-option>
        </el-select>
      </div>
      <div class="query-option-container">
        <label>{{ $t('AlarmTable.TaskName') }}</label>
        <el-input style="width: 180px;" v-model="TaskName" placeholder="ALL" size="20" clearable @clear="QueryAlarm()" />
      </div>
      <div class="query-option-container">
        <label>{{ $t('AlarmTable.FailureReason') }}</label>
        <el-input style="width: 180px;" v-model="Alarm_description" placeholder="ALL" size="20" clearable @clear="QueryAlarm()" />
      </div>
      <div class="query-actions-container">
        <b-button @click="QueryAlarm()" class="Select-Query" variant="primary" size="sm" style="float:right">{{ $t('Search.Search') }}</b-button>
      </div>
      <div class="query-option-container">
        <el-divider class="h-100" direction="vertical"></el-divider>
      </div>
      <div class="query-option-container">
        <label>{{ $t('Keyword') }}</label>
        <el-input style="width: 180px;" v-model="keyword" placeholder="Keyword" size="20" clearable @clear="QueryAlarmWithKeyword()" />
      </div>
      <div class="query-actions-container">
        <b-button @click="QueryAlarmWithKeyword()" class="Select-Query" variant="primary" size="sm" style="float:right">{{ $t('KeywordSearch') }}</b-button>
      </div>
      <div class="query-actions-container">
        <b-button @click="SaveTocsv()" :SaveTocsv="SaveTocsv" class="SaveTocsv mx-2" variant="primary" size="sm" style="float:right">{{ $t('Search.Output_csv_file') }}</b-button>
      </div>
    </div>
    <div>
      <el-table border :data="alarms" empty-text="No Alarms" :row-class-name="row_state_class_name" size="small" style="width: 100%; height: cal(100vh - 150px) ;font-weight: bold;" aria-current="currentpage" id="alarmtable">
        <el-table-column :label="$t('AlarmTable.Occur_Time')" prop="Time" width="140">
          <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.EQ_Name')" prop="Equipment_Name" width="180" align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Alarm_code')" prop="AlarmCode" width="60" align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Alarm_description')" prop="Description_En" min-width="320">
          <template #default="scope">
            <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.Alarm_Type')" prop="Level" width="100" align="center">
          <template #default="scope">
            <el-tag style="width:80px" effect="dark" :type="scope.row.Level == 1 ? 'danger' : 'warning'"> {{ scope.row.Level == 1 ? 'Alarm' : 'Warning' }} </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.TaskName')" prop="Task_Name" width="280">
          <template #default="scope">
            <div> {{ scope.row.Task_Name }} <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i v-if="scope.row.Task_Name != ''" @click="CopyText(scope.row.Task_Name)"
                  class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.Occur_Tag')" prop="OccurLocation" width="120" align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Solution')" prop="TrobleShootingMethod" width="320" align="center">
          <template #default="scope">
            <div>
              <span v-if="scope.row.TrobleShootingReference == ''">{{ scope.row.TrobleShootingMethod }}</span>
              <a class="cursor-pointer" v-else @click="() => {
                selectedTroubleShootingDocument = scope.row.TrobleShootingReference
                showTroubleShootingDocument = true;
              }"> 📕 {{ scope.row.TrobleShootingMethod }} </a>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AlarmTable.Duration')" prop="Duration" width="90" align="center"></el-table-column>
        <el-table-column :label="$t('AlarmTable.Clear_OP')" prop="ResetAalrmMemberName" min-width="120"></el-table-column>
        <el-table-column min-width="120" v-if="isDevLogin" label="Action">
          <template #default="scope">
            <div class="w-100">
              <b-button variant="danger" @click="DeleteAlarmHandle(scope.row)">Delete</b-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex flex-row justify-content-center fixed-bottom py-4">
        <b-pagination :per-page="per_page_num" :total-rows="rows" aria-controls="alarmtable" class="pagination justify-content-center" v-model="currentpage" @click="PageChnageHandle"></b-pagination>
        <div class="mx-3 py-2"> {{ $t('Search.Total_First') }} <span style="font-weight: bold; font-size: large;"> {{ rows }} </span> {{ $t('Search.Total_Last') }} </div>
      </div>
    </div>
    <el-dialog fullscreen :overflow="false" v-model="showTroubleShootingDocument" draggable :title="selectedTroubleShootingDocument">
      <div style="position: absolute; height: 100vh;width: 100vw;overflow: hidden;">
        <iframe :src="CurrentSelectedTroubleShootingFileUrl" width="100%" height="100%" style="border: none;" allow="autoplay"></iframe>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { QueryAlarm, QueryAlarmWithKeyword } from "@/api/AlarmAPI.js";
import { SaveTocsv, DeleteAlarm } from "@/api/AlarmAPI.js";
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
      Alarm_description: "",
      showTroubleShootingDocument: false,
      selectedTroubleShootingDocument: '',
      keyword: '',
      searchMethod: 'condition'
    };
  },

  computed: {
    AgvNameList() {
      return agv_states_store.getters.AGVNameList;
    },
    isDevLogin() {
      return userStore.getters.IsDeveloperLogining;
    },
    CurrentSelectedTroubleShootingFileUrl() {
      return param.backend_host + '/Resources' + this.selectedTroubleShootingDocument
    }
  },
  mounted() {
    const EndDate = new Date();
    this.end_time = EndDate.toISOString().substring(0, 10) + " 23:59:59";
    this.start_time = moment(this.end_time, "YYYY-MM-DD HH:mm:ss")
      .subtract(7, "days")
      .format("YYYY-MM-DD HH:mm:ss");
    setTimeout(() => {
      this.QueryAlarm()
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
    async QueryAlarmWithKeyword() {
      this.loading = true;
      this.alarms = [];
      this.rows = 1;
      this.currentpage = 1;
      this.payload = 2;
      this.searchMethod = 'keyword';
      QueryAlarmWithKeyword(
        this.currentpage,
        this.start_time,
        this.end_time,
        this.keyword
      )
        .then((retquery) => {
          this.alarms = retquery.alarms;
          this.rows = retquery.count;
          this.currentpage = retquery.currentpage;
        })
        .catch((er) => {
          Notifier.Danger("警報查詢失敗後端服務異常");
        });
    },
    async QueryAlarm() {
      this.loading = true;
      this.alarms = [];
      this.rows = 1;
      this.currentpage = 1;
      this.payload = 2;
      this.searchMethod = 'condition';
      setTimeout(() => {
        QueryAlarm(
          this.currentpage,
          this.start_time,
          this.end_time,
          this.AGVSelected,
          this.TaskName,
          this.AlarmTypeSelected,
          this.Alarm_description
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
      if (this.searchMethod == 'condition') {
        QueryAlarm(
          this.currentpage,
          this.start_time,
          this.end_time,
          this.AGVSelected,
          this.TaskName,
          this.AlarmTypeSelected,
          this.Alarm_description
        ).then((retquery) => {
          this.alarms = retquery.alarms;
        }).catch((er) => {
          Notifier.Danger("警報查詢失敗後端服務異常");
        });
      } else {
        QueryAlarmWithKeyword(
          this.currentpage,
          this.start_time,
          this.end_time,
          this.keyword
        ).then((retquery) => {
          this.alarms = retquery.alarms;
        }).catch((er) => {
          Notifier.Danger("警報查詢失敗後端服務異常");
        });
      }
    },
    CopyText(text) {
      CopyText(text);
    },
    getFullFilePath(filePath) {
      const baseURL = param.backend_host;
      return baseURL + "/TrobleShootingFiles/" + filePath; // 構建完整的 URL
    },
    async DeleteAlarmHandle(alarmRow) {
      await DeleteAlarm(alarmRow.Time);
      this.QueryAlarm();
    }
  },
};
</script>
<style lang="scss">
.alarm-query {
  overflow-y: scroll;
  padding: 0px;

  .el-table .warning-row {
    background-color: rgb(255, 237, 186);
    /* --el-table-tr-bg-color: var(--el-color-warning-light-9); */
  }

  .el-table .alarm-row {
    background-color: rgb(245, 198, 206);
  }
}
</style>