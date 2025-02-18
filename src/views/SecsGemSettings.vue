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
            <el-button size="large" type="primary" @click="taskreplyConfigHandleSaveButtonClicked">儲存</el-button>
            <el-button size="large" @click="() => { DownloadConfigurations(); }">重新載入</el-button>
          </div>
          <el-row class="m-3">
            <el-col :lg="8" class="border px-6">
              <div class="w-100">
                <h3 class="text-start text-danger border-bottom my-3">Task Return Code</h3>
                <el-form label-position="left" label-width="500px" style="max-height: 70vh; overflow-y: auto;">
                  <template v-for="(value, key) in configuration.TaskConfiguration.ReturnCodes" :key="key">
                    <el-form-item :label="'-' + $t(`${key.replace('ReturnCodes', '')}`)">
                      <!-- 🔹 十進制 (可編輯) -->
                      <el-input-number v-model="configuration.TaskConfiguration.ReturnCodes[key]" :min="0" :max="255"
                        :controls="false">
                      </el-input-number>
                      <!-- 🔹 十六進制 (只讀) -->
                      <el-input :value="hexReturnCodes[key]">
                      </el-input>
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
import { GetConfigurations, SaveReturnCodeSetting, SaveSECSConfig, SaveResultCodeSetting } from '@/api/SecsGemAPI'
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
            Control_State_Not_At_Online_Remote: 112,            // 派車非 Online/Remote 模式
            Cannot_Create_Command_By_Exception: 113,           // 因異常無法創建命令
            Not_Assign_Source_Port: 114,             // 未指定來源站點
            Cannot_Find_Source_Port: 115,                 // 找不到來源站點
            Not_Assign_Destination_Port: 116,                    // 未指定目標站點
            Cannot_Find_Destination_Port: 117,             // 找不到目標站點
            Cannot_Perform_Unload_For_Source_Port: 118,      // 無法在來源站點執行卸載
            Cannot_Perform_Load_For_Destination_Port: 119,      // 無法在目標站點執行裝載
            Save_Command_Data_To_Database_Fail: 120,           // 保存命令數據到數據庫失敗
            Source_Port_Assign_Wrong_AGV: 121,             // 來源站點分配了錯誤的AGV
            AGV_Cargo_Status_Mismatch_With_Command: 122,             // AGV貨物狀態與命令不匹配
            Wrong_Command_Data_Cause_Exception: 123,               // 錯誤的命令數據導致異常
            Signal_Is_Not_Load_Request_For_Destination_Port: 124,     // 目標站點無裝載請求信號
            Signal_Is_Not_Unload_Request_For_Source_Port: 125,        // 來源站點無卸載請求信號
            Cannot_Detect_Carrier_Exist_For_Source_Port: 126,       // 無法檢測到來源站點的載具存在
            Equipment_Status_Is_Down: 128,                      // 設備狀態為停機
            Detect_Carrier_Exist_For_Destination_Port: 129,            // 檢測到目標站點已有載具
            Equipment_Load_Request_And_Unload_Request_Both_ON: 130, // 設備裝載和卸載請求信號同時開啟
            Equipment_Load_Request_And_Unload_Request_Both_OFF: 131, // 設備裝載和卸載請求信號同時關閉
            Unknown_Conditions: 132,                                   // 未知條件
            Cannot_Find_The_Carrier_ID_In_Rack: 133,              // 在料架中找不到指定載具ID
            Cannot_Find_Seat_For_The_Carrier_In_Rack: 134,           // 在料架中找不到載具的位置
            Not_Assign_Vehicle_For_Abnormal_Transfer: 135,      // 異常搬運未指定車輛
            Source_Port_Assign_AGV_But_Already_Exist_Same_Command: 136,// 來源站點已分配AGV但存在相同命令
            Not_Assign_Carrier_ID_For_Command: 137,                   // 命令未指定載具ID
            Rack_Source_Port_Already_Has_Task: 138,                   // 料架來源站點已有任務
            Rack_Source_Port_Position_Is_Disable: 139,             // 料架來源站點位置已禁用
            Rack_Source_Port_Exist_Multiple_Same_Carrier_Id: 140,    // 料架來源站點存在多個相同載具ID
            Rack_Destination_Port_Already_Has_Task: 141,            // 料架目標站點已有任務
            Rack_Destination_Port_Position_Is_Disable: 143,         // 料架目標站點位置已禁用
            Rack_Destination_Port_Already_Has_Data: 144,          // 料架目標站點已有數據
            Source_Port_Unload_Request_Is_OFF: 145,           // 來源站點卸載請求為關閉狀態
            Destination_Port_Load_Request_Is_OFF: 146,                // 目標站點裝載請求為關閉狀態
            Source_Port_Is_Disconnected: 147,                      // 來源站點已斷開連接
            Destination_Port_Is_Disconnected: 148,               // 目標站點已斷開連接
            Rack_Sensor_Is_Error: 149
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
        alert(error.message, "123")
      }
      finally {
        setTimeout(() => {
          this.loading = false;
        }, 300);
      }
    }
    ,
    async toHex(value) {
      return '0x' + (value !== undefined ? value.toString(16).toUpperCase().padStart(2, '0') : '00');
    }
    ,
    async LoadConfigurations() {
      try {
        const response = await GetConfigurations();
        Object.assign(configuration, response.data || {});
      } catch (error) {
        console.error('載入配置失敗', error);
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
    async taskreplyConfigHandleSaveButtonClicked() {
      try {
        let response = await SaveReturnCodeSetting(this.configuration.baseConfiguration)

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