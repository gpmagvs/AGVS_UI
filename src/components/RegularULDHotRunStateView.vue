<template>
  <div
    v-show="isRunning"
    class="regular-uld-hot-run-state border"
    v-bind:style="{
      width: showDetail?'450px': '400px'
    }"
  >
    <div class="d-flex flex-row cursor-pointer">
      <i class="bi bi-three-dots-vertical"></i>
      <label
        @click="()=>{showDetail=!showDetail;}"
        class="mx-2 flex-fill cursor-pointer text-start"
      >定時出料模擬 HOT RUN 運行中</label>
      <b-button size="sm" variant="danger" @click="EndScript">結束</b-button>
      <i @click="()=>{showDetail=!showDetail;}" v-if="showDetail" class="bi bi-caret-down-fill"></i>
      <i @click="()=>{showDetail=!showDetail;}" v-else class="bi bi-caret-up-fill"></i>
    </div>
    <div v-if="showDetail" class="detail-info">
      <!-- {{runState}} -->
      <el-table :data="runState" border height="400">
        <el-table-column label="設備" prop="EqName"></el-table-column>
        <el-table-column label="下次取貨時間" prop="nextUnloadTime"></el-table-column>
        <el-table-column label="下次取貨時間" prop="timeRemain"></el-table-column>
        <el-table-column label>
          <template #default="scope">
            <el-button v-if="scope.row.timeRemain.includes('-')" type="warning">取消出料</el-button>
            <el-button v-else type="danger">強制出料</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import moment from 'moment';
import { StopHotRun } from '@/api/TaskAllocation';
export default {
  data() {
    return {
      showDetail: false
    }
  },
  computed: {
    isRunning() {
      return store.state.regularHotRunStates.state == 'running';
    },
    runState() {
      var eqNames = Object.keys(store.state.regularHotRunStates.unloaderStates);
      return eqNames.map(name => {
        var state = store.state.regularHotRunStates.unloaderStates[name];
        state.EqName = name;
        state.nextUnloadTime = moment(state.nextUnloadTime).format("HH:mm:ss")
        return state;
      })
      return []
    }
  },
  methods: {
    async EndScript() {
      this.$swal.fire(
        {
          text: '',
          title: '確定要結束HOT RUN?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (res) => {
          if (!res.isConfirmed)
            return;

          var scriptID = store.state.regularHotRunStates.scriptID;
          await StopHotRun(scriptID)
        })
    }
  },
}
</script>

<style lang="scss" scoped>
.regular-uld-hot-run-state {
  padding: 8px;
  background-color: rgba(20, 143, 71, 0.8);
  color: white;
  border-radius: 6px;
  font-size: large;
  position: fixed;
  left: 3px;
  bottom: 0.1rem;
  z-index: 23923;

  .detail-info {
    background-color: white;
    color: black;
    border-radius: 6px;
    padding: 8px;
    margin-top: 10px;
  }
}
</style>