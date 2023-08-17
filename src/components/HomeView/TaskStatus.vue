<template>
  <div class="task-status card-like">
    <div v-show="show_card_title" class="title">
      <i class="bi bi-three-dots-vertical"></i>任務狀態 TASK STATUS
    </div>
    <div class="px-1" v-if="display_mode=='tabs'">
      <el-tabs @activate-tab="TabActiveHandle" size>
        <el-tab-pane label="未完成任務">
          <RunningTaskTable :height="height" :IncompletedTaskList="IncompletedTaskList"></RunningTaskTable>
        </el-tab-pane>
        <el-tab-pane label="已結束任務">
          <CompletedTaskTable :height="height" :CompletedTaskList="CompletedTaskList"></CompletedTaskTable>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-else class="column-display-mode">
      <div class="title-display">等待/執行中任務</div>
      <RunningTaskTable :height="height" :IncompletedTaskList="IncompletedTaskList"></RunningTaskTable>
      <div class="title-display">已結束任務</div>
      <CompletedTaskTable :height="height" :CompletedTaskList="CompletedTaskList"></CompletedTaskTable>
    </div>
  </div>
</template>

<script>
import clsTaskState from '@/ViewModels/TaskState.js'
import param from '@/gpm_param'
import { userStore } from '@/store'
import RunningTaskTable from '@/components/TaskStatus/RunningTaskTable.vue'
import CompletedTaskTable from '@/components/TaskStatus/CompletedTaskTable.vue'
export default {
  components: {
    RunningTaskTable, CompletedTaskTable
  },
  props: {
    display_mode: {
      type: String,
      default: 'tabs'
    },
    show_card_title: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      defualt: '310px'
    }
  },
  data() {
    return {
      IncompletedTaskList: [
      ],
      CompletedTaskList: [
      ],
      showCancelTaskConfirm: false,
      cancelTaskName: ''
    }
  },
  mounted() {
    this.WsInit();
  },
  computed: {
    taskCancelable() {
      return userStore.getters.IsLogin;
    }
  },
  methods: {

    WsInit() {
      const worker = new Worker('websocket_worker.js')
      worker.onmessage = (event) => {
        var parsedArray = event.data;
        this.IncompletedTaskList = parsedArray.incompleteds.map(task => new clsTaskState(task));
        this.CompletedTaskList = parsedArray.completeds.map(task => new clsTaskState(task));
      }
      worker.postMessage({ command: 'connect', ws_url: param.backend_ws_host + '/ws/TaskData' });
    }
  },
}
</script>

<style lang="scss" scoped>
.task-status {
  .column-display-mode {
    height: 100%;
    .title-display {
      text-align: left;
      font-weight: bold;
      letter-spacing: 1px;
    }
  }
}
</style>