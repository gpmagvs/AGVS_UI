<template>
  <div class="map-right-click-menu">
    <button @click="GoToSettingPage()">設定</button>
    <button @click="GoToEqStatusTable()">IO/狀態檢視</button>
    <button @click="GoToSettingPage()">將AGV定位在此點</button>

    <div class="w-100 d-flex flex-column border-top py-1" v-if="isEmulationEq">
      <div class="text-start text-primary font-size-smaller">模擬器</div>
      <button @click="SetLoadable()">設為可入料</button>
      <button @click="SetUnloadable()">設為可出料</button>
      <button @click="SetBusy()">設為BUSY</button>
    </div>
    <!-- <span class="text-light">{{ agvState }}</span> -->
  </div>
</template>
  

<script>
import { Feature } from 'ol';
import bus from '@/event-bus';
import { EqStore } from '@/store';
import { DeviceConfig } from '@/ViewModels/EndDeviceOption';
import { EmuAPI } from '@/api/EquipmentAPI';
export default {
  props: {
    eqTag: {
      type: Number,
      default: 0
    },
  },
  computed: {
    eqOption() {
      const opt = EqStore.state.EqOptions.find(opt => opt.TagID == this.eqTag);
      if (opt)
        return opt;
      else
        return new DeviceConfig();
    },
    isEmulationEq() {
      return this.eqOption.IsEmulation;
    },
    eqName() {
      return this.eqOption.Name;
    }
  },
  methods: {
    SetLoadable() {
      EmuAPI.SetState(this.eqName, 'load')
    },
    SetUnloadable() {
      EmuAPI.SetState(this.eqName, 'unload')
    },
    SetBusy() {
      EmuAPI.SetState(this.eqName, 'busy')
    },
    GoToSettingPage() {
      this.$router.push(`/sys_settings/Equipment_Setting?eqTag=${this.eqTag}`)
    },
    GoToEqStatusTable() {
      bus.emit('viewEqStatus')
    }
  },
}
</script>

<style lang="scss">
</style>