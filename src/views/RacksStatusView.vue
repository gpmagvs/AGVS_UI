<template>
  <div class="rack-status-view custom-tabs-head p-1">
    <div class="text-start border-bottom my-1 py-1">
      <span class="px-2 text-primary">
        <b>顯示方式</b>
      </span>
      <el-select class="mx-2" v-model="display" style="width:120px">
        <el-option label="分頁顯示" value="tabs"></el-option>
        <el-option label="單頁顯示" value="div"></el-option>
      </el-select>
    </div>
    <!-- {{ GroupedWipData }} -->
    <b-tabs v-if="display=='tabs'">
      <b-tab v-for="zone in GroupedWipData" :key="zone.zoneName" :title="zone.zoneName">
        <div class="d-flex flex-row">
          <b>{{ $t('Rack.Cargo_Spaces') }}</b>
          <div class="flex-fill p-2">
            <el-progress
              :stroke-width="18"
              :percentage="zone.level"
              text-inside
              striped
              striped-flow
              :duration="40"
            >
              <span>{{ zone.hasCstPortNum }}/{{ zone.totalPorts }}</span>
            </el-progress>
          </div>
        </div>
        <div class="d-flex flex-row flex-wrap w-100">
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
    <div v-else>
      <div v-for="zone in GroupedWipData" :key="zone.zoneName">
        <div class="d-flex flex-row">
          <b>{{ $t('Rack.Cargo_Spaces') }}</b>
          <div class="flex-fill">
            <el-progress
              :stroke-width="18"
              :percentage="zone.level"
              text-inside
              striped
              striped-flow
              :duration="40"
            >
              <span>{{ zone.hasCstPortNum }}/{{ zone.totalPorts }}</span>
            </el-progress>
          </div>
        </div>
        <div class="d-flex flex-row flex-wrap w-100">
          <div v-for="Rack in zone.zones" :key="Rack.WIPName">
            <RackStatus :rack_info="Rack" :showLevel="false"></RackStatus>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import RackStatus from '@/components/RacksStatusView/RackStatus.vue'
import { EqStore } from '@/store'
export default {
  components: {
    RackStatus,
  },
  data() {
    return {
      display: 'div'//div
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
  }
}
</script>
<style lang="scss">
.rack-status-view {
}
</style>