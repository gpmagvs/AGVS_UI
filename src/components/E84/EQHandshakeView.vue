<template>
  <div class="w-100">
    <div v-if="IsE84UseEmu" class="p-1 text-danger">模擬模式!</div>
    <div v-if="!IsUserLogin" class="p-1 text-danger">{{ $t('only-gpm-user-can-modify-hs-signal') }}</div>
    <div v-if="EQHSStatus.ConnectionType == 1" class="workstation-select d-flex justify-content-center bg-light">
      <label class=" mx-1" style="font-size:20px;">設備選擇</label>
      <el-select v-model="workstation_name_slected">
        <el-option v-for="workstation in WorkStations" :key="workstation.Tag" :label="workstation.Name" :value="workstation.Name"></el-option>
      </el-select>
      <el-button :loading="connecting" type="primary" :disabled="workstation_name_slected == undefined" @click="HandleIOTestBtnClick">IO測試</el-button>
      <el-tag class="mx-2" size="large" effect="dark" :type="!EQHSStatus.Connected ? 'error' : 'primary'">{{ EQHSStatus.Connected ? "已連線" : "斷線" }}</el-tag>
    </div> {{ ConnectionTypeName }} <div class="d-flex flex-column px-1" v-if="IsGodUse" style="float: left;">
      <b-button v-if="false" @click="show_hs_test_drawer = true" class="my-1" variant="primary">交握測試</b-button>
    </div>
    <div class="d-flex justify-content-center">
      <DJM_PIO></DJM_PIO>
    </div>
    <el-drawer direction="btt" v-model="show_hs_test_drawer">
      <div class="w-100 d-flex">
        <b-card title="設備異常模擬">
          <b-button class="my-1" variant="danger" @click="EQAbnormalWhenEQBusy">EQ異常模擬(EQ動作中)</b-button>
          <b-button class="my-1" variant="success" @click="EQInitialzeHandler">EQ復歸</b-button>
        </b-card>
        <b-button class="my-1" variant="danger">正常流程測試</b-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import DJM_PIO from './DJM_PIO.vue';
import { UserStore, DIOStore, AGVStatusStore, WorkstationStore } from '@/store'
import { EQAbnormalWhenEQBusyEmu, EQInitialze } from '@/api/EQHSEmuAPI';
export default {
  components: {
    DJM_PIO,
  },
  data() {
    return {
      show_hs_test_drawer: false,
      workstation_name_slected: undefined,
      connecting: false,
    }
  },
  computed: {
    IsGodUse() {
      return UserStore.getters.IsGodUser;
    },
    IsUserLogin() {
      return UserStore.getters.CurrentUserRole != 0
    },
    IsE84UseEmu() {
      return DIOStore.getters.IsE84UseEmu
    },
    WorkStations() {
      return WorkstationStore.getters.Workstations;
    },
    SelectedWorkStationInfo() {
      if (!this.WorkStations)
        return undefined;
      return this.WorkStations.find(w => w.Name == this.workstation_name_slected);
    },
    EQHSStatus() {
      //ConnectionType = 0
      //Connected = false
      return AGVStatusStore.getters.AGVStatus.HandshakeStatus
    },
    ConnectionTypeName() {
      if (this.EQHSStatus.ConnectionType == 0)
        return 'PIO';
      else if (this.EQHSStatus.ConnectionType == 1)
        return 'ModbusTcp';
      else
        return 'Emulation'
    }

  },
  methods: {
    async EQAbnormalWhenEQBusy() {
      await EQAbnormalWhenEQBusyEmu();
    },
    async EQInitialzeHandler() {
      await EQInitialze();
    },
    async HandleIOTestBtnClick() {
      if (this.workstation_name_slected == undefined)
        return;
      this.connecting = true;
      var result = await WorkstationStore.dispatch('ModbusIOTestStart', this.SelectedWorkStationInfo.Tag);
      this.connecting = false;
      if (result.confirm) {
        this.$swal.fire(
          {
            text: '',
            title: '已連線!',
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      } else {
        this.$swal.fire(
          {
            text: '',
            title: result.message,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    }
  },
  mounted() {
    WorkstationStore.dispatch('GetWorkStationData');
  }
}
</script>

<style lang="scss" scoped></style>