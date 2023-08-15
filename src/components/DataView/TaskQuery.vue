<template>
    <div class="Task-query">
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
        <b-button @click="TaskQuery()" :TaskQuery="TaskQuery" class="Select-Query" variant="primary" size="sm"
          style="float:right">搜尋</b-button>
      </div>
      <div>
        <el-table :data="tasks" empty-text="No Tasks" row-class-name="row_state_class_name" size="small"
          style="width: 100%" aria-current="currentpage" id="Tasktable">
          <el-table-column label="接收時間" prop="RecieveTime" width="160">
            <template #default="scope">{{ formatTime(scope.row.RecieveTime) }}</template>
          </el-table-column>
          <el-table-column label="結束時間" prop="FinishTime" width="160">
            <template #default="scope">{{ formatTime(scope.row.FinishTime) }}</template>
          </el-table-column>
          <el-table-column label="任務名稱" prop="TaskName" width="210"></el-table-column>
          <el-table-column label="任務情況" prop="StateName" width="100"></el-table-column>
          <el-table-column label="執行人員" prop="DispatcherName" width="100"></el-table-column>
          <el-table-column label="AGV名稱" prop="DesignatedAGVName" width="100"></el-table-column>          
          <el-table-column label="任務描述" prop="ActionName" min-width="100"></el-table-column>  
          <el-table-column label="起始地點" prop="From_Station" width="180"></el-table-column>
          <el-table-column label="結束地點" prop="To_Station" width="180"></el-table-column>
          <el-table-column label="料號名稱" prop="Carrier_ID" min-width="160"></el-table-column>
        </el-table>
        <b-pagination :per-page="per_page_num" :total-rows="rows" aria-controls="Tasktable"
          class="pagination justify-content-center" v-model="currentpage" @click="PageChnageHandle"></b-pagination>
      </div>
    </div>
  </template>
  
  <script>
  import { TaskQuery } from '@/api/TaskAPI.js'
  import moment from 'moment'
  import Notifier from '@/api/NotifyHelper'
  export default {
    data() {
      return {
        start_time: '2023-06-01 00:00:00',
        end_time: '2023-06-30 00:00:00',
        AGVSelected: 'ALL',
        tasks: [],
        per_page_num: 10,
        rows: 1,
        currentpage: 1,
        loading: false,
      }
    },
    mounted() {
        TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected).then(retquery => {
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
        this.payload=2;
        setTimeout(() => {
            TaskQuery(this.currentpage, this.start_time, this.end_time, this.AGVSelected).then(retquery => {
            this.tasks = retquery.tasks
            this.rows = retquery.count;
            this.currentpage = retquery.currentpage;
          }).catch(er => {
            this.loading = false;
            Notifier.Danger('警報查詢失敗後端服務異常')
          });
        }, 300);
  
      },
      PageChnageHandle(payload) {
        TaskQuery(this.currentpage,this.start_time, this.end_time, this.AGVSelected).then(retquery => {
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