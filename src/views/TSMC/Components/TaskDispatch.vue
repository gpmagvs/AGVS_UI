<template>
  <div>
    <div class="d-flex">
      <div class="actions w-50">
        <AGVStatus></AGVStatus>
        <Dispatcher></Dispatcher>
      </div>
      <task-status-vue class="flex-fill" :show_card_title="false" display_mode="column"></task-status-vue>
    </div>
    <TaskAllocationVue></TaskAllocationVue>
  </div>
</template>

<script>
import AGVStatus from '@/components/HomeView/AGVStatus/AGVStatus.vue'
import TaskStatusVue from '@/components/HomeView/TaskStatus.vue';
import Dispatcher from './Dispatcher.vue';
import TaskAllocationVue from '@/components/HomeView/TaskAllocation.vue';
import { MapStore } from '@/components/Map/store';
export default {
  components: {
    AGVStatus, TaskStatusVue, Dispatcher, TaskAllocationVue
  },
  mounted() {
    MapStore.dispatch('DownloadMapData');
  }

}
</script>

<style lang="scss" scoped></style>