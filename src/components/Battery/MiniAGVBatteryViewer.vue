<template>
  <div class="mini-agv-battery-view w-100 h-100">
    <div class="battery-container d-flex flex-row">
      <!-- <div class="battery-img bat1" v-bind:style="bat1_style.leveing"></div>
      <div class="battery-img bat2" v-bind:style="bat2_style.leveing"></div>-->
      <div class="battery-img bat2" v-bind:style="Bat1Style"></div>
      <div class="battery-img bat1" v-bind:style="Bat2Style"></div>
      <div
        class="bat-ctl bat_tex justify-content-center d-flex flex-row"
        style="position:absolute;width:100%;top:75%;font-size:30px;">
        <div class="rounded border p-2 text-start" style="position:relative; left:-74px;">
          <span class="p-2">Battery-2</span>
          <div>
            <b-button
              @click="BatteryLockHandler(2, true)"
              :disabled="!Bat2Lockable"
              variant="primary"
              class="mx-1">Lock</b-button>
            <b-button
              @click="BatteryLockHandler(2, false)"
              :disabled="!Bat2UnLockable"
              variant="primary"
              class="mx-1">Unlock</b-button>
          </div>
        </div>
        <div class="rounded border p-2 text-start" style="position:relative; left:-69px;">
          <span class="p-2">Battery-1</span>
          <div>
            <b-button
              @click="BatteryLockHandler(1, true)"
              :disabled="!Bat1Lockable"
              variant="primary"
              class="mx-1">Lock</b-button>
            <b-button
              @click="BatteryLockHandler(1, false)"
              :disabled="!Bat1UnLockable"
              variant="primary"
              class="mx-1">Unlock</b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { AGVStatusStore, SystemSettingsStore, DIOStore } from '@/store'
import { BatteryLockCtrl } from '@/api/VMSAPI.js'

export default {
  data() {
    return {
      bat1_style: {
        installed: {
          top: '3px',
          right: '125px'
        },
        leveing: {
          top: '35px',
          left: '-158px',
        },
        no_exist: {
          visibility: 'hidden'
        }
      },
      bat2_style: {
        installed: {
          top: '3px',
          right: '-122px'
        },
        leveing: {
          top: '35px',
          left: '91px',
        },
        no_exist: {
          visibility: 'hidden'
        }
      },
    }
  },
  computed: {
    AGVVersion() {
      return SystemSettingsStore.getters.Settings.Version;
    },
    Battery1Status() {
      return AGVStatusStore.getters.Battery1Status
    },
    Battery2Status() {
      return AGVStatusStore.getters.Battery2Status
    },
    Bat1Lockable() {
      return AGVStatusStore.getters.Bat1Lockable
    },
    Bat1UnLockable() {
      return AGVStatusStore.getters.Bat1UnLockable
    },
    Bat2Lockable() {
      return AGVStatusStore.getters.Bat2Lockable
    },
    Bat2UnLockable() {
      return AGVStatusStore.getters.Bat2UnLockable
    },
    Bat1Style_DemoAGV() {
      var batStatus = DIOStore.getters.DemoMiniAGVBatteryStatus.battery1;
      if (batStatus == 'installed')
        return this.bat1_style.installed;
      else if (batStatus == 'installing')
        return this.bat1_style.leveing;
      else if (batStatus == 'removed')
        return this.bat1_style.no_exist;
    },

    Bat2Style_DemoAGV() {
      var batStatus = DIOStore.getters.DemoMiniAGVBatteryStatus.battery2;
      if (batStatus == 'installed')
        return this.bat2_style.installed;
      else if (batStatus == 'installing')
        return this.bat2_style.leveing;
      else if (batStatus == 'removed')
        return this.bat2_style.no_exist;
    },
    Bat1Style() {
      if (!this.Battery1Status)
        return this.bat1_style.no_exist

      if (this.AGVVersion == 2)
        return this.Bat1Style_DemoAGV

      if (this.Battery1Status.SensorInfo.IsExistSensor1ON && this.Battery1Status.SensorInfo.IsDockingSensor1ON)
        return this.bat1_style.installed
      else if (this.Battery1Status.SensorInfo.IsExistSensor1ON && !this.Battery1Status.SensorInfo.IsDockingSensor1ON)
        return this.bat1_style.leveing
      else
        return this.bat1_style.no_exist
    },
    Bat2Style() {
      if (!this.Battery2Status)
        return this.bat2_style.no_exist

      if (this.AGVVersion == 2)
        return this.Bat2Style_DemoAGV

      if (this.Battery2Status.SensorInfo.IsExistSensor1ON && this.Battery2Status.SensorInfo.IsDockingSensor1ON)
        return this.bat2_style.installed
      else if (this.Battery2Status.SensorInfo.IsExistSensor1ON && !this.Battery2Status.SensorInfo.IsDockingSensor1ON)
        return this.bat2_style.leveing
      else
        return this.bat2_style.no_exist
    },
  },
  methods: {
    async BatteryLockHandler(bat_no, islock) {
      await BatteryLockCtrl(bat_no, islock)
    },
  }
}
</script>
<style lang="scss" scoped>
.bat-ctl {
  button {
    width: 105px;
  }
}

.battery-container {
  background: url("../../assets/images/Battery/Battery_Container.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 600px;
  height: 100%;
  width: 100%;

  .battery-img {
    position: absolute;
    background: url("../../assets/images/Battery/Battery.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 318px;
    height: 100%;
    width: 100%;

    span {
      position: absolute;
      bottom: -0px;
      font-size: 50px;
      color: white;
    }
  }
}
</style>