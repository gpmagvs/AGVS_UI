<template>
  <div class="p-5">
    <div class="border rounded p-3 text-start w-50">
      <h3>FORK 測試</h3>
      <el-divider></el-divider>
      <el-form label-width="120px" label-position="left">
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

        <el-form-item label="Current Position">
          <el-tag style="width:100px" effect="dark" type="info">{{ current_pose}}</el-tag>
        </el-form-item>

        <el-form-item label="測試狀態">
          <el-tag style="width:100px" effect="dark">{{ forkTestState.state}}</el-tag>
        </el-form-item>
        <el-form-item label="Fork動作">
          <el-tag style="width:100px" effect="dark">{{ forkTestState.fork_action}}</el-tag>
        </el-form-item>
        <el-form-item label="已完成次數">
          <el-tag
            style="width:100px"
            effect="dark"
            type="info"
          >{{ forkTestState.complete_loop_num}}/{{option.loopNum }}</el-tag>
        </el-form-item>
        <div class="my-1">
          <b-button
            :disabled="start_btn_disabled"
            class="w-100"
            variant="primary"
            @click="ForkTestStart"
          >Start</b-button>
        </div>
        <div class="my-1">
          <b-button
            :disabled="abort_btn_disabled"
            class="w-100"
            variant="danger"
            @click="ForkTestAbort"
          >中斷</b-button>
        </div>
      </el-form>
      <b-modal v-model="show_reject_modal" :centered="true" :ok-only="true">
        <p>{{ ack_response.Message }}</p>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { FORKTEST, clsForkTesetOption, clsForkTestState } from '@/api/RDTestAPI'
import WebSocketHelp from '@/api/WebSocketHepler'
import bus from '@/event-bus.js'
export default {
  data() {
    return {
      current_pose: -1,
      option: new clsForkTesetOption(),
      forkTestState: new clsForkTestState(),
      ack_response: {
        Success: true, Message: ''
      }
    }
  },
  methods: {
    async ForkTestStart() {

      this.ack_response = await FORKTEST.Start(this.option);

    },
    async ForkTestAbort() {
      this.ack_response = await FORKTEST.Abort();
    }
  },
  computed: {
    abort_btn_disabled() {
      return this.forkTestState.state != "RUNNING"
    },
    start_btn_disabled() {
      return this.forkTestState.state == "RUNNING"
    },
    show_reject_modal() {
      return this.ack_response.Success == false;
    }
  },
  mounted() {
    bus.on('/z_axis_position', (pose) => {
      this.current_pose = pose
    })
    var ws = new WebSocketHelp('fork_test_state');
    ws.Connect();
    ws.wssocket.onmessage = (evt) => {
      var state = JSON.parse(evt.data);
      this.forkTestState = state;
    }
  },
}
</script>

<style>
</style>