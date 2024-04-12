<template>
  <div class="manual_settings border px-3 mx-3">
    <div class="d-flex flex-row py-3">
      <div class="item-label">Laser Mode</div>
      <LaserModeSwitcher></LaserModeSwitcher>
    </div>
    <div class="d-flex flex-row py-3">
      <div class="item-label">Current Laser Mode</div>
      <div>
        <b-form-input
          size="lg"
          class="centered-text"
          disabled
          v-model="CurrentLaserMode"
          min="0"
          max="16"
          text-align="center"></b-form-input>
      </div>
    </div>
    <el-drawer v-model="show_keyboard" direction="btt" size="50%">
      <SimpleKeyboard keyboard_type="number" @onChange="onChange"></SimpleKeyboard>
    </el-drawer>
    <div v-if="IsBatteryLockControlable" class="d-flex flex-row py-3">
      <div class="item-label">電池鎖定</div>
      <div class="battery py-1">
        <div class="d-flex flex-row py-2 my-2 border-bottom">
          <label>電池 1(近PC側)</label>
          <b-button :disabled="!Bat1Lockable" @click="BatteryLockHandler(1, true)" squared variant="primary">Lock</b-button>
          <b-button :disabled="Bat1Lockable" @click="BatteryLockHandler(1, false)" squared variant="danger">Unlock</b-button>
        </div>
        <div class="d-flex flex-row">
          <label>電池 2(近天線側)</label>
          <b-button :disabled="!Bat2Lockable" @click="BatteryLockHandler(2, true)" squared variant="primary">Lock</b-button>
          <b-button :disabled="Bat2Lockable" @click="BatteryLockHandler(2, false)" squared variant="danger">Unlock</b-button>
        </div>
      </div>
    </div>
    <div v-if="IsForkARMControlable" class="d-flex flex-row py-3">
      <div class="item-label">牙叉伸縮</div>
      <div class="battery py-1">
        <div class="d-flex flex-row mb-1">
          <b-button
            :disabled="!enabled || FORK_ARM_Status.IsArmAtHomePose && !FORK_ARM_Status.IsArmAtEndPose"
            @click="ForkArmPoseControlHandler(false)"
            squared
            variant="primary">縮回</b-button>
          <b-button
            :disabled="!enabled || FORK_ARM_Status.IsArmAtEndPose && !FORK_ARM_Status.IsArmAtHomePose"
            @click="ForkArmPoseControlHandler(true)"
            squared
            variant="primary">伸出</b-button>
          <b-button @click="ForkArmStopHandler()" squared variant="danger">停止</b-button>
        </div>
      </div>
    </div>
    <div v-if="IsPinMounted" class="d-flex flex-row py-3">
      <div class="item-label">浮動牙叉</div>
      <div class="battery py-1">
        <div class="d-flex flex-row mb-1">
          <b-button
            :disabled="PinState.pose == 'lock' || pin_action_running"
            @click="ForkFloatPinDriverControlHandler(true)"
            squared
            variant="primary">LOCK</b-button>
          <b-button
            :disabled="PinState.pose == 'release' || pin_action_running"
            @click="ForkFloatPinDriverControlHandler(false)"
            squared
            variant="primary">RELEASE</b-button>
          <div style="font-size: smaller;">目前狀態:{{ PinState.pose.toUpperCase() }}</div>
          <!-- {{ PinState }} -->
        </div>
      </div>
    </div>
    <div v-if="false" class="d-flex flex-row py-3">
      <div class="item-label">煞車功能</div>
      <b-button
        :disabled="!enabled"
        class="mx-1"
        squared
        variant="danger"
        style="width:130px"
        @click="Brake()">煞車</b-button>
      <b-button
        :disabled="!enabled"
        class="mx-1"
        squared
        variant="primary"
        style="width:130px"
        @click="UnBrake()">解除煞車</b-button>
    </div>
    <div v-if="false" class="d-flex flex-row py-3">
      <div class="item-label">里程數</div>
      <b-button
        :disabled="!enabled"
        class="mx-1"
        squared
        variant="danger"
        style="width:130px"
        @click="ResetMile()">重置里程數</b-button>
    </div>
    <b-modal
      v-model="modifyLaserModeDialogShow"
      :centered="true"
      title="Laser Mode Change"
      @ok="ModifyLaserMode">
      <p>Change Laser Mode to : {{ laser_mode }}</p>
      <p>Are you sure?</p>
    </b-modal>
  </div>
</template>
<script>
import { LaserMode, Braker, Reset_Mileage, BatteryLockCtrl, ForkAPI } from '@/api/VMSAPI.js'
import Notifier from '@/api/NotifyHelper';
import SimpleKeyboard from '@/components/Tools/SimpleKeyboard.vue'
import LaserModeSwitcher from '@/components/LaserModeSwitcher.vue'
import { AGVStatusStore, DIOStore, UserStore, SystemSettingsStore } from '@/store'
import { ROS_STORE } from '@/store/ros_store';

export default {
  components: {
    SimpleKeyboard, LaserModeSwitcher
  },
  props: {
  },
  data() {
    return {
      laser_mode: 0,
      modifyLaserModeDialogShow: false,
      show_keyboard: false,
      pin_action_running: false,

    }
  },
  computed: {
    IsBatteryLockControlable() {
      return AGVStatusStore.getters.IsInspectionAGV
    },
    IsForkARMControlable() {
      return AGVStatusStore.getters.IsForkExtenable
    },
    IsForkAGV() {
      return AGVStatusStore.getters.IsForkAGV
    },
    FORK_ARM_Status() {
      //{
      //   IsArmAtHomePose: IsArmAtHomePose,
      //   IsArmAtEndPose: IsArmAtEndPose
      // }

      return DIOStore.getters.Fork_ARM_States
    },
    CurrentLaserMode() {
      return AGVStatusStore.getters.CurrentLaserMode
    },
    enabled() {
      return UserStore.getters.Operationable
    },
    IsPinMounted() {
      if (!this.IsForkAGV || !SystemSettingsStore.getters.Settings.ForkAGV)
        return false;
      return SystemSettingsStore.getters.Settings.ForkAGV.IsPinMounted;
    },
    PinState() {
      if (ROS_STORE.getters.Pin_State)
        return ROS_STORE.getters.Pin_State;
      else {
        return {
          pose: ''
        }
      }
    },
    Bat1Lockable() {
      return AGVStatusStore.getters.Bat1Lockable
    },
    Bat2Lockable() {
      return AGVStatusStore.getters.Bat2Lockable
    },
  },
  methods: {
    LaserMode_Increase() {
      this.laser_mode++;
    },
    LaserMode_decrease() {
      if (this.laser_mode == 0)
        return;
      this.laser_mode--;
    },
    async ModifyLaserMode() {
      await LaserMode(this.laser_mode);
      Notifier.Success(`Lasr mode changed:${this.laser_mode}`);
    },
    async Brake() {
      await Braker.Brake();
    },
    async UnBrake() {
      await Braker.UnBrake();

    },
    async ResetMile() {
      await Reset_Mileage();
    },
    async BatteryLockHandler(bat_no, islock) {
      await BatteryLockCtrl(bat_no, islock)
    },
    async ForkArmPoseControlHandler(isExtend) {
      this.pin_action_running = true;
      var result = { confirm: false, message: '' }
      if (isExtend)
        result = await ForkAPI.ARM_Extend();
      else
        result = await ForkAPI.ARM_Shorten();
      this.pin_action_running = false;
      if (!result.confirm) {
        this.$swal.fire(
          {
            text: '',
            title: result.message,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    },
    async ForkFloatPinDriverControlHandler(isLock) {
      var result = { confirm: false, message: '' }
      if (isLock)
        result = await ForkAPI.PIN_LOCK();
      else
        result = await ForkAPI.PIN_RELEASE();
      if (!result.confirm) {
        this.$swal.fire(
          {
            text: '',
            title: result.message,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    },
    async ForkArmStopHandler() {
      await ForkAPI.ARM_Stop();
    },
    onChange(input) {
      if (input + "" == "") {
        this.laser_mode = 0;
      } else {
        if (input > 16) {
          input = 16
        }
        this.laser_mode = input;
      }
    }
  },
}
</script>
<style lang="scss" scoped>
.manual_settings {
  button {
    font-size: 24px;
    font-weight: bold;
    width: 130px;
  }

  height: 450px;

  .item-label {
    width: 160px;
    font-size: 22px;
    text-align: left;
    padding: 1px;
    font-weight: bold;
  }

  .b-form-input input {
    text-align: center;
  }

  .updown-btns {
    button {
      height: 25px;
      font-size: small;
      text-align: center;
      padding: 0px;
      width: 43px;
      border: 1px solid rgb(255, 255, 255);
      background-color: rgb(0, 123, 255);
    }
  }

  .battery {
    font-size: 25px;

    label {
      margin-right: 10px;
      font-size: 20px;
      width: 150px;
      text-align: left;
    }

    button {
      margin: auto 5px;
    }
  }

  .el-overlay {
    background-color: transparent;
  }
}
</style>