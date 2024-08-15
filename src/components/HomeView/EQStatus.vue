<template>
  <div class="eq-status" ref="eq-status-container">
    <div class="text-start border-bottom p-2 my-2 d-flex flex-row justify-content-space">
      <!-- <div class="d-flex">
        <div class="p-1">
          <i class="bi bi-three-dots-vertical pt-2"></i>區域選擇
        </div>
        <RegionsSelector v-model="selected_region"></RegionsSelector>
      </div>-->
      <div class="d-flex">
        <div class="p-1">
          <i class="bi bi-three-dots-vertical pt-2"></i>
          {{ $t('HomeView.EQStatus.EQStatus.ViewMode') }}
        </div>
        <el-select style="width:120px" v-model="display_mode">
          <el-option :label="$t('HomeView.EQ_Status')" value="lduld_state"></el-option>
          <el-option :label="$t('HomeView.EQStatus.EQStatus.IO')" value="io_siganl"></el-option>
        </el-select>
      </div>
      <div v-if="!show_lduld_state" class="legend d-flex flex-row px-2">
        <div class="disconnect"></div>
        <span>{{ $t('HomeView.EQStatus.EQStatus.DisConnect') }}</span>
        <div class="signal-on"></div>
        <span>{{ $t('HomeView.EQStatus.EQStatus.ON') }}</span>
        <div class="signal-off"></div>
        <span>{{ $t('HomeView.EQStatus.EQStatus.OFF') }}</span>
      </div>
    </div>
    <!-- <div v-if="IsDeveloperLogining" class="dev-debug-global d-flex">
      <b-button variant="light" @click="EmuAllLoad">ALL Load</b-button>
      <b-button class="mx-2" variant="light" @click="EmuAllBusy">ALL Busy</b-button>
    </div>-->
    <el-table
      class="eq-status-table px-1"
      border
      scrollbar-always-on
      siz="small"
      v-bind:style="tableStyle"
      :header-cell-style="{ color: 'black', backgroundColor: 'white' }"
      :data="display_data"
      :row-style="{ fontWeight: 'bold' }"
      :row-class-name="eq_connection_status"
      row-key="EQName"
    >
      <el-table-column type="expand" max-width="40">
        <template #default="scope">
          <div class="hs-signals d-flex">
            <div class="mx-3">{{ $t('HomeView.EQStatus.EQStatus.Handshake_EQ') }}</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'L_REQ', !scope.row.HS_EQ_L_REQ)"
              v-bind:style="signalOn(scope.row.HS_EQ_L_REQ)"
            >L_REQ</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'U_REQ', !scope.row.HS_EQ_U_REQ)"
              v-bind:style="signalOn(scope.row.HS_EQ_U_REQ)"
            >U_REQ</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'READY', !scope.row.HS_EQ_READY)"
              v-bind:style="signalOn(scope.row.HS_EQ_READY)"
            >READY</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'UP_READY', !scope.row.HS_EQ_UP_READY)"
              v-bind:style="signalOn(scope.row.HS_EQ_UP_READY)"
            >UP_READY</div>
            <div
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'LOW_READY', !scope.row.HS_EQ_LOW_READY)"
              v-bind:style="signalOn(scope.row.HS_EQ_LOW_READY)"
            >LOW_READY</div>
            <div
              v-if="false"
              class="di-status"
              @click="HandleHSsignaleChange(scope.row.EQName, 'BUSY', !scope.row.HS_EQ_BUSY)"
              v-bind:style="signalOn(scope.row.HS_EQ_BUSY)"
            >BUSY</div>
          </div>
          <div class="hs-signals d-flex">
            <div class="mx-3">{{ $t('HomeView.EQStatus.EQStatus.Handshake_AGV') }}</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'To_EQ_Up', !scope.row.To_EQ_Up)"
              v-bind:style="signalOn(scope.row.To_EQ_Up)"
            >To_EQ_Up</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'To_EQ_Low', !scope.row.To_EQ_Low)"
              v-bind:style="signalOn(scope.row.To_EQ_Low)"
            >To_EQ_Low</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'Cmd_Reserve_Up', !scope.row.Cmd_Reserve_Up)"
              v-bind:style="signalOn(scope.row.Cmd_Reserve_Up)"
            >Cmd_Reserve_Up</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'Cmd_Reserve_Low', !scope.row.Cmd_Reserve_Low)"
              v-bind:style="signalOn(scope.row.Cmd_Reserve_Low)"
            >Cmd_Reserve_Low</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'VALID', !scope.row.HS_AGV_VALID)"
              v-bind:style="signalOn(scope.row.HS_AGV_VALID)"
            >VALID</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'TR_REQ', !scope.row.HS_AGV_TR_REQ)"
              v-bind:style="signalOn(scope.row.HS_AGV_TR_REQ)"
            >TR_REQ</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'BUSY', !scope.row.HS_AGV_BUSY)"
              v-bind:style="signalOn(scope.row.HS_AGV_BUSY)"
            >BUSY</div>
            <div
              v-if="false"
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'READY', !scope.row.HS_AGV_READY)"
              v-bind:style="signalOn(scope.row.HS_AGV_READY)"
            >READY</div>
            <div
              class="di-status"
              @click="HandleAGVHSSignaleChange(scope.row.EQName, 'COMPT', !scope.row.HS_AGV_COMPT)"
              v-bind:style="signalOn(scope.row.HS_AGV_COMPT)"
            >COMPT</div>
          </div>
          <div v-if="IsDeveloperLogining" class="d-flex">
            <div class="mx-3">{{ $t('HomeView.EQStatus.EQStatus.emulator') }}</div>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName, 'busy')">
              {{
              $t('HomeView.EQStatus.EQStatus.changetoBusy') }}
            </el-button>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName, 'load')">
              {{
              $t('HomeView.EQStatus.EQStatus.changetoLoad') }}
            </el-button>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName, 'unload')">
              {{
              $t('HomeView.EQStatus.EQStatus.changetoUnload') }}
            </el-button>

            <el-button @click="UpPoseSimulation(scope.row.EQName)">撈爪上點位</el-button>
            <el-button @click="DownPoseSimulation(scope.row.EQName)">撈爪下點位</el-button>
            <el-button @click="UnknownPoseSimulation(scope.row.EQName)">撈爪未知位置</el-button>
            <el-button
              :type="scope.row.IsMaintaining ? 'success' : 'danger'"
              @click="MaintainEmulation(scope.row, 'maintain')"
            >
              {{ scope.row.IsMaintaining ?
              $t('HomeView.EQStatus.EQStatus.Cancel_maintenance') :
              $t('HomeView.EQStatus.EQStatus.Maintenance_Simulation')
              }}
            </el-button>
            <el-button
              :type="scope.row.IsPartsReplacing ? 'success' : 'danger'"
              @click="PartsReplacingEmulation(scope.row)"
            >
              {{ scope.row.IsPartsReplacing ?
              $t('HomeView.EQStatus.EQStatus.Cancel_replacement_parts') :
              $t('HomeView.EQStatus.EQStatus.Part_replacement_simulation')
              }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        sortable
        :label="$t('HomeView.EQStatus.EQStatus.EQ_Name')"
        prop="EQName"
        width="170"
      >
        <template #default="scope">
          <div>
            {{ scope.row.EQName }}
            <el-tooltip placement="top-start" content="複製到剪貼簿">
              <i @click="CopyText(scope.row.EQName)" class="copy-button copy-icon bi bi-clipboard"></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <el-table-column sortable label="Tag" prop="Tag" width="80" align="center">
        <template #default="scope">
          <div style="color:grey">{{ scope.row.Tag }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="show_lduld_state"
        align="center"
        width="130"
        :label="$t('HomeView.EQStatus.EQStatus.Main_Status')"
        prop="MainStatus"
      >
        <template #default="scope">
          <el-tag
            style="width:80px"
            :type="GetMainStatusTagtype(scope.row.MainStatus, scope.row.IsConnected)"
            effect="dark"
          >{{ GetMainStatusStr(scope.row.MainStatus, scope.row.IsConnected) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="show_lduld_state"
        align="center"
        width="130"
        :label="$t('HomeView.EQStatus.EQStatus.TransferStatus')"
        prop="TransferStatus"
      >
        <template #default="scope">
          <el-tag
            style="width:80px"
            :type="GetTransferStatusTagtype(scope.row.TransferStatus, scope.row.IsConnected)"
            effect="dark"
          >{{ GetTransferStatusStr(scope.row.TransferStatus, scope.row.IsConnected) }}</el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="show_lduld_state" align="center" label="帳籍狀態" prop="TransferStatus">
        <template #default="scope">
        </template>
      </el-table-column>-->
      <el-table-column
        v-if="show_lduld_state"
        align="center"
        width="130"
        :label="$t('HomeView.EQStatus.EQStatus.Exist')"
      >
        <template #default="scope">
          <div class="d-flex w-100 justify-content-center">
            <el-tag v-if="scope.row.Port_Exist" class="mx-1" type="success" effect="dark">
              {{
              $t('HomeView.EQStatus.EQStatus.Instock') }}
            </el-tag>
            <!-- <el-tag
              v-if="scope.row.Port_Exist"
              class="mx-1"
              type="info"
              effect="dark">滿框</el-tag>
            <el-tag
              v-if="scope.row.Port_Exist"
              class="mx-1"
              type="info"
            effect="dark">空框</el-tag>-->
            <el-tag v-if="!scope.row.Port_Exist" class="mx-1" type="warning" effect="dark">
              {{
              $t('HomeView.EQStatus.EQStatus.SoldOut') }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="show_lduld_state"
        align="center"
        :label="$t('HomeView.EQStatus.EQStatus.CarrierID')"
      ></el-table-column>
      <!-- <el-table-column sortable label="區域" prop="Region" width="110"></el-table-column> -->
      <!-- IO訊號 -->
      <el-table-column
        v-if="!show_lduld_state"
        :label="$t('HomeView.EQStatus.EQStatus.Load')"
        prop="Load_Request"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.Load_Request)"
          >{{ $t('HomeView.EQStatus.EQStatus.Load') }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        :label="$t('HomeView.EQStatus.EQStatus.UnLoad')"
        prop="Unload_Request"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.Unload_Request)"
          >{{ $t('HomeView.EQStatus.EQStatus.UnLoad') }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        :label="$t('HomeView.EQStatus.EQStatus.Exist')"
        prop="Port_Exist"
        :min-width="column_width"
      >
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Port_Exist)">
            {{ scope.row.Port_Exist ?
            $t('HomeView.EQStatus.EQStatus.Instock') : $t('HomeView.EQStatus.EQStatus.SoldOut') }}
          </div>
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
      </el-table-column>-->
      <!--  -->
      <el-table-column
        v-if="!show_lduld_state"
        label="Down"
        prop="Eqp_Status_Down"
        :min-width="column_width"
      >
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Down)">
            {{ scope.row.EqType == 0 ? 'Normal'
            : 'Down' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="Run"
        prop="Eqp_Status_Run"
        :min-width="column_width"
      >
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Run)">Run</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="Idle"
        prop="Eqp_Status_Idle"
        :min-width="column_width"
      >
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Idle)">Idle</div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="!show_lduld_state"
        label="空框移出"
        prop="Empty_CST"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.Empty_CST, false, 'rgb(13, 110, 253)')"
          >空框移出</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="實框移出"
        prop="Full_CST"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.Full_CST, false, 'rgb(13, 110, 253)')"
          >實框移出</div>
        </template>
      </el-table-column>

      <!---->
      <el-table-column
        v-if="!show_lduld_state"
        label="空框移入"
        prop="To_Empty_CST"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.To_Empty_CST, false, 'rgb(16, 152, 104)')"
          >空框移入</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="實框移入"
        prop="To_Full_CST"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.To_Full_CST, false, 'rgb(16, 152, 104)')"
          >實框移入</div>
        </template>
      </el-table-column>
      <!---->
      <el-table-column
        v-if="!show_lduld_state"
        :label="$t('HomeView.EQStatus.EQStatus.IsMaintaining')"
        prop="IsMaintaining"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.IsMaintaining, false, 'red')"
          >{{ $t('HomeView.EQStatus.EQStatus.IsMaintaining')}}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="Down_Pose"
        prop="Down_Pose"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.Down_Pose, false, 'rgb(199, 167, 91)')"
          >Down_Pose</div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!show_lduld_state"
        label="Up_Pose"
        prop="Up_Pose"
        :min-width="column_width"
      >
        <template #default="scope">
          <div
            class="di-status"
            v-bind:style="signalOn(scope.row.Up_Pose, false, 'rgb(199, 167, 91)')"
          >Up_Pose</div>
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
      column_width: 103,
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
      previous_eq_data: [],
      zoomRatio: 1
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
    },
    tableStyle() {
      return this.zoomRatio > 0.9 ? {
        height: `${window.innerHeight * 0.75}px`
      } : {}
    },
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
    // 監聽 document 的 wheel 事件來檢測滾輪動作
    document.addEventListener('wheel', (event) => {
      // 檢查是否按下了 Ctrl 鍵，這是瀏覽器縮放的常見方式
      if (event.ctrlKey) {
        this.zoomRatio = window.devicePixelRatio
      }
    }, { passive: false }); // 使用 passive: false 以允許 preventDefault()
  },
  methods: {
    userStoreTest() {
      alert(userStore.getters.IsDeveloperLogining)
    },

    eq_connection_status(row, rowIndex) {
      var isConnected = row.row.IsConnected;
      return isConnected ? 'success-row' : 'error-row';
    },
    signalOn(status, isLoadable = false, activeColor = '#00e300') {
      if (status) {
        if (isLoadable) {
          return { backgroundColor: 'blue' }
        }
        return {
          backgroundColor: activeColor
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
    UpPoseSimulation(EQName) {
      EmuAPI.SetUpPose(EQName)
    },
    DownPoseSimulation(EQName) {
      EmuAPI.SetDownPose(EQName)
    },
    UnknownPoseSimulation(EQName) {
      EmuAPI.SetUnknownPose(EQName)
    },
    async MaintainEmulation(row) {
      var isMaintaining = row.IsMaintaining;
      var stateToSwitch = !isMaintaining;
      await EmuAPI.SwitchMaintainstate(row.Tag, stateToSwitch);
    },
    async PartsReplacingEmulation(row) {
      var IsPartsReplacing = row.IsPartsReplacing;
      var stateToSwitch = !IsPartsReplacing;
      await EmuAPI.SwitchPartsReplacing(row.Tag, stateToSwitch);
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
    GetMainStatusStr(status_int, connected) {
      if (!connected)
        return '斷線';
      switch (status_int) {
        case 0:
          return '當機'
        case 1:
          return '生產中'
        case 2:
          return '閒置'
        case 3:
          return '-'
        default:
          return status_int + ''
      }
    },
    GetTransferStatusStr(status_int, connected) {
      if (!connected)
        return '斷線';
      switch (status_int) {
        case 0:
          return '斷線'
        case 1:
          return '可收料'
        case 2:
          return '可出料'
        case 3:
          return 'No-Request'
        default:
          return status_int + ''
      }
    },
    /**'success' | 'info' | 'warning' | 'danger' | '' */
    GetTransferStatusTagtype(status_int, connected) {
      if (!connected)
        return 'danger';
      switch (status_int) {
        case 0:
          return 'info'
        case 1:
          return 'warning'
        case 2:
          return 'success'
        case 3:
          return 'info'
        case 4:
          return 'success'
        default:
          break;
      }
    },
    /**'success' | 'info' | 'warning' | 'danger' | '' */
    GetMainStatusTagtype(status_int, connected) {
      if (!connected)
        return 'danger';
      switch (status_int) {
        case 0:
          return 'danger'
        case 1:
          return 'success'
        case 2:
          return 'warning'
        case 3:
          return 'success'
        default:
          break;
      }
    }
  }
}
</script>
<style lang="scss">
.eq-status {
  height: 100%;
  width: 99%;

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
    color: rgb(240, 240, 240);
    height: 22px;
    padding: 0;
    margin: 0;
    text-align: center;
    font-size: 12px;
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