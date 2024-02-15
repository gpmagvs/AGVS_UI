<template>
  <div class="charge-station-setup" style="height:100%">
    <el-tabs tab-position="top">
      <el-tab-pane v-for="(data, name) in charge_station_data" :key="name" :label="name">
        <div class="charger-states border rounded text-start">
          <h3 class="px-2">{{ name }}</h3>
          <div class="d-flex w-100">
            <div class="state p-3">
              <h5 class="title">狀態</h5>
              <el-form label-width="120" label-position="left">
                <el-form-item label="連線狀態">
                  <el-tag
                    effect="dark"
                    :type="data.Connected ? 'success' : 'danger'">{{ data.Connected ? 'Connected' : 'Disconnect' }}</el-tag>
                </el-form-item>
                <el-form-item label="狀態">
                  <el-tag
                    effect="dark"
                    :type="GetTagType(data)">{{ !data.Connected ? 'Disconnect' : data.ErrorCodes.length == 0 ? 'Normal' : 'Warning' }}</el-tag>
                </el-form-item>
                <el-form-item label="異常碼">
                  <div class="row" style="width:390px;padding-left:12px">
                    <el-tag
                      effect="dark"
                      class="col-sm-3"
                      v-for="error_code in data.ErrorCodes"
                      :key="error_code"
                      type="danger">{{ error_code }}</el-tag>
                  </div>
                </el-form-item>
                <el-form-item label="輸入電壓">
                  <el-tag>{{ data.Vin }} V</el-tag>
                </el-form-item>
                <el-form-item label="輸出電壓">
                  <el-tag>{{ data.Vout }} V</el-tag>
                </el-form-item>
                <el-form-item label="輸出電流">
                  <el-tag>{{ data.Iout }} A</el-tag>
                </el-form-item>
              </el-form>
            </div>
            <div class="state mx-2 p-3">
              <h5 class="title">充電曲線參數</h5>
              <el-form label-width="70" label-position="left">
                <el-form-item label="CC">
                  <div class="d-flex">
                    <el-input :precision="2" disabled v-model="data.CC"></el-input>
                    <el-button
                      :disabled="!IsLogin"
                      @click="HandleSettingBtnClick(name, 'cc', data.CC)">設定</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="CV">
                  <div class="d-flex">
                    <el-input :precision="2" disabled v-model="data.CV"></el-input>
                    <el-button
                      :disabled="!IsLogin"
                      @click="HandleSettingBtnClick(name, 'cv', data.CV)">設定</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="FV">
                  <div class="d-flex">
                    <el-input :precision="2" disabled v-model="data.FV"></el-input>
                    <el-button
                      :disabled="!IsLogin"
                      @click="HandleSettingBtnClick(name, 'fv', data.FV)">設定</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="TC">
                  <div class="d-flex">
                    <el-input :precision="2" disabled v-model="data.TC"></el-input>
                    <el-button
                      :disabled="!IsLogin"
                      @click="HandleSettingBtnClick(name, 'tc', data.TC)">設定</el-button>
                  </div>
                </el-form-item>
              </el-form>
              <h6>充電曲線參考圖示</h6>
              <img class="border rounded p-3" src="images/charger_curve.png" alt />
            </div>
          </div>
        </div>
        <div class="text-start" style="font-size: 14px;">
          <span>更新時間</span> {{ FormatTime(data.UpdateTime) }}
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      draggable
      :title="`${DialogData.EqName}-${DialogData.Item.toUpperCase()} 設定`"
      width="300px"
      v-model="SettingDialogVisible">
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
import { EqStore, userStore, UIStore } from '@/store'
import param from '@/gpm_param.js'
import { ChargerAPI } from '@/api/EquipmentAPI.js'
import moment from 'moment'
export default {
  computed: {
    charge_station_data() {
      return EqStore.getters.ChargeStationData
    },
    IsLogin() {
      return userStore.getters.IsLogin
    }
  },
  data() {
    return {
      select: 1,
      SettingDialogVisible: false,
      DialogData: {
        EqName: '',
        Item: 'CC',
        Value: 33
      }
    }
  },
  methods: {
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
    }
  },
}
</script>

<style lang="scss" >
.el-tabs__content {
  padding: 3px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.charger-states {
  .state {
    width: 30%;
  }

  .title {
    font-weight: bold;
    width: 100%;
    border-bottom: 1px solid grey;
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