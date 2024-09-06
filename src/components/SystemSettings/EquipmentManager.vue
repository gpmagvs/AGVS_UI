<template>
  <div class="equipment-manager border-start border-end" v-loading="loading">
    <div class="w-100 d-flex">
      <p v-if="displayMode=='eq-list'" class="text-start px-1 flex-fill">
        <b-button variant="primary" squared @click="SaveSettingHandler">儲存設定</b-button>
        <b-button variant="info" squared class="mx-2" @click="AddNewEqHandler">新增設備</b-button>
        <b-button squared @click="ReloadSettingsHandler">重新載入</b-button>
      </p>

      <!-- action buttons for eq-group mode -->
      <p v-if="displayMode=='eq-group'" class="text-start px-1 flex-fill">
        <b-button variant="primary" squared @click="SaveGroupsClicked">儲存設定</b-button>
        <b-button squared @click="ReloadSettingsHandler">重新載入</b-button>
      </p>

      <!-- 切換設備列表/群組選單 -->
      <el-radio-group v-model="displayMode">
        <el-radio-button size="large" label="設備列表" value="eq-list"></el-radio-button>
        <el-radio-button size="large" label="設備群組" value="eq-group"></el-radio-button>
      </el-radio-group>
    </div>
    <EqGroupEditor ref="group-editor" v-show="displayMode=='eq-group'"></EqGroupEditor>
    <el-table
      v-show="displayMode=='eq-list'"
      :header-cell-style="{ color: 'white', backgroundColor: 'rgb(13, 110, 253)', fontSize: '12px' }"
      :data="EqDatas"
      :row-key="rowKey"
      size="small"
      border
      scrollbar-always-on
      height="77vh"
      table-layout="fixed"
      ref="eqTable"
      style="width:100vw"
    >
      <el-table-column label="Index" prop="index" width="80" align="center" fixed="left" />
      <el-table-column label="設備名稱" prop="Name" width="210" fixed="left">
        <template #default="scope">
          <div class>
            <b-form-input
              :state="ValidName(scope.row)"
              v-model="scope.row.Name"
              placeholder="設備名稱"
              style="width:160px"
              :no-wheel="true"
              size="sm"
              :min="1"
              @input="HandleEqNameChange(scope.row, scope.row.Name)"
            ></b-form-input>
            <el-button
              class="my-1"
              size="small"
              @click="HandleUseMapDataDisplayName(scope.row.TagID)"
            >使用圖資設定</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Tag ID" prop="TagID" width="120" align="center" fixed="left">
        <template #default="scope">
          <b-form-input
            type="number"
            :state="ValidTag(scope.row)"
            v-model.number="scope.row.TagID"
            placeholder="tag id"
            size="sm"
            :min="1"
          ></b-form-input>
        </template>
      </el-table-column>
      <el-table-column label="層" prop="Height" width="80" align="center" fixed="left">
        <template #default="scope">
          <el-select v-model="scope.row.Height">
            <el-option label="1" :value="0"></el-option>
            <el-option label="2" :value="1"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <!-- <el-table-column label="區域" prop="Region" width="130">
        <template #default="scope">
          <RegionsSelector v-model="scope.row.Region"></RegionsSelector>
        </template>
      </el-table-column>-->
      <el-table-column label="下游設備" width="850">
        <template #default="scope">
          <div class="w-100 d-flex flex-row">
            <el-select
              size="small"
              v-model="scope.row.ValidDownStreamEndPointNames"
              multiple
              placeholder="Select"
              style="width: 1000px"
            >
              <el-option
                v-for="eq_name in GetAvaluableEqNameList(scope.row.Name)"
                :key="eq_name"
                :label="eq_name"
                :value="eq_name"
              />
            </el-select>
            <el-button
              class="mx-1"
              size="small"
              type="default"
              @click="() => { scope.row.ValidDownStreamEndPointNames = GetAvaluableEqNameList(scope.row.Name) }"
            >使用所有設備</el-button>
            <el-button
              size="small"
              type="danger"
              @click="() => { scope.row.ValidDownStreamEndPointNames = [] }"
            >清除</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="允入車款" width="120">
        <template #default="scope">
          <el-select size="small" v-model="scope.row.Accept_AGV_Type">
            <el-option :value="0" label="0-不限"></el-option>
            <el-option :value="1" label="1-叉車AGV"></el-option>
            <el-option :value="2" label="2-潛盾AGV"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="可移載貨物類型" width="130">
        <template #default="scope">
          <el-select size="small" v-model="scope.row.EQAcceeptCargoType">
            <el-option :value="0" label="0-不限"></el-option>
            <el-option :value="200" label="200-Tray"></el-option>
            <el-option :value="201" label="201-子母框"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="具貨物升降機構" width="100" align="center">
        <template #default="scope">
          <el-checkbox v-model="scope.row.HasCstSteeringMechanism"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="雙Port設備" width="100" align="center">
        <template #default="scope">
          <el-checkbox v-model="scope.row.IsOneOfDualPorts"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="AnotherPortTagNumber" width="80" align="center">
        <template #default="scope">
          <el-input
            type="number"
            v-model="scope.row.AnotherPortTagNumber"
            :disabled="!scope.row.IsOneOfDualPorts"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="可取貨狀態識別碼" width="80" align="center">
        <template #default="scope">
          <el-input
            type="number"
            v-model="scope.row.AllowUnloadPortTypeNumber"
            :disabled="!scope.row.IsOneOfDualPorts"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="空框/實框 訊號檢查" width="100" align="center">
        <template #default="scope">
          <el-checkbox v-model="scope.row.RackCapcityCheck"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="100" fixed="right">
        <template #default="scope">
          <div>
            <el-button
              size="small"
              type="default"
              @click="ConnectionSettingBtnHandle(scope.row)"
            >連線設定</el-button>
            <!-- <el-button
              :size="cell_item_size"
              type="primary"
            @click="IOCheckBtnHandle(scope.row)">IO點檢</el-button>-->
            <el-button size="small" type="danger" @click="RemoveHandle(scope.row)">移除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer
      size="50%"
      :z-index="1"
      v-model="connection_setting_drawer"
      :title="`${selected_eq_option.Name}-連線設定`"
    >
      <div class="w-100">
        <el-form label-position="left" label-width="100">
          <el-divider>通訊 Protocol</el-divider>
          <el-form-item label="通訊方式">
            <el-select v-model="selected_eq_option.ConnOptions.ConnMethod">
              <el-option label="Modbus TCP" :value="0"></el-option>
              <el-option label="Modbus RTU" :value="1"></el-option>
              <el-option label="TCP/IP" :value="2"></el-option>
              <el-option label="Serial Port" :value="3"></el-option>
              <el-option label="MC Protocol" :value="5"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="IP">
            <el-input
              :disabled="selected_eq_option.ConnOptions.ConnMethod == 1"
              v-model="selected_eq_option.ConnOptions.IP"
            ></el-input>
          </el-form-item>
          <el-form-item label="PORT">
            <el-input
              :disabled="selected_eq_option.ConnOptions.ConnMethod == 1"
              v-model.number="selected_eq_option.ConnOptions.Port"
            ></el-input>
          </el-form-item>
          <el-form-item label="COMPORT">
            <el-input
              :disabled="selected_eq_option.ConnOptions.ConnMethod == 0"
              v-model="selected_eq_option.ConnOptions.ComPort"
            ></el-input>
          </el-form-item>
          <el-button
            :loading="connection_testing"
            type="default"
            @click="ConnectTestHandle(selected_eq_option)"
          >通訊測試</el-button>
          <el-divider>IO位置</el-divider>
          <el-form-item label="IO數量">
            <el-input type="number" v-model="selected_eq_option.ConnOptions.Input_RegisterNum"></el-input>
          </el-form-item>

          <el-form-item label="PLC Base">
            <el-checkbox v-model="selected_eq_option.ConnOptions.IsPLCAddress_Base_1"></el-checkbox>
          </el-form-item>
          <div class="d-flex w-100 mx-1">
            <div class="w-50 border p-2">
              <h5 class="w-100 border rounded bg-primary text-light">INPUT</h5>
              <el-form label-position="left" label-width="120">
                <el-form-item label="Start Index">
                  <el-input
                    type="number"
                    v-model="selected_eq_option.ConnOptions.Input_StartRegister"
                  ></el-input>
                </el-form-item>
                <el-divider></el-divider>
                <el-form-item label="Load_Request">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Load_Request"></el-input>
                </el-form-item>
                <el-form-item label="Unload_Request">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Unload_Request"></el-input>
                </el-form-item>
                <el-form-item label="Port_Exist">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Port_Exist"></el-input>
                </el-form-item>

                <el-form-item label="Up_Pose">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Up_Pose"></el-input>
                </el-form-item>
                <el-form-item label="Down_Pose">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Down_Pose"></el-input>
                </el-form-item>
                <el-form-item label="Eqp_Status_Down">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Eqp_Status_Down"></el-input>
                </el-form-item>

                <el-form-item label="Eqp_Maintaining">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.Eqp_Maintaining"></el-input>
                </el-form-item>
                <el-form-item label="Eqp_PartsReplacing">
                  <el-input
                    type="number"
                    v-model="selected_eq_option.IOLocation.Eqp_PartsReplacing"
                  ></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="w-50 border p-2 mx-1">
              <h5 class="w-100 border rounded bg-info text-light">OUTPUT</h5>
              <el-form label-position="left" label-width="120">
                <el-form-item label="Start Index">
                  <el-input
                    type="number"
                    v-model="selected_eq_option.ConnOptions.Output_Start_Address"
                  ></el-input>
                </el-form-item>
                <el-divider></el-divider>
                <el-form-item label="To_EQ_Up">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.To_EQ_Up"></el-input>
                </el-form-item>
                <el-form-item label="To_EQ_Low">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.To_EQ_Low"></el-input>
                </el-form-item>

                <el-form-item label="CMD_Reserve_Up">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.CMD_Reserve_Up"></el-input>
                </el-form-item>
                <el-form-item label="CMD_Reserve_Low">
                  <el-input type="number" v-model="selected_eq_option.IOLocation.CMD_Reserve_Low"></el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-form>
      </div>
    </el-drawer>
    <el-drawer v-model="io_check_drawer" direction="btt">
      <div class="hs-signals d-flex">
        <div class="mx-3">交握訊號-EQ</div>
        <div
          class="di-status"
          @click="HandleHSsignaleChange(selected_eq_io_data.EQName, 'L_REQ', !scope.row.HS_EQ_L_REQ)"
          v-bind:style="signalOn(selected_eq_io_data.HS_EQ_L_REQ)"
        >L_REQ</div>
        <div
          class="di-status"
          @click="HandleHSsignaleChange(selected_eq_io_data.EQName, 'U_REQ', !scope.row.HS_EQ_U_REQ)"
          v-bind:style="signalOn(selected_eq_io_data.HS_EQ_U_REQ)"
        >U_REQ</div>
        <div
          class="di-status"
          @click="HandleHSsignaleChange(selected_eq_io_data.EQName, 'READY', !scope.row.HS_EQ_READY)"
          v-bind:style="signalOn(selected_eq_io_data.HS_EQ_READY)"
        >READY</div>
        <div
          class="di-status"
          @click="HandleHSsignaleChange(selected_eq_io_data.EQName, 'UP_READY', !scope.row.HS_EQ_UP_READY)"
          v-bind:style="signalOn(selected_eq_io_data.HS_EQ_UP_READY)"
        >UP_READY</div>
        <div
          class="di-status"
          @click="HandleHSsignaleChange(selected_eq_io_data.EQName, 'LOW_READY', !scope.row.HS_EQ_LOW_READY)"
          v-bind:style="signalOn(selected_eq_io_data.HS_EQ_LOW_READY)"
        >LOW_READY</div>
        <div
          v-if="false"
          class="di-status"
          @click="HandleHSsignaleChange(selected_eq_io_data.EQName, 'BUSY', !scope.row.HS_EQ_BUSY)"
          v-bind:style="signalOn(selected_eq_io_data.HS_EQ_BUSY)"
        >BUSY</div>
      </div>
      <div class="hs-signals d-flex">
        <div class="mx-3">交握訊號-AGV</div>
        <div
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'To_EQ_Up', !scope.row.To_EQ_Up)"
          v-bind:style="signalOn(selected_eq_io_data.To_EQ_Up)"
        >To_EQ_Up</div>
        <div
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'To_EQ_Low', !scope.row.To_EQ_Low)"
          v-bind:style="signalOn(selected_eq_io_data.To_EQ_Low)"
        >To_EQ_Low</div>
        <div
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'VALID', !scope.row.HS_AGV_VALID)"
          v-bind:style="signalOn(selected_eq_io_data.HS_AGV_VALID)"
        >VALID</div>
        <div
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'TR_REQ', !scope.row.HS_AGV_TR_REQ)"
          v-bind:style="signalOn(selected_eq_io_data.HS_AGV_TR_REQ)"
        >TR_REQ</div>
        <div
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'BUSY', !scope.row.HS_AGV_BUSY)"
          v-bind:style="signalOn(selected_eq_io_data.HS_AGV_BUSY)"
        >BUSY</div>
        <div
          v-if="false"
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'READY', !scope.row.HS_AGV_READY)"
          v-bind:style="signalOn(selected_eq_io_data.HS_AGV_READY)"
        >READY</div>
        <div
          class="di-status"
          @click="HandleAGVHSSignaleChange(selected_eq_io_data.EQName, 'COMPT', !scope.row.HS_AGV_COMPT)"
          v-bind:style="signalOn(selected_eq_io_data.HS_AGV_COMPT)"
        >COMPT</div>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { GetEQOptions, SaveEQOptions, ConnectTest, SaveEqGroupsConfigs } from '@/api/EquipmentAPI.js';
import RegionsSelector from '@/components/RegionsSelector.vue'
import EqGroupEditor from "./EQGroupEditor.vue"
import { MapStore } from '../Map/store';
import { EqStore } from '@/store'
import { ElNotification } from 'element-plus';
import { duration } from 'moment';
import { DeviceConfig } from '@/ViewModels/EndDeviceOption.js'

export default {
  components: {
    RegionsSelector, EqGroupEditor
  },
  data() {
    return {
      displayMode: 'eq-list',
      cell_item_size: '',
      io_check_drawer: false,
      connection_setting_drawer: false,
      EqDatas: [
        // {
        //   Name: "123",
        //   TagID: 1,
        //   ValidDownStreamEndPointNames: [],
        //   ConnOptions: {
        //     ConnMethod: 0,
        //     IP: "10.0.0.1",
        //     Port: 502,
        //     ComPort: "COM1"
        //   }
        // }
      ],
      EqDatas_Orignal: [],
      ValidTag: (row_) => {
        return true;
        var tag = row_.TagID;
        var others_row = this.EqDatas.filter(d => d.Name != row_.Name)
        var same_tag_rows = others_row.filter(row => row.TagID == tag)
        return same_tag_rows.length == 0 && tag >= 1;
      },
      ValidName: (row_) => {
        var name = row_.Name;
        var same_name_row = this.EqDatas.filter(d => d.Name == row_.Name)
        return same_name_row.length == 1 && name != '';
      },
      selected_eq_option: new DeviceConfig(),
      connection_testing: false,
      loading: true,
      rowKey: 'index',
    }
  },
  watch: {
    displayMode(currentMode) {
      // alert(currentMode)
    }
  },
  methods: {
    GetAvaluableEqNameList(expect_name) {
      var othersEqName = this.EqNames.filter(name => name != expect_name);

      return ["ALL", ...othersEqName];
    },
    async SaveGroupsClicked() {
      var groupConfigs = this.$refs['group-editor'].GroupsConfigures;
      SaveEqGroupsConfigs(groupConfigs)
      // alert(JSON.stringify(groupConfigs))
    },
    async SaveSettingHandler() {

      var result = this.ValidateSetting();
      if (!result.confirm) {
        this.$swal.fire(
          {
            text: '',
            title: result.message,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      }

      var ret = await SaveEQOptions(this.EqDatas);
      if (ret.confirm) {
        setTimeout(() => {
          this.ReloadSettingsHandler(false);
        }, 200);
        this.$swal.fire({
          title: '儲存成功',
          icon: 'success',
          timer: 2000
        })
      }
      else {
        this.$swal.fire({
          title: '參數設定有誤',
          text: ret.message,
          icon: 'error',
        })

      }
    },
    ValidateSetting() {
      const expectNum = this.EqDatas.length;
      var tagIDHeightCollection = [...new Set(this.EqDatas.map(opt => opt.TagID + '-' + opt.Height))]
      const confirmed = tagIDHeightCollection.length == expectNum;
      return { confirm: confirmed, message: "同一個TAG不可有相同的層設置" }
    },
    async DownloadEQOptions() {
      this.EqDatas = [];
      var datas = EqStore.state.EqOptions
      for (let index = 0; index < datas.length; index++) {
        var element = new DeviceConfig();
        Object.assign(element, datas[index]);
        element.index = index;

        this.EqDatas.push(element)
      }
      this.CloneEQDatas();
    },
    CloneEQDatas() {
      this.EqDatas_Orignal = JSON.parse(JSON.stringify(this.EqDatas));
    },
    ReloadSettingsHandler(showLoading = true) {
      this.loading = showLoading;
      setTimeout(() => {
        GetEQOptions().then(option => EqStore.commit('EqOptions', option));

        this.DownloadEQOptions();
        this.$refs.eqTable.setScrollTop(0)

        this.loading = false;
      }, 300);
    },
    AddNewEqHandler() {
      let newOption = new DeviceConfig();
      newOption.TagID = 1;
      newOption.index = this.EqDatas.length;
      this.EqDatas = [newOption, ...this.EqDatas]

      setTimeout(() => {
        this.$refs.eqTable.setScrollTop(0)
      }, 300);
    },
    RemoveHandle(row) {
      var remains = this.EqDatas.filter(eq => eq.Name != row.Name)
      this.EqDatas = remains;
    },
    async IOCheckBtnHandle(row) {
      this.selected_eq_option = row;
      this.io_check_drawer = true;
    },
    async ConnectionSettingBtnHandle(row) {
      this.selected_eq_option = row;
      this.connection_setting_drawer = true;
    },
    async ConnectTestHandle(row) {
      this.connection_testing = true;
      var ret = await ConnectTest(row.ConnOptions)
      this.connection_testing = false;
      var display_text = ''
      if (row.ConnOptions.ConnMethod == 0) {
        display_text = `Modbus TCP - ${row.ConnOptions.IP}:${row.ConnOptions.Port}`
      } else {
        display_text = `Modbus RTU - ${row.ConnOptions.ComPort}`
      }

      if (ret.Connected) {
        this.$swal.fire({
          title: 'OK',
          text: display_text,
          icon: 'success'

        })
      } else {
        this.$swal.fire({
          title: 'Fail',
          text: display_text,
          icon: 'error'

        })
      }
    },
    beforeRouteLeave(to, from, next) {
      alert('leave!')
    },
    async HandleUseMapDataDisplayName(tag) {
      var mapPoint = await MapStore.dispatch('GetMapPointByTag', tag)
      if (mapPoint) {
        var row = this.EqDatas.find(eq => eq.TagID == tag);
        var _name = mapPoint.Graph.Display;
        row.Name = _name;
        this.HandleEqNameChange(row, _name);
        ElNotification({
          message: `Get Display Name From Map Success(Tag ${tag} = ${_name})`,
          duration: 1000,
          type: 'success',
          title: '設備同步名稱'
        })
      } else {
        ElNotification({
          message: `Get Display Name From Map Fail`,
          duration: 1000,
          type: 'error',
          title: '設備同步名稱失敗'
        })
      }

    },
    HandleEqNameChange(row, newName) {
      var tagid = row.TagID;
      var oriOptions = this.EqDatas_Orignal.find(d => d.TagID == tagid);
      if (!oriOptions)
        return;
      var oriName = oriOptions.Name;
      var useOriNameOptionsList = this.EqDatas.filter(eq => eq.ValidDownStreamEndPointNames.includes(oriName));
      useOriNameOptionsList.forEach(option => {
        var _index = option.ValidDownStreamEndPointNames.indexOf(oriName);
        option.ValidDownStreamEndPointNames[_index] = newName;
      });
      this.CloneEQDatas();
    }
  },
  mounted() {
    setTimeout(() => {
      this.DownloadEQOptions();
      this.loading = false;
    }, 400);
  },
  computed: {
    EqNames() {
      return this.EqDatas.map(ep => ep.Name);
    },
    eq_data() {
      return EqStore.getters.EQData
    },
    selected_eq_io_data() {
      return this.eq_data.find(eq => eq.EQName == this.selected_eq_option.EQName)
    }
  },
}
</script>
<style lang="scss" scoped>
.equipment-manager {
  .el-drawer__header {
    margin-bottom: 5px !important;
  }
}
</style>