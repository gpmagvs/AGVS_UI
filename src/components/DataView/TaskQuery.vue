<template>
  <div class="Task-query">
    <div class="Task-options bg-light d-flex border-bottom w-100 py-2">
      <label>{{ $t('Search.Start_Time') }}</label>
      <input type="datetime-local" v-model="start_time" prop="Start Time" />
      <label>{{ $t('Search.End_Time') }}</label>
      <input type="datetime-local" v-model="end_time" prop="End Time" />
      <label>{{ $t('TaskTable.TaskName') }}</label>
      <el-input v-model="TaskName" placeholder="ALL" style="width:220px" clearable />
      <label>{{ $t('TaskTable.EQ_Name') }}</label>
      <el-select prop="EQ Name" v-model="AGVSelected" style="width:120px">
        <el-option label="ALL" value="ALL">ALL</el-option>
        <el-option v-for="name in AgvNameList" :key="name" :label="name" :value="name"></el-option>
      </el-select>
      <label>{{ $t('TaskTable.Action') }}</label>
      <el-select prop="EQ Name" v-model="ActionTypeSelected" style="width:120px">
        <el-option value="ALL" label="ALL"></el-option>
        <el-option :value="$t('Search.Move')" :label="$t('Search.Move')"></el-option>
        <el-option :value="$t('Search.Load')" :label="$t('Search.Load')"></el-option>
        <el-option :value="$t('Search.UnLoad')" :label="$t('Search.UnLoad')"></el-option>
        <el-option :value="$t('Search.Transfer')" :label="$t('Search.Transfer')"></el-option>
        <el-option :value="$t('Search.Charge')" :label="$t('Search.Charge')"></el-option>
        <el-option :value="$t('Search.Measure')" :label="$t('Search.Measure')"></el-option>
        <el-option :value="$t('Search.ExchangeBattrey')" :label="$t('Search.ExchangeBattrey')"></el-option>
      </el-select>
      <label>{{ $t('TaskTable.Final') }}</label>
      <el-select v-model="ExecuteResultSelected" style="width:120px">
        <el-option value="ALL" label="ALL"></el-option>
        <el-option :value="$t('Search.Completed')" :label="$t('Search.Completed')"></el-option>
        <el-option :value="$t('Search.Fail')" :label="$t('Search.Fail')"></el-option>
        <el-option :value="$t('Search.Cancel')" :label="$t('Search.Cancel')"></el-option>
      </el-select>
      <!-- <select prop="EQ Name" v-model="ExecuteResultSelected">
        <option>ALL</option>
        <option>{{ $t('Search.Completed') }}</option>
        <option>{{ $t('Search.Fail') }}</option>
        <option>{{ $t('Search.Cancel') }}</option>
      </select>-->
      <label>{{ $t('TaskTable.FailureReason') }}</label>
      <!-- <input type="text" v-model="Fail_reason" placeholder="ALL" size="20" /> -->
      <el-input v-model="Fail_reason" placeholder="ALL" clearable style="width:120px"></el-input>
      <b-button
        @click="TaskQuery()"
        :TaskQuery="TaskQuery"
        class="Select-Query"
        variant="primary mx-1"
        size="sm"
        style="float:right"
      >{{ $t('Search.Search') }}</b-button>
      <b-button
        @click="SaveTocsv()"
        :SaveTocsv="SaveTocsv"
        class="SaveTocsv mx-2"
        variant="primary"
        size="sm"
        style="float:right"
      >{{ $t('Search.Output_csv_file') }}</b-button>
    </div>
    <div>
      <el-table
        v-loading="loading"
        :data="tasks"
        empty-text="No Tasks"
        row-class-name="row_state_class_name"
        size="small"
        style="width: 100%; height: 770px ;font-weight: bold;"
        border
        aria-current="currentpage"
        id="Tasktable"
      >
        <el-table-column :label="$t('TaskTable.TaskName')" prop="TaskName" width="280">
          <template #default="scope">
            <div>
              {{ scope.row.TaskName }}
              <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i
                  @click="CopyText(scope.row.TaskName)"
                  class="copy-button copy-icon bi bi-clipboard"
                ></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.RecievedTime')" prop="RecieveTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.RecieveTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.FinishTime')" prop="FinishTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.FinishTime) }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.Final')" prop="StateName" width="100" align="center">
          <template #default="scope">
            <el-tag
              effect="dark"
              :type="scope.row.State == 4 ? 'success' : scope.row.State == 6 ? 'danger' : 'warning'"
            >
              {{
              scope.row.StateName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('TaskTable.AGV_Name')"
          prop="DesignatedAGVName"
          width="100"
          align="center"
        ></el-table-column>
        <el-table-column
          :label="$t('TaskTable.Action')"
          prop="ActionName"
          min-width="30"
          align="center"
        ></el-table-column>
        <el-table-column
          :label="$t('TaskTable.Source')"
          prop="From_Station_Display"
          width="120"
          align="center"
        ></el-table-column>
        <el-table-column
          :label="$t('TaskTable.Source_Slot')"
          prop="From_Slot"
          width="120"
          align="center"
        >
          <template #default="scope">{{ scope.row.From_Slot == -1 ? '-' : scope.row.From_Slot }}</template>
        </el-table-column>
        <el-table-column
          :label="$t('TaskTable.Destine')"
          prop="To_Station_Display"
          width="120"
          align="center"
        ></el-table-column>
        <el-table-column
          :label="$t('TaskTable.Destine_Slot')"
          prop="To_Slot"
          width="120"
          align="center"
        >
          <template #default="scope">{{ scope.row.To_Slot == -1 ? '-' : scope.row.To_Slot }}</template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.CstID')" prop="Carrier_ID" min-width="30">
          <template #default="scope">
            <div>
              {{ scope.row.Carrier_ID == '-1' ? '' : scope.row.Carrier_ID }}
              <el-tooltip placement="top-start" :content="$t('Rack.copy')">
                <i
                  v-if="scope.row.Carrier_ID != '-1' && scope.row.Carrier_ID != ''"
                  @click="CopyText(scope.row.Carrier_ID)"
                  class="copy-button copy-icon bi bi-clipboard"
                ></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('TaskTable.Dispatcher')" prop="DispatcherName" width="100"></el-table-column>
        <el-table-column :label="$t('TaskTable.Fail_reason')" prop="FailureReason" min-width="120">
          <template #default="scope">
            <div class="text-danger">
              <div v-for="alarm in scope.row.FailureReason.split(',')" :key="alarm">{{ alarm }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column min-width="120" v-if="isDevLogin" label="Action">
          <template #default="scope">
            <div class="w-100">
              <b-button variant="danger" @click="DeleteTaskHandle(scope.row)">Delete</b-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex flex-row justify-content-center fixed-bottom py-4">
        <b-pagination
          :per-page="per_page_num"
          :total-rows="rows"
          aria-controls="Tasktable"
          class="pagination justify-content-center"
          v-model="currentpage"
          @click="PageChnageHandle"
        ></b-pagination>
        <div class="mx-3 py-2">
          {{ $t('Search.Total_First') }}
          <span style="font-weight: bold; font-size: large;">
            {{
            rows
            }}
          </span>
          {{ $t('Search.Total_Last') }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { TaskQuery } from '@/api/TaskAPI.js'
import { SaveTocsv, DeleteTask } from '@/api/TaskAPI.js'
import { userStore, agv_states_store } from '@/store';
import { CopyText } from '@/api/Common/UtilityTools'
import moment from 'moment'
import Notifier from '@/api/NotifyHelper'
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
      per_page_num: 19,
      rows: 1,
      currentpage: 1,
      loading: false,
    }
  },
  computed: {
    AgvNameList() {
      return agv_states_store.getters.AGVNameList
    },
    isDevLogin() {
      return userStore.getters.IsDeveloperLogining;
    }
  },
  mounted() {
    const EndDate = new Date();
    this.end_time = EndDate.toISOString().substring(0, 10) + ' 23:59:59';
    this.start_time = moment(this.end_time, 'YYYY-MM-DD HH:mm:ss').subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
    setTimeout(() => {
      this.TaskQuery()
    }, 500);
  },
  methods: {
    formatTime(_time) {
      return moment(_time).format('yyyy-MM-DD HH:mm:ss');
    },
    onmessage(ev) {
      this.tasks = JSON.parse(ev.data)
    },

    async TaskQuery() {
      this.loading = true;
      this.tasks = [];
      this.rows = 1;
      this.currentpage = 1;
      this.payload = 2;
      setTimeout(() => {
        TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected, this.TaskName, this.ExecuteResultSelected, this.ActionTypeSelected, this.Fail_reason).then(retquery => {
          this.tasks = retquery.tasks
          this.rows = retquery.count;
          this.currentpage = retquery.currentpage;
          this.loading = false;
        }).catch(er => {
          this.loading = false;
          Notifier.Danger('警報查詢失敗後端服務異常')
        });
      }, 300);

    },
    async SaveTocsv() {
      SaveTocsv(this.start_time, this.end_time, this.AGVSelected, this.TaskName)
      Notifier.Primary('檔案儲存成功')
    },
    PageChnageHandle(payload) {
      TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected, this.TaskName, this.ExecuteResultSelected, this.ActionTypeSelected, this.Fail_reason).then(retquery => {
        this.tasks = retquery.tasks;
      }
      ).catch(er => {
        Notifier.Danger('警報查詢失敗後端服務異常')
      });
    },
    CopyText(text) {
      CopyText(text)
    },
    async DeleteTaskHandle(taskRow) {
      await DeleteTask(taskRow.TaskName);
      this.TaskQuery();
    }
  },
}
</script>
<style lang="scss" scoped>
.Task-query {
  padding: 0px;

  .Task-options {
    label {
      margin: auto 10px;
      font-weight: bold;
    }
  }
}
</style>