<template>
  <div class="home-view h-100 w-100 d-flex flex-row custom-tabs-head">
    <div class="left-col border-right flex-fill">
      <AGVStatusVue></AGVStatusVue>
      <TaskStatusVue height="400px"></TaskStatusVue>
    </div>
    <b-tabs v-bind:style="{width:'60%'}" @activate-tab="TabActiveHandle">
      <b-tab title="地圖">
        <div style="height:800px">
          <HomeMap></HomeMap>
          <!-- <LMap></LMap> -->
        </div>
      </b-tab>
      <b-tab title="設備狀態">
        <div style="height:800px">
          <EQStatus></EQStatus>
        </div>
      </b-tab>
    </b-tabs>

    <TaskAllocationVue></TaskAllocationVue>
  </div>
</template>

<script>
import AGVStatusVue from '@/components/HomeView/AGVStatus/AGVStatus.vue'
import HomeMap from '@/components/HomeView/HomeMap.vue';
import LMap from '@/components/NavMap/AGVMap.vue'
import EQStatus from '@/components/HomeView/EQStatus.vue'
import TaskStatusVue from '@/components/HomeView/TaskStatus.vue';
import TaskAllocationVue from '@/components/HomeView/TaskAllocation.vue';
import bus from '@/event-bus.js'
import store from '@/store';
export default {
  components: {
    AGVStatusVue, TaskStatusVue, HomeMap, TaskAllocationVue, EQStatus, LMap
  },
  methods: {
    TabActiveHandle(tab) {
    }
  },
}
</script>

<style lang="scss" >
.home-view {
  .left-col {
    overflow-y: scroll;
  }
}
</style>