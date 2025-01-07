<template>
  <div class="agv-emulator">
    <el-form label-position="left" label-width="180px">
      <el-form-item label="Move Speed Ratio">
        <el-input-number
          v-model="Parameters.MoveSpeedRatio"
          :min="0"
          :max="1"
          :step="0.1"
          :precision="2"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Tap Move Speed Ratio">
        <el-input-number
          v-model="Parameters.TapMoveSpeedRatio"
          :min="0"
          :max="1"
          :step="0.05"
          :precision="2"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Rotation Speed">
        <el-input-number
          v-model="Parameters.RotationSpeed"
          :min="0"
          :max="180"
          :step="5"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Fork Lifter Speed">
        <el-input-number
          v-model="Parameters.ForkLifterSpeed"
          :min="0"
          :step="1"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Speed Up Rate">
        <el-input-number
          v-model="Parameters.SpeedUpRate"
          :min="0"
          :step="1"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Battery Charge Speed">
        <el-input-number
          v-model="Parameters.BatteryChargeSpeed"
          :min="0"
          :step="1"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Battery Used (Run)">
        <el-input-number
          v-model="Parameters.BatteryUsed_Run"
          :min="0"
          :max="1"
          :step="0.1"
          :precision="2"
          @change="HandleInputChanged"
        />
      </el-form-item>

      <el-form-item label="Working Time">
        <el-input-number
          v-model="Parameters.WorkingTime"
          :min="0"
          :step="1"
          @change="HandleInputChanged"
        />
      </el-form-item>
      <el-divider />
      <el-form-item label="CID Read Fail 模擬">
        <el-switch
          v-model="Parameters.IsCIDReadFailSimulation"
          @mousedown="HandleCIDReadFailChanged"
        />
      </el-form-item>
      <el-form-item label="CID Read Mismatch 模擬">
        <el-switch
          v-model="Parameters.IsCIDReadMismatchSimulation"
          @mousedown="HandleCIDReadMismatchChanged"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { agv_states_store } from '@/store'
export default {
  props: {
    AgvName: {
      type: String,
      required: true,
      default: "AGV_001"
    }
  },
  data() {
    return {
      debounceTimer: null,
      Parameters: {
        MoveSpeedRatio: 0.7,
        TapMoveSpeedRatio: 0.15,
        RotationSpeed: 15,
        ForkLifterSpeed: 0,
        SpeedUpRate: 10,
        BatteryChargeSpeed: 9,
        BatteryUsed_Run: 0.1,
        WorkingTime: 15,
        IsCIDReadMismatchSimulation: false,
        IsCIDReadFailSimulation: false
      }
    }
  },
  mounted() {
    this.Parameters = agv_states_store.getters.GetAGVEmuParameters(this.AgvName)
  },
  methods: {
    HandleInputChanged() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        try {
          await agv_states_store.dispatch('updateEmulationParameters', { agvName: this.AgvName, parameters: this.Parameters });
        } catch (error) {
          console.error('Failed to update emulation parameters:', error);
        }
      }, 500);
    },
    async HandleCIDReadFailChanged() {
      let _isCIDReadFail = !this.Parameters.IsCIDReadFailSimulation;
      let _isCIDReadMismatch = _isCIDReadFail ? false : this.Parameters.IsCIDReadMismatchSimulation;
      await agv_states_store.dispatch('setCIDAbnormalSimualtion', { agvName: this.AgvName, isCIDReadFail: _isCIDReadFail, isCIDReadMismatch: _isCIDReadMismatch })

      setTimeout(() => {
        this.Parameters = agv_states_store.getters.GetAGVEmuParameters(this.AgvName)
      }, 1000)
    },
    async HandleCIDReadMismatchChanged() {
      let _isCIDReadMismatch = !this.Parameters.IsCIDReadMismatchSimulation;
      let _isCIDReadFail = _isCIDReadMismatch ? false : this.Parameters.IsCIDReadFailSimulation;
      await agv_states_store.dispatch('setCIDAbnormalSimualtion', { agvName: this.AgvName, isCIDReadFail: _isCIDReadFail, isCIDReadMismatch: _isCIDReadMismatch })

      setTimeout(() => {
        this.Parameters = agv_states_store.getters.GetAGVEmuParameters(this.AgvName)
      }, 1000)
    }
  }
};
</script>

<style scoped lang="scss">
.agv-emulator {
  width: 100%;
  height: 100%;
}
</style>
