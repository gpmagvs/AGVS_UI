<template>
  <div class="bg-light h-100 d-flex" v-loading="loading">
    <b-tabs class="w-100" v-model="tabSelected">
      <b-tab class title="Return Code 設定">
        <div class="tab-container">
          <div class="p-2 d-flex bg-light border-bottom">
            <el-button size="large" type="primary" @click="HandleSaveButtonClicked">儲存</el-button>
            <el-button size="large" @click="() => { DownloadConfigurations(); }">重新載入</el-button>
          </div>
          <el-row class="m-3">
            <el-col :lg="8" class="border px-5">
              <div class="w-100">
                <h3 class="text-start text-danger border-bottom my-3">Transfer Complete Result Code</h3>
                <el-form label-position="left" label-width="320px" style="max-height: 70vh; overflow-y: auto;">
                  <template v-for="(value, key) in configuration.transferReportConfiguration.ResultCodes" :key="key">
                    <el-form-item :label="'-' + $t(`secsGem.${key.replace('ResultCode', '')}`)">
                      <el-input-number v-model="configuration.transferReportConfiguration.ResultCodes[key]" :min="0"
                        :max="999" :controls="false"></el-input-number>
                    </el-form-item>
                  </template>
                </el-form>
              </div>
            </el-col>
            <el-col :lg="12"></el-col>
          </el-row>
        </div>
      </b-tab>
      <b-tab class title="尚未開放">
        <div class="tab-container">AAA</div>
      </b-tab>
    </b-tabs>
    <div v-if="false" class="w-20 border">
      <pre class="text-start">{{ configuration }}</pre>
    </div>
  </div>
</template>

<script>
import { GetConfigurations, SaveReturnCodeSetting } from '@/api/SecsGemAPI'
import { ElNotification } from 'element-plus';
export default {
  data() {
    return {
      loading: true,
      tabSelected: 0,
      route: '',
      configuration: {
        baseConfiguration: {
          DeviceID: "2F_AGVC02",
          CarrierLOCPrefixName: "AOIRACK001",
          SystemID: "022",
          UnknowTrayIDFlowNumberUsed: 135,
          UnknowRackIDFlowNumberUsed: 1,
          DoubleUnknowDFlowNumberUsed: 240,
          DoubleUnknowRackIDFlowNumberUsed: 0,
          MissMatchTrayIDFlowNumberUsed: 1,
          MissMatchRackIDFlowNumberUsed: 0
        },
        alarmConfiguration: {
          Version: 0
        },
        transferReportConfiguration: {
          ResultCodes:
          {
            OtherErrorsResultCode: 1,
            ZoneIsFullResultCode: 1,
            UnloadButCargoIDReadNotMatchedResultCode: 1,
            UnloadButCargoIDReadFailResultCode: 1,
            InterlockErrorResultCode: 1,
            EqUnloadButNoCargoResultCode: 1,
            AGVDownWhenLDULDWithCargoResultCode: 1,
            AGVDownWhenLDWithoutCargoResultCode: 1,
            AGVDownWhenULDWithoutCargoResultCode: 1,
            AGVDownWhenMovingToDestineResultCode: 1,
            DestineEqLoadReqeustOff: 1,
            DestineEqHasCargoResultCode: 1,
            DestineEqMachechStateErrorResultCode: 1,
            DestineEqDownResultCode: 1,
            SourceEqUnloadReqeustOff: 1,
            SourceEqNotHasCargoResultCode: 1,
            SourceEqMachechStateErrorResultCode: 1,
            SourceEqDownResultCode: 1,
            DestineRackPortHasCargoResultCode: 1,
            SourceRackPortNotHasCargoResultCode: 1
          }
        },
        alarmConfigFilePath: "",
        transferReportConfigFilePath: ""
      }
    }
  },
  mounted() {
    this.route = this.$route.path;
    this.DownloadConfigurations();
  },
  methods: {
    async DownloadConfigurations() {
      this.loading = true;
      try {
        this.configuration = await GetConfigurations();
      } catch (error) {
        alert(error.message)
      }
      finally {
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }
    },
    async HandleSaveButtonClicked() {
      try {
        //var checkReuslt = this.CheckResultCodeNoRepeated(this.configuration.transferCompletedResultCodes.ResultCodes[key]);
        //const checkReuslt = this.CheckResultCodeNoRepeated(this.configuration.transferCompletedResultCodes.ResultCodes);
        const resultCodes = this.configuration.transferReportConfiguration.ResultCodes;
        const isDuplicate = this.ShowRepeatedResultCode(resultCodes);
        if (isDuplicate.hasDuplicates) {
          this.$swal.fire(
            {
              text: `有重複的Result Code: ${isDuplicate.duplicateValues.join(', ')}`,
              title: '',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
          return;
        }
        let response = await SaveReturnCodeSetting({
          transferCompletedResultCodes: this.configuration.transferReportConfiguration.ResultCodes
        })

        if (!response) {
          ElNotification({ message: '儲存失敗', type: 'error' })
          return;
        }

        if (response.confirm)
          ElNotification({ message: '儲存成功', type: 'success' })
        else
          ElNotification({ message: '儲存失敗-' + response.message, type: 'success' })

      } catch (error) {
        ElNotification({ message: '儲存失敗-' + error.message, type: 'success' })
      }
    },

    /**若無重複 返回  true , 反之 false */

    ShowRepeatedResultCode(resultCodes) {
      const values = Object.values(resultCodes);
      console.log('All Result Codes:', values);
      const valueCountMap = new Map();
      // 計算每個值出現的次數
      values.forEach(value => {
        valueCountMap.set(value, (valueCountMap.get(value) || 0) + 1);
      });
      // 找出重複的值
      const duplicateValues = Array.from(valueCountMap.entries())
        .filter(([value, count]) => count > 1)
        .map(([value]) => value);
      console.log('Duplicate Result Codes:', duplicateValues);
      // 返回是否有重複以及重複的值
      return {
        hasDuplicates: duplicateValues.length > 0,
        duplicateValues: duplicateValues
      };
    }
  },
  watch: {
    $route(to, from) {

      if (to.path == this.route) {
        console.log('Route changed:', to.path);
        return;
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.tab-container {}
</style>