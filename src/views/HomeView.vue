<template>
  <div class="home-view h-100 custom-tabs-head" v-loading="loading">
    <div v-bind:style="{
      visibility: isEasyMode ? 'hidden' : 'visible'
    }" class="d-flex flex-row ">
      <div class="left-col border-right flex-fill">
        <AGVStatusVue></AGVStatusVue>
        <TaskStatusVue height="500px"></TaskStatusVue>
      </div>
      <b-tabs v-bind:style="{ width: '60%' }" @activate-tab="TabActiveHandle">
        <b-tab title="地圖">
          <div style="height:800px" class="border">
            <HomeMap></HomeMap>
            <!-- <LMap></LMap> -->
          </div>
        </b-tab>
        <b-tab title="設備狀態">
          <div class="border w-100">
            <EQStatus></EQStatus>
          </div>
        </b-tab>
      </b-tabs>
      <TaskAllocationVue></TaskAllocationVue>
    </div>
    <div v-bind:style="{
      visibility: isEasyMode ? 'visible' : 'hidden',
      position: 'absolute',
      top: '140px',
      width: '100%'
    }" class="easy_mode d-flex">
      <div>
        <AGVStatusVue :IsEasyMode="true"></AGVStatusVue>
      </div>
      <div style="width:100%;padding-right:50px" class="border">
        <HomeMap id="homemap-easymode"></HomeMap>
        <!-- <LMap></LMap> -->
      </div>
    </div>
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
  data() {
    return {
      isEasyMode: false,
      loading: false
    }
  },
  mounted() {
    bus.on('view_mode_changed', (isEasyMode) => {
      this.loading = true
      this.isEasyMode = isEasyMode;
      setTimeout(() => {
        this.loading = false
      }, 300)

    });
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