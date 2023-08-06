<template>
  <div class="charge-station-setup" style="height:100%">
    <el-tabs type="border-card" tab-position="top">
      <el-tab-pane v-for="(data,name) in charge_station_data" :key="name" :label="name">
        <div class="charger-states d-flex border rounded">
          <!-- {{data}} -->
          <div class="p-3">
            <el-form label-width="120" label-position="left">
              <el-form-item label="充電站名稱">
                <el-tag>{{ name }}</el-tag>
              </el-form-item>
              <el-form-item label="狀態">
                <el-tag
                  effect="dark"
                  :type="GetTagType(data.ErrorCodes)"
                >{{data.ErrorCodes.length==0?'Normal':'Warning' }}</el-tag>
              </el-form-item>
              <el-form-item label="異常碼">
                <div class="row" style="width:390px;padding-left:12px">
                  <el-tag
                    effect="dark"
                    class="col-sm-3"
                    v-for="error_code in data.ErrorCodes"
                    :key="error_code"
                    type="danger"
                  >{{ error_code}}</el-tag>
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
          <div class="mx-2 p-3">
            <el-form label-width="70" label-position="left">
              <el-form-item label="CC">
                <div class="d-flex">
                  <el-input :disabled="!IsLogin" v-model="data.Iout"></el-input>
                </div>
              </el-form-item>
              <el-form-item label="CV">
                <div class="d-flex">
                  <el-input :disabled="!IsLogin" v-model="data.Iout"></el-input>
                </div>
              </el-form-item>
              <el-form-item label="FV">
                <div class="d-flex">
                  <el-input :disabled="!IsLogin" v-model="data.Iout"></el-input>
                </div>
              </el-form-item>
              <el-form-item label="TC">
                <div class="d-flex">
                  <el-input :disabled="!IsLogin" v-model="data.Iout"></el-input>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { EqStore, userStore, UIStore } from '@/store'
import param from '@/gpm_param.js'
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
      select: 1
    }
  },
  methods: {
    GetTagType(errorCodes) {
      if (errorCodes.length == 0)
        return 'success'
      else {
        return 'warning'
      }
    },
    HandleTabChange(e) {
      alert(e)
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