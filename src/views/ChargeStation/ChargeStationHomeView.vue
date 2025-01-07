<template>
  <div class="charge-station-setup" style="height:100%" v-loading="!IsChargeStationDataReceived">
    <div v-if="!IsChargeStationDataReceived" class="my-5 mx-3">
      <el-skeleton :rows="10" animated />
    </div>
    <el-tabs
      v-else
      lazy
      type="border-card"
      tab-position="top"
      @tab-change="HandleTabChange"
      v-model="selectedTabName"
      style="height:100%"
    >
      <el-tab-pane
        class="h-100"
        v-for="(data, name) in charge_station_data"
        :key="name"
        :label="name"
        :name="name"
        v-loading="loading"
      >
        <div class="charger-states rounded text-start py-3 px-1">
          <el-row class="d-flex w-100 my-1" :gutter="10">
            <el-col :lg="8">
              <div class="state p-3 border rounded w-100 h-100">
                <h5 class="title">狀態</h5>
                <el-row :lg="12" :gutter="10">
                  <el-col :lg="12">
                    <el-form label-width="100" label-position="left">
                      <el-form-item label="通訊狀態">
                        <el-tag
                          effect="dark"
                          :type="data.Connected ? 'success' : 'danger'"
                        >{{ data.Connected ? '正常' : '斷線' }}</el-tag>
                      </el-form-item>
                      <el-form-item v-if="data.IsUsing" label="運轉狀態">
                        <el-tag
                          effect="dark"
                          :type="GetTagType(data)"
                        >{{ !data.Connected ? 'Disconnect' : data.ErrorCodes.length == 0 ? 'Normal' : 'Warning' }}</el-tag>
                      </el-form-item>
                      <el-form-item v-else label="運轉狀態">
                        <el-tag effect="dark" type="warning">閒置中</el-tag>
                      </el-form-item>
                      <el-form-item v-if="data.IsUsing" label="當前充電模式" class="d-flex">
                        <el-tag>{{ GetChargeMode(data.CurrentChargeMode) }}</el-tag>
                        <el-tag v-if="data.IsBatteryFull" type="success" effect="dark">已充飽電</el-tag>
                      </el-form-item>
                      <el-form-item label="異常">
                        <div class="d-flex flex-column w-100">
                          <el-tag
                            v-if="data.ErrorCodesDescrptions &&data.ErrorCodesDescrptions.length == 0"
                            type="success"
                          >尚無異常</el-tag>
                          <el-tag
                            v-else
                            class="w-100"
                            v-for="error_code in data.ErrorCodesDescrptions"
                            :key="error_code"
                            type="danger"
                          >{{ error_code }}</el-tag>
                        </div>
                      </el-form-item>
                    </el-form>
                  </el-col>
                  <el-col :lg="12">
                    <el-form label-width="150" label-position="left">
                      <el-form-item label="輸入電壓(AC)">
                        <div class="w-100 d-flex px-3">
                          <span class="digital-font-charger-station">{{ data.Vin }}</span>
                          <span class="digital-font-unit-charger-station">V</span>
                        </div>
                      </el-form-item>
                      <el-form-item label="輸出電壓(DC)">
                        <div class="w-100 d-flex px-3">
                          <span class="digital-font-charger-station">{{ data.Vout }}</span>
                          <span class="digital-font-unit-charger-station">V</span>
                        </div>
                      </el-form-item>
                      <el-form-item label="輸出電流">
                        <div class="w-100 d-flex px-3">
                          <span class="digital-font-charger-station">{{ data.Iout }}</span>
                          <span class="digital-font-unit-charger-station">A</span>
                        </div>
                      </el-form-item>
                      <el-form-item label="充電器溫度">
                        <div class="w-100 d-flex px-3">
                          <span class="digital-font-charger-station">{{ data.Temperature }}</span>
                          <span class="digital-font-unit-charger-station">°C</span>
                        </div>
                      </el-form-item>
                      <el-form-item label="充電站溫度">
                        <div class="w-100 d-flex px-3">
                          <span
                            class="digital-font-charger-station"
                            v-bind:class="data.IsStationTemperatureOverThresHold?'text-danger':''"
                          >{{ data.StationTemperature }}</span>
                          <span class="digital-font-unit-charger-station">°C</span>
                        </div>
                      </el-form-item>
                    </el-form>
                  </el-col>
                </el-row>
              </div>
            </el-col>
            <el-col :lg="8" v-if="data.IOStates">
              <div class="state p-3 border rounded w-100 h-100">
                <h5 class="title">IO狀態</h5>
                <div class="d-flex w-100 gap-4">
                  <div>
                    <el-form-item label="連線狀態">
                      <el-tag
                        effect="dark"
                        :type="data.IOModuleConnected ? 'success' : 'danger'"
                      >{{ data.IOModuleConnected ? '正常' : '斷線' }}</el-tag>
                    </el-form-item>
                  </div>
                  <el-form>
                    <el-form-item label="IO狀態">
                      <div class="d-flex flex-column w-100">
                        <div>
                          <span>DI-0</span>
                          <el-tag
                            :effect="GetIOTagEffect(data.IOStates.IO_St_EMO)"
                            class="text-truncate mx-3"
                          >EMO</el-tag>
                        </div>
                        <div>
                          <span>DI-1</span>
                          <el-tag
                            :effect="GetIOTagEffect(data.IOStates.IO_St_SMOKE_DECTECTED)"
                            class="text-truncate mx-3"
                          >偵煙異常</el-tag>
                        </div>
                        <div>
                          <span>DI-2</span>
                          <el-tag
                            :effect="GetIOTagEffect(data.IOStates.IO_St_AIR_ERROR)"
                            class="text-truncate mx-3"
                          >氣壓異常</el-tag>
                        </div>
                        <div>
                          <span>DI-3</span>
                          <el-tag
                            :effect="GetIOTagEffect(data.IOStates.IO_St_CYLINDER_FORWARD)"
                            class="text-truncate mx-3"
                          >極頭伸出</el-tag>
                        </div>
                        <div>
                          <span>DI-4</span>
                          <el-tag
                            :effect="GetIOTagEffect(data.IOStates.IO_St_CYLINDER_BACKWARD)"
                            class="text-truncate mx-3"
                          >極頭收回</el-tag>
                        </div>
                        <div>
                          <span>DI-5</span>
                          <el-tag
                            :effect="GetIOTagEffect(data.IOStates.IO_St_TEMPERATURE_MODULE_ABN)"
                            class="text-truncate mx-3"
                          >溫度異常</el-tag>
                        </div>
                      </div>
                    </el-form-item>
                  </el-form>
                </div>
              </div>
            </el-col>
            <el-col class :lg="8">
              <div class="state p-3 border rounded w-100 h-100">
                <h5 class="title">使用中車輛</h5>
                <el-tag v-if="!data.UseVehicleName || data.UseVehicleName == ''">無</el-tag>
                <el-tag v-else>{{ data.UseVehicleName }}</el-tag>
              </div>
            </el-col>
          </el-row>
          <el-row class="d-flex w-100 my-1" :gutter="10">
            <el-col :lg="16">
              <div class="state p-3 border rounded w-100 h-100">
                <h5 class="title">充電曲線參數</h5>
                <div class="d-flex">
                  <el-row :gutter="10">
                    <el-col :lg="8">
                      <el-form label-width="70" label-position="left">
                        <el-form-item label="CC">
                          <div class="d-flex">
                            <el-input :precision="2" disabled v-model="data.CC"></el-input>
                            <el-button
                              :disabled="!IsLogin"
                              @click="HandleSettingBtnClick(name, 'cc', data.CC)"
                            >設定</el-button>
                          </div>
                        </el-form-item>
                        <el-form-item label="CV">
                          <div class="d-flex">
                            <el-input :precision="2" disabled v-model="data.CV"></el-input>
                            <el-button
                              :disabled="!IsLogin"
                              @click="HandleSettingBtnClick(name, 'cv', data.CV)"
                            >設定</el-button>
                          </div>
                        </el-form-item>
                        <el-form-item label="FV">
                          <div class="d-flex">
                            <el-input :precision="2" disabled v-model="data.FV"></el-input>
                            <el-button
                              :disabled="!IsLogin"
                              @click="HandleSettingBtnClick(name, 'fv', data.FV)"
                            >設定</el-button>
                          </div>
                        </el-form-item>
                        <el-form-item label="TC">
                          <div class="d-flex">
                            <el-input :precision="2" disabled v-model="data.TC"></el-input>
                            <el-button
                              :disabled="!IsLogin"
                              @click="HandleSettingBtnClick(name, 'tc', data.TC)"
                            >設定</el-button>
                          </div>
                        </el-form-item>
                      </el-form>
                    </el-col>
                    <el-col :lg="8">
                      <div class="mx-5">
                        <div class="mb-1 text-dark">充電曲線參考圖示</div>
                        <img class="border rounded p-2" src="/images/charger_curve.png" alt />
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-col>
            <el-col :lg="8">
              <div class="state p-3 border rounded w-100 h-100">
                <h5 class="title">充電樁配置</h5>
                <el-form label-width="120" label-position="left">
                  <el-form-item label="可使用AGV">
                    <div class="d-flex w-100">
                      <el-select
                        v-if="!IsModify"
                        :disabled="true"
                        size="small"
                        v-model="data.UsableAGVNames"
                        multiple
                        placeholder="Select"
                        style="width: 1000px"
                      >
                        <el-option
                          v-for="agv_name in GetAGVName"
                          :key="agv_name"
                          :label="agv_name"
                          :value="agv_name"
                        />
                      </el-select>
                      <el-select
                        v-else
                        size="small"
                        v-model="UsableAGVNamesEdit"
                        multiple
                        placeholder="Select"
                        style="width: 1000px"
                      >
                        <el-option
                          v-for="agv_name in GetAGVName"
                          :key="agv_name"
                          :label="agv_name"
                          :value="agv_name"
                        />
                      </el-select>
                      <el-button
                        class="mx-2"
                        :type="IsModify ? 'success' : ''"
                        size="large"
                        @click="() => {
                        IsModify = !IsModify;
                        if (IsModify)
                          UsableAGVNamesEdit = data.UsableAGVNames;
                        else
                          SaveUsableAGVSetting(name, UsableAGVNamesEdit)
                      }"
                      >{{ IsModify ? '儲存' : '修改' }}</el-button>
                      <el-button
                        class="mx-2"
                        v-if="IsModify"
                        type="danger"
                        size="large"
                        @click="() => { IsModify = false }"
                      >取消</el-button>
                    </div>
                  </el-form-item>
                  <el-form-item label="Tag">
                    <div class="w-100 d-flex"></div>
                    <el-input-number
                      size="large"
                      class="flex-fill"
                      v-model="data.TagNumber"
                      v-if="!IsTagNumberModify"
                      :disabled="true"
                    ></el-input-number>
                    <el-input-number
                      size="large"
                      class="flex-fill"
                      v-model="TagNumberForEdit"
                      v-else
                    ></el-input-number>
                    <el-button
                      size="large"
                      class="mx-2"
                      type="success"
                      v-if="IsTagNumberModify"
                      @click="() => { IsTagNumberModify = !IsTagNumberModify; ChangeTagNumerOfStation(name, TagNumberForEdit); }"
                    >儲存</el-button>
                    <el-button
                      size="large"
                      class="mx-2"
                      v-else
                      @click="() => { IsTagNumberModify = !IsTagNumberModify; TagNumberForEdit = data.TagNumber; }"
                    >修改</el-button>
                    <el-button
                      size="large"
                      class="mx-2"
                      type="danger"
                      v-if="IsTagNumberModify"
                      @click="() => { IsTagNumberModify = !IsTagNumberModify; }"
                    >取消</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      draggable
      :title="`${DialogData.EqName}-${DialogData.Item.toUpperCase()} 設定`"
      width="300px"
      v-model="SettingDialogVisible"
    >
      <el-form class="border-top py-2" label-width="60px">
        <el-form-item :label="DialogData.Item.toUpperCase()">
          <el-input-number :step="0.1" :precision="2" v-model="DialogData.Value"></el-input-number>
        </el-form-item>
      </el-form>
      <div class="d-flex justify-content-end w-100 border-top py-2">
        <el-button type="success" @click="HandleConfirmClick">確定</el-button>
        <el-button type="danger" @click="SettingDialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { EqStore, userStore, UIStore, agv_states_store } from '@/store'
import param from '@/gpm_param.js'
import { ChargerAPI } from '@/api/EquipmentAPI.js'
import moment from 'moment'
export default {
  computed: {
    charge_station_data() {
      return EqStore.state.ChargeStation
    },
    IsLogin() {
      return userStore.getters.IsLogin
    },
    IsChargeStationDataReceived() {
      return EqStore.state.ChargeStationDataReceived
    },
    GetAGVName() {
      return agv_states_store.getters.AGVNameList
    }
  },
  data() {
    return {
      select: 1,
      selectedTabName: '',
      previousSelectedTabName: '',
      SettingDialogVisible: false,
      DialogData: {
        EqName: '',
        Item: 'CC',
        Value: 33,
        UsableAGVNames: []
      },
      UsableAGVNamesEdit: [],
      IsModify: false,
      IsTagNumberModify: false,
      TagNumberForEdit: 0,
      loading: false
    }
  },
  watch: {
    IsChargeStationDataReceived(newVal) {
      if (newVal) {
        this.SetDefaultTab()
      }
    }
  },
  mounted() {
    this.SetDefaultTab()
  },
  methods: {
    SetDefaultTab() {
      this.selectedTabName = this.previousSelectedTabName = Object.keys(this.charge_station_data)[0]
    },
    HandleTabChange(name) {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 500);
      if (this.previousSelectedTabName != name && this.IsModify) {
        var previousChargeAGVNameList = this.charge_station_data[this.previousSelectedTabName].UsableAGVNames;
        var isHasChange = JSON.stringify(this.UsableAGVNamesEdit) != JSON.stringify(previousChargeAGVNameList);
        if (isHasChange) {
          this.$swal.fire(
            {
              text: '',
              title: `${this.previousSelectedTabName} 可用車輛設定尚未儲存，確定要離開嗎?`,
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              cancelButtonText: '返回',
              showCancelButton: true,
              customClass: 'my-sweetalert'
            }).then(ret => {
              if (ret.isConfirmed) {
                this.IsModify = false;
                this.previousSelectedTabName = name;
              } else {
                this.selectedTabName = this.previousSelectedTabName;
                this.IsModify = true;
                return;
              }
            })
        } else {
          this.IsModify = false;
          this.previousSelectedTabName = name;
        }
      } else if (this.previousSelectedTabName != name) {

        this.IsModify = false;
        this.previousSelectedTabName = name;
      }

      this.IsTagNumberModify = false;
    },
    GetTagType(data) {
      if (!data.Connected) {
        return 'danger'
      }
      if (data.ErrorCodes.length == 0)
        return 'success'
      else {
        return 'warning'
      }
    },
    GetIOTagEffect(state) {
      if (state)
        return 'dark'
      else
        return 'plain'
    },
    GetChargeMode(mode_int) {
      if (mode_int != 0 && mode_int != 1 && mode_int != 2)
        return '未知'

      var map = { 0: '定電壓模式', 1: '浮充模式', 2: '定電流模式' }
      return map[mode_int];
    },
    FormatTime(time) {
      return moment(time).format('yyyy/MM/DD HH:mm:ss');
    },
    HandleSettingBtnClick(charge_station_name, setting_item, value) {
      this.DialogData.EqName = charge_station_name
      this.DialogData.Item = setting_item
      this.DialogData.Value = value

      this.SettingDialogVisible = true;
    },
    HandleConfirmClick() {
      this.SettingDialogVisible = false;
      this.$swal.fire(
        {
          text: '',
          title: `確定要將${this.DialogData.EqName} ${this.DialogData.Item.toUpperCase()} 更改為 ${this.DialogData.Value} ?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (res) => {
          if (res.isConfirmed) {
            var response = await ChargerAPI.SetCurveSetting(this.DialogData.EqName, this.DialogData.Item, this.DialogData.Value)
            var swalIcon = response.confirm ? 'success' : 'error'
            this.$swal.fire(
              {
                text: response.confirm ? '' : response.message,
                title: response.confirm ? '修改成功' : '修改失敗',
                icon: swalIcon,
                showCancelButton: false,
                confirmButtonText: 'OK',
                customClass: 'my-sweetalert',
                timer: response.confirm ? 3000 : -1
              }).then((res) => {
                if (!response.confirm)
                  this.SettingDialogVisible = true;

              })

          } else {
            this.SettingDialogVisible = true;
          }
        })
    },
    async SaveUsableAGVSetting(stationName, AGVList) {
      var response = await ChargerAPI.SaveUsableAGVSetting(stationName, AGVList);
      if (response.confirm) {
        this.$swal.fire(
          {
            title: `${stationName} 可用車輛設定已儲存!`,
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      } else {
        this.$swal.fire(
          {
            text: response.message,
            title: `${stationName} 可用車輛設定失敗!`,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    },
    async ChangeTagNumerOfStation(stationName = '', tagNumber = -1) {
      var response = await ChargerAPI.ModifyTagNumber(stationName, tagNumber);
      if (response.confirm) {
        this.$swal.fire(
          {
            title: `${stationName} Tag 設定成功!`,
            icon: 'info',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      } else {
        this.IsTagNumberModify = true;
        this.$swal.fire(
          {
            text: response.message,
            title: `${stationName} Tag 設定失敗!`,
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }
    }
  },

}
</script>
<style lang="scss">
.el-tabs__content {
  padding: 3px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.charger-states {
  height: 95%;
  .state {
    width: 30%;
  }

  .title {
    font-weight: bold;
    // border: 1px solid;
    padding: 5px;
    background-color: rgb(243, 243, 243);
    border-radius: 5px;
  }

  .el-form-item__label {
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 4px;
  }

  .el-tag {
    width: 120px;
    height: 35px;
    margin: 3px;
  }

  .el-tag,
  input {
    font-size: 18px;
  }

  input {
    width: 100px;
    text-align: center;
  }
}
</style>