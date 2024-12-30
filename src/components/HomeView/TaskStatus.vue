<template>
  <div class="task-status card-like">
    <div v-if="show_card_title" class="title d-flex flex-row justify-content-between">
      <div>
        <i class="bi bi-three-dots-vertical"></i>
        {{ $t('HomeView.TaskStatus') }}
      </div>
      <div>
        <i class="bi bi-sliders" @click="ShowSettingsDrawer = true"></i>
      </div>
    </div>
    <div class v-if="display_mode == 'tabs'">
      <el-tabs lazy size type="border-card">
        <el-tab-pane :label="$t('IncompleteTasks')">
          <RunningTaskTable
            :height="height"
            :IncompletedTaskList="IncompletedTaskListTbData"
            :display_mode="'cards'"
            :taskIDSelected="taskIDSelected"
          ></RunningTaskTable>
        </el-tab-pane>
        <el-tab-pane :label="$t('CompleteTasks')">
          <CompletedTaskTable :height="height" :CompletedTaskList="CompletedTaskListTbData"></CompletedTaskTable>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-else class="column-display-mode">
      <div class="title-display">等待/執行中任務</div>
      <RunningTaskTable
        :height="height"
        :IncompletedTaskList="IncompletedTaskListTbData"
        display_mode="cards"
      ></RunningTaskTable>
      <div class="title-display">已結束任務</div>
      <CompletedTaskTable :height="height" :CompletedTaskList="CompletedTaskListTbData"></CompletedTaskTable>
    </div>
    <el-drawer v-model="ShowSettingsDrawer" title="任務狀態設定">
      <div class="setting-container w-100 bg-light text-start">
        <el-checkbox
          @change="HandleShowTrafficCkbChg"
          v-model="Settings.ShowTrafficTask"
          label="顯示交管任務"
        ></el-checkbox>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import clsTaskState from '@/ViewModels/TaskState.js'
import param from '@/gpm_param'
import { userStore, TaskStore } from '@/store'
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
    },
    taskIDSelected: {
      type: String,
      default: ""
    }
  },
  data() {
    return {

      showCancelTaskConfirm: false,
      cancelTaskName: '',
      ShowSettingsDrawer: false,
      Settings: {
        ShowTrafficTask: true
      }
    }
  },
  mounted() {
  },
  computed: {
    taskCancelable() {
      return userStore.getters.IsLogin;
    },
    IncompletedTaskListTbData() {
      if (!this.Settings.ShowTrafficTask) {
        return this.IncompletedTaskList.filter(tk => !tk.DispatcherName.toUpperCase().includes('TRAFFIC'))
      } else
        return this.IncompletedTaskList
    },
    CompletedTaskListTbData() {
      if (!this.Settings.ShowTrafficTask) {
        return this.CompletedTaskList.filter(tk => !tk.DispatcherName.toUpperCase().includes('TRAFFIC'))
      } else
        return this.CompletedTaskList

    },
    IncompletedTaskList() {
      return TaskStore.getters.IncompletedTaskList
    },
    CompletedTaskList() {
      return TaskStore.getters.CompletedTaskList

    }
  },
  methods: {
  },
}
</script>
<style lang="scss" scoped>
.task-status {
  .setting-container {
    .el-checkbox__input {
      font-size: 25px;
    }
  }

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