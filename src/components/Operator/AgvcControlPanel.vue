<template>
  <div class="agv-control-panel-container w-100">
    <div
      v-loading="!enabled"
      :element-loading-spinner="false"
      :element-loading-background="enabled ? 'rgba(0,0,0,0)' : 'rgba(202,202,202,0.4)'"
      ref="agvc_ctrl_pnl"
      class="agvc-control-panel keys pt-4 p-3"
      style="width:400px">
      <div v-show="!enabled" class="disable-notify text-start my-2">{{ $t('agv_control_notify_text') }}</div>
      <div v-if="speed_modifyable" class="w-100 bg-light text-start px-2 py-3">
        <div class="speed-item-container d-flex flex-row">
          <div>Linear Speed</div>
          <!-- <KeyboardInput v-model="linear_speed"></KeyboardInput> -->
          <el-input-number size="large" v-model="linear_speed" :step="0.001" :max="1" :min="0.001"></el-input-number>
        </div>
        <div class="speed-item-container d-flex flex-row">
          <div>Rotation Speed</div>
          <el-input-number
            size="large"
            v-model="rotation_speed"
            :step="0.01"
            :max="0.3"
            :min="0.01"></el-input-number>
        </div>
      </div>
      <table class="w-100">
        <tbody>
          <tr align="center">
            <td>
              <div :class="active_state" @click="MOVE_FL()">
                <img src="@/assets/images/forward_left.png" alt />
              </div>
            </td>
            <td>
              <div :class="active_state" @click="MOVE_UP()">
                <img src="@/assets/images/fordward.png" alt />
              </div>
            </td>
            <td>
              <div :class="active_state" @click="MOVE_FR()">
                <img src="@/assets/images/forward_right.png" alt />
              </div>
            </td>
          </tr>
          <tr align="justify">
            <td>
              <div :class="active_state" @click="MOVE_LEFT()">
                <img src="@/assets/images/left.png" alt />
              </div>
            </td>
            <td>
              <div :class="active_state" @click="MOVE_STOP()">
                <i class="bi bi-sign-stop"></i>
              </div>
            </td>
            <td>
              <div :class="active_state" @click="MOVE_RIGHT()">
                <img src="@/assets/images/right.png" alt />
              </div>
            </td>
          </tr>
          <tr align="justify">
            <td>
              <div :class="active_state" @click="MOVE_BL()">
                <img v-if="!IsMiniAGV" src="@/assets/images/back_left.png" alt />
              </div>
            </td>
            <td>
              <div :class="active_state" @click="MOVE_DOWN()">
                <img src="@/assets/images/backward.png" alt />
              </div>
            </td>
            <td>
              <div :class="active_state" @click="MOVE_BR()">
                <img v-if="!IsMiniAGV" src="@/assets/images/back_right.png" alt />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        @click="speed_modifyable = !speed_modifyable"
        style="height:20px;width:100px"
        class="bg-light"></div>
    </div>
  </div>
</template>
<script>
import { AGVMoveUp, AGVMoveDown, AGVMoveRight, AGVMoveLeft, AGVStop, AGVMove_FordwardRight, AGVMove_FordwardLeft, AGVMove_BackwardRight, AGVMove_BackwardLeft, AGVMove_ShiftRight, AGVMove_ShiftLeft } from '@/api/WebRos';
import KeyboardInput from '@/components/UIComponents/keyboard-number-input.vue'
import { AGVStatusStore } from '@/store'
import { UserStore } from '@/store'
export default {
  components: {
    KeyboardInput,
  },
  props: {
  },
  data() {
    return {
      linear_speed: 0.05,
      backward_speed: 0.1,
      rotation_speed: 0.05,
      speed_modifyable: false,
      linear_action: 'stop',
      rotation_action: 'stop',
    }
  },
  methods: {
    async MOVE_UP() {
      if (this.linear_action != 'up')
        this.MOVE_STOP();
      this.linear_action = 'up'
      this.linear_speed += 0.05;
      if (this.linear_speed >= 1)
        this.linear_speed = 1
      AGVMoveUp(this.linear_speed);
      // await MOVEControl.AGVMove_UP(this.linear_speed);
    },
    async MOVE_DOWN() {
      if (this.linear_action != 'down')
        this.MOVE_STOP();
      this.linear_action = 'down'
      AGVMoveDown(this.backward_speed);
    },
    async MOVE_LEFT() {
      if (this.IsMiniAGV) {
        AGVMove_ShiftLeft(this.linear_speed);
      } else {
        if (this.rotation_action != 'left')
          this.MOVE_STOP();
        this.rotation_action = 'left'
        this.rotation_speed += 0.05;
        if (this.rotation_speed >= 0.3)
          this.rotation_speed = 0.3
        AGVMoveLeft(this.rotation_speed);
      }
    },
    async MOVE_RIGHT() {
      if (this.IsMiniAGV)
        AGVMove_ShiftRight(this.linear_speed);
      else {
        if (this.rotation_action != 'right')
          this.MOVE_STOP();
        this.rotation_action = 'right'
        this.rotation_speed += 0.05;
        if (this.rotation_speed >= 0.3)
          this.rotation_speed = 0.3
        AGVMoveRight(this.rotation_speed);
      }
    },
    async MOVE_STOP() {
      AGVStop();
      this.linear_speed = this.rotation_speed = 0.05;
    },
    async MOVE_FR() {
      if (this.IsMiniAGV)
        AGVMoveRight(this.rotation_speed);
      else
        AGVMove_FordwardRight(0.2, 0.15);
    },
    async MOVE_FL() {
      if (this.IsMiniAGV)
        AGVMoveLeft(this.rotation_speed);
      else
        AGVMove_FordwardLeft(0.2, 0.15);
    },
    async MOVE_BR() {
      if (this.IsMiniAGV)
        return;
      AGVMove_BackwardRight(0.2, 0.15);
    },
    async MOVE_BL() {
      if (this.IsMiniAGV)
        return;
      AGVMove_BackwardLeft(0.2, 0.15);
    }
  },
  computed: {
    active_state() {
      return this.enabled ? 'active' : 'inactive';
    },
    IsMiniAGV() {
      return AGVStatusStore.getters.IsInspectionAGV;
    },
    IsUserLogin() {
      return UserStore.getters.CurrentUserRole != 0;
    },
    IsGodUser() {
      return UserStore.getters.IsGodUser;
    },
    IsAuto() {
      return AGVStatusStore.getters.IsAuto;
    },
    IsOnline() {
      return AGVStatusStore.getters.IsOnline;
    },
    enabled() {
      if (this.IsGodUser)
        return true;
      return (this.IsUserLogin && !this.IsAuto && !this.IsOnline)
    }
  },
}
</script>
<style scoped lang="scss">
.agv-control-panel-container {

  .el-loading-spinner .el-loading-text {
    color: var(--el-color-primary);
    margin: 3px 0;
    font-size: 24px;
  }

  .disable-notify {
    color: red;
    font-weight: bold;
    font-size: 20px;
    position: absolute;
    top: 45%;
    background-color: grey;
  }

  .speed-item-container {
    div {
      width: 120px;
    }
  }

  .agvc-control-panel {
    table {
      td {
        .active {
          background-color: white;
        }

        .inactive {
          background-color: rgb(255, 255, 255);
        }

        div {
          background-color: rgb(202, 202, 202);
          margin: 5px;
          width: 90%;
          text-align: center;
          height: 80px;
          border-radius: 3px;
          border: 1px solid grey;

          i {
            font-size: 50px;
            position: relative;
            top: 5px;
          }

          &:active {
            background-color: red;
            color: white;
          }


        }

      }
    }
  }
}
</style>