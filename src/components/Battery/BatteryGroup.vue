<template>
  <div class="battrey-group d-flex flex-row">
    <div
      class="bat d-flex flex-row"
      v-bind:class="IsMiniAGV ? 'w-50' : 'w-100'"
      v-for="i in IsMiniAGV ? [1, 2] : [0]"
      :key="i">
      <i
        v-if="GetBatteryStatus(i).IsCharging"
        style="color:limegreen"
        class="bi bi-battery-charging"></i>
      <i v-else :class="'bi bi-battery-full'"></i>
      <b-progress class="flex-fill h-100" :max="100" :animated="!IsBackendDisconnected" @click="HandleBatteryClick">
        <b-progress-bar
          :animated="!IsBackendDisconnected"
          :value="IsBackendDisconnected ? 100 : GetBatteryStatus(i).BatteryLevel"
          :label="GetLabel(GetBatteryStatus(i))"
          v-bind:class="GetClass(GetBatteryStatus(i))"
          style="font-size:16px;"></b-progress-bar>
      </b-progress>
      <div class="d-flex px-2" v-if="GetBatteryStatus(i).IsCharging">
        <label for>充電電流:</label> {{ GetBatteryStatus(i).ChargeCurrent }} <span
          class="px-1"
          style="font-size:smaller;">mA</span>
      </div>
    </div>
    <el-drawer v-model="show_inspection_agv_battery_viewer" direction="btt" size="600px" :show-close="false">
      <template #header="{ close }">
        <el-button
          class="border-bottom"
          style="z-index:9999"
          type="danger"
          size="large"
          @click="close">Close</el-button>
      </template>
      <MiniAGVBatteryViewer style="position:absolute;top:-50px;z-index: 1;"></MiniAGVBatteryViewer>
    </el-drawer>
    <el-drawer v-model="show_battery_info" direction="rtl" size="660px">
      <template #header>
        <div class="w-100 text-start">
          <h3>電池資訊</h3>
        </div>
      </template>
      <Battery_Detail ref="battery_detail" style="position: absolute; width:100%;top:80px"></Battery_Detail>
    </el-drawer>
  </div>
</template>

<script>
import BatteryStatus from '@/ViewModels/BatteryStatus';
import MiniAGVBatteryViewer from './MiniAGVBatteryViewer.vue'
import { AGVStatusStore } from '@/store'
import Battery_Detail from './Battery_Detail.vue';
export default {
  components: {
    MiniAGVBatteryViewer, Battery_Detail
  },
  props: {
    direction: {
      type: String,
      default: "horizon"
    },
    IsBackendDisconnected: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    IsMiniAGV() {
      return AGVStatusStore.getters.IsInspectionAGV
    },
    battery_states() {
      return AGVStatusStore.getters.BatteryStatus
    }
  },
  data() {
    return {
      show_inspection_agv_battery_viewer: false,
      show_battery_info: false
    }
  },
  methods: {
    GetBatteryStatus(index) {
      try {
        var stat = this.battery_states.find(bat => bat.BatteryID == index)
        if (stat)
          return stat
        else
          return new BatteryStatus(100)
      } catch (error) {
        return new BatteryStatus(100)
      }
    },
    GetLabel(bat_status = new BatteryStatus) {
      if (this.IsBackendDisconnected)
        return '電池狀態未知'

      if (!bat_status.IsCharging)
        return bat_status.BatteryLevel + "%";
      else {
        return bat_status.BatteryLevel + "%(充電中)";
      }
    },
    GetClass(bat_status = new BatteryStatus) {
      if (this.IsBackendDisconnected)
        return 'bg-danger'

      var batLevel = bat_status.BatteryLevel;
      if (!bat_status.IsCharging) {
        if (batLevel < 20)
          return 'bg-danger'
        else if (batLevel >= 20 && batLevel < 40)
          return 'bg-warning'
        else
          return 'bg-primary'
      }
      else {
        return 'charging'
      }
    },
    OnClick(i) {
      alert('wtf' + i)
    },
    async HandleBatteryClick() {
      if (this.IsMiniAGV)
        this.show_inspection_agv_battery_viewer = true
      else
        this.show_battery_info = true;
      setTimeout(() => {
        if (this.$refs['battery_detail'])
          this.$refs['battery_detail'].UpdateChargeCircuitState();
      }, 500);
    }
  },
}
</script>

<style lang="scss" scoped>
.battrey-group {
  height: 22px;
  margin-top: 2px;

  i {
    font-size: 20px;
    transform: rotate(-0.25turn);
    margin-right: 3px;
    position: relative;
    left: -2px;
  }

  .charging {
    background-color: limegreen;
  }
}
</style>