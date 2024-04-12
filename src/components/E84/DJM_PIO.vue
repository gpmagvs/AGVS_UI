<template>
  <div class="djm-pio border rounded mx-1 py-3 px-5">
    <div class="d-flex">
      <div>
        <div v-for="(state, name) in HandshakeSignals.AGV" :key="name" class="d-flex">
          <div class="signal-name">{{ name }}</div>
          <div
            @click="SignalWriteChangeHandler('AGV', name)"
            class="border signal-div rounded"
            v-bind:style="{
              backgroundColor: state ? 'rgb(0, 204, 0)' : 'grey',
            }">{{ state ? 'ON' : 'OFF' }}</div>
        </div>
      </div>
      <div class="mx-5">
        <div v-for="(state, name) in HandshakeSignals.EQ" :key="name" class="d-flex">
          <div class="signal-name">{{ name }}</div>
          <div
            @click="SignalWriteChangeHandler('EQ', name)"
            class="border signal-div rounded"
            v-bind:style="{
              backgroundColor: state ? 'rgb(0, 204, 0)' : 'grey',
            }">{{ state ? 'ON' : 'OFF' }}</div>
        </div>
      </div>
    </div>
    <div class="my-1 timer">
      <el-table size="small" :header-row-style="{ backgroundColor: 'black' }" border :data="HsTimerData" @click="HandleTimerTBClick">
        <el-table-column label="Timer" prop="name"></el-table-column>
        <el-table-column label="設定值" prop="sv"></el-table-column>
        <el-table-column label="當前值" prop="pv"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { AGVStatusStore, UserStore, SystemSettingsStore } from '@/store'
import { DIO } from '@/api/VMSAPI'
import bus from '@/event-bus.js'
export default {
  props: {
    Owner: {
      type: String,
      default: 'AGV'
    },
  },
  data() {
    return {
    }
  },
  computed: {
    Editable() {
      return UserStore.getters.CurrentUserRole != 0
    },
    IsGodUse() {
      return UserStore.getters.IsGodUser;
    },
    HandshakeSignals() {
      return AGVStatusStore.getters.Handshake_Signals
    },
    HSTimers() {
      return AGVStatusStore.getters.HSTimers
    },
    HsTimerData() {
      if (!this.HSTimerSettings || !this.HSTimers)
        return [];

      var data = [
        {
          name: 'T1',
          sv: this.HSTimerSettings.TA1_Wait_L_U_REQ_ON,
          pv: this.HSTimers.TA1_Wait_L_U_REQ_ON
        }, {
          name: 'T2',
          sv: this.HSTimerSettings.TA2_Wait_EQ_READY_ON,
          pv: this.HSTimers.TA2_Wait_EQ_READY_ON
        }, {
          name: 'T3',
          sv: this.HSTimerSettings.TA3_Wait_EQ_BUSY_ON,
          pv: this.HSTimers.TA3_Wait_EQ_BUSY_ON
        }, {
          name: 'T4',
          sv: this.HSTimerSettings.TA4_Wait_EQ_BUSY_OFF,
          pv: this.HSTimers.TA4_Wait_EQ_BUSY_OFF
        }, {
          name: 'T5',
          sv: this.HSTimerSettings.TA5_Wait_L_U_REQ_OFF,
          pv: this.HSTimers.TA5_Wait_L_U_REQ_OFF
        },
      ]
      return data;
    },
    HSTimerSettings() {
      return SystemSettingsStore.getters.Settings.EQHSTimeouts
    }

  },
  methods: {
    HandleTimerTBClick() {
      if (!this.IsGodUse) {
        return;
      }
      bus.emit('show-settings', 3);
    },
    async SignalWriteChangeHandler(owner, signal_name) {
      if (!this.IsGodUse) {
        return;
      }
      var state_to_change = !this.HandshakeSignals[owner][signal_name]
      await DIO.HsSignalChange(owner, signal_name, state_to_change)
    }
  },
}
</script>

<style lang="scss" scoped>
.djm-pio {}

h3 {
  //   padding-left: 100px;
  padding-bottom: 10px;
}

.signal-div {
  width: 60px;
  height: 60px;
  padding: 15px;
  color: white;
  cursor: pointer;
}

.signal-name {
  width: 100px;
  padding-top: 15px;
  padding-right: 10px;
  text-align: right;
  font-weight: bold;
}

.timer {
  span {
    margin-right: 5px;
  }
}
</style>