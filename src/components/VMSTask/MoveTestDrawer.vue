<template>
  <el-drawer
    @closed="()=>{move_test_drawer=false}"
    v-model="move_test_drawer"
    direction="btt"
    size="60%"
    title="移動測試"
  >
    <div class="drawer-content">
      <div class="text-start my-2">
        <b-button
          :loading="waiting_sever_response"
          :disabled="waiting_sever_response"
          @click="MoveToBtnHandler"
          style="width:103px"
          variant="primary"
        >移動</b-button>
      </div>
      <div class="move w-100 bg-light item d-flex">
        <b-card body-class="w-100">
          <el-form :model="moveTestDto" label-width="100px" label-position="left">
            <el-form-item label="Point ID" prop="DestinPointID">
              <el-input-number v-model="moveTestDto.DestinPointID"></el-input-number>
            </el-form-item>

            <el-form-item label="X" prop="X">
              <el-input-number step="0.01" precision="2" v-model="moveTestDto.X"></el-input-number>
            </el-form-item>
            <el-form-item label="Y" prop="Y">
              <el-input-number step="0.01" precision="2" v-model="moveTestDto.Y"></el-input-number>
            </el-form-item>
            <el-form-item label="Theta" prop="Theta">
              <el-input-number step="0.01" precision="2" v-model="moveTestDto.Theta"></el-input-number>
            </el-form-item>
            <b-button class="w-100" variant="info" @click="SetCurrentPose">使用當前位置</b-button>
          </el-form>
        </b-card>
        <b-card>
          <el-form :model="moveTestDto" label-width="100px" label-position="left">
            <el-form-item label="Direction">
              <el-input-number v-model="moveTestDto.Direction"></el-input-number>
            </el-form-item>
            <el-form-item label="Laser Mode">
              <el-input-number v-model="moveTestDto.LaserMode"></el-input-number>
            </el-form-item>
            <el-form-item label="Speed Limit">
              <el-input-number v-model="moveTestDto.Speed"></el-input-number>
            </el-form-item>
          </el-form>
        </b-card>
        <b-card class="text-start">
          <h5 class="border-bottom">Direction</h5>
          <ol>
            <li>0: 可旋轉(方向依照當下角度)</li>
            <li>1: 不可旋轉</li>
            <li>2: 向左旋轉</li>
            <li>3: 向右旋轉</li>
          </ol>
          <h5 class="border-bottom">
            Laser Mode
            <span style="font-size: smaller;">(巡檢AGV USE)</span>
          </h5>
          <ol>
            <li>0: 主走道不避障</li>
            <li>1: 主走道避障</li>
            <li>2: 進Bay不避障</li>
            <li>3: 進窄門不避障</li>
            <li>4: 一般橫移不避障</li>
          </ol>
        </b-card>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { NavigationAPI } from '@/api/VMSAPI';
import MoveTestVM from '@/ViewModels/MoveTestDto.js'
import { AGVStatusStore } from '@/store';
export default {
  data() {
    return {
      move_test_drawer: false,
      waiting_sever_response: false,
      moveTestDto: new MoveTestVM()
    }
  },
  methods: {
    Show() {
      this.move_test_drawer = true;
    },
    MoveToBtnHandler() {
      this.$swal.fire({
        title: 'AGV Move',
        text: `確定要將AGV移動至(${this.moveTestDto.X},${this.moveTestDto.Y}),Theta:${this.moveTestDto.Theta} ?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      }).then(async (ret) => {
        if (!ret.isConfirmed)
          return;
        this.waiting_sever_response = true;
        var response = await NavigationAPI.MoveTest(this.moveTestDto); //{confirm,message}
        this.waiting_sever_response = false;
        this.$swal.fire({
          title: '移動測試',
          text: response.confirm ? '移動測試請求發送成功' : response.message,
          icon: response.confirm ? 'success' : 'error',
          showCancelButton: false
        })
      })
    },
    SetCurrentPose() {
      var currentAGVPose = AGVStatusStore.getters.CurrentPose;
      var currentAGVAngle = AGVStatusStore.getters.CurrentAngle;
      this.moveTestDto.X = currentAGVPose.position.x;
      this.moveTestDto.Y = currentAGVPose.position.y;
      this.moveTestDto.Theta = currentAGVAngle;
    }
  },
}
</script>

<style lang="scss" scoped>
.card {
  margin-inline: 2px;
}
.drawer-content {
  position: absolute;
  top: 50px;
}
.move {
  label,
  .move-pose-input {
    margin-inline: 5px;
  }
  .move-pose-input {
    width: 100px;
  }
}
</style>