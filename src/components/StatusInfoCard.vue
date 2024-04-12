<template>
  <transition name="el-zoom-in-center">
    <div class="status-card" v-show="show">
      <!-- <h4 class="text-start">{{ $t('Status_info') }}</h4> -->
      <div class="w-100  p-3">
        <el-row class="w-100 row">
          <el-col :span="5">{{ $t('status') }}</el-col>
          <el-col :span="7" class="val-column status">
            <b-button
              class="w-100 border"
              v-bind:class="vms_data.SubState == '' ? 'down' : vms_data.SubState.toLowerCase()">
              <b>{{ vms_data.SubState == '' ? 'ERROR' : vms_data.SubState }}</b>
            </b-button>
          </el-col>
          <el-col :span="5">Laser Mode</el-col>
          <el-col :span="7">
            <el-tag @click="HandleLsrModeTagClick" class="w-100" type="info" size="large" v-model="vms_data.Current_LASER_MODE">{{ vms_data.Current_LASER_MODE }}</el-tag>
            <!-- <b-form-input class="border" size="sm" disabled v-model="vms_data.Current_LASER_MODE"></b-form-input> -->
          </el-col>
        </el-row>
        <el-row class="w-100 row">
          <el-col :span="5">{{ $t('current_position') }}</el-col>
          <el-col :span="7" class="val-column">
            <el-tag type="info" v-if="vms_data.Last_Visit_MapPoint.Graph" class="w-100" size="large">{{ vms_data.Last_Visit_MapPoint.Graph.Display }}</el-tag>
            <!-- <b-form-input v-if="vms_data.Last_Visit_MapPoint.Graph" size="sm" disabled v-model="vms_data.Last_Visit_MapPoint.Graph.Display"></b-form-input> -->
            <!-- <el-input disabled v-model="vms_data.Tag"></el-input> -->
          </el-col>
          <el-col :span="5">{{ $t('target_position') }}</el-col>
          <el-col :span="7" class="val-column">
            <el-tag type="info" v-if="vms_data.NavInfo.DestinationMapPoint.Graph" class="w-100" size="large">{{ vms_data.NavInfo.DestinationMapPoint.Graph.Display }}</el-tag>
            <!-- <b-form-input v-if="vms_data.NavInfo.DestinationMapPoint.Graph" size="sm" disabled v-model="vms_data.NavInfo.DestinationMapPoint.Graph.Display"></b-form-input> -->
            <!-- <el-input disabled v-model="currentPosition"></el-input> -->
          </el-col>
        </el-row>
        <el-row class="w-100 row">
          <!-- 動作名稱 -->
          <el-col :span="5">{{ $t('tag_read_status') }}</el-col>
          <el-col :span="7" class="val-column">
            <!-- <b-form-input
                v-if="!IsInspectionAGV"
                size="sm"
                disabled
                v-model="vms_data.BCR_State_MoveBase.tagID"
                :state="vms_data.BCR_State_MoveBase.tagID > 0">
              </b-form-input> -->
            <el-tag v-if="!IsInspectionAGV" class="w-100"
              :type="vms_data.BCR_State_MoveBase.tagID > 0 ? 'success' : 'danger'"
              size="large">{{ vms_data.BCR_State_MoveBase.tagID }}</el-tag>
          </el-col>
          <!-- 載物ID -->
          <el-col :span="5" v-if="vms_data.Agv_Type != 2">{{ $t('carrier_id') }}</el-col>
          <el-col :span="7" v-if="vms_data.Agv_Type != 2" class="val-column">
            <el-tag class="w-100"
              :type="vms_data.CST_Data != '' ? 'success' : 'danger'"
              size="large">{{ vms_data.CST_Data }}</el-tag>
            <!-- <b-form-input
                size="sm"
                disabled
                v-model="vms_data.CST_Data"
                :state="vms_data.CST_Data != ''"></b-form-input> -->
          </el-col>
        </el-row>
        <el-row class="w-100 row" v-if="true">
          <el-col :span="5">{{ $t('localization-state') }}</el-col>
          <el-col :span="7" class="val-column">
            <el-tag class="w-100"
              :type="LocStatusDisplay == 'OK' ? 'success' : 'danger'"
              size="large">{{ LocStatusDisplay }}</el-tag>
            <!-- <b-form-input
                size="sm"
                disabled
                v-model="LocStatusDisplay"
                :state="LocStatusDisplay == 'OK'"></b-form-input> -->
          </el-col>
          <el-col :span="5">{{ $t('map-matching-rate') }}</el-col>
          <el-col :span="7" class="val-column">
            <el-tag class="w-100"
              :type="vms_data.MapComparsionRate != 0 ? 'success' : 'danger'"
              size="large">{{ vms_data.MapComparsionRate }}</el-tag>
            <!-- <b-form-input
                size="sm"
                disabled
                v-model="vms_data.MapComparsionRate"
                :state="vms_data.MapComparsionRate != 0"></b-form-input> -->
          </el-col>
        </el-row>
        <!--Fork高度狀態 -->
        <el-row class="w-100 row" v-if="vms_data.Agv_Type == 0">
          <el-col :span="5">牙叉高度</el-col>
          <el-col :span="19">
            <el-tag class="w-100"
              :type="!vms_data.IsForkHeightAboveSafty ? 'success' : 'danger'"
              size="large">{{ for_position_safe_state }}</el-tag>
            <!-- <b-form-input
                size="sm"
                disabled
                v-model="for_position_safe_state"
                :state="!vms_data.IsForkHeightAboveSafty"></b-form-input> -->
          </el-col>
        </el-row>
        <el-row class="w-100 row border-top py-1" v-if="IsGodUser">
          <el-col :span="5">ROS</el-col>
          <el-col :span="19">
            <b-button class="border" variant="light" @click="() => { show_module_info_drawer = true }">顯示Module Information</b-button>
          </el-col>
        </el-row>
        <el-row class="w-100 row">
          <el-col :span="5"></el-col>
          <el-col :span="19" class="text-end">
            <p style="    font-size: 28px;    color: #e1e1e1;">RAM :{{ Memory }} Mb</p>
          </el-col>
        </el-row>
        <el-row class="w-100 row" v-if="false">
          <el-col :span="6">AGV Direct</el-col>
          <el-col :span="6">
            <b-form-input size="sm" disabled v-model="vms_data.AGV_Direct"></b-form-input>
          </el-col>
        </el-row>
      </div>
      <el-drawer title="Module Information" size="50%" v-model="show_module_info_drawer">
        <pre class="w-100 border rounded bg-light text-start">
        {{ module_information }}
        </pre>
      </el-drawer>
    </div>
  </transition>
</template>

<script>
import bus from '@/event-bus.js'
import VMSData from '@/ViewModels/VMSData.js'
import { ROS_STORE } from '@/store/ros_store'
import { UserStore } from '@/store'
export default {
  props: {

  },
  data() {
    return {
      currentPosition: '123',
      vms_data: new VMSData(),
      show: false,
      show_module_info_drawer: false,
    }
  },
  computed: {
    IsGodUser() {
      return UserStore.getters.IsGodUser
    },
    for_position_safe_state() {
      var forkHeight = this.vms_data.ZAxisDriverState.position.toFixed(2);
      return `${forkHeight} cm (${this.vms_data.IsForkHeightAboveSafty ? '高於安全位置' : "安全"})`
    },
    state_btn_variant() {
      var _state = this.vms_data.SubState.toUpperCase();
      if (_state == "DOWN" | _state == "ALARM" | _state == "STOP" | _state == "SYSTEM_INIT") {
        return 'danger'
      }
      else if (_state == "INITIALIZE" | _state == "CHARGING") {
        return 'primary'
      }
      else if (_state == "RUN" | _state == "WORKING") {
        return "success";
      }
      else if (_state == "IDLE" | _state == "WARNING") {
        return 'warning'
      }
      return ""
    },
    CurrentPosition() {
      if (this.ModuleInformation.nav_state == undefined) {
        return '-1';
      } else {
        return this.ModuleInformation.nav_state.lastVisitedNode;
      }
    },
    CarrierID() {
      if (this.ModuleInformation.CSTReader == undefined) {
        return '-1';
      } else {
        return this.ModuleInformation.CSTReader.data;
      }
    },
    NewestAlarm() {
      if (this.vms_data.NewestAlarm == undefined)
        return '';

      return this.$i18n.locale == 'zh-TW' ? this.vms_data.NewestAlarm.CN : this.vms_data.NewestAlarm.Description;
    },
    LocStatusDisplay() {
      //  1 byte LocalizationStatus [10: OK, 20: Warning, 30: Not localized, 40: System error] -->
      var locStatus = this.vms_data.LocStatus;
      if (locStatus == 10) {
        return "OK"
      }
      else if (locStatus == 20) {
        return "Warning"
      }
      else if (locStatus == 30) {
        return "Not Localized"
      }
      else if (locStatus == 40) {
        return "System Error"
      }
      else {
        return "Unknown"
      }
    },
    IsInspectionAGV() {
      return this.vms_data.Agv_Type == 2;
    },
    Memory() {
      return this.vms_data.SysLoading ? this.vms_data.SysLoading.Memory : -1;
    },
    module_information() {
      return ROS_STORE.getters.Module_Information
    }
  },
  methods: {
    HandleLsrModeTagClick() {
      if (!this.IsGodUser)
        return;
      bus.emit('on-manual-lsr-setting-show-invoke')
    }
  }
  ,
  mounted() {
    bus.on('/vms_data', (data) => {
      this.vms_data = data
    });
    setTimeout(() => {
      this.show = true
    }, 500);
  },
}
</script>

<style lang="scss">
.status-card {
  .row {
    margin: 36px auto;
    border-bottom: 1px solid #f3f3f3;
    padding-bottom: 13px;

    .el-col {
      text-align: left;
      font-size: 19px;
      font-weight: bold;
      color: rgb(103 103 103);
    }

    .val-column {
      width: 100%;
    }
  }

  h4 {
    font-weight: bold;
  }

  .el-tag__content {
    font-size: 20px;
  }
}
</style>