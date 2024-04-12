<template>
  <div class="battery d-flex flex-row" :style="'height:'+bHeight">
    <div>
      <i
        @click="RechargeCircuitControl"
        v-if="battery_status.IsCharging"
        style="color:limegreen"
        class="bi bi-battery-charging"
      ></i>
      <i
        @click="RechargeCircuitControl"
        v-else
        :class="'bi bi-battery-full'"
        :style="{color:IsLowBatteryLevel?'red':'black'}"
      ></i>
    </div>
    <b-progress class="flex-fill h-100" :max="max" animated>
      <b-progress-bar
        animated
        v-bind:class="battery_state_bg"
        :value="battery_level"
        :label="battery_level<=10? '':`${battery_level}%${battery_status.IsCharging?'(充電中)':''}`"
        v-bind:style="{
          fontSize:bHeight=='1rem'? '12px':'16px'
        }"
      ></b-progress-bar>
    </b-progress>
    <div
      class="bat_level_show_when_low"
      v-if="battery_level<=10"
      v-bind:style="{
          fontSize:bHeight=='1rem'? '12px':'16px'
        }"
    >{{battery_level }}%{{battery_status.IsCharging?'(充電中)':''}}</div>

    <div v-if="battery_status.IsCharging" class="charge-current px-3">
      <div>{{ $t('charging_current') }}: {{ battery_status.ChargeCurrent }} mA</div>
    </div>
  </div>
</template>

<script>
import { GetBatteryState, RechargeCircuit } from '@/api/VMSAPI';
import bus from '@/event-bus.js'
import { AGVStatusStore } from '@/store'
import BatteryStatus from '@/ViewModels/BatteryStatus';
export default {
  data() {
    return {
      max: 100,
    }
  },
  props: {
    Warning_Up_limit: {
      type: Number,
      default: 45
    },
    Warning_DOwn_limit: {
      type: Number,
      default: 20
    },
    bHeight: {
      type: String,
      default() {
        return '1rem'
      }
    },
    showIcon: {
      type: Boolean,
      default: true
    },
    battery_status: {
      type: Object,
      default() {
        return new BatteryStatus()
      }
    }
  },
  computed: {
    battery_level() {
      return this.battery_status.BatteryLevel;
    },
    battery_state_bg() {
      if (this.battery_status.IsCharging)
        return "charging"

      if (this.battery_level > this.Warning_Up_limit)
        return "full-state"
      if (this.battery_level <= this.Warning_Up_limit && this.battery_level >= this.Warning_DOwn_limit)
        return "bg-warning"
      else
        return "bg-danger"
    },
    IsLowBatteryLevel() {
      return this.battery_level < this.Warning_DOwn_limit
    },
    batHeight() {
      return this.bHeight;
    },
    IsHasRechareCircuit() {
      return !AGVStatusStore.getters.IsInspectionAGV;
    }
  },
  mounted() {
  },

  methods: {
    async RechargeCircuitControl() {
      if (!this.IsHasRechareCircuit)
        return;
      await RechargeCircuit()
    }
  }

}
</script>

<style scoped lang="scss">
.battery {
  i {
    font-size: 1.5rem;
    position: relative;
    top: -11px;
    margin: auto 4px;
  }
  .full-state {
    background-color: #007bff;
  }
  .charging {
    background-color: limegreen;
  }
  .charge-current {
    font-size: 11px;
    font-weight: bold;
  }
  .bat_level_show_when_low {
    font-weight: bold;
    position: absolute;
    right: 4px;
    top: 34px;
    color: #ff000091;
  }
}
</style>