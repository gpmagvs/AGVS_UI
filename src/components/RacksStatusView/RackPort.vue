<template>
  <div class="rack-port" v-bind:class="[ProductQualityClassName, UsableStateClass, NotRackPortClass]">
    <div class="bg-light border-bottom d-flex py-1">
      <span class="flex-fill text-start px-1">
        <el-tooltip v-if="IsDeveloperLogining" placement="right" effect="light">
          <template #content>
            <div>
              <el-button @click="HandleRenamePortNoClicked">{{ $t('Rename') }}</el-button>
            </div>
          </template>
          <label :class="!IsInstallEQ ? 'port-no-display' : 'port-no-display-not-rack'">{{ PortNameDisplay }} </label>
        </el-tooltip>
      </span>
      <div v-show="AnySensorFlash" class="text-danger bg-light w-100 text-start" style=" max-height: 0;  position: relative;left:3px;top:0px;">
        <i class="bi bi-exclamation"></i> {{ $t('Rack.Sensor_Flash') }}
      </div>
      <div v-if="IsUserLoginAndPermissionAboveOP && !IsInstallEQ" class="px-2">
        <el-switch :active-text="$t('Enable')" :inactive-text="$t('Disable')" :active-value="1" :inactive-value="0" inactive-color="rgb(146, 148, 153)" v-model="port_info.Properties.PortUsable" :before-change="HandlePortUsableSwitchClicked"></el-switch>
      </div>
      <div v-else-if="!IsInstallEQ">
        <span class="text-danger" v-if="port_info.Properties.PortUsable == 0">{{ $t('Disabled') }}</span>
      </div>
    </div>
    <div v-if="!IsInstallEQ">
      <div class="item">
        <div class="title">{{ $t('RackPort.CarrierID') }}</div>
        <div class="values d-flex">
          <el-tag size="large" effect="dark" :type="port_info.CarrierID == '' ? 'info' : 'primary'" style="width: 135px; font-weight: bold; letter-spacing: 3px;">{{ port_info.CarrierID }}</el-tag>
          <el-tooltip placement="top-start" :content="$t('Rack.copy')">
            <i v-if="port_info.CarrierID != ''" @click="CopyText(port_info.CarrierID)" class="copy-button copy-icon bi bi-clipboard"></i>
          </el-tooltip>
        </div>
      </div>
      <div class="item" v-if="!IsOvenAsRacks && port_info.Properties.HasTraySensor && (port_info.Properties.CargoTypeStore == 2 || port_info.Properties.CargoTypeStore == 0)">
        <div class="title">{{ $t('CarrierExistSensor_Tray') }}</div>
        <div class="values d-flex">
          <div class="exist-sensor round my-1" v-bind:style="ExistSensorTray_1 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('tray', 0)"></div>
          <div class="exist-sensor round my-1 mx-3" v-bind:style="ExistSensorTray_2 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('tray', 1)"></div>
        </div>
        <!-- <div class="values">{{ port_info.CstExist }}</div> -->
      </div>
      <div class="item" v-if="!IsOvenAsRacks && port_info.Properties.HasRackSensor && (port_info.Properties.CargoTypeStore == 2 || port_info.Properties.CargoTypeStore == 1)">
        <div class="title">{{ $t('CarrierExistSensor_Rack') }}</div>
        <div class="values d-flex">
          <div class="exist-sensor round my-1" v-bind:style="ExistSensorRack_1 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('rack', 0)"></div>
          <div class="exist-sensor round my-1 mx-3" v-bind:style="ExistSensorRack_2 ? ExistSensorOnStyle : ExistSensorOFFStyle" @click="HandleExistSensorStateClick('rack', 1)"></div>
        </div>
        <!-- <div class="values">{{ port_info.CstExist }}</div> -->
      </div>
      <!--  -->
      <div class="item" v-if="!IsOvenAsRacks && port_info.Properties.HasTrayDirectionSensor && (port_info.Properties.CargoTypeStore == 2 || port_info.Properties.CargoTypeStore == 1)">
        <div class="title">{{ $t('TrayDirection') }}</div>
        <div class="values d-flex">
          <div class="exist-sensor round my-1" v-bind:style="TrayDirectionSensor ? ExistSensorOnStyle : ExistSensorOFFStyle"></div>
        </div>
        <!-- <div class="values">{{ port_info.CstExist }}</div> -->
      </div>
      <!--  -->
      <div class="item" v-if="IsOvenAsRacks">
        <div class="title">{{ $t('RackPort.CarrierExist') }}</div>
        <div class="values">
          <el-tag size="large" effect="dark" :type="port_info.CarrierExist ? 'success' : 'danger'"> {{ port_info.CarrierExist ? $t('RackPort.HasCargo') : $t('RackPort.NoCargo') }} </el-tag>
        </div>
      </div>
      <div class="item" v-if="IsOvenAsRacks">
        <div class="title">{{ $t('RackPort.EmptyorFillFrame') }}</div>
        <div class="values">
          <el-radio-group :disabled="radioGroupDisable" size="large" v-model="port_info.RackContentState" fill="rgb(8, 87, 60)">
            <el-radio-button @click="EmptyContentClick" :value="0">{{ $t('RackPort.EmptyFrame') }}</el-radio-button>
            <el-radio-button @click="FullContentClick" :value="1">{{ $t('RackPort.FillFrame') }}</el-radio-button>
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
        <div class="title">{{ $t('RackPort.InstallTime') }}</div>
        <div class="values">{{ InstallTime }}</div>
      </div>
      <div class="item justify-content-center">
        <el-button v-if="IsCarrierIDExist && IsCarrierExist" ref="modify_btn" @click="CstIDEditHandle" type="success">{{ $t('Rack.Edit_ID') }}</el-button>
        <el-button v-if="!IsCarrierIDExist && IsCarrierExist" @click="CstIDEditHandle" class="m-1" type="info">{{ $t('Rack.Creat_ID') }}</el-button>
        <el-button v-if="IsCarrierIDExist && !IsCarrierExist" @click="RemoveCSTID" type="danger">{{ $t('Rack.Remove_ID') }}</el-button>
      </div>
    </div>
    <div v-else class="h-100">
      <div class="w-100 h-100 align-items-center justify-content-center d-flex">NOT RACK PORT</div>
    </div>
    <el-dialog v-model="showPortNoRenameDialog" :title="`Port No Rename: ${port_info.Properties.ID}`" width="30%" draggable :close-on-click-modal="false" :modal="false">
      <el-form label-position="top">
        <el-form-item label="Current Port No:">
          <el-input v-model="port_info.Properties.PortNo" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="New Port No:" required>
          <el-input v-model="newPortNo" placeholder="Enter new port number" autofocus ref="portNoInput" :rules="[
            { required: true, message: 'Port number is required' },
            { pattern: /^[A-Za-z0-9-_]+$/, message: 'Only letters, numbers, hyphens and underscores allowed' },
            { min: 1, max: 20, message: 'Length must be between 1-20 characters' }
          ]"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="showPortNoRenameDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handlePortNoRename">Confirm</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Clipboard from 'clipboard'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import { ModifyCargoID, RemoveCargoID, PortUsableSwitch, PortNoRename } from '@/api/WIPAPI.js'
import { userStore } from '@/store'
import { RackEmuAPI, SetToFullRackStatusByEqTag, SetToEmptyRackStatusByEqTag } from '@/api/EquipmentAPI'
import { EqStore } from '@/store'
import bus from '@/event-bus'
import moment from 'moment'
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
      showPortNoRenameDialog: false,
      newPortNo: '',

    }
  },
  computed: {
    IsInstallEQ() {
      if (!this.port_info.Properties.EQInstall.IsUseForEQ)
        return false;
      const eqName = this.port_info.Properties.EQInstall.BindingEQName;
      const eqOption = EqStore.state.EqOptions.find(e => e.Name == eqName);
      return (eqOption && !eqOption.IsRoleAsZone)
    },
    BindingEQName() {
      return this.port_info.Properties.EQInstall.BindingEQName;
    },
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
      if (this.port_info.disabledTempotary)
        return 'port-not-usable-temportary'
      return this.port_info.Properties.PortUsable == 1 ? 'port-usable' : 'port-not-usable';
    },
    NotRackPortClass() {
      return this.IsInstallEQ ? 'not-rack-port' : '';
    },
    PortNameDisplay() {
      return `${this.port_info.PortNo}`
      // return `${this.port_info.NickName} | ${this.port_info.Properties.ID}`
    },
    IsCarrierIDExist() {
      return this.port_info.CarrierID && this.port_info.CarrierID != '';
    },
    IsCarrierExist() {
      return this.port_info.CargoExist;
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
    },
    InstallTime() {
      if (!this.port_info.CarrierID || this.port_info.CarrierID == '')
        return '';
      else
        return moment(this.port_info.InstallTime).format('YYYY-MM-DD HH:mm:ss');
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
    },
    HandleRenamePortNoClicked() {
      this.showPortNoRenameDialog = true;
      setTimeout(() => {
        this.$refs.portNoInput.focus();
      }, 100);
    },
    async handlePortNoRename() {
      console.log(this.newPortNo)
      if (!this.newPortNo) {
        ElMessage({
          message: '請輸入新的Port編號',
          type: 'warning',
          duration: 2000
        })
        return
      }
      if (this.newPortNo.length < 1 || this.newPortNo.length > 20) {
        ElMessage({
          message: '編號長度必須在1-20個字元之間',
          type: 'warning',
          duration: 2000
        })
        return
      }
      try {

        let result = await PortNoRename(this.rack_name, this.port_info.Properties.ID, this.newPortNo);
        ElMessage({
          message: `Port編號已更新為 ${this.newPortNo}`,
          type: 'success',
          duration: 2000
        })
        this.showPortNoRenameDialog = false;
      } catch (error) {
        this.showPortNoRenameDialog = false;
        this.$swal.fire({
          text: error.message,
          title: '',
          icon: 'error',
          showCancelButton: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.showPortNoRenameDialog = true;
        })
      }
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

  .port-no-display-not-rack {
    font-size: 18px;
    font-weight: bold;
    color: rgb(255, 255, 255);
    background-color: rgb(119, 119, 119);
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
  background: var(--map-rack-port-no-cargo-but-id-exist-color);
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

.port-not-usable-temportary {
  border: 4px dashed rgb(253, 138, 6);
}

.not-rack-port {
  //background-color: rgb(119, 119, 119);
  border: 1px solid rgb(189, 189, 189);
}
</style>