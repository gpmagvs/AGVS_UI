<template>
  <div>
    <div class="d-flex">
      <div class="actions w-50">
        <AGVStatus></AGVStatus>
        <Dispatcher></Dispatcher>
      </div>
      <task-status-vue class="flex-fill" :show_card_title="false" display_mode="column"></task-status-vue>
    </div>
  </div>
</template>

<script>
import AGVStatus from '@/components/HomeView/AGVStatus/AGVStatus.vue'
import TaskStatusVue from '@/components/HomeView/TaskStatus.vue';
import Dispatcher from './Dispatcher.vue';

export default {
  components: {
    AGVStatus, TaskStatusVue, Dispatcher
  },
}
</script>

<style lang="scss" scoped>
</style>