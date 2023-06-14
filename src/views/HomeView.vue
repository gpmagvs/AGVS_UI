<template>
  <div class="home-view h-100 d-flex flex-row">
    <div class="left-col d-flex flex-column w-50 border-right flex-fill">
      <AGVStatusVue></AGVStatusVue>
      <TaskStatusVue></TaskStatusVue>
    </div>
    <Map class="h-100" v-bind:style="{width:'40%'}"></Map>
    <TaskAllocationVue></TaskAllocationVue>
  </div>
</template>

<script>
import AGVStatusVue from '@/components/HomeView/AGVStatus/AGVStatus.vue'
import Map from '@/components/HomeView/Map.vue';
import TaskStatusVue from '@/components/HomeView/TaskStatus.vue';
import TaskAllocationVue from '@/components/HomeView/TaskAllocation.vue';
import bus from '@/event-bus.js'
export default {
  components: {
    AGVStatusVue, TaskStatusVue, Map, TaskAllocationVue,
  }
}
</script>

<style lang="scss" scoped>
.home-view {
  .left-col {
    overflow-y: scroll;
  }
}
</style>