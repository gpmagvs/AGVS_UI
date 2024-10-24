<template>
  <div class="rack-status-view custom-tabs-head p-1">
    <div class="text-start border-bottom my-1 py-1">
      <span class="px-2 text-primary">
        <b>顯示方式</b>
      </span>
      <el-select class="mx-2" v-model="display" style="width:120px">
        <el-option label="分頁顯示" value="tabs"></el-option>
        <el-option label="單頁顯示" value="div"></el-option>
      </el-select>
    </div>
    <b-tabs v-if="display=='tabs'">
      <b-tab v-for="Rack in WIPData" :key="Rack.WIPName" :title="Rack.WIPName">
        <div class="rack-container d-flex flex-row justify-content-center border">
          <RackStatus :rack_info="Rack"></RackStatus>
        </div>
      </b-tab>
    </b-tabs>
    <div v-else>
      <div class="my-1" v-for="Rack in WIPData" :key="Rack.WIPName">
        <div class="rack-container d-flex flex-row justify-content-center border">
          <RackStatus :rack_info="Rack"></RackStatus>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import RackStatus from '@/components/RacksStatusView/RackStatus.vue'
import { EqStore } from '@/store'
export default {
  components: {
    RackStatus,
  },
  data() {
    return {
      display: 'div'//div
    }
  },
  computed: {
    WIPData() {
      return EqStore.state.WIPsData
    },
  },
  watch: {
    display(nval) {
      localStorage.setItem('wips-display-mode', nval)
    }
  },
  mounted() {
    var _displayStored = localStorage.getItem('wips-display-mode');
    if (_displayStored) {
      this.display = _displayStored;
    }
  }
}
</script>
<style lang="scss">
.rack-status-view {
}
</style>