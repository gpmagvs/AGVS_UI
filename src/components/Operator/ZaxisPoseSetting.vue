<template>
  <div class="text-start my-2">
    <b>LD/ULD HEIGHT SETTING</b>
  </div>
  <el-form class="px-2" label-width="70px" label-position="left">
    <el-form-item label="Tag ID">
      <el-input-number v-model="tag_id" size="small" type="number" :min="0" :step="1"></el-input-number>
    </el-form-item>
    <el-form-item label="層數">
      <el-select v-model="layer" size="small">
        <el-option label="1" value="1"></el-option>
        <el-option label="2" value="2"></el-option>
        <el-option label="3" value="3"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="點位">
      <el-select v-model="pose_loc" size="small">
        <el-option label="上點位" value="uplimit"></el-option>
        <el-option label="下點位" value="downlimit"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="Z軸位置">
      <div>
        <el-input-number v-model="pose" size="small" center :step="0.001"></el-input-number>
      </div>
      <div>
        <b-button size="sm" class="w-100" @click="pose= parseFloat(current_pose)">使用目前位置</b-button>
        <b-button size="sm" class="w-100" @click="PoseTo">移動到此位置</b-button>
      </div>
    </el-form-item>
    <b-button size="sm" class="w-100" variant="primary" @click="showDialog=true">設定</b-button>
  </el-form>

  <b-modal :centered="true" v-model="showDialog" title="Z軸高度設定" @ok="Setting">
    <div>
      <p>確定要更新 {{tag_id}}_{{ layer}} 設定?</p>
    </div>
  </b-modal>
</template>

<script>
import { ForkAPI } from '@/api/VMSAPI'
import Notifier from '@/api/NotifyHelper'
import bus from '@/event-bus.js'
export default {
  data() {
    return {
      showDialog: false,
      tag_id: 0,
      pose_loc: 'downlimit',
      layer: 1,
      pose: 0,
      current_pose: 0
    }
  },
  methods: {
    async Setting() {
      Notifier.Primary("LD/ULD高度設定請求已送出", 'bottom');
      var ret = await ForkAPI.SetTagHeightLimit(this.tag_id, this.pose_loc, this.layer, this.pose)
      if (ret.Success) {
        Notifier.Success("LD/ULD高度設定成功", 'bottom');
      } else {
        Notifier.Danger(`LD/ULD高度設定失敗:${ret.Message}`, 'bottom');
      }
    },
    async PoseTo() {
      await ForkAPI.Pose(this.pose);
    }
  },
  mounted() {
    bus.on('/z_axis_position', (pose) => {
      this.current_pose = pose
    })
  },
}
</script>

<style>
</style>