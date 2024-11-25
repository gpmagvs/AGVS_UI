<template>
  <div class="updown-stream-settings p-3">
    <h3>{{ scriptName }}</h3>

    <h5>Options</h5>
    <div class="d-flex flex-column w-100 mb-5">
      <el-checkbox
        size="large"
        label="Rack Port需要真正有貨才可做為起點"
        v-model="script.RandomHotRunSettings.IsRackPortNeedHasCargoAcutally"
      ></el-checkbox>
      <el-checkbox
        size="large"
        label="主設備出貨後僅搬運至Rack"
        v-model="script.RandomHotRunSettings.IsMainEqUnloadTransferToRackOnly"
      ></el-checkbox>
    </div>
    <h5>Rack Up/Down Stream</h5>
    <el-table :data="RackTable" border>
      <el-table-column label="RACK" prop="Name"></el-table-column>
      <el-table-column label="可供入料取貨之設備">
        <template #default="scope">
          <el-select
            v-model="scope.row.DownStream"
            multiple
            @change="HandleDownStreamChanged(scope.row)"
          >
            <el-option
              v-for="opt in EQPortOptions"
              :key="opt.value"
              :label="opt.name"
              :value="opt.value"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="可供出料存貨之設備">
        <template #default="scope">
          <el-select
            v-model="scope.row.UpStream"
            multiple
            @change="HandleUpStreamChanged(scope.row)"
          >
            <el-option
              v-for="opt in EQPortOptions"
              :key="opt.value"
              :label="opt.name"
              :value="opt.value"
            ></el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>

    <pre v-if="false">{{ script }}</pre>
    <pre v-if="false">{{ RackTable }}</pre>
  </div>
</template>

<script>
import { EqStore } from '@/store';
export default {
  name: 'UpDownStreamSettings',
  data() {
    return {
      script: {
        RandomHotRunSettings: {

        }
      },
      RackTable: [
        { Name: 'Rack1' }
      ],
    }
  },
  computed: {
    scriptName() {
      if (this.script) {
        return this.script.scriptID ?? 'Unknown Script';
      }
      return 'Unknown Script';
    },
    EQPortOptions() {
      return EqStore.state.EqOptions.map(opt => { return { name: opt.Name + `(${opt.TagID})`, value: opt.TagID } })
    },
    RacksInfo() {
      return EqStore.state.WIPOptions.map(opt => { return { name: opt.Name, value: opt.TagID } })
    }
  },
  methods: {
    update(script) {
      this.script = script;

      this.RackTable = this.RacksInfo.map(rack => { return { Name: rack.name, UpStream: [], DownStream: [] } })

      if (script.RandomHotRunSettings && script.RandomHotRunSettings.RacksUpDownStarems) {

        Object.entries(script.RandomHotRunSettings.RacksUpDownStarems).forEach(([rackTag, rackInfo]) => {
          const rack = this.RackTable.find(r => r.Name == rackTag);
          if (rack) {
            rack.UpStream = rackInfo.UpStream;
            rack.DownStream = rackInfo.DownStream;
          }
        });
      }

    },
    HandleDownStreamChanged(rack) {
      console.log(rack);
      if (!this.script.RandomHotRunSettings.RacksUpDownStarems[rack.Name]) {
        this.script.RandomHotRunSettings.RacksUpDownStarems[rack.Name] = {
          UpStream: [],
          DownStream: []
        };
      }
      this.script.RandomHotRunSettings.RacksUpDownStarems[rack.Name].DownStream = rack.DownStream;
    },
    HandleUpStreamChanged(rack) {
      if (!this.script.RandomHotRunSettings.RacksUpDownStarems[rack.Name]) {
        this.script.RandomHotRunSettings.RacksUpDownStarems[rack.Name] = {
          UpStream: [],
          DownStream: []
        };
      }
      this.script.RandomHotRunSettings.RacksUpDownStarems[rack.Name].UpStream = rack.UpStream;
    },

  },
}
</script>

<style lang="scss" scoped>
.updown-stream-settings {
  h3 {
    margin-bottom: 4rem;
    letter-spacing: 3px;
  }

  h3,
  h5 {
    width: 100%;
    border-bottom: 1px solid #ccc;
    padding-bottom: 10px;
  }
}
</style>
