<template>
  <div class="bg-light h-100 d-flex" v-loading="loading">
    <b-tabs class="w-100" v-model="tabSelected">
      <b-tab class title="Basic">
        <div class="tab-container">
          <div class="p-2 d-flex bg-light border-bottom">
            <el-button size="large" type="primary" @click="SECSConfigHandleSaveButtonClicked">儲存</el-button>
            <el-button size="large" @click="() => { DownloadConfigurations(); }">重新載入</el-button>
          </div>
          <el-row class="m-3">
            <el-col :lg="8" class="border px-5">
              <div class="w-100">
                <h3 class="text-start text-danger border-bottom my-3">SECS Config設定</h3>
                <el-form label-position="left" label-width="320px" style="max-height: 70vh; overflow-y: auto;">
                  <template v-for="(value, key) in configuration.baseConfiguration" :key="key">
                    <el-form-item :label="'-' + $t(`secsGem.${key}`)">
                      <el-input v-model="configuration.baseConfiguration[key]" :controls="false"
                        style="text-align: center !important"></el-input>
                    </el-form-item>
                  </template>
                </el-form>
              </div>
            </el-col>
            <el-col :lg="12"></el-col>
          </el-row>
        </div>
      </b-tab>
      <b-tab class title="Result Code 設定">
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
      <b-tab class title="Return Code 設定">
        <div class="tab-container">
          <div class="p-2 d-flex bg-light border-bottom">
            <el-button size="large" type="primary" @click="HandleSaveButtonClicked">儲存</el-button>
            <el-button size="large" @click="() => { DownloadConfigurations(); }">重新載入</el-button>
          </div>
          <el-row class="m-3">
            <el-col :lg="8" class="border px-5">
              <div class="w-100">
                <h3 class="text-start text-danger border-bottom my-3">Task Return Code</h3>
                <el-form label-position="left" label-width="500px" style="max-height: 70vh; overflow-y: auto;">
                  <template v-for="(value, key) in hexReturnCodes" :key="key">
                    <el-form-item :label="'-' + $t(`${key.replace('ReturnCodes', '')}`)">
                      <el-input v-model="hexReturnCodes[key]" readonly></el-input>
                    </el-form-item>
                  </template>
                </el-form>
              </div>
            </el-col>
            <el-col :lg="12"></el-col>
          </el-row>
        </div>
      </b-tab>
    </b-tabs>
    <div v-if="false" class="w-20 border">
      <pre class="text-start">{{ configuration }}</pre>
    </div>
  </div>
</template>
<script>
import { GetConfigurations, SaveReturnCodeSetting, SaveSECSConfig } from '@/api/SecsGemAPI'
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
        TaskConfiguration: {
          ReturnCodes:
          {
            Control_State_Not_At_Online_Remote: 0x70,            // 派車非 Online/Remote 模式
            Cannot_Create_Command_By_Exception: 0x71,           // 因異常無法創建命令
            Not_Assign_Source_Port: 0x72,             // 未指定來源站點
            Cannot_Find_Source_Port: 0x73,                 // 找不到來源站點
            Not_Assign_Destination_Port: 0x74,                    // 未指定目標站點
            Cannot_Find_Destination_Port: 0x75,             // 找不到目標站點
            Cannot_Perform_Unload_For_Source_Port: 0x76,      // 無法在來源站點執行卸載
            Cannot_Perform_Load_For_Destination_Port: 0x77,      // 無法在目標站點執行裝載
            Save_Command_Data_To_Database_Fail: 0x78,           // 保存命令數據到數據庫失敗
            Source_Port_Assign_Wrong_AGV: 0x79,             // 來源站點分配了錯誤的AGV
            AGV_Cargo_Status_Mismatch_With_Command: 0x7A,             // AGV貨物狀態與命令不匹配
            Wrong_Command_Data_Cause_Exception: 0x7B,               // 錯誤的命令數據導致異常
            Signal_Is_Not_Load_Request_For_Destination_Port: 0x7C,     // 目標站點無裝載請求信號
            Signal_Is_Not_Unload_Request_For_Source_Port: 0x7D,        // 來源站點無卸載請求信號
            Cannot_Detect_Carrier_Exist_For_Source_Port: 0x7E,       // 無法檢測到來源站點的載具存在
            Equipment_Status_Is_Down: 0x80,                      // 設備狀態為停機
            Detect_Carrier_Exist_For_Destination_Port: 0x81,            // 檢測到目標站點已有載具
            Equipment_Load_Request_And_Unload_Request_Both_ON: 0x82, // 設備裝載和卸載請求信號同時開啟
            Equipment_Load_Request_And_Unload_Request_Both_OFF: 0x83, // 設備裝載和卸載請求信號同時關閉
            Unknown_Conditions: 0x84,                                   // 未知條件
            Cannot_Find_The_Carrier_ID_In_Rack: 0x85,              // 在料架中找不到指定載具ID
            Cannot_Find_Seat_For_The_Carrier_In_Rack: 0x86,           // 在料架中找不到載具的位置
            Not_Assign_Vehicle_For_Abnormal_Transfer: 0x87,      // 異常搬運未指定車輛
            Source_Port_Assign_AGV_But_Already_Exist_Same_Command: 0x88,// 來源站點已分配AGV但存在相同命令
            Not_Assign_Carrier_ID_For_Command: 0x89,                   // 命令未指定載具ID
            Rack_Source_Port_Already_Has_Task: 0x8A,                   // 料架來源站點已有任務
            Rack_Source_Port_Position_Is_Disable: 0x8B,             // 料架來源站點位置已禁用
            Rack_Source_Port_Exist_Multiple_Same_Carrier_Id: 0x8C,    // 料架來源站點存在多個相同載具ID
            Rack_Destination_Port_Already_Has_Task: 0x8D,            // 料架目標站點已有任務
            Rack_Destination_Port_Position_Is_Disable: 0x8F,         // 料架目標站點位置已禁用
            Rack_Destination_Port_Already_Has_Data: 0x90,          // 料架目標站點已有數據
            Source_Port_Unload_Request_Is_OFF: 0x91,           // 來源站點卸載請求為關閉狀態
            Destination_Port_Load_Request_Is_OFF: 0x92,                // 目標站點裝載請求為關閉狀態
            Source_Port_Is_Disconnected: 0x93,                      // 來源站點已斷開連接
            Destination_Port_Is_Disconnected: 0x94,               // 目標站點已斷開連接
            Rack_Sensor_Is_Error: 0x95
          }
        },
        alarmConfigFilePath: "",
        transferReportConfigFilePath: ""
      }
    }
  },
  computed: {
    hexReturnCodes() {
      return Object.fromEntries(
        Object.entries(this.configuration.TaskConfiguration.ReturnCodes).map(([key, value]) =>
          [key, '0x' + parseInt(value).toString(16).toUpperCase()] // 轉換數字為十六進制字串
        )
      );
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
          //return;
        }
        let response = await SaveResultCodeSetting({
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
    async SECSConfigHandleSaveButtonClicked() {
      try {
        let response = await SaveSECSConfig(this.configuration.baseConfiguration)

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
.tab-container {
  :deep(.el-input__inner) {
    text-align: center;
  }
}
</style>