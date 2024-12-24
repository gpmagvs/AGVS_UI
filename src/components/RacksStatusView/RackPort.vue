<template>
  <div class="rack-port" v-bind:class="[ProductQualityClassName,UsableStateClass]">
    <div class="bg-light border-bottom d-flex py-1">
      <span class="flex-fill text-start px-1">
        <label class="port-no-display">{{ PortNameDisplay }}</label>
      </span>
      <div
        v-show="AnySensorFlash"
        class="text-danger bg-light w-100 text-start"
        style=" max-height: 0;  position: relative;left:3px;top:0px;"
      >
        <i class="bi bi-exclamation"></i>
        {{
        $t('Rack.Sensor_Flash') }}
      </div>
      <div v-if="IsUserLoginAndPermissionAboveOP" class="px-2">
        <el-switch
          active-text="啟用"
          inactive-text="禁用"
          :active-value="1"
          :inactive-value="0"
          inactive-color="rgb(146, 148, 153)"
          v-model="port_info.Properties.PortUsable"
          :before-change="HandlePortUsableSwitchClicked"
        ></el-switch>
      </div>
      <div v-else>
        <span class="text-danger" v-if="port_info.Properties.PortUsable==0">已禁用</span>
      </div>
      <!-- <div class="px-2" v-if="!IsOvenAsRacks">
        <el-tag
          v-bind:class="ProductQualityClassName + ' text-dark'"
          v-if=" port_info.Properties.ProductionQualityStore == 0"
          effect="dark"
        >NORMAL PORT</el-tag>
        <el-tag v-bind:class="ProductQualityClassName + ' text-dark'" v-else effect="dark">NG PORT</el-tag>
      </div>-->
    </div>
    <div class="item">
      <div class="title">Carrier ID</div>
      <div class="values d-flex">
        <el-tag
          size="large"
          effect="dark"
          :type="port_info.CarrierID==''?'info':'primary'"
          style="width: 135px; font-weight: bold; letter-spacing: 3px;"
        >{{ port_info.CarrierID }}</el-tag>
        <el-tooltip placement="top-start" :content="$t('Rack.copy')">
          <i
            v-if="port_info.CarrierID != ''"
            @click="CopyText(port_info.CarrierID)"
            class="copy-button copy-icon bi bi-clipboard"
          ></i>
        </el-tooltip>
      </div>
    </div>
    <div
      class="item"
      v-if="!IsOvenAsRacks && port_info.Properties.HasTraySensor && (port_info.Properties.CargoTypeStore == 2 || port_info.Properties.CargoTypeStore == 0)"
    >
      <div class="title">Exist Sensor(Tray)</div>
      <div class="values d-flex">
        <div
          class="exist-sensor round my-1"
          v-bind:style="ExistSensorTray_1 ? ExistSensorOnStyle : ExistSensorOFFStyle"
          @click="HandleExistSensorStateClick('tray', 0)"
        ></div>
        <div
          class="exist-sensor round my-1 mx-3"
          v-bind:style="ExistSensorTray_2 ? ExistSensorOnStyle : ExistSensorOFFStyle"
          @click="HandleExistSensorStateClick('tray', 1)"
        ></div>
      </div>
      <!-- <div class="values">{{ port_info.CstExist }}</div> -->
    </div>
    <div
      class="item"
      v-if="!IsOvenAsRacks && port_info.Properties.HasRackSensor&&( port_info.Properties.CargoTypeStore == 2 || port_info.Properties.CargoTypeStore == 1)"
    >
      <div class="title">Exist Sensor(Rack)</div>
      <div class="values d-flex">
        <div
          class="exist-sensor round my-1"
          v-bind:style="ExistSensorRack_1 ? ExistSensorOnStyle : ExistSensorOFFStyle"
          @click="HandleExistSensorStateClick('rack', 0)"
        ></div>
        <div
          class="exist-sensor round my-1 mx-3"
          v-bind:style="ExistSensorRack_2 ? ExistSensorOnStyle : ExistSensorOFFStyle"
          @click="HandleExistSensorStateClick('rack', 1)"
        ></div>
      </div>
      <!-- <div class="values">{{ port_info.CstExist }}</div> -->
    </div>

    <!--  -->
    <div
      class="item"
      v-if="!IsOvenAsRacks && port_info.Properties.HasTrayDirectionSensor&&( port_info.Properties.CargoTypeStore == 2 || port_info.Properties.CargoTypeStore == 1)"
    >
      <div class="title">Tray Direction</div>
      <div class="values d-flex">
        <div
          class="exist-sensor round my-1"
          v-bind:style="TrayDirectionSensor ? ExistSensorOnStyle : ExistSensorOFFStyle"
        ></div>
      </div>
      <!-- <div class="values">{{ port_info.CstExist }}</div> -->
    </div>

    <!--  -->
    <div class="item" v-if="IsOvenAsRacks">
      <div class="title">貨物在席</div>
      <div class="values">
        <el-tag
          size="large"
          effect="dark"
          :type="port_info.CarrierExist?'success':'danger'"
        >{{port_info.CarrierExist?'有貨':'無貨'}}</el-tag>
      </div>
    </div>
    <div class="item" v-if="IsOvenAsRacks">
      <div class="title">空/實框</div>
      <div class="values">
        <el-radio-group
          :disabled="radioGroupDisable"
          size="large"
          v-model="port_info.RackContentState"
          fill="rgb(8, 87, 60)"
        >
          <el-radio-button @click="EmptyContentClick" :value="0" label="空框"></el-radio-button>
          <el-radio-button @click="FullContentClick" :value="1" label="實框"></el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="item" v-if="false">
      <div class="title">Install Priority</div>
      <div class="values">
        <el-input type="text" size="small" v-model="port_info.Properties.StoragePriority"></el-input>
      </div>
    </div>
    <div class="item">
      <div class="title">Install Time</div>
      <div class="values">{{ port_info.InstallTime }}</div>
    </div>
    <!-- <div class="item">
      <div class="title"></div>
      <div class="values">BBB</div>
    </div>-->
    <div class="item justify-content-center">
      <div v-if="IsCarrierIDExist" class="w-100 d-flex justify-content-center">
        <el-button ref="modify_btn" @click="CstIDEditHandle" type="success">{{ $t('Rack.Edit_ID') }}</el-button>
        <el-button @click="RemoveCSTID" type="danger">{{ $t('Rack.Remove_ID') }}</el-button>
      </div>
      <el-button v-else @click="CstIDEditHandle" class="m-1" type="info">{{ $t('Rack.Creat_ID') }}</el-button>
    </div>
  </div>
</template>
<script>
import Clipboard from 'clipboard'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { ModifyCargoID, RemoveCargoID, PortUsableSwitch } from '@/api/WIPAPI.js'
import { userStore } from '@/store'
import { RackEmuAPI, SetToFullRackStatusByEqTag, SetToEmptyRackStatusByEqTag } from '@/api/EquipmentAPI'
import { EqStore } from '@/store'
import bus from '@/event-bus'
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
          SensorStates: {
            TRAY_1: false,
            TRAY_2: true,
            RACK_1: false,
            RACK_2: false,
            TRAY_DIRECTION: false
          },
          InstallTime: "0001-01-01T00:00:00",
          Properties: {
            ID: "0-0",
            Row: 0,
            Column: 0,
            PortNo: '',
            PortUsable: 0,
            ProductionQualityStore: 0,//0: ok | 1: ng
            CargoTypeStore: 2, // 0:tray | 1:Rack| 2:Mixed
            IOLocation: { Tray_Sensor1: 0, Tray_Sensor2: 1, Box_Sensor1: 2, Box_Sensor2: 3 },
            StoragePriority: 0, //數字愈大優先度愈高
            HasTrayDirectionSensor: false,
            HasTraySensor: true,
            HasRackSensor: true,
          },
          RackPlacementState: 0,
          TrayPlacementState: 0
        }
      }
    },
    IsOvenAsRacks: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ExistSensorOnStyle: {
        backgroundColor: 'lime'
      },
      ExistSensorOFFStyle: {
        backgroundColor: 'rgb(180, 183, 191)'
      },
      selectedRackContentType: '',
      radioGroupDisable: false,
    }
  },
  computed: {
    IsUserLoginAndPermissionAboveOP() {
      return userStore.state.user.Role > 0;
    },
    ProductQualityClassName() {
      if (this.IsOvenAsRacks)
        return 'oven-port'
      if (this.port_info.CargoExist && this.port_info.CarrierID)
        return 'has-cst-port'
      if (!this.port_info.CargoExist && this.port_info.CarrierID) //有帳籍但無貨
        return 'has-data-but-no-cargo-port'

      if (this.port_info.CargoExist && !this.port_info.CarrierID) //有貨但無帳籍
        return 'has-cargo-but-no-cst-port'
      return 'empty-port'
    },
    UsableStateClass() {
      return this.port_info.Properties.PortUsable == 1 ? 'port-usable' : 'port-not-usable';
    },
    PortNameDisplay() {
      return `${this.port_info.PortNo}`
      // return `${this.port_info.NickName} | ${this.port_info.Properties.ID}`
    },
    IsCarrierIDExist() {
      return this.port_info.CarrierID && this.port_info.CarrierID != '';
    },
    ModifyButtonText() {
      return !this.IsCarrierIDExist ? '新增帳籍' : '修改帳籍';
    },
    ExistSensorTray_1() { return this.port_info.MaterialExistSensorStates["TRAY_1"] != 0; },
    ExistSensorTray_2() { return this.port_info.MaterialExistSensorStates["TRAY_2"] != 0; },
    ExistSensorRack_1() { return this.port_info.MaterialExistSensorStates["RACK_1"] != 0; },
    ExistSensorRack_2() { return this.port_info.MaterialExistSensorStates["RACK_2"] != 0; },
    TrayDirectionSensor() { return this.port_info.SensorStates["TRAY_DIRECTION"] != 0; },
    AnySensorFlash() {
      var states = Object.values(this.port_info.MaterialExistSensorStates)
      var flashs = states.filter(sta => sta == 2);
      return flashs.length != 0;
    },
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
        type: 'warning',
        // cancelButtonClass: 'bg-danger text-light rounded',
        confirmButtonText: '修改',
        inputErrorMessage: '帳籍ID不得為空',
        inputPlaceholder: '請輸入ID',
        inputValidator: (_input) => {
          return _input != '';
        }
      }).then(async (msg_data) => {
        console.info(msg_data)
        var _newid = !msg_data.value ? "" : msg_data.value;
        let result = await ModifyCargoID(this.rack_name, this.port_info.Properties.ID, _newid)
        if (result.confirm)
          this.$message({ message: '帳籍已修改。', type: 'success' })
        else
          this.$swal.fire(
            {
              text: result.message,
              title: '',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        // this.port_info.CarrierID = msg_data.value
      }).catch(() => {

      })
    },
    RemoveCSTID() {
      this.$swal.fire(
        {
          text: `確定要移除帳籍-[${this.port_info.CarrierID}] ?`,
          title: '移除帳籍確認',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (res) => {
          if (res.isConfirmed) {
            let result = await RemoveCargoID(this.rack_name, this.port_info.Properties.ID);
            if (result.confirm)
              this.$message({ message: '帳籍已移除。' })
            else
              this.$swal.fire(
                {
                  text: result.message,
                  title: '',
                  icon: 'error',
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                  customClass: 'my-sweetalert'
                })
          }
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
    },
    async EmptyContentClick() {
      this.radioGroupDisable = true;
      await SetToEmptyRackStatusByEqTag(this.port_info.TagNumbers[0], true)
      await SetToFullRackStatusByEqTag(this.port_info.TagNumbers[0], false)
      this.radioGroupDisable = false;
    },
    async FullContentClick() {
      this.radioGroupDisable = true;
      await SetToFullRackStatusByEqTag(this.port_info.TagNumbers[0], true)
      await SetToEmptyRackStatusByEqTag(this.port_info.TagNumbers[0], false)
      this.radioGroupDisable = false;
    },
    async HandlePortUsableSwitchClicked() {
      setTimeout(async () => {
        const nameDisplay = `${this.rack_name}-${this.port_info.PortNo}`
        const switchToUsable = this.port_info.Properties.PortUsable != 1;
        const response = await PortUsableSwitch(this.rack_name, this.port_info.Properties.ID, switchToUsable);
        if (response.confirm) {
          bus.emit('home-reload-request', 'rack-port-usable-changed')
          ElNotification({
            title: '成功',
            message: switchToUsable ? `${nameDisplay}已啟用` : `${nameDisplay}已停用`,
            type: 'success',
            duration: 1500
          })
        } else {
          this.$swal.fire({
            text: response.message,
            title: `切換${nameDisplay} ${switchToUsable ? '啟用' : '禁用'}失敗`,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        }
      }, 300);
      return false;
    }
  },
}
</script>
<style lang="scss" scoped>
.rack-port {
  width: 360px;
  height: 260px;
  //   background-color: rgb(236, 236, 236);
  border: 3px solid rgb(0, 0, 0);
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

  .port-no-display {
    font-size: 18px;
    font-weight: bold;
    color: rgb(255, 255, 255);
    background-color: rgb(0, 0, 0);
    border-radius: 5px;
    padding: 2px 10px;
    letter-spacing: 3px;
  }
}
.rack-port:hover {
  border: 5px solid rgb(51, 51, 51);
  border-radius: 8px;
}
.ok-port {
  font-weight: bold;
  background: rgb(255, 255, 255);
}
.has-data-but-no-cargo-port,
.has-cargo-but-no-cst-port {
  background: rgb(255, 62, 62);
  color: rgb(255, 255, 255);
}

.has-cst-port {
  background: rgb(61, 61, 61);
  color: rgb(255, 255, 255);
}
.empty-port {
  background: rgb(255, 255, 255);
}
.ng-port {
  background: rgb(255, 196, 196);
}
.oven-port {
  background-color: rgb(213, 213, 213);
  color: black;
}
.port-not-usable {
  border: 6px solid red;
}
</style>