<template>
  <div class="eq-status">
    <div class="text-start border-bottom p-2 my-2 d-flex flex-row justify-content-space">
      <div class="d-flex">
        <div class="p-1">
          <i class="bi bi-three-dots-vertical pt-2"></i>區域選擇
        </div>
        <RegionsSelector v-model="selected_region"></RegionsSelector>
      </div>
      <div class="d-flex">
        <div class="p-1">
          <i class="bi bi-three-dots-vertical pt-2"></i>顯示模式
        </div>
        <el-select style="width:120px" v-model="display_mode">
          <el-option label="設備狀態" value="lduld_state"></el-option>
          <el-option label="IO訊號" value="io_siganl"></el-option>
        </el-select>
      </div>
      <div v-if="!show_lduld_state" class="legend d-flex flex-row px-2">
        <div class="disconnect"></div>
        <span>斷線</span>
        <div class="signal-on"></div>
        <span>訊號[ON]</span>
        <div class="signal-off"></div>
        <span>訊號[OFF]</span>
      </div>
    </div>
    <!-- <div v-if="IsDeveloperLogining" class="dev-debug-global d-flex">
      <b-button variant="light" @click="EmuAllLoad">ALL Load</b-button>
      <b-button class="mx-2" variant="light" @click="EmuAllBusy">ALL Busy</b-button>
    </div>-->
    <el-table
      class="px-1"
      style="height:600px"
      v-bind:style="{
        width: show_lduld_state ? '920px' : '950px'
      }"
      border
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="display_data"
      :row-style="{ fontWeight: 'bold' }"
      :row-class-name="eq_connection_status"
      row-key="EQName">
      <el-table-column type="expand" width="40">
        <template #default="scope">
          <div class="hs-signals d-flex">
            <div class="mx-3">交握訊號-EQ</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'L_REQ', !scope.row.HS_EQ_L_REQ)"
              v-bind:style="signalOn(scope.row.HS_EQ_L_REQ)">L_REQ</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'U_REQ', !scope.row.HS_EQ_U_REQ)"
              v-bind:style="signalOn(scope.row.HS_EQ_U_REQ)">U_REQ</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'READY', !scope.row.HS_EQ_READY)"
              v-bind:style="signalOn(scope.row.HS_EQ_READY)">READY</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'UP_READY', !scope.row.HS_EQ_UP_READY)"
              v-bind:style="signalOn(scope.row.HS_EQ_UP_READY)">UP_READY</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'LOW_READY', !scope.row.HS_EQ_LOW_READY)"
              v-bind:style="signalOn(scope.row.HS_EQ_LOW_READY)">LOW_READY</div>
            <div
              v-if="false"
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'BUSY', !scope.row.HS_EQ_BUSY)"
              v-bind:style="signalOn(scope.row.HS_EQ_BUSY)">BUSY</div>
          </div>
          <div class="hs-signals d-flex">
            <div class="mx-3">交握訊號-AGV</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'To_EQ_Up', !scope.row.To_EQ_Up)"
              v-bind:style="signalOn(scope.row.To_EQ_Up)">To_EQ_Up</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'To_EQ_Low', !scope.row.To_EQ_Low)"
              v-bind:style="signalOn(scope.row.To_EQ_Low)">To_EQ_Low</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'VALID', !scope.row.HS_AGV_VALID)"
              v-bind:style="signalOn(scope.row.HS_AGV_VALID)">VALID</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'TR_REQ', !scope.row.HS_AGV_TR_REQ)"
              v-bind:style="signalOn(scope.row.HS_AGV_TR_REQ)">TR_REQ</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'BUSY', !scope.row.HS_AGV_BUSY)"
              v-bind:style="signalOn(scope.row.HS_AGV_BUSY)">BUSY</div>
            <div
              v-if="false"
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'READY', !scope.row.HS_AGV_READY)"
              v-bind:style="signalOn(scope.row.HS_AGV_READY)">READY</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'COMPT', !scope.row.HS_AGV_COMPT)"
              v-bind:style="signalOn(scope.row.HS_AGV_COMPT)">COMPT</div>
          </div>
          <div v-if="IsDeveloperLogining" class="d-flex">
            <div class="mx-3">模擬器:</div>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName, 'busy')">切換為Busy</el-button>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName, 'load')">切換為Load</el-button>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName, 'unload')">切換為Unload</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column sortable label="設備名稱" prop="EQName" width="170">
        <template #default="scope">
          <div> {{ scope.row.EQName }} <el-tooltip placement="top-start" content="複製到剪貼簿">
              <i @click="CopyText(scope.row.EQName)" class="copy-button copy-icon bi bi-clipboard"></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column sortable label="Tag" prop="Tag" width="80" align="center"></el-table-column>
      <el-table-column v-if="show_lduld_state" align="center" label="設備狀態" prop="TransferStatus">
        <template #default="scope">
          <el-tag
            style="width:220px"
            :type="GetTransferStatusTagtype(scope.row.TransferStatus)"
            effect="dark">{{ GetTransferStatusStr(scope.row.TransferStatus) }}</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column sortable label="區域" prop="Region" width="110"></el-table-column> -->
      <!-- IO訊號 -->
      <el-table-column
        v-if="!show_lduld_state"
        label="可移入"
        prop="Load_Request"
        :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Load_Request)">可移入</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="可移出"
        prop="Unload_Request"
        :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Unload_Request)">可移出</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="貨物在席"
        prop="Port_Exist"
        :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Port_Exist)">貨物在席</div>
        </template>
      </el-table-column>
      <!-- 轉換架之類的 -->
      <!-- <el-table-column v-if="!show_lduld_state" label="撈爪上位" prop="Up_Pose" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Up_Pose)">撈爪上位</div>
        </template>
      </el-table-column>
      <el-table-column v-if="!show_lduld_state" label="撈爪下位" prop="Down_Pose" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Down_Pose)">撈爪下位</div>
        </template>
      </el-table-column> -->
      <!--  -->
      <el-table-column
        v-if="!show_lduld_state"
        label="Down"
        prop="Eqp_Status_Down"
        :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Down)">Status</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="Run"
        prop="Eqp_Status_Run"
        :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Run)">Run</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="Idle"
        prop="Eqp_Status_Idle"
        :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Idle)">Idle</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import WebSocketHelp from '@/api/WebSocketHepler';
import RegionsSelector from '@/components/RegionsSelector.vue'
import { ElNotification } from 'element-plus'
import { EmuAPI, SetAGVHandshakeIO } from '@/api/EquipmentAPI.js'
import { userStore } from '@/store';
import param from '@/gpm_param.js'
import { EqStore } from '@/store'
import { watch } from 'vue';
import bus from '@/event-bus.js'
import { CopyText } from '@/api/Common/UtilityTools'

export default {
  components: {
    RegionsSelector,
  },
  data() {
    return {
      column_width: 115,
      // eq_data: [
      //   {
      //     IsConnected: true,
      //     EQName: 'GB123#1',
      //     Load_Request: false,
      //     Unload_Request: true,
      //     Port_Exist: true,
      //     Up_Pose: false,
      //     Down_Pose: true,
      //     Eqp_Status_Down: true,
      //     Region: '',
      //    TransferStatus:0,
      //   }
      // ],
      selected_region: "all",
      display_mode: 'lduld_state',
      previous_eq_data: []
    }
  },
  computed: {
    IsDeveloperLogining() {
      return userStore.getters.IsDeveloperLogining;
    },
    display_data() {
      if (this.selected_region == 'all')
        return this.eq_data;
      else {
        return this.eq_data.filter(eq => eq.Region == this.selected_region)
      }
    },
    eq_data() {
      return EqStore.getters.EQData
    },
    show_lduld_state() {
      return this.display_mode == 'lduld_state'
    }
  },
  mounted() {
    //this.WsConnect();
    var signal_divs = document.getElementsByClassName('di-status');
    bus.on('/map_init_done', () => {
      this.eq_data.forEach(eq_states => {
        bus.emit('/eq_lduld_status_changed', {
          tagNumber: eq_states.Tag,
          status: eq_states.TransferStatus,
        })
      });

    })

  },
  methods: {
    userStoreTest() {
      alert(userStore.getters.IsDeveloperLogining)
    },

    eq_connection_status(row, rowIndex) {
      var isConnected = row.row.IsConnected;
      return isConnected ? 'success-row' : 'error-row';
    },
    signalOn(status, isLoadable = false) {
      if (status) {
        if (isLoadable) {
          return { backgroundColor: 'blue' }
        }
        return {
          backgroundColor: 'lime'
        }
      }
      else {
        return {
          backgroundColor: 'rgb(204, 204, 204)'
        }
      }
    },
    RegionSelectChanged(val) {
      this.selected_region = val;
    },
    filterRegionData(value, row, column) {
      console.log(row)
    },
    CopyText(text) {
      CopyText(text)
    },
    LDULD_Emu_State_Switch(EQName = "", mode = 'busy|load|unlod') {
      EmuAPI.SetState(EQName, mode)
    },
    EmuAllLoad() {
      EmuAPI.EQAllLoad()
    },
    EmuAllBusy() {
      EmuAPI.EQAllBusy()
    },
    HandleHSsignaleChange(eqname, signal_name, state) {
      // alert(eqname + ',' + signal_name)
      if (!this.IsDeveloperLogining)
        return;
      EmuAPI.SetEQHsSignal(eqname, signal_name, state)
    },
    HandleAGVHSSignaleChange(eqname, signal_name, state) {
      // alert(eqname + ',' + signal_name)
      if (!this.IsDeveloperLogining)
        return;
      SetAGVHandshakeIO(eqname, signal_name, state)
    },
    GetTransferStatusStr(status_int) {
      switch (status_int) {
        case 0:
          return '斷線'
        case 1:
          return '當機'
        case 2:
          return 'BUSY'
        case 3:
          return '可移入'
        case 4:
          return '可移出'
        default:
          return status_int + ''
      }
    },
    /**'success' | 'info' | 'warning' | 'danger' | '' */
    GetTransferStatusTagtype(status_int) {
      switch (status_int) {
        case 0:
          return 'info'
        case 1:
          return 'danger'
        case 2:
          return 'warning'
        case 3:
          return 'success'
        case 4:
          return 'success'
        default:
          break;
      }
    }
  }
}
</script>

<style lang="scss" >
.eq-status {
  height: 100%;

  .legend {
    div {
      width: 40px;
      height: 12px;
      border-radius: 4px;

      margin-right: 3px;
      margin-top: 5px;
    }

    div:hover {
      cursor: pointer;
    }

    span {
      margin-right: 20px;
      font-weight: bold;
      font-size: 14px;
      color: rgb(112, 112, 112);
    }

    .disconnect {
      background-color: rgb(245, 108, 108);
    }

    .signal-on {
      background-color: lime;
    }

    .signal-off {
      background-color: rgb(204, 204, 204);
    }
  }

  .di-status {
    color: rgb(139, 139, 139);
    height: 22px;
    padding: 0;
    margin: 0;
    text-align: center;
    font-size: 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .hs-signals {
    div {
      margin: 3px;
      padding: 3px;
    }
  }

  .el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
  }

  .el-table .error-row {
    --el-table-tr-bg-color: var(--el-color-error);
    color: white;
  }
}
</style>