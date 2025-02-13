<template>
  <div class="Task-query d-flex flex-column">
    <div class="Task-options bg-light d-flex border-bottom w-100 py-2">
      <div class="query-option-container">
        <label>{{ $t('Search.Start_Time') }}</label>
        <el-date-picker
          v-model="queryCondition.StartTime"
          type="datetime"
          :placeholder="$t('Search.Start_Time')"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :clearable="false" />
      </div>
      <div class="query-option-container">
        <label>{{ $t('Search.End_Time') }}</label>
        <el-date-picker
          v-model="queryCondition.EndTime"
          type="datetime"
          :placeholder="$t('Search.End_Time')"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :clearable="false" />
      </div>
      <div class="query-option-container">
        <label>{{ $t('TaskTable.TaskName') }}</label>
        <el-input v-model="queryCondition.TaskName" placeholder="ALL" style="width:160px" clearable
          @clear="TaskQuery()" />
      </div>
      <div class="query-option-container">
        <label>{{ $t('TaskTable.SearchSourceDestine') }}</label>
        <el-input v-model="queryCondition.Source" placeholder clearable style="width:120px"
          @clear="TaskQuery()"></el-input>
      </div>
      <div class="query-option-container">
        <label>{{ $t('TaskTable.AGV_Name') }}</label>
        <el-select prop="EQ Name" v-model="queryCondition.AgvName" clearable @clear="TaskQuery()" style="width:120px">
          <el-option label="ALL" value>ALL</el-option>
          <el-option v-for="name in AgvNameList" :key="name" :label="name" :value="name"></el-option>
        </el-select>
      </div>
      <div class="query-option-container">
        <label>{{ $t('TaskTable.Action') }}</label>
        <el-select prop="EQ Name" v-model="queryCondition.ActionType" clearable @clear="TaskQuery()" style="width:120px">
          <el-option :value="actionTypeList.Unknown" label="ALL"></el-option>
          <el-option :value="actionTypeList.None" :label="$t('Search.Move')"></el-option>
          <el-option :value="actionTypeList.Unload" :label="$t('Search.Load')"></el-option>
          <el-option :value="actionTypeList.Load" :label="$t('Search.UnLoad')"></el-option>
          <el-option :value="actionTypeList.Carry" :label="$t('Search.Transfer')"></el-option>
          <el-option :value="actionTypeList.Charge" :label="$t('Search.Charge')"></el-option>
          <el-option :value="actionTypeList.Measure" :label="$t('Search.Measure')"></el-option>
          <el-option :value="actionTypeList.ExchangeBattery" :label="$t('Search.ExchangeBattrey')"></el-option>
        </el-select>
      </div>
      <div class="query-option-container">
        <label>{{ $t('TaskTable.Final') }}</label>
        <el-select v-model="queryCondition.TaskResult" clearable @clear="TaskQuery()" style="width:120px">
          <el-option :value="taskResultList.UNKNOWN" label="ALL"></el-option>
          <el-option :value="taskResultList.ACTION_FINISH" :label="$t('Search.Completed')"></el-option>
          <el-option :value="taskResultList.FAILURE" :label="$t('Search.Fail')"></el-option>
          <el-option :value="taskResultList.CANCEL" :label="$t('Search.Cancel')"></el-option>
        </el-select>
      </div>
      <!-- <select prop="EQ Name" v-model="ExecuteResultSelected">
        <option>ALL</option>
        <option>{{ $t('Search.Completed') }}</option>
        <option>{{ $t('Search.Fail') }}</option>
        <option>{{ $t('Search.Cancel') }}</option>
      </select>-->
      <div class="query-option-container">
        <label>{{ $t('TaskTable.FailureReason') }}</label>
        <!-- <input type="text" v-model="Fail_reason" placeholder="ALL" size="20" /> -->
        <el-input v-model="queryCondition.Description" placeholder clearable style="width:120px"
          @clear="TaskQuery()"></el-input>
      </div>
      <div class="query-actions-container">
        <b-button @click="TaskQuery()" :TaskQuery="TaskQuery" class="Select-Query" variant="primary mx-1" size="sm"
          style="float:right">{{ $t('Search.Search') }}</b-button>
        <b-button @click="SaveTocsv()" :SaveTocsv="SaveTocsv" class="SaveTocsv mx-2" variant="primary" size="sm"
          style="float:right">{{ $t('Search.Output_csv_file') }}</b-button>
        <b-button v-show="isDevLogin" @click="HandleExportToAutoRptFolder()" :SaveTocsv="SaveTocsv" class="SaveTocsv mx-2"
          variant="danger" size="sm" style="float:right">輸出至自動匯出目錄</b-button>
      </div>
    </div>
    <div class="flex-grow-1 overflow-y-auto" style="padding-bottom: 80px;">
      <el-table v-loading="loading" :data="tasks" empty-text="No Tasks" row-class-name="row_state_class_name"
        size="small" style="width: 100%;height: cal(100vh - 150px);font-weight: bold;" border id="Tasktable">
        <el-table-column :label="$t('TaskTable.TaskName')" prop="TaskName" width="280" show-overflow-tooltip>
          <template #default="scope">
            <div> {{ scope.row.TaskName }} <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i @click="CopyText(scope.row.TaskName)" class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.RecievedTime')" prop="RecieveTime" width="160" show-overflow-tooltip>
          <template #default="scope">{{ formatTime(scope.row.RecieveTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.FinishTime')" prop="FinishTime" width="160" show-overflow-tooltip>
          <template #default="scope">{{ formatTime(scope.row.FinishTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.Final')" prop="StateName" width="100" align="center">
          <template #default="scope">
            <el-tag effect="dark"
              :type="scope.row.State == 4 ? 'success' : scope.row.State == 6 ? 'danger' : 'warning'"> {{ scope.row.StateName }} </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.AGV_Name')" prop="DesignatedAGVName" width="100" align="center" :filters="getAGVListFilter" :filter-method="filterAGVName"></el-table-column>
        <el-table-column :label="$t('TaskTable.Action')" prop="ActionName" width="60" align="center"></el-table-column>
        <el-table-column :label="$t('TaskTable.Source')" prop="From_Station_Display" width="120" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('TaskTable.Source_Slot')" prop="From_Slot" width="120" align="center">
          <template #default="scope">{{ scope.row.From_Slot == -1 ? '-' : scope.row.From_Slot }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.Destine')" prop="To_Station_Display" width="120" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column :label="$t('TaskTable.Destine_Slot')" prop="To_Slot" width="120" align="center">
          <template #default="scope">{{ scope.row.To_Slot == -1 ? '-' : scope.row.To_Slot }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.CstID')" prop="Carrier_ID" width="140">
          <template #default="scope">
            <div> {{ scope.row.Carrier_ID == '-1' ? '' : scope.row.Carrier_ID }} <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i v-if="scope.row.Carrier_ID != '-1' && scope.row.Carrier_ID != ''"
                  @click="CopyText(scope.row.Carrier_ID)" class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="false" :label="$t('TaskTable.AGVReadID')" prop="Actual_Carrier_ID" width="140">
          <template #default="scope">
            <div> {{ scope.row.Actual_Carrier_ID == '-1' ? '' : scope.row.Actual_Carrier_ID }} <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i v-if="scope.row.Actual_Carrier_ID != '-1' && scope.row.Actual_Carrier_ID != ''"
                  @click="CopyText(scope.row.Actual_Carrier_ID)" class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.UnloadTime')" prop="RecieveTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.UnloadTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.LoadTime')" prop="RecieveTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.LoadTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.StartLocation')" prop="StartLocationDisplay" width="160"></el-table-column>
        <el-table-column :label="$t('TaskTable.Dispatcher')" prop="DispatcherName" width="100"></el-table-column>
        <el-table-column :label="$t('TaskTable.Fail_reason')" prop="FailureReason" min-width="220" show-overflow-tooltip fixed="right">
          <template #default="scope">
            <div class="text-danger">
              <div v-for="alarm in scope.row.FailureReason.split(',')" :key="alarm">{{ alarm }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :min-width="isDevLogin ? 220 : 120" v-if="isDevLogin || isEngUserLogin" label="Action" fixed="right">
          <template #default="scope">
            <div class="w-100">
              <b-button class="mx-1" variant="primary" squared @click="ShowLocus(scope.row)">軌跡</b-button>
              <b-button v-if="isDevLogin" variant="danger" squared
                @click="DeleteTaskHandle(scope.row)">Delete</b-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex flex-row justify-content-center fixed-bottom" style="margin-bottom: 3px;">
        <b-pagination :per-page="per_page_num" :total-rows="rows" aria-controls="Tasktable" class="pagination justify-content-center" v-model="queryCondition.CurrentPage" @click="handlePageChange"></b-pagination>
        <div class="mx-3"> {{ $t('Search.Total_First') }} <span style="font-weight: bold; font-size: large;">{{ rows }}</span>
          <span>,成功:{{ completeNum }},失敗:{{ failNum }},取消:{{ cancelNum }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { TaskQuery, ExportToAutoRptFolder, Query } from '@/api/TaskAPI.js'
import { SaveTocsv, DeleteTask } from '@/api/TaskAPI.js'
import { userStore, agv_states_store } from '@/store';
import { CopyText } from '@/api/Common/UtilityTools'
import moment from 'moment'
import Notifier from '@/api/NotifyHelper'
import { TaskQueryCondition } from '@/ViewModels/Query'
export default {
  data() {
    return {
      start_time: '2023-06-01 00:00:00',
      end_time: '2023-06-30 00:00:00',
      AGVSelected: 'ALL',
      ExecuteResultSelected: 'ALL',
      ActionTypeSelected: 'ALL',
      TaskName: '',
      Fail_reason: '',
      tasks: [],
      per_page_num: 25,
      rows: 0,
      currentpage: 1,
      loading: false,
      queryCondition: new TaskQueryCondition(),
      completeNum: 0,
      failNum: 0,
      cancelNum: 0,
      Source: '',
      Destine: '',
    }
  },
  computed: {
    AgvNameList() {
      return agv_states_store.getters.AGVNameList
    },
    isDevLogin() {
      return userStore.getters.IsDeveloperLogining;
    },
    isEngUserLogin() {
      return userStore.state.user.Role == 1;
    },
    taskResultList() {
      return TaskQueryCondition.TASK_RUN_STATUS;
    },
    actionTypeList() {
      return TaskQueryCondition.ACTION_TYPE;
    },
    getAGVListFilter() {
      const agvList = this.tasks.map(task => task.DesignatedAGVName);
      const uniqueAgvList = [...new Set(agvList)];
      uniqueAgvList.sort();
      return [
        ...uniqueAgvList.map(agv => ({ text: agv, value: agv })),
      ]
    },
    SourceList() {
      const sourceList = this.tasks.map(task => task.From_Station_Display || ""); // 提取 Source 欄位
      return [...new Set(sourceList)].filter(Boolean).sort(); // 過濾空值並排序
    },
    DestineList() {
      const destineList = this.tasks.map(task => task.To_Station_Display || ""); // 提取 Destine 欄位
      return [...new Set(destineList)].filter(Boolean).sort(); // 過濾空值並排序
    },
    FilterSourceandDestine() {
      const keyword = this.queryCondition.TaskName.toLowerCase(); // 獲取輸入的篩選字串
      return this.tasks.filter(task => {
        // 模糊匹配 Source 和 Destine 欄位
        const source = task.From_Station_Display?.toLowerCase() || '';
        const destine = task.To_Station_Display?.toLowerCase() || '';
        return source.includes(keyword) || destine.includes(keyword);
      });
    }
  },
  mounted() {
    const EndDate = new Date();
    this.queryCondition.EndTime = EndDate.toISOString().substring(0, 10) + 'T23:59:59';;
    this.queryCondition.StartTime = moment(this.queryCondition.EndTime, 'YYYY-MM-DD HH:mm:ss').subtract(7, 'days').format('YYYY-MM-DDTHH:mm:ss');;
    setTimeout(() => {
      this.TaskQuery()
    }, 500);
  },
  methods: {
    formatTime(_time) {
      const formatedTimStr = moment(_time).format('yyyy-MM-DD HH:mm:ss');
      if (formatedTimStr == '0001-01-01 00:00:00' || formatedTimStr == '1900-01-01 00:00:00')
        return '';
      return formatedTimStr;
    },
    onmessage(ev) {
      this.tasks = JSON.parse(ev.data)
    },

    async TaskQuery(isQueryByPagination = false) {
      if (!isQueryByPagination) {
        this.loading = true;
        this.tasks = [];
        this.rows = 0;
        this.completeNum = 0;
        this.failNum = 0;
        this.cancelNum = 0;
        this.queryCondition.CurrentPage = 1;
      }

      setTimeout(() => {
        Query(this.queryCondition).then(retquery => {
          this.tasks = retquery.tasks
          this.rows = retquery.count;
          this.loading = false;
          this.completeNum = retquery.CompleteNum;
          this.failNum = retquery.FailNum;
          this.cancelNum = retquery.CancelNum;
          if (!isQueryByPagination) {
            this.queryCondition.CurrentPage = 1;
          }
        }).catch(er => {
          this.loading = false;
          Notifier.Danger('警報查詢失敗後端服務異常')
        });
      }, isQueryByPagination ? 0 : 100);

    },
    async SaveTocsv() {
      SaveTocsv(this.queryCondition.StartTime, this.queryCondition.EndTime, this.queryCondition.AgvName, this.queryCondition.TaskName, this.queryCondition.TaskResult)
      Notifier.Primary('檔案儲存成功')
    },
    async HandleExportToAutoRptFolder() {
      var response = await ExportToAutoRptFolder(this.queryCondition.StartTime, this.queryCondition.EndTime);
      if (response.confirm) {
        this.$swal.fire(
          {
            title: '匯出成功',
            html: response.message,
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      } else {
        this.$swal.fire(
          {
            text: response.message,
            title: '匯出失敗',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    },
    handlePageChange(payload) {
      this.TaskQuery(true);
    },
    CopyText(text) {
      CopyText(text)
    },
    async DeleteTaskHandle(taskRow) {
      await DeleteTask(taskRow.TaskName);
      this.TaskQuery(true);
    },
    filterAGVName(value, row) {
      return row.DesignatedAGVName === value;
    },
    ShowLocus(taskRow) {
      console.log(taskRow);
      const taskName = taskRow.TaskName;
      const agvName = taskRow.DesignatedAGVName;
      this.$router.push({
        path: '/data/agv_locus',
        query: {
          taskName: taskName,
          agvName: agvName
        }
      });
    }
  },
}
</script>
<style lang="scss" scoped>
.Task-query {
  padding: 0px;
  height: 100%;
  overflow-y: auto;

  .Task-options {
    label {
      font-weight: bold;
    }
  }
}
</style>