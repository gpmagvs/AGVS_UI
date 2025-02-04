<template>
  <div class="rack-status-view custom-tabs-head p-1">
    <div class="display-mode-container text-start border-bottom my-1 py-1">
      <el-button :loading="waitingClearAllNotCargoButHasIDPorts" link type="primary" :disabled="!Permission" @click="HandleClearAllNotCargoButHasIDPorts">清除所有無料帳籍</el-button>
      <el-button link type="primary" :disabled="!Permission" @click="showLowLevelSettingDrawer = true">低水位提醒設置</el-button>
      <span class="px-2 text-primary">
        <b>{{ $t('Display Mode') }}</b>
      </span>
      <el-select class="mx-2" v-model="display" style="width:120px">
        <el-option :label="$t('Tabs')" value="tabs"></el-option>
        <el-option :label="$t('Single Page')" value="div"></el-option>
      </el-select>
    </div>
    <!-- {{ GroupedWipData }} -->
    <b-tabs v-if="display == 'tabs'">
      <b-tab v-for="zone in GroupedWipData" :key="zone.zoneName">
        <template #title>
          <span>{{ zone.zoneName }}</span>
          <el-badge class="mx-2" type="warning" :value="IsHasDataButNoCargo(zone.zoneName) ? '!' : ''"></el-badge>
        </template>
        <div class="d-flex flex-row">
          <b>{{ $t('Rack.Cargo_Spaces') }}</b>
          <div class="flex-fill p-2">
            <el-progress :stroke-width="18" :percentage="zone.level" text-inside striped striped-flow :duration="500">
              <span>{{ zone.hasCstPortNum }}/{{ zone.totalPorts }}</span>
            </el-progress>
          </div>
        </div>
        <div class="d-flex flex-row flex-no-wrap w-100 overflow-auto">
          <div v-for="Rack in zone.zones" :key="Rack.WIPName">
            <RackStatus :rack_info="Rack" :showLevel="false"></RackStatus>
          </div>
        </div>
      </b-tab>
      <!-- <b-tab v-for="Rack in WIPData" :key="Rack.WIPName" :title="Rack.WIPName">
        <div class="rack-container d-flex flex-row justify-content-center border">
          <RackStatus :rack_info="Rack"></RackStatus>
        </div>
      </b-tab>-->
    </b-tabs>
    <div v-else style="height: 100vh; overflow: auto;">
      <div v-for="zone in GroupedWipData" :key="zone.zoneName" class="my-2 border">
        <h3 class="bg-dark text-light">{{ zone.zoneName }}</h3>
        <div class="d-flex flex-row">
          <b>{{ $t('Rack.Cargo_Spaces') }}</b>
          <div class="flex-fill">
            <el-progress :stroke-width="18" :percentage="zone.level" text-inside striped striped-flow :duration="500">
              <span>{{ zone.hasCstPortNum }}/{{ zone.totalPorts }}</span>
            </el-progress>
          </div>
        </div>
        <div class="d-flex flex-row flex-no-wrap overflow-auto">
          <div v-for="Rack in zone.zones" :key="Rack.WIPName">
            <RackStatus :rack_info="Rack" :showLevel="false"></RackStatus>
          </div>
        </div>
      </div>
    </div>
    <el-drawer v-model="showLowLevelSettingDrawer" title="低水位提醒設置" size="50%">
      <ZoneLowLevelNotifySetting :opened="showLowLevelSettingDrawer"></ZoneLowLevelNotifySetting>
    </el-drawer>
  </div>
</template>
<script>
import RackStatus from '@/components/RacksStatusView/RackStatus.vue'
import ZoneLowLevelNotifySetting from '@/components/RacksStatusView/ZoneLowLevelNotifySetting.vue'
import { EqStore, userStore } from '@/store'
import { ClearAllNotCargoButHasIDPorts } from '@/api/WIPAPI'
export default {
  components: {
    RackStatus,

    ZoneLowLevelNotifySetting
  },
  data() {
    return {
      display: 'div',//div,
      showLowLevelSettingDrawer: false,
      waitingClearAllNotCargoButHasIDPorts: false,
    }

  },
  computed: {
    WIPData() {
      return EqStore.state.WIPsData
    },
    GroupedWipData() {
      const wipDatas = EqStore.state.WIPsData;

      let GetZoneData = (zoneID) => {
        let rackDatas = wipDatas.filter(rack => rack.DeviceID == zoneID);
        const totalPorts = rackDatas.reduce((sum, rack) => sum + GetRackTotalPorts(rack), 0);
        const hasCstPortNum = rackDatas.reduce((sum, rack) => sum + GetRackHasCstPortNum(rack), 0);
        return {
          zoneName: zoneID,
          zones: rackDatas,
          totalPorts: totalPorts,
          hasCstPortNum: hasCstPortNum,
          level: hasCstPortNum / totalPorts * 100,
        }
      }

      let GetRackHasCstPortNum = (rackData) => {
        let count = 0;
        for (let i = 0; i < rackData.Ports.length; i++) {
          if (rackData.Ports[i].CargoExist === true) {
            count++;
          }
        }
        return count;
      }

      let GetRackTotalPorts = (rackData) => {
        return rackData.Rows * rackData.Columns;
      }

      const deviceIDList = [...new Set(wipDatas.map(rack => rack.DeviceID))];
      return deviceIDList.map(id => GetZoneData(id))
    },
    Permission() {
      return userStore.state.user.Role > 1;
    }
  },
  watch: {
    display(nval) {
      localStorage.setItem('wips-display-mode', nval)
    }
  },
  mounted() {
    var _displayStored = localStorage.getItem('wips-display-mode');
    if (_displayStored) {
      this.display = _displayStored;
    }
  },
  methods: {
    async HandleClearAllNotCargoButHasIDPorts() {
      const result = await this.$swal.fire({
        title: '確認清除',
        text: '是否要清除所有有帳無料的帳籍?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定',
        cancelButtonText: '取消'
      });

      if (result.isConfirmed) {
        this.waitingClearAllNotCargoButHasIDPorts = true;
        const ret = await ClearAllNotCargoButHasIDPorts();
        //ret={"total":0,"success":0,"fail":0}
        this.$message.success(`有帳無料帳籍清除成功，共${ret.total}筆，成功${ret.success}筆，失敗${ret.fail}筆`);
        this.waitingClearAllNotCargoButHasIDPorts = false;
      }
    },
    IsHasDataButNoCargo(zoneID) {
      const wip = EqStore.state.HasDataButNoCargoWIPs.find(wip => wip.DeviceID == zoneID);
      return wip != undefined;
    }
  }

}
</script>
<style lang="scss">
.rack-status-view {
  .display-mode-container {
    position: absolute;
    right: 1rem;
  }
}
</style>