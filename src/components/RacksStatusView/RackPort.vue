<template>
  <div class="rack-port ">
    <div class="bg-primary text-light border-bottom">{{ PortNameDisplay }}</div>
    <div class="item">
      <div class="title">Carrier ID</div>
      <div class="values d-flex">
        <el-input type="text" disabled size="small" v-model="port_info.CarrierID"></el-input>
        <el-tooltip placement="top-start" content="複製到剪貼簿">
          <i
            v-if="port_info.CarrierID != ''"
            @click="CopyText(port_info.CarrierID)"
            class="copy-button copy-icon bi bi-clipboard"></i>
        </el-tooltip>
      </div>
    </div>
    <div class="item">
      <div class="title">Exist Sensor(Tray)</div>
      <div class="values d-flex">
        <div class="exist-sensor round my-1" v-bind:style="ExistSensorTray_1 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('tray', 0)"></div>
        <div class="exist-sensor round my-1 mx-3" v-bind:style="ExistSensorTray_2 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('tray', 1)"></div>
      </div>
      <!-- <div class="values">{{ port_info.CstExist }}</div> -->
    </div>
    <div class="item">
      <div class="title">Exist Sensor(Rack)</div>
      <div class="values d-flex">
        <div class="exist-sensor round my-1" v-bind:style="ExistSensorRack_1 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('rack', 0)"></div>
        <div class="exist-sensor round my-1 mx-3" v-bind:style="ExistSensorRack_2 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('rack', 1)"></div>
      </div>
      <!-- <div class="values">{{ port_info.CstExist }}</div> -->
    </div>
    <div class="item">
      <div class="title">Install Time</div>
      <div class="values">{{ port_info.InstallTime }}</div>
    </div>
    <div class="item">
      <div class="title"></div>
      <div class="values">BBB</div>
    </div>
    <div class="item">
      <el-button
        ref="modify_btn"
        @click="CstIDEditHandle"
        class="m-1 w-100"
        :type="ModifyButtonText == '新增帳籍' ? 'info' : 'success'"
        size="large">{{ ModifyButtonText }}</el-button>
    </div>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { ModifyCargoID } from '@/api/WIPAPI.js'
import { userStore } from '@/store'
import { RackEmuAPI } from '@/api/EquipmentAPI'
export default {
  props: {
    rack_name: {
      type: String,
      default: ""
    },
    port_info: {
      type: Object,
      default() {
        return {
          CargoExist: false,
          CarrierID: null,
          ExistSensorStates: {
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
        }
      }
    }
  },
  data() {
    return {
      ExistSensorOnStyle: {
        backgroundColor: 'lime'
      },
      ExistSensorOFFStyle: {
        backgroundColor: 'rgb(255, 50, 0)'
      }
    }
  },
  computed: {
    PortNameDisplay() {
      return `${this.rack_name} | ${this.port_info.Properties.ID}`
    },
    ModifyButtonText() {
      return !this.port_info.CarrierID || this.port_info.CarrierID == '' ? '新增帳籍' : '修改帳籍';
    },
    ExistSensorTray_1() { return this.port_info.ExistSensorStates["TRAY_1"]; },
    ExistSensorTray_2() { return this.port_info.ExistSensorStates["TRAY_2"]; },
    ExistSensorRack_1() { return this.port_info.ExistSensorStates["RACK_1"]; },
    ExistSensorRack_2() { return this.port_info.ExistSensorStates["RACK_2"]; },
    IsDeveloperLogining() {
      return userStore.getters.IsDeveloperLogining;
    }
  },

  methods: {
    async HandleExistSensorStateClick(cargoType = 'tray|rack', number = 0 | 1) {
      // alert(`${cargoType}-${number}`)
      if (!this.IsDeveloperLogining)
        return;

      var response = await RackEmuAPI.SetSensorState(this.rack_name, this.port_info.Properties.ID, cargoType, number, false);
      if (!response.confirm)
        this.$swal.fire(
          {
            text: '',
            title: `${response.message}`,
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
    },
    CstIDEditHandle() {
      ElMessageBox.prompt('Carrier ID', {
        title: `${this.ModifyButtonText} : ${this.PortNameDisplay}`,
        draggable: true,
        inputValue: this.port_info.CarrierID,
        type: 'warning'

      }).then((msg_data) => {
        console.info(msg_data)
        var _newid = !msg_data.value ? "" : msg_data.value;
        ModifyCargoID(this.rack_name, this.port_info.Properties.ID, _newid)
        // this.port_info.CarrierID = msg_data.value
      }).catch(() => {

      })
    },
    CopyText(text) {
      const clipboard = new Clipboard('.copy-button', {
        text: () => text
      });
      clipboard.on('success', () => {
        ElNotification({
          title: text,
          message: "已複製到剪貼簿",
          duration: 1500
        })
        clipboard.destroy();
      });

      clipboard.on('error', () => {
        clipboard.destroy();
      });
    }
  },
}
</script>

<style lang="scss">
.rack-port {
  width: 360px;
  height: 255px;
  //   background-color: rgb(236, 236, 236);
  border: 2px solid grey;
  margin: 2px;

  .item {
    display: flex;
    flex-direction: row;
    margin: 0px;
    padding: 3px;
    border-block: 1px dashed grey;

    .title {
      font-size: 14px;
      width: 40%;
      font-weight: bold;
      padding: 3px;
      text-align: start;
    }

    .values {
      text-align: center;
      text-align: center;
    }

    .exist-sensor {
      width: 15px;
      height: 15px;
      border: 2px solid grey;
      cursor: pointer;
    }
  }
}
</style>