<template>
  <div class="rack-status m-0 p-1">
    <div class="my-1 d-flex flex-row bg-light">
      <h3 class="w-50 text-start px-2">{{ rack_info.WIPName }}</h3>
      <div class="p-1" v-if="showLevel">
        <b>{{ $t('Rack.Cargo_Spaces') }}</b>
      </div>
      <div class="flex-fill p-2" v-if="showLevel">
        <el-progress
          :stroke-width="18"
          :percentage="Level"
          text-inside
          striped
          striped-flow
          :duration="40"
        >
          <span>{{ this.HasCstPortNum }}/{{ this.TotalPorts }}</span>
        </el-progress>
      </div>
    </div>
    <div class="ports-container">
      <div class="d-flex flex-row" v-for="row in RowsArray(rack_info.Rows)" :key="'row-' + row">
        <div class="d-flex flex-column" v-for="col in rack_info.Columns" :key="'col-' + col">
          <RackPort
            :rack_name="rack_info.WIPName"
            :port_info="GetPortByColRow(col - 1, row - 1)"
            :IsOvenAsRacks="rack_info.IsOvenAsRacks"
          ></RackPort>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import RackPort from './RackPort.vue';
export default {
  components: {
    RackPort,
  },
  methods: {
    GetPortByColRow(col, row) {
      var _ports = this.rack_info.Ports;
      return _ports.find(port => port.Properties.Row == row && port.Properties.Column == col);
    },
    RowsArray(n) {
      let arr = []
      for (var i = n; i >= 1; i--)
        arr.push(i)
      return arr;
    }
  },
  props: {
    rack_info: {
      type: Object,
      default() {
        return {
          WIPName: "Rack-1",
          Rows: 3,
          Columns: 3,
          ColumnsTagMap: {
            0: [0],
            1: [1],
            2: [2],
          },
          Ports: [
            {
              CargoExist: false,
              CarrierID: null,
              MaterialExistSensorStates: {
                TRAY_1: false,
                TRAY_2: true,
                RACK_1: false,
                RACK_2: false
              },
              InstallTime: "0001-01-01T00:00:00",
              Properties: {
                ID: "0-0",
                Row: 0,
                Column: 0,
                IOLocation: { Tray_Sensor1: 0, Tray_Sensor2: 1, Box_Sensor1: 2, Box_Sensor2: 3 },
              },
              RackPlacementState: 0,
              TrayPlacementState: 0
            },
          ]
        }
      }
    },
    showLevel: {
      type: Boolean,
      default: true
    }
  },
  computed: {

    TotalPorts() {
      return this.rack_info.Rows * this.rack_info.Columns;
    },
    HasCstPortNum() {
      //統計有貨物的Port數量
      let count = 0;
      for (let i = 0; i < this.rack_info.Ports.length; i++) {
        if (this.rack_info.Ports[i].CargoExist === true) {
          count++;
        }
      }
      return count;
    },
    Level() {
      return this.HasCstPortNum / this.TotalPorts * 100;
    }
  },
}
</script>
<style lang="scss" scoped>
.rack-status {
  border: 2px solid black;
  .ports-container {
    // background-color: black;
    overflow-x: scroll;
  }
}
</style>