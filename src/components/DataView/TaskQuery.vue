<template>
  <div class="Task-query">
    <div class="Task-options bg-light d-flex border-bottom w-100 py-2">
      <label>Start Time</label>
      <input type="datetime-local" v-model="start_time" prop="Start Time" />
      <label>End Time</label>
      <input type="datetime-local" v-model="end_time" prop="End Time" />
      <label>任務名稱</label>
      <input type="text" v-model="TaskName" placeholder="ALL" size="20" />
      <label>EQ Name</label>
      <select prop="EQ Name" v-model="AGVSelected">
        <option>ALL</option>
        <option v-for="name in AgvNameList" :key="name">{{ name }}</option>
      </select>
      <label>任務類型</label>
      <select prop="EQ Name" v-model="ActionTypeSelected">
        <option>ALL</option>
        <option>移動</option>
        <option>取貨</option>
        <option>放貨</option>
        <option>搬運</option>
        <option>充電</option>
        <option>量測</option>
        <option>交換電池</option>
      </select>
      <label>執行結果</label>
      <select prop="EQ Name" v-model="ExecuteResultSelected">
        <option>ALL</option>
        <option>完成</option>
        <option>失敗</option>
        <option>取消</option>
      </select>
      <b-button
        @click="TaskQuery()"
        :TaskQuery="TaskQuery"
        class="Select-Query"
        variant="primary mx-1"
        size="sm"
        style="float:right">搜尋</b-button>
      <b-button
        @click="SaveTocsv()"
        :SaveTocsv="SaveTocsv"
        class="SaveTocsv mx-2"
        variant="primary"
        size="sm"
        style="float:right">輸出csv檔</b-button>
    </div>
    <div>
      <el-table
        v-loading="loading"
        :data="tasks"
        empty-text="No Tasks"
        row-class-name="row_state_class_name"
        size="small"
        style="width: 100%;font-weight: bold;"
        border
        aria-current="currentpage"
        id="Tasktable">
        <el-table-column label="任務名稱" prop="TaskName" width="230">
          <template #default="scope">
            <div> {{ scope.row.TaskName }} <el-tooltip placement="top-start" content="複製到剪貼簿">
                <i
                  @click="CopyText(scope.row.TaskName)"
                  class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="接收時間" prop="RecieveTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.RecieveTime) }}</template>
        </el-table-column>
        <el-table-column label="結束時間" prop="FinishTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.FinishTime) }}</template>
        </el-table-column>
        <el-table-column label="執行結果" prop="StateName" width="100" align="center">
          <template #default="scope">
            <el-tag
              effect="dark"
              :type="scope.row.State == 4 ? 'success' : scope.row.State == 6 ? 'danger' : 'warning'">{{ scope.row.StateName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AGV名稱" prop="DesignatedAGVName" width="100" align="center"></el-table-column>
        <el-table-column label="任務類型" prop="ActionName" min-width="30" align="center"></el-table-column>
        <el-table-column label="起點" prop="From_Station_Display" width="120" align="center">
        </el-table-column>
        <el-table-column label="起點Slot" prop="From_Slot" width="120" align="center">
          <template #default="scope"> {{ scope.row.From_Slot == -1 ? '-' : scope.row.From_Slot }} </template>
        </el-table-column>
        <el-table-column label="終點" prop="To_Station_Display" width="120" align="center">
        </el-table-column>
        <el-table-column label="終點Slot" prop="To_Slot" width="120" align="center">
          <template #default="scope"> {{ scope.row.To_Slot == -1 ? '-' : scope.row.To_Slot }} </template>
        </el-table-column>
        <el-table-column label="載物ID" prop="Carrier_ID" min-width="30">
          <template #default="scope">
            <div> {{ scope.row.Carrier_ID == '-1' ? '' : scope.row.Carrier_ID }} <el-tooltip placement="top-start" content="複製到剪貼簿">
                <i
                  v-if="scope.row.Carrier_ID != '-1' && scope.row.Carrier_ID != ''"
                  @click="CopyText(scope.row.Carrier_ID)"
                  class="copy-button copy-icon bi bi-clipboard"></i>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="派工人員" prop="DispatcherName" width="100"></el-table-column>
        <el-table-column label="失敗原因" prop="FailureReason" min-width="120">
          <template #default="scope">
            <div class="text-danger">
              <div v-for="alarm in scope.row.FailureReason.split(',')" :key="alarm">{{ alarm }}</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex flex-row justify-content-center">
        <b-pagination :per-page="per_page_num" :total-rows="rows" aria-controls="Tasktable" class="pagination justify-content-center" v-model="currentpage" @click="PageChnageHandle"></b-pagination>
        <div class="mx-3 py-2"> 共 <span style="font-weight: bold; font-size: large;">{{ rows }}</span>筆 </div>
      </div>
    </div>
  </div>
</template>
<script>
import { TaskQuery } from '@/api/TaskAPI.js'
import { SaveTocsv } from '@/api/TaskAPI.js'
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
  },
  mounted() {
    const EndDate = new Date();
    this.end_time = EndDate.toISOString().substring(0, 10) + ' 23:59:59';
    this.start_time = moment(this.end_time, 'YYYY-MM-DD HH:mm:ss').subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');

    setTimeout(() => {
      TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected, this.TaskName).then(retquery => {
        this.tasks = retquery.tasks
        this.rows = retquery.count;
        this.currentpage = retquery.currentpage;
      }).catch(er => {
        Notifier.Danger('警報查詢失敗後端服務異常')
      });
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
        TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected, this.TaskName, this.ExecuteResultSelected, this.ActionTypeSelected).then(retquery => {
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
      TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected, this.TaskName, this.ExecuteResultSelected, this.ActionTypeSelected).then(retquery => {
        this.tasks = retquery.tasks;
      }
      ).catch(er => {
        Notifier.Danger('警報查詢失敗後端服務異常')
      });
    },
    CopyText(text) {
      CopyText(text)
    }
  },
}
</script>
<style lang="scss" scoped>
.Task-query {
  overflow-y: scroll;
  padding: 0px;

  .Task-options {
    label {
      margin: auto 10px;
      font-weight: bold;
    }
  }
}
</style>