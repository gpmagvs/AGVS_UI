<template>
  <div class="fork-controller bg-dark">
    <div class="d-flex flex-row">
      <div>
        <div @mousedown="ForkClick" v-bind:style="ForkStyle" class="fork">
          <span>{{ ForkHeight }} mm</span>
        </div>
        <img src="/images/agv_lift.png" width="300" alt />
      </div>
      <div class="flex-fill"></div>
      <div class="control-buttons px-2 border m-1 d-flex flex-column justify-content-start">
        <span class="border-bottom">升降控制</span>
        <b-button @click="ForkAction('up')" variant="primary my-1">上點位</b-button>
        <b-button @click="ForkAction('up')" variant="primary my-1">Up</b-button>
        <b-button @click="ForkAction('home')" variant="success my-1">Home</b-button>
        <b-button @click="ForkAction('stop')" variant="danger my-1">Stop</b-button>
        <b-button @click="ForkAction('down')" variant="primary my-1">下</b-button>
        <b-button @click="ForkAction('down')" variant="primary my-1">下點位</b-button>
        <b-button @click="()=>{teach_data_visible=true}" variant="warning my-1">教點</b-button>
      </div>
      <div class="control-buttons px-2 border m-1 d-flex flex-column justify-content-start">
        <span class="border-bottom">伸縮控制</span>
        <b-button
          :disabled="FORK_ARM_Status.IsArmAtEndPose&&!FORK_ARM_Status.IsArmAtHomePose"
          @click="ForkArmPoseControlHandler(true)"
          variant="primary my-1"
        >牙叉伸出</b-button>
        <b-button
          :disabled="FORK_ARM_Status.IsArmAtHomePose&&!FORK_ARM_Status.IsArmAtEndPose"
          @click="ForkArmPoseControlHandler(false)"
          variant="primary my-1"
        >牙叉縮回</b-button>
        <b-button @click="ForkArmStopHandler" variant="danger my-1">牙叉停止動作</b-button>
      </div>
    </div>

    <el-dialog v-model="teach_data_visible" draggable width="90%">
      <forkTeachEditor></forkTeachEditor>
    </el-dialog>
  </div>
</template>

<script>
import { ForkAPI } from '@/api/VMSAPI';
import { AGVStatusStore, ForkTeachStore, DIOStore } from '@/store'
import forkTeachEditor from '@/components/Operator/WorkStation/ForkTeachEditor.vue'
export default {
  components: {
    forkTeachEditor,
  },
  data() {
    return {
      isZAxisMoving: false,
      show_teach_page: false,
      hardware_limit_enable: true,
      teach_data_visible: false
    }
  },
  computed: {
    ForkHeight() {
      return AGVStatusStore.getters.ForkHeight
    },
    ForkStyle() {
      return {
        bottom: `${-380 + this.ForkHeight * 10}px`
      }
    }, FORK_ARM_Status() {
      //{
      //   IsArmAtHomePose: IsArmAtHomePose,
      //   IsArmAtEndPose: IsArmAtEndPose
      // }

      return DIOStore.getters.Fork_ARM_States
    }
  },
  methods: {
    async ForkAction(action, pose = 0, speed = 0) {
      this.isZAxisMoving = true;
      var ret = await ForkAPI.Action(action, pose, speed);
      this.isZAxisMoving = false;
      if (!ret.confirm) {
        this.$swal.fire({
          text: ret.message,
          icon: 'error',
          title: '牙叉禁止操作'
        })
      }
    },
    async ForkArmPoseControlHandler(isExtend) {
      if (isExtend)
        await ForkAPI.ARM_Extend();
      else
        await ForkAPI.ARM_Shorten();
    },
    async ForkArmStopHandler() {
      await ForkAPI.ARM_Stop();
    },


    ShowTeachView() {
      if (this.$refs['fork_teach'])
        this.$refs['fork_teach'].reload();
      this.show_teach_page = true;
    },
    TeachDrawerClosingHandle() {
      if (ForkTeachStore.getters.IsAnyChanged) {
        this.$swal.fire({
          icon: 'warning',
          text: '教點資料已修改但尚未儲存，確定要離開?',
          showConfirmButton: true,
          showCancelButton: true
        }).then(user_response => {
          if (!user_response.isConfirmed) {
            this.show_teach_page = true
          }
          else {
          }
        })
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.fork-controller {
  .control-buttons {
    width: 160px;
    button {
      height: 50px;
    }
    span {
      color: grey;
    }
  }
  padding-left: 30px;
  .fork {
    position: relative;
    height: 30px;
    width: 240px;
    left: 60px;
    bottom: -380px;
    background-color: orange;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;

    cursor: pointer;
    span {
      font-size: 30px;
      position: relative;
      bottom: 50px;
      color: grey;
    }
  }
}
</style>