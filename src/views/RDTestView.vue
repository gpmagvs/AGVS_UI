<template>
  <div class="p-1 bg-light text-dark">
    <el-tabs v-model="selected_tab">
      <el-tab-pane name="fork_test" label="Fork Test">
        <div class="border rounded p-3 text-start w-100">
          <h3>FORK 測試</h3>
          <el-divider></el-divider>
          <div class="d-flex flex-row">
            <el-form label-width="160px" label-position="left">
              <el-form-item label="測試LOOP">
                <el-input-number v-model="option.loopNum" min="1" max="1000"></el-input-number>
              </el-form-item>
              <el-form-item label="上點位位置">
                <el-input-number v-model="option.up_limit_pose" min="0" max="176.0" step="0.1"></el-input-number>
              </el-form-item>
              <el-form-item label="下點位位置">
                <el-input-number v-model="option.down_limit_pose" min="0" max="170.0" step="0.1"></el-input-number>
              </el-form-item>
              <el-form-item label="速度">
                <el-input-number v-model="option.speed" min="0.1" max="1.0" step="0.1"></el-input-number>
              </el-form-item>
              <el-form-item label="測試前初始化">
                <el-switch
                  v-model="option.initalizeBeforeTest"
                  :active-value="true"
                  :inactive-value="false"></el-switch>
              </el-form-item>
              <el-form-item label="使用Random位置">
                <el-switch
                  v-model="option.useRandomPose"
                  :active-value="true"
                  :inactive-value="false"></el-switch>
              </el-form-item>
              <el-form-item label="次數達四分位數暫停">
                <el-switch
                  v-model="option.pauseWhenReachQuarter"
                  :active-value="true"
                  :inactive-value="false"></el-switch>
              </el-form-item>
              <el-form-item label="Current Position">
                <el-tag style="width:100px" effect="dark" type="info">{{ current_pose }}</el-tag>
              </el-form-item>
              <el-form-item label="測試狀態">
                <el-tag style="width:100px" effect="dark">{{ forkTestState.state }}</el-tag>
              </el-form-item>
              <el-form-item label="Fork動作">
                <el-tag style="width:100px" effect="dark">{{ forkTestState.fork_action }}</el-tag>
              </el-form-item>
              <el-form-item label="已完成次數">
                <el-tag
                  style="width:100px"
                  effect="dark"
                  type="info">{{ forkTestState.complete_loop_num }}/{{ option.loopNum }}</el-tag>
              </el-form-item>
              <div class="my-1">
                <b-button
                  :disabled="start_btn_disabled"
                  class="w-100"
                  variant="primary"
                  @click="ForkTestStart">Start</b-button>
              </div>
              <div class="my-1">
                <b-button
                  :disabled="abort_btn_disabled"
                  class="w-100"
                  variant="danger"
                  @click="ForkTestAbort">中斷</b-button>
              </div>
            </el-form>
            <ForkAGV3D class="mx-5"></ForkAGV3D>
          </div>
          <b-modal v-model="show_reject_modal" :centered="true" :ok-only="true">
            <p>{{ ack_response.Message }}</p>
          </b-modal>
          <b-modal
            v-model="show_test_paused_model"
            :centered="true"
            :title="`測試已達四分位數`"
            cancel-title="中斷"
            ok-title="繼續"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            cancel-variant="danger"
            @ok="ContiunTestWhenPause"
            @cancel="ForkTestAbort">
            <p>{{ `測試暫停中，已達${forkTestState.complete_loop_num}` }}</p>
          </b-modal>
        </div>
      </el-tab-pane>
      <el-tab-pane name="move_test" label="Move Test">
        <div class="px-3">
          <el-form label-width="110" label-position="left">
            <el-form-item label="狀態">
              <el-tag
                effect="dark"
                class="text-center px-5"
                :type="rotation_test_state == 1 ? 'warning' : 'success'">{{ rotation_test_state == 1 ? 'IDLE' : 'RUNNING' }}</el-tag>
            </el-form-item>
            <el-form-item label="角度">
              <el-input-number v-model="move_test_options.theta_move"></el-input-number>
            </el-form-item>
            <el-form-item label="當前角度">
              <div class="text-center px-5">{{ current_theta }}</div>
            </el-form-item>
            <el-form-item label="當前TAG">
              <div class="text-center px-5">{{ current_tag }}</div>
            </el-form-item>
            <el-form-item label="持續時間(秒)">
              <el-input-number v-model="move_test_options.duration"></el-input-number>
            </el-form-item>
            <el-form-item label="停滯時間(秒)">
              <el-input-number v-model="move_test_options.delay_time"></el-input-number>
            </el-form-item>
            <el-form-item label="旋轉速度">
              <el-input-number :step="0.1" v-model="move_test_options.rotation_speed"></el-input-number>
            </el-form-item>
            <el-form-item label="歷時">
              <div class="text-center px-5"> {{ rotation_test_period }} <span class="mx-3">秒</span>
              </div>
            </el-form-item>
          </el-form>
          <div class="text-start">
            <el-button @click="HandleMoveTestStart" style="width:125px" type="primary">Start</el-button>
            <el-button @click="HandleMoveTestStop" style="width:125px" type="danger">Stop</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { FORKTEST, clsForkTesetOption, clsForkTestState, MoveTEST } from '@/api/RDTestAPI'
import bus from '@/event-bus.js'
import ForkAGV3D from '@/components/3DModel/ForkAGV3DModel.vue'
import { AGVStatusStore, RDTestDataStore } from '@/store'

export default {
  components: {
    ForkAGV3D,
  },
  data() {
    return {
      current_pose: -1,
      option: new clsForkTesetOption(),
      ack_response: {
        Success: true, Message: ''
      },
      selected_tab: 'move_test',
      move_test_options: {
        theta_move: 90,
        duration: 60,
        delay_time: 1,
        rotation_speed: 0.3
      },
      timer: undefined
    }
  },
  methods: {
    async ForkTestStart() {
      this.ack_response = await FORKTEST.Start(this.option);
      localStorage.setItem('fork-test-options', JSON.stringify(this.option));
    },
    async ForkTestAbort() {
      this.ack_response = await FORKTEST.Abort();
    },
    async ContiunTestWhenPause() {
      this.ack_response = await FORKTEST.Continue();
    },
    async HandleMoveTestStart() {
      var response = await MoveTEST.Start(this.move_test_options);
      if (!response.result) {
        this.$swal.fire(
          {
            text: '',
            title: response.message,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      } else {
        this.rotation_test_period = 0;
        this.timer = setInterval(() => {
          this.rotation_test_period += 1
        }, 1000);
      }
    },
    HandleMoveTestStop() {
      MoveTEST.Stop();
      clearInterval(this.timer)

    }
  },
  computed: {
    forkTestState() {
      return RDTestDataStore.getters.testData;
    },
    abort_btn_disabled() {
      return this.forkTestState.state != "RUNNING"
    },
    start_btn_disabled() {
      return this.forkTestState.state == "RUNNING"
    },
    show_reject_modal() {
      return this.ack_response.Success == false;
    },
    show_test_paused_model() {
      return this.forkTestState.state == 'PAUSE';
    },
    current_theta() {
      return AGVStatusStore.getters.CurrentAngle;
    },
    current_tag() {
      return AGVStatusStore.getters.CurrentTag;
    },
    rotation_test_period() {
      return RDTestDataStore.getters.testData.move_test.duration
    },
    rotation_test_state() {
      return RDTestDataStore.getters.testData.move_test.state
    }
  },
  mounted() {
    bus.on('/z_axis_position', (pose) => {
      this.current_pose = pose
    })
    var options_stored = localStorage.getItem('fork-test-options');
    if (options_stored) {
      this.option = JSON.parse(options_stored);
    }

  },
}
</script>
<style></style>