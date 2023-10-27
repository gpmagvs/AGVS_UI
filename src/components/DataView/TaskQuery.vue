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
        style="width: 100%"
        border
        aria-current="currentpage"
        id="Tasktable">
        <el-table-column label="接收時間" prop="RecieveTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.RecieveTime) }}</template>
        </el-table-column>
        <el-table-column label="結束時間" prop="FinishTime" width="160">
          <template #default="scope">{{ formatTime(scope.row.FinishTime) }}</template>
        </el-table-column>
        <el-table-column label="任務名稱" prop="TaskName" width="210"></el-table-column>
        <el-table-column label="執行結果" prop="StateName" width="100" align="center"></el-table-column>
        <el-table-column label="AGV名稱" prop="DesignatedAGVName" width="100" align="center"></el-table-column>
        <el-table-column label="任務類型" prop="ActionName" min-width="30" align="center"></el-table-column>
        <el-table-column label="起始站點" prop="From_Station" width="120" align="center"></el-table-column>
        <el-table-column label="結束站點" prop="To_Station" width="120" align="center"></el-table-column>
        <el-table-column label="載物ID" prop="Carrier_ID" min-width="30"></el-table-column>
        <el-table-column label="派工人員" prop="DispatcherName" width="100"></el-table-column>
        <el-table-column label="失敗原因" prop="FailureReason" min-width="120">
          <template #default="scope">
            <div class="text-danger">{{ scope.row.FailureReason }}</div>
          </template>
        </el-table-column>
      </el-table>
      <div class="d-flex flex-row justify-content-center">
        <b-pagination
          :per-page="per_page_num"
          :total-rows="rows"
          aria-controls="Tasktable"
          class="pagination justify-content-center"
          v-model="currentpage"
          @click="PageChnageHandle">
        </b-pagination>
        <div class="mx-3 py-2">共 <span style="font-weight: bold; font-size: large;"> {{ rows }}</span>筆</div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { TaskQuery } from '@/api/TaskAPI.js'
import { SaveTocsv } from '@/api/TaskAPI.js'
import { userStore, agv_states_store } from '@/store';

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
      per_page_num: 20,
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
    this.end_time = EndDate.toISOString().substring(0, 10) + ' 00:00:00';
    TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected, this.TaskName).then(retquery => {
      this.tasks = retquery.tasks
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