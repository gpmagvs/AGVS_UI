<template>
  <div class="battery-state d-flex">
    <div
      class="bat-show bg-light d-flex flex-fill"
      v-for="bat in BatteryStatus"
      :key="bat.BatteryID"
    >
      <i style="color:limegreen" class="bi bi-battery-charging"></i>
      <div class="flex-fill">
        <el-progress text-inside stroke-width="30" :percentage="bat.BatteryLevel" status="warning"></el-progress>
      </div>
    </div>
    <!-- {{ BatteryStatus }} -->
  </div>
</template>

<script>
import { AGVStatusStore } from '@/store'
export default {
  computed: {
    BatteryStatus() {
      var batstates = AGVStatusStore.getters.BatteryStatus
      //[
      // {  
      //    BatteryID: 1
      //    BatteryLevel: 66
      //    ChargeCurrent: 0
      //    CircuitOpened: false
      //    IsCharging: false
      //    IsError: false 
      //    }
      // ]
      return batstates
    }
  },
}
</script>

<style lang="scss" scoped>
.battery-state {
}
</style>