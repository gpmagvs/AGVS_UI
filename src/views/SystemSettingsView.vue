<template>
  <div class="sys-setting">
    <el-drawer v-model="drawer_show" size="60%" direction="rtl">
      <template #header>
        <div class="w-100 border-bottom">
          <h2 class="text-start">Settings</h2>
        </div>
      </template>
      <div style="position: absolute; width:95%;top:80px">
        <b-tabs v-model="selected_tab">
          <b-tab title="一般">
            <div class="tabpage border p-2">
              <el-form :model="settings" label-width="250" label-position="left">
                <!-- <el-form-item label="網頁鍵盤移動控制">
                  <el-switch @change="HandleParamChanged" v-model="settings.WebKeyboardMoveControl"></el-switch>
                </el-form-item>-->
                <el-form-item label="蜂鳴器">
                  <el-switch @change="HandleParamChanged" v-model="settings.BuzzerOn"></el-switch>
                </el-form-item>
                <el-form-item label="一般走行開啟車頭燈">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.FrontLighterFlashWhenNormalMove"></el-switch>
                </el-form-item>
                <el-form-item label="離線地圖圖資檔案路徑">
                  <el-input
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.MapParam.LocalMapFileName"></el-input>
                </el-form-item>
                <el-form-item v-if="!IsInspectionAGV" label="初始化時有帳無料自動清帳">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.Auto_Cleaer_CST_ID_Data_When_Has_Data_But_NO_Cargo"></el-switch>
                </el-form-item>
                <el-form-item v-if="!IsInspectionAGV" label="初始化時有料無帳自動建帳">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.Auto_Read_CST_ID_When_No_Data_But_Has_Cargo"></el-switch>
                </el-form-item>
                <el-form-item label="Action任務Timeout(Sec)">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.ActionTimeout"></el-input-number>
                </el-form-item>
                <div v-if="IsInspectionAGV" class="text-start w-100 border-bottom">
                  <b>巡檢AGV</b>
                </div>
                <el-form-item v-if="IsInspectionAGV" label="初始化檢查電池鎖定">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.InspectionAGV.CheckBatteryLockStateWhenInit"></el-switch>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab title="安全防護">
            <div class="tabpage border p-2">
              <div class="text-start w-100">
                <el-form :model="settings" label-width="150" label-position="left">
                  <div class="w-100 border-bottom">
                    <b>IMU 數據</b>
                  </div>
                  <el-form-item label="加速度(G)">
                    <el-tag effect="dark" style="width:70px" for>數值</el-tag>
                    <code>{{ IMU_ACC_Data }}</code>
                  </el-form-item>
                  <el-form-item v-if="IMUMaxMinRecord" label="最大值紀錄(G)">
                    <div>
                      <div>
                        <el-tag effect="dark" style="width:70px" for>數值</el-tag>
                        <code>{{ IMUMaxMinRecord.MaxMag }}</code>
                      </div>
                      <div>
                        <el-tag effect="dark" style="width:70px" for>數值</el-tag>
                        <code>{{ { x: IMUMaxMinRecord.AccVal.x.toFixed(2), y: IMUMaxMinRecord.AccVal.y.toFixed(2), z: IMUMaxMinRecord.AccVal.z.toFixed(2) } }}</code>
                      </div>
                      <div>
                        <el-tag effect="dark" style="width:70px" for>發生時間</el-tag>
                        <code>{{ TimeFormat(IMUMaxMinRecord.Time) }}</code>
                      </div>
                      <div>
                        <el-tag effect="dark" style="width:70px" for>發生座標</el-tag>
                        <code>{{ { X: IMUMaxMinRecord.Coordination.x, Y: IMUMaxMinRecord.Coordination.y } }}</code>
                      </div>
                      <div>
                        <el-button @click="HandleIMUDataResetButtonClick" type="danger">RESET</el-button>
                      </div>
                    </div>
                  </el-form-item>
                  <div class="w-100 border-bottom">
                    <b>碰撞偵測功能</b>
                  </div>
                  <el-form-item label="啟用">
                    <el-switch
                      @change="HandleParamChanged"
                      v-model="settings.ImpactDetection.Enabled"></el-switch>
                  </el-form-item>
                  <el-form-item label="異常檢出警報等級">
                    <el-select
                      :disabled="!settings.ImpactDetection.Enabled"
                      v-model="settings.ImpactDetection.ImpactingAlarmLevel"
                      @change="HandleParamChanged">
                      <el-option label="Warning" :value="0"></el-option>
                      <el-option label="Alarm" :value="1"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="閥值">
                    <el-input-number
                      size="small"
                      step="0.01"
                      precision="2"
                      min="0.01"
                      max="4"
                      @change="HandleParamChanged"
                      v-model="settings.ImpactDetection.ThresHold"></el-input-number>
                    <span class="mx-2">G</span>
                  </el-form-item>
                  <div class="w-100 border-bottom">
                    <b>姿態異常偵測(傾倒偵測)</b>
                  </div>
                  <el-form-item label="啟用">
                    <el-switch
                      @change="HandleParamChanged"
                      v-model="settings.ImpactDetection.PitchErrorDetection"></el-switch>
                  </el-form-item>
                  <el-form-item label="異常檢出警報等級">
                    <el-select
                      :disabled="!settings.ImpactDetection.PitchErrorDetection"
                      v-model="settings.ImpactDetection.PitchErrorAlarmLevel"
                      @change="HandleParamChanged">
                      <el-option label="Warning" :value="0"></el-option>
                      <el-option label="Alarm" :value="1"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="閥值">
                    <el-input-number
                      size="small"
                      step="0.01"
                      precision="2"
                      min="0.01"
                      max="9.8"
                      @change="HandleParamChanged"
                      v-model="settings.ImpactDetection.PitchErrorThresHold"></el-input-number>
                    <span class="mx-2">G</span>
                  </el-form-item>
                  <div v-if="settings.ForbidToOnlineTags" class="w-100 border-bottom">
                    <b>禁止上線點位</b>
                  </div>
                  <el-select
                    class="my-2"
                    v-model="settings.ForbidToOnlineTags"
                    multiple
                    placeholder="Select"
                    @change="HandleParamChanged"
                    style="width: 300px">
                    <el-option
                      v-for="station in normal_stations"
                      :key="station.tag"
                      :label="station.name"
                      :value="station.tag" />
                  </el-select>
                </el-form>
              </div>
            </div>
          </b-tab>
          <b-tab title="電池">
            <div class="tabpage border p-2">
              <el-form :model="settings" label-width="250" label-position="left">
                <el-form-item label="等待充電開始時間(秒)">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.BatteryModule.WaitChargeStartDelayTimeWhenReachChargeTaskFinish"></el-input-number>
                </el-form-item>
                <el-form-item label="斷開充電回路電壓閥值(mV)">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.BatteryModule.CutOffChargeRelayVoltageThreshodlval"></el-input-number>
                </el-form-item>
                <el-form-item label="僅電量低於閥值才開啟充電迴路">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.BatteryModule.ChargeWhenLevelLowerThanThreshold"></el-switch>
                </el-form-item>
                <el-form-item label="充電迴路開啟閥值">
                  <el-input-number
                    size="small"
                    step="1"
                    precision="0"
                    min="1"
                    max="100"
                    :disabled="!settings.BatteryModule.ChargeWhenLevelLowerThanThreshold"
                    @change="HandleParamChanged"
                    v-model="settings.BatteryModule.ChargeLevelThreshold"></el-input-number>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab title="設備取/放貨">
            <div class="tabpage border p-2">
              <el-form :model="settings" label-width="250" label-position="left">
                <el-form-item label="空取空放">
                  <el-switch @change="HandleParamChanged" v-model="settings.LDULD_Task_No_Entry"></el-switch>
                </el-form-item>
                <el-form-item label="CST ID讀取功能">
                  <el-switch @change="HandleParamChanged" v-model="settings.CST_READER_TRIGGER"></el-switch>
                </el-form-item>
                <el-form-item label="CST ID讀取失敗後車載狀態設為">
                  <el-select @change="HandleParamChanged" v-model="settings.CstReadFailAction">
                    <el-option label="Normal Status" :value="0"></el-option>
                    <el-option label="Down Status" :value="1"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="CST ID讀取值與任務不符時">
                  <el-select
                    @change="HandleParamChanged"
                    v-model="settings.Cst_ID_Not_Match_Action">
                    <el-option label="上報讀取之ID" :value="0"></el-option>
                    <el-option label="向派車查詢虛擬ID" :value="1"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="CST 在席檢-進入設備前">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.CST_EXIST_DETECTION.Before_In"></el-switch>
                </el-form-item>
                <el-form-item label="CST 在席檢-設備動作後">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.CST_EXIST_DETECTION.After_EQ_Busy_Off"></el-switch>
                </el-form-item>
                <el-form-item label="車頭設備內產品預檢知-放貨">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.LOAD_OBS_DETECTION.Enable_Load"></el-switch>
                </el-form-item>
                <el-form-item label="車頭設備內產品預檢知-取貨">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.LOAD_OBS_DETECTION.Enable_UnLoad"></el-switch>
                </el-form-item>
                <el-form-item label="車頭設備內產品預檢知-偵測時間(sec)">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.LOAD_OBS_DETECTION.Duration"></el-input-number>
                </el-form-item>
                <el-form-item label="等待EQ READY播放音樂">
                  <el-switch @change="HandleParamChanged" v-model="settings.PlayHandshakingMusic"></el-switch>
                </el-form-item>
                <el-form-item label="設備內停車允許誤差(mm)">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.TagParkingTolerance"></el-input-number>
                </el-form-item>
                <div class="text-start w-100 border-bottom">
                  <b>雷射偵測設備Port內障礙物</b>
                </div>
                <el-form-item label="啟用">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.LDULDParams.LsrObstacleDetectionEnable"></el-switch>
                </el-form-item>
                <el-form-item label="雷射組數">
                  <el-input-number
                    :disabled="!settings.LDULDParams.LsrObstacleDetectionEnable"
                    @change="HandleParamChanged"
                    size="small"
                    :min="0"
                    :max="16"
                    v-model="settings.LDULDParams.LsrObsLaserModeNumber"></el-input-number>
                </el-form-item>
                <el-form-item label="偵測異常發報等級">
                  <el-select
                    :disabled="!settings.LDULDParams.LsrObstacleDetectionEnable"
                    v-model="settings.LDULDParams.LsrObsDetectedAlarmLevel"
                    @change="HandleParamChanged">
                    <el-option label="Warning" :value="0"></el-option>
                    <el-option label="Alarm" :value="1"></el-option>
                  </el-select>
                </el-form-item>
                <div class="text-start w-100 border-bottom">
                  <b>交握TIMEOUT</b>
                </div>
                <el-form-item label="TA1_Wait_L_U_REQ_ON">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.EQHSTimeouts.TA1_Wait_L_U_REQ_ON"></el-input-number>
                </el-form-item>
                <el-form-item label="TA2_Wait_EQ_READY_ON">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.EQHSTimeouts.TA2_Wait_EQ_READY_ON"></el-input-number>
                </el-form-item>
                <el-form-item label="TA3_Wait_EQ_BUSY_ON">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.EQHSTimeouts.TA3_Wait_EQ_BUSY_ON"></el-input-number>
                </el-form-item>
                <el-form-item label="TA4_Wait_EQ_BUSY_OFF">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.EQHSTimeouts.TA4_Wait_EQ_BUSY_OFF"></el-input-number>
                </el-form-item>
                <el-form-item label="TA5_Wait_L_U_REQ_OFF">
                  <el-input-number
                    @change="HandleParamChanged"
                    size="small"
                    v-model="settings.EQHSTimeouts.TA5_Wait_L_U_REQ_OFF"></el-input-number>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab title="叉車AGV" v-if="IsForkAGV && settings.ForkAGV">
            <div class="tabpage border p-2">
              <el-form label-position="left" label-width="210">
                <el-form-item label="行程上極限(cm)">
                  <el-input-number
                    size="small"
                    step="0.1"
                    precision="1"
                    min="1"
                    :max="settings.ForkAGV.UplimitPoseSettingMax"
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.UplimitPose"></el-input-number>
                </el-form-item>
                <el-form-item label="行程下極限(cm)">
                  <el-input-number
                    size="small"
                    step="0.1"
                    precision="1"
                    min="0"
                    max="100"
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.DownlimitPose"></el-input-number>
                </el-form-item>
                <el-form-item label="安全高度(cm)">
                  <el-input-number
                    size="small"
                    step="0.1"
                    precision="1"
                    min="1"
                    max="100"
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.SaftyPositionHeight"></el-input-number>
                </el-form-item>
                <el-form-item label="允許走行之牙叉位置限制">
                  <el-select
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.ForkSaftyStratrgy">
                    <el-option label="牙叉位於原點" :value="0"></el-option>
                    <el-option label="牙叉低於安全高度" :value="1"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="Z軸皮帶檢知Bypass">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.SensorBypass.BeltSensorBypass"></el-switch>
                </el-form-item>
                <el-form-item label="牙叉已在Home位置不必初始化">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.ForkNoInitializeWhenPoseIsHome"></el-switch>
                </el-form-item>
                <el-form-item label="退出設備時不等待牙叉縮回完成">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.NoWaitForkArmFinishAndMoveOutInWorkStation"></el-switch>
                </el-form-item>
                <el-form-item label="退出設備後Z軸同步回Home">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.NoWaitParkingFinishAndForkGoHomeWhenBackToSecondary"></el-switch>
                </el-form-item>
                <el-form-item label="退出充電站後Z軸同步回Home">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.ForkAGV.NoWaitParkingFinishAndForkGoHomeWhenBackToSecondaryAtChargeStation"></el-switch>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab v-if="settings.Log" title="終端機Log顯示">
            <div class="tabpage border p-2">
              <el-form label-position="left" label-width="210">
                <el-form-item label="Trace Log">
                  <el-switch @change="HandleParamChanged" v-model="settings.Log.ConsoleTraceShow"></el-switch>
                </el-form-item>
                <el-form-item label="Info Log">
                  <el-switch @change="HandleParamChanged" v-model="settings.Log.ConsoleInfoShow"></el-switch>
                </el-form-item>
                <el-form-item label="Warning Log">
                  <el-switch @change="HandleParamChanged" v-model="settings.Log.ConsoleWarningShow"></el-switch>
                </el-form-item>
                <el-form-item label="Error Log">
                  <el-switch @change="HandleParamChanged" v-model="settings.Log.ConsoleErrorShow"></el-switch>
                </el-form-item>
                <el-form-item label="Critical Log">
                  <el-switch
                    @change="HandleParamChanged"
                    v-model="settings.Log.ConsoleCriticalShow"></el-switch>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab title="派車系統">
            <div class="tabpage border p-2">
              <el-form label-position="left" label-width="210">
                <el-form-item label="Host">
                  <el-row>
                    <el-col :span="3">IP</el-col>
                    <el-col :span="10">
                      <el-input
                        @change="HandleParamChanged"
                        size="small"
                        v-model="settings.Connections.AGVS.IP"></el-input>
                    </el-col>
                    <el-col :span="3">Port</el-col>
                    <el-col :span="5">
                      <el-input-number
                        @change="HandleParamChanged"
                        size="small"
                        v-model="settings.Connections.AGVS.Port"></el-input-number>
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item label="連線類型">
                  <el-select v-model="settings.VMSParam.Protocol" @change="HandleParamChanged">
                    <el-option label="TCP/IP" :value="0"></el-option>
                    <el-option label="Web API" :value="1"></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab title="進階">
            <div class="tabpage border p-2">
              <div class="w-100 d-flex">
                <b-button
                  class="w-50 mx-3"
                  variant="primary"
                  @click="HandleSystemRestartBtnClick">系統重啟</b-button>
                <b-button class="w-50 mx-3" variant="danger" @click="HandleSystemCloseBtnClick">系統關閉</b-button>
              </div>
            </div>
          </b-tab>
          <b-tab title="音效">
            <div class="tabpage border p-2 souns-page">
              <div class="border-button">
                <b-button variant="danger">停止播放</b-button>
              </div>
              <el-form label-width="100px" label-position="left">
                <el-form-item label="Alarm">
                  <div class="d-flex flex-row">
                    <i class="bi bi-play-circle" @click="PlayAlarm"></i>
                    <uploader music_type="Alarm"></uploader>
                  </div>
                </el-form-item>
                <el-form-item label="Move">
                  <div class="d-flex flex-row">
                    <i class="bi bi-play-circle" @click="PlayMove"></i>
                    <uploader music_type="Move"></uploader>
                  </div>
                </el-form-item>
                <el-form-item label="Action">
                  <div class="d-flex flex-row">
                    <i class="bi bi-play-circle" @click="PlayAction"></i>
                    <uploader music_type="Action"></uploader>
                  </div>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
          <b-tab title="Cst Reader">
            <div class="tabpage border p-2 cst-reader">
              <el-form label-width="100px" label-position="left">
                <el-form-item label="Tray Reader">
                  <el-checkbox v-model="settings.HasTrayCstReader" @change="HandleParamChanged"></el-checkbox>
                </el-form-item>
                <el-form-item label="Rack Reader">
                  <el-checkbox v-model="settings.HasRackCstReader" @change="HandleParamChanged"></el-checkbox>
                </el-form-item>
              </el-form>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { ElNotification } from 'element-plus'
import bus from '@/event-bus.js'
import { SystemAPI, IMUAPI, SoundsAPI } from '@/api/VMSAPI.js'
import MapAPI from '@/api/MapAPI.js'
import { SystemSettingsStore, AGVStatusStore } from '@/store'
import moment from 'moment'
import { ROS_STORE } from "@/store/ros_store";
import uploader from '@/components/Upload/music_upload.vue'


class ForkLifer {
  constructor() {
    this.forkLiferEnable = true;
    this.vehicleLengthWithForkArmExtend = 160.0;
    this.uplimitPose = 35;
    this.downlimitPose = 0;
    this.uplimitPoseSettingMax = 35;
    this.isPinMounted = true;
    this.isForkIsExtendable = true;
    this.noWaitForkArmFinishAndMoveOutInWorkStation = true;
    this.noWaitParkingFinishAndForkGoHomeWhenBackToSecondary = true;
    this.noWaitParkingFinishAndForkGoHomeWhenBackToSecondaryAtChargeStation = true;
    this.forkSaftyStrategy = 'UNDER_SAFTY_POSITION';
    this.saftyPositionHeight = 20;
    this.initParams = {};
  }
}


export default {
  components: {
    uploader,
  },
  data() {
    return {
      drawer_show: false,
      selected_tab: 0,
      settings: {
        LogFolder: "GPM_AGV_LOG",
        AgvType: 1,
        SID: "001:001:001",
        VehicleName: "AGV_001",
        SimulationMode: true,
        WagoSimulation: true,
        ActiveTrafficControl: false,
        EQHandshakeBypass: false,
        CST_READER_TRIGGER: true,
        Cst_ID_Not_Match_Action: 0,//0:上報讀到的ID 1:向派車查詢虛擬ID
        Auto_Cleaer_CST_ID_Data_When_Has_Data_But_NO_Cargo: false,
        Auto_Read_CST_ID_When_No_Data_But_Has_Cargo: false,
        ForkLifer_Enable: false,
        LDULD_Task_No_Entry: false,
        BuzzerOn: true,
        LastVisitedTag: 17,
        ForbidToOnlineTags: [
          49
        ],
        CutOffChargeRelayVoltageThreshodlval: 28800,
        LDULD_Laser_Mode: 0,
        Spin_Laser_Mode: 5,
        LDULD_FrontBackLaser_Bypass: true,
        FrontLighterFlashWhenNormalMove: true,
        WebKeyboardMoveControl: false,
        PlayHandshakingMusic: false,
        Connections: {
          RosBridge: {
            IP: "192.168.235.130",
            Port: 9090
          },
          Wago: {
            IP: "127.0.0.1",
            Port: 9999
          },
          AGVS: {
            IP: "127.0.0.1",
            Port: 5036
          }
        },
        VMSParam: {
          LocalIP: "127.0.0.1",
          Protocol: 1,
          MapUrl: "http://127.0.0.1:5216/api/Map"
        },
        MapParam: {
          LocalMapFileName: "/temp/Map_UMTC_AOI.json"
        },
        EQHandshakeMethod: 2,
        TagParkingTolerance: 5,
        ActionTimeout: 5,
        CstReadFailAction: 0,////0:狀態保持IDLE 1:狀態DOWN
        LOAD_OBS_DETECTION: {
          Enable_Load: false,
          Enable_UnLoad: false,
          Duration: 4
        },
        CST_EXIST_DETECTION: {
          Before_In: false,
          After_EQ_Busy_Off: false
        },
        SensorBypass: {
          BeltSensorBypass: true
        },
        EQHSTimeouts: {
          TA1_Wait_L_U_REQ_ON: 5,
          TA2_Wait_EQ_READY_ON: 15,
          TA3_Wait_EQ_BUSY_ON: 15,
          TA4_Wait_EQ_BUSY_OFF: 90,
          TA5_Wait_L_U_REQ_OFF: 5
        },
        InspectionAGV: {
          CheckBatteryLockStateWhenInit: false
        },
        ForkAGV: new ForkLifer()
      },
      normal_stations: [],
      last_setting_val_set_success_time: '1970/1/1 00:00:00'
    }
  },
  computed: {
    IsForkAGV() {
      return AGVStatusStore.getters.IsForkAGV;
    },
    IsInspectionAGV() {
      return AGVStatusStore.getters.IsInspectionAGV;
    },
    IMUMaxMinRecord() {
      return AGVStatusStore.getters.IMUMaxMinRecord
    },
    IMU_ACC_Data() {
      var _data = ROS_STORE.getters.ImuData_Acc;
      return {
        x: (_data.x / 9.8).toFixed(2),
        y: (_data.y / 9.8).toFixed(2),
        z: (_data.z / 9.8).toFixed(2),
      }
    }
  },
  mounted() {
    bus.on('show-settings', async (tabIndex) => {
      if (tabIndex)
        this.selected_tab = tabIndex;
      this.drawer_show = true
      await this.DownloadSettings();
    })
    this.DownloadSettings();
  },
  methods: {
    async HandleSystemCloseBtnClick() {
      this.SystemOptConfirmAndDoAction('確定要關閉車載系統?', async () => {
        var _response = await SystemAPI.CloseSystem();
        if (_response.confirm) {
          this.drawer_show = false;
          this.$swal.fire(
            {
              title: '系統將於一秒後關閉...',
              text: '',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        } else {
          this.$swal.fire(
            {
              title: _response.message,
              text: '',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
      })


    },
    async HandleSystemRestartBtnClick() {

      this.SystemOptConfirmAndDoAction('確定要重新啟動車載系統?', async () => {
        var _response = await SystemAPI.RestartSystem();
        if (_response.confirm) {
          this.drawer_show = false;
          this.$swal.fire(
            {
              text: '',
              title: '系統將於一秒後重新啟動...',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        } else {
          this.$swal.fire(
            {
              text: '',
              title: _response.message,
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
      });

    },
    SystemOptConfirmAndDoAction(opt_text, handler_action) {
      return this.$swal.fire(
        {
          title: opt_text,
          text: '',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            handler_action();
          }
        })
    },
    async DownloadSettings() {
      try {
        var _settings = await SystemAPI.GetSettings()
        console.log(_settings)
        this.settings = _settings
        SystemSettingsStore.commit('setSettings', _settings)
        this.normal_stations = await MapAPI.GetNormalStations()
      } catch {
        alert("!!")
      }
    },
    async HandleParamChanged() {
      var success = await SystemAPI.SaveSettings(this.settings)
      if (success) {
        SystemSettingsStore.commit('setSettings', this.settings)
        if (this.DiffSecOfLastSettingSuccess() > 0.6) {

          ElNotification({
            title: '系統參數設定',
            message: '系統參數設定成功',
            type: 'success',
            duration: 1000,
            position: 'bottom-right'
          });
        }
        this.last_setting_val_set_success_time = moment(Date.now()).format('YYYY/MM/DD HH:mm:ss');
      } else {
        ElNotification({
          title: '系統參數設定',
          message: '系統參數設定失敗',
          type: 'error',
          position: 'bottom-right',
          duration: 1000,
        });
      }
    },
    DiffSecOfLastSettingSuccess() {
      var lastTime = moment(this.last_setting_val_set_success_time);
      var now = moment();
      var diff = now.diff(lastTime, 'seconds');
      console.log(this.last_setting_val_set_success_time, diff);
      return diff;
    },
    TimeFormat(time) {
      return moment(time).format("YYYY/MM/DD HH:mm:ss")
    },
    HandleIMUDataResetButtonClick() {
      this.$swal.fire(
        {
          text: '',
          title: '確定要重置IMU紀錄?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (!res.isConfirmed)
            return;
          IMUAPI.ResetMAXMINRecord();
        })
    },
    PlayAlarm() {
      SoundsAPI.Alarm();
    },
    PlayAction() {
      SoundsAPI.Action();
    },
    PlayMove() {
      SoundsAPI.Move();
    }
  },
}
</script>
<style lang="scss" scoped>
.sys-setting {
  z-index: 1099999;

  .souns-page {
    i {
      font-size: 30px;
      margin-right: 5px;
      cursor: pointer;
    }
  }
}

.tabpage {
  // height: 85vh;
  overflow-y: auto;
  height: 76vh;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>