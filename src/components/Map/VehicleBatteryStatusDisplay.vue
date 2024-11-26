<template>
  <div class="vehicle-bat-status d-flex flex-column" :style="dynamicStyle">
    <span v-bind:class="[colorClass]">{{batteryLevel.batLv.toFixed(0)}}%</span>
    <el-tooltip :transition="'el-fade-in-linear'" placement="right" :content="tooltipContent">
      <i v-bind:class="[iconClass,colorClass]"></i>
    </el-tooltip>
  </div>
</template>

<script>
import { agv_states_store } from '@/store';
export default {
  props: {
    dynamicStyle: {
      type: Object,
      default() {
        return {
          position: 'absolute',
          left: '0px',
          top: '0px',
          transform: 'translate(0, -50%)', // 垂直置中
          zIndex: 1
        }
      }
    },
    agvName: {
      type: String,
      default: "AGV_"
    }
  },
  computed: {
    batteryLevel() {
      return agv_states_store.getters.VehicleBattery(this.agvName);
    },
    iconClass() {
      const batLv = this.batteryLevel.batLv;
      const isCharging = this.batteryLevel.isCharging;
      if (isCharging) return 'bi bi-battery-charging text-success'
      if (batLv > 80)
        return 'bi bi-battery-full text-success'
      if (batLv > 30)
        return 'bi bi-battery-half text-warning'
      return 'bi bi-battery text-danger'
    },
    colorClass() {
      const batLv = this.batteryLevel.batLv;
      const isCharging = this.batteryLevel.isCharging;
      if (isCharging) return 'text-success'
      if (batLv > 80)
        return 'text-success'
      if (batLv > 30)
        return 'text-warning'
      return 'text-danger'
    },
    tooltipContent() {
      return `Remain : ${this.batteryLevel.batLv} %`
    }
  },
}
</script>

<style lang="scss" scoped>
.vehicle-bat-status {
  cursor: pointer;
  i {
    font-size: 40px;
    position: relative;
    top: -22px;
  }
  span {
    font-size: large;
    font-weight: 800;
  }
}
</style>