<template>
  <div class="w-100 p-3">
    <h1>SECS/GEM</h1>
    <!-- <el-button @click="showSecsMessageDisplay = !showSecsMessageDisplay">Toggle</el-button> -->
    <div class="w-100 d-flex">
      <div class="main-content w-100 h-100 bg-light border rounded-3 mx-2">
        <!-- <el-switch
          v-model="isSimulation"
          :active-value="true"
          :inactive-value="false"
          width="60"
          size="large"
          active-text="RUN"
          inactive-text="模擬"
          inline-prompt
        ></el-switch>-->
        <div class="card platform-running-state d-flex">
          <h4>平台運行狀態</h4>
          <el-tag
            size="large"
            effect="dark"
            :type="isSecsPlatformRunning ? 'success' : 'danger'"
            style="height: 40px;"
          >
            <span
              style="font-size: 1.2em;  font-weight: bold"
            >{{ isSecsPlatformRunning ? '系統運行正常' : '系統運行異常' }}</span>
          </el-tag>
        </div>
        <div class="d-flex gap-2">
          <div class="card gem-connection-status">
            <h4>HSMS 連線狀態</h4>
            <div class="d-flex flex-column">
              <div class="text-start">
                <label>MCS</label>
                <el-tag
                  effect="dark"
                  :type="connectionStatusMap[connectionState.mcs].type"
                  style="width: 120px; height: 30px; text-align: center"
                >{{ connectionStatusMap[connectionState.mcs].text }}</el-tag>
              </div>
              <div class="text-start">
                <label>CIM</label>
                <el-tag
                  effect="dark"
                  :type="connectionStatusMap[connectionState.cim].type"
                  style="width: 120px; height: 30px; text-align: center"
                >{{ connectionStatusMap[connectionState.cim].text }}</el-tag>
              </div>
            </div>
          </div>
          <div class="card gem-connection-status">
            <h4>上位模擬</h4>
            <div class="d-flex flex-column align-items-center">
              <el-button
                :type="isSimulation ? 'primary' : 'danger'"
                size="large"
                style="width: 120px; height: 50px; font-size: 1.2em; font-weight: bold"
                @click="() => {
                  $swal.fire({
                    title: isSimulation ? '確定要關閉模擬模式?' : '確定要開啟模擬模式?',
                    text: isSimulation ? '關閉後將停止模擬運作' : '開啟後將進入上位模擬模式',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: '確定',
                    cancelButtonText: '取消'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      isSimulation = !isSimulation;
                    }
                  })
                }"
                :title="isSimulation ? '關閉模擬' : '按一下已開啟模擬模式'"
              >{{ isSimulation ? '模擬運行中' : '已關閉' }}</el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showSecsMessageDisplay" class="w-100 border bg-dark">
        <secsMessageDisplay style="width: 100%; height: 100%;"></secsMessageDisplay>
      </div>
    </div>
  </div>
</template>

<script>
import secsMessageDisplay from '@/components/SecsGem/SecsMessageDisplay.vue';
import SecsPlatformAPI from '@/api/SecsPlatform'
import store from '@/store';
export default {
  components: {
    secsMessageDisplay
  },
  data() {
    return {
      showSecsMessageDisplay: true,
      isSimulation: false,
      connectionStatusMap: {
        0: { text: 'Connecting', type: 'warning' },
        1: { text: 'Connected', type: 'success' },
        2: { text: 'Selected', type: 'success' },
        3: { text: 'Retry', type: 'warning' },
        4: { text: 'Disconnected', type: 'danger' }
      }
    }
  },
  computed: {
    connectionState() {
      return this.$store.state.connectionStates;
    },
    isSecsPlatformRunning() {
      return this.$store.state.secsPlatformRunning;
    }
  },
  mounted() {
    store.dispatch('updageConnectionStates')
  }
}
</script>

<style lang="scss" scoped>
h1,
h4 {
  text-align: left;
  letter-spacing: 4px;
  font-weight: 900;
}
.main-content {
  padding: 10px;
  div {
    width: 100%;
    padding: 10px;
  }
  .card {
    margin-bottom: 10px;
  }
  .gem-connection-status {
    padding: 10px;
    label {
      font-weight: 600;
      width: 40px;
    }
  }
}
</style>
