<template>
  <div
    class="vehicle-info-card"
    :class="[vehicleStateData.Connected?'connected':'vehicle-card-disconnect',vehicleStateData.OnlineStatus==0? 'v-Offline':'v-Online',IsOrderRunning?'order-run':'no-order-run'
      , this.vehicleStateData.MainStatus==3?'vehicle-info-card-status-down':''
    ]"
  >
    <div class="vehicle-info-card-header p-2 border-bottom">
      <el-tooltip
        :content="vehicleStateData.Model==0?'Forklifter AGV':'Submarine AGV'"
        placement="bottom-start"
      >
        <div
          class="vehicle-icon"
          :class="vehicleStateData.Model==0?'fork-icon':'agv-icon-1'"
          :style="StyleOfAGVDisplayColor"
        ></div>
      </el-tooltip>
      <h6
        class="flex-fill"
        :class="[vehicleStateData.OnlineStatus==0? 'v-Offline':'v-Online',vehicleStateData.Connected?'connected':'disconnect']"
      >{{ vehicleStateData.AGV_Name }}</h6>
      <div v-if="IsEmulationMode">
        <el-tooltip content="EMULATION MODE" placement="right-end" effect="light">
          <template #content>
            <AgvEmulator :AgvName="vehicleStateData.AGV_Name" />
          </template>
          <el-button class="text-primary" text>Simulation</el-button>
        </el-tooltip>
      </div>
      <el-button
        v-if="vehicleStateData.Model == 2 || IsEmulationMode"
        class="text-primary"
        text
        @click="()=>{$emit('OnTagLocatingClicked',vehicleStateData)}"
      >定位</el-button>
      <el-tooltip content="點擊顯示車載頁面" placement="top">
        <i
          class="bi bi-globe mx-2"
          style="cursor:pointer;"
          @click="()=>{$emit('OnWebSiteIconClicked',vehicleStateData)}"
        ></i>
      </el-tooltip>
      <el-button
        :class="vehicleStateData.OnlineStatus==0||!vehicleStateData.Connected ? 'text-danger':'text-success'"
        style="font-size:16px"
        @click="HandleOnlineButtonClicked"
      >
        <template #icon>
          <i class="bi bi-circle-fill" style="font-size:10px"></i>
        </template>
        <span v-if="!vehicleStateData.Connected">Disconnect</span>
        <span v-else>{{vehicleStateData.OnlineStatus==0? 'Offline':'Online' }}</span>
      </el-button>
    </div>
    <div class="center-content d-flex justify-content-between p-2 m-1">
      <div>
        <label class="item-name-label">{{ $t('HomeView.AGVStatus.AGVStatus.status') }}</label>
        <el-tag class="w-100" effect="dark" :type="AGVMainStatusDto.type" style="height:2rem">
          <b>{{ AGVMainStatusDto.text }}</b>
        </el-tag>
      </div>
      <div>
        <div>
          <label class="item-name-label">{{ $t('HomeView.AGVStatus.AGVStatus.position') }}</label>
          <el-tooltip content="追隨AGV，AGV將保持顯示於地圖中央" placement="top">
            <i
              v-if="!IsOpUsing"
              style="cursor: pointer;height: 22px;position: relative;top: 2px;border-radius: 30px;width: 22px;padding-left: 4px;font-size: 18px;"
              class="bi bi-eyeglasses mx-1"
              @click="()=>{$emit('OnTrackingVehicleClick',vehicleStateData.AGV_Name)}"
              v-bind:style="isMapViewTracking? {backgroundColor:'rgb(13, 110, 253)',color:'white'}:{}"
            ></i>
          </el-tooltip>
        </div>
        <div
          class="text-bold"
          @click="()=>{$emit('OnLocateClicked',vehicleStateData.AGV_Name)}"
        >{{ vehicleStateData.StationName }}</div>
      </div>
      <div>
        <label class="item-name-label">{{ $t('TaskTable.CstID') }}</label>
        <div class="text-bold">{{ vehicleStateData.CurrentCarrierID }}</div>
      </div>
      <div>
        <label class="item-name-label">{{ $t('TaskTable.TaskName') }}</label>
        <el-tooltip content="點擊顯示任務詳情" placement="right" effect="light">
          <template #content>
            <MissionCard style="width: 620px" :mission="CurrentOrderStatus.order" />
          </template>
          <div
            class="text-truncate text-bold task-id"
            @click="HandleTaskIDClicked"
            style="width: 120px"
          >{{ CurrentOrderID }}</div>
        </el-tooltip>
      </div>
    </div>

    <div class="footer">
      <div class="button-like-container w-100" :class="IsOrderRunning?'order-run':'no-order-run'">
        {{ $t('HomeView.AGVStatus.AGVStatus.From') }}
        <span
          class="station-name"
        >{{ vehicleStateData.TaskSourceStationName }}</span>
      </div>
      <div
        class="button-like-container w-100 mx-1"
        :class="IsOrderRunning?'order-run':'no-order-run'"
      >
        {{ $t('HomeView.AGVStatus.AGVStatus.To') }}
        <span
          class="station-name"
        >{{ vehicleStateData.TaskDestineStationName }}</span>
      </div>
      <div
        class="button-like-container battery-info"
        :class="BatteryPercentage < 30 ? 'battery-low':'battery-normal'"
      >
        <el-progress :percentage="BatteryPercentage" :stroke-width="20" :color="batteryStatusColor">
          <div class="battery-head"></div>
          <div class="battery-level-text">{{BatteryPercentage}}%</div>
          <i v-if="IsCharging" class="battery-charging-icon bi bi-lightning-charge-fill"></i>
        </el-progress>
      </div>
      <div class="button-like-container mx-1" style="width: 290px;">
        <el-popover width="150" placement="right">
          <template #reference>
            <el-button
              type="success"
              v-bind:class="getChargeButtnClass()"
              @click="()=> $emit('ShowAGVChargeConfirmDialog',vehicleStateData)"
            >
              <span v-if="vehicleStateData.Model == 2">{{ $t('Exchange Battery') }}</span>
              <span
                v-else-if="getChargeButtnClass()=='charge-deep-charging'"
              >{{ $t('DeepCharging') }}</span>
              <span v-else>{{ $t('Charge') }}</span>
            </el-button>
          </template>
          <template #default>
            <div class="charge-button-container d-flex flex-column">
              <b-button
                variant="warning"
                style="width: 100%; margin-bottom: 8px;"
                @click="()=>$emit('ShowAGVChargeConfirmDialog',vehicleStateData)"
              >一般充電</b-button>
              <b-button
                variant="success"
                style="width: 100%; margin-bottom: 8px;"
                @click="()=>$emit('ShowAGVDeepChargeConfirmDialog',vehicleStateData)"
              >深度充電</b-button>
              <b-button
                variant="light"
                style="width: 100%; margin-bottom: 8px;"
                @click="()=> $emit('StopDeepCharge',vehicleStateData.AGV_Name)"
              >解除深度充電</b-button>
            </div>
          </template>
        </el-popover>
      </div>
    </div>
    <!-- <pre class="text-start" style="font-size: 20px;"> {{ mission }}</pre> -->
  </div>
</template>
  <script>
import clsTaskState from '@/ViewModels/TaskState';
import clsAGVStateDto from '@/ViewModels/clsAGVStateDto';
import { TaskAllocation } from '@/api/TaskAllocation';
import { MapStore } from '../Map/store';
import { userStore, agv_states_store, TaskStore } from '@/store';
import MissionCard from '../TaskStatus/MissionCard.vue';
import AgvEmulator from './AgvEmulator.vue';
export default {
  name: 'vehicle-info-card',
  components: {
    MissionCard, AgvEmulator
  },
  data() {
    return {
    }
  },
  props: {
    vehicleStateData: {
      type: Object,
      default() {
        return new clsAGVStateDto()
      }
    },
    isMapViewTracking: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    IsOpUsing() {
      return userStore.getters.IsOPLogining;
    },
    IsEmulationMode() {
      return this.vehicleStateData.Simulation;
    },
    StyleOfAGVDisplayColor() {
      if (this.vehicleStateData.OnlineStatus == 0)
        return {
          backgroundColor: 'rgb(156, 156, 156)',
        }
      const agv_name = this.vehicleStateData.AGV_Name;
      var color = 'blue'
      if (MapStore.getters.CustomAGVStyles[agv_name])
        color = MapStore.getters.CustomAGVStyles[agv_name].DisplayColor
      return {
        backgroundColor: color,
      }
    },
    AGVMainStatusDto() {
      const status_code = this.vehicleStateData.MainStatus;
      let statusText = 'Unknown';
      let tagType = 'info'
      if (status_code == 1) {
        statusText = this.$t('AGVStatus.IDLE')
        tagType = 'warning'
      }
      else if (status_code == 2) {
        statusText = this.$t('AGVStatus.RUN')
        tagType = 'success'
      }
      else if (status_code == 3) {
        statusText = this.$t('AGVStatus.DOWN')
        tagType = 'danger'
      }
      else if (status_code == 4) {
        statusText = this.$t('AGVStatus.CHARGING')
        tagType = 'primary'
      }
      return {
        text: statusText,
        type: tagType
      }
    },
    IsOrderRunning() {
      return this.CurrentOrderStatus.isExecuting;
    },
    CurrentOrderID() {
      if (!this.IsOrderRunning)
        return '';
      return this.CurrentOrderStatus.order.TaskName;
    },
    CurrentOrderStatus() {
      const _agvName = this.vehicleStateData.AGV_Name;
      const orderExecuting = TaskStore.state.IncompletedTaskListData.find(_order => _order.State == 1 && _order.DesignatedAGVName == _agvName);
      return {
        order: orderExecuting,
        isExecuting: orderExecuting != undefined
      }
    },
    IsCharging() {
      return !this.vehicleStateData ? false : this.vehicleStateData.IsCharging;
    },
    BatteryPercentage() {
      if (!this.vehicleStateData || !this.vehicleStateData.BatteryLevel_1)
        return 0;
      const percentage = parseInt(this.vehicleStateData.BatteryLevel_1.toFixed(0));
      if (percentage > 100)
        return 100;
      if (percentage < 0)
        return 0;
      return percentage;
    },
    batteryStatusColor() {
      let batLevel = this.vehicleStateData.BatteryLevel_1;
      if (batLevel < 30)
        return 'red';
      else if (batLevel < 60)
        return 'orange';
      else
        return 'rgb(64, 158, 255)';
    },
  },
  methods: {

    /**由狀態取得充電按鈕的類別 */
    getChargeButtnClass() {
      var battery_status = agv_states_store.getters.VehicleBatteryStatus(this.vehicleStateData.AGV_Name);
      if (battery_status == 1)
        return 'charge-deep-charging';
      return 'charge-normal'; //TODO: 由狀態取得充電按鈕的類別
      if (agv_states.MainStatus == 1)
        return 'charge-normal';
      else if (agv_states.MainStatus == 3)
        return 'charge-deep-charge-raising';
      else
        return 'charge-deep-charging';
    },
    HandleOnlineButtonClicked() {
      this.$emit('OnOnlineBtnClicked', this.vehicleStateData)
    },
    HandleTaskIDClicked() {
      if (!this.IsOrderRunning)
        return;
      this.$emit('onTaskIdClick', this.CurrentOrderID)
    }
  },
  mounted() {
  },
  beforeUnmount() {
  }
}
  </script>
  
  <style lang="scss" scoped>
.vehicle-info-card-status-down {
  animation: status-down-border-blink 2s infinite !important;
}

.vehicle-info-card {
  --battery-outline-color: rgb(180, 180, 180);
  --battery-width: 41px;
  border: 1px solid #c4c4c4;
  margin: 10px;
  border-radius: 4px;
  font-size: 16px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: rgb(250, 250, 250);
  color: rgb(54, 54, 54);
  flex-wrap: nowrap;
  .vehicle-info-card-header {
    .vehicle-icon {
      width: 20px;
      height: 20px;
      margin-right: 5px;
      position: relative;
      bottom: 3px;
      background-size: 100%;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 5px;
    }
    .vehicle-icon {
      background-image: url("@/assets/images/submarineIcon.png");
    }
    .fork-icon {
      background-image: url("@/assets/images/forkIcon.png");
    }
    color: black;
    display: flex;
    align-items: center;
    .connected {
    }
    .disconnect {
      color: red !important;
      background-color: transparent !important;
    }
    h6 {
      text-align: left;
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: 0.1rem;
    }
    .v-Offline {
      color: rgb(156, 156, 156);
      border: none;
    }
    .v-Online {
      color: rgb(88, 88, 88);
      border: none;
      font-weight: 800;
    }
  }
  .center-content {
    .task-id:hover {
      color: rgb(64, 158, 255);
      font-weight: bold;
    }
  }
  .center-content:hover {
    cursor: pointer;
  }
  .footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-top: 1px solid rgb(196, 196, 196);
    width: 100%;
    padding: 10px;
    left: 0;
    margin: 0;
    .button-like-container {
      border: 2px solid rgb(197, 197, 197);
      padding: 2px 10px;
      border-radius: 0.41rem;
    }
    .battery-info {
      padding-top: 8px !important;
      width: 140px;
      ::v-deep .el-progress-bar__outer {
        border: 4px solid var(--battery-outline-color);
        border-radius: 1px;
        width: var(--battery-width);
      }
      ::v-deep .el-progress-bar__inner {
        border-radius: 1px;
      }

      .battery-head,
      .battery-level-text,
      .battery-charging-icon {
        position: absolute;
      }
      .battery-head {
        left: calc(var(--battery-width) - 2px);
        top: 4px;
        width: 5px;
        height: 10px;
        background-color: var(--battery-outline-color);
      }
      .battery-level-text {
        left: calc(var(--battery-width) + 10px);
        top: 0px;
        text-wrap: nowrap;
        font-weight: bold;
      }
      .battery-charging-icon {
        // left: calc(var(--battery-width));
        left: 15%;
        font-size: smaller;
        top: 0px;
        animation: charger-icon-flash 1s infinite;
      }

      @keyframes charger-icon-flash {
        0%,
        100% {
          color: rgb(255, 255, 255);
        }
        50% {
          color: rgb(255, 208, 0);
        }
      }
    }
    .battery-low {
      border: 3px solid red;
      animation: battery-low-blink 1s infinite;
    }

    @keyframes battery-low-blink {
      0%,
      100% {
        border-color: red;
      }
      50% {
        border-color: rgb(255, 255, 255);
      }
    }

    .station-name {
      color: rgb(0, 119, 255);
      font-weight: bold;
    }
    .no-order-run {
      color: grey;
    }
    .order-run {
    }
  }
  .from-to-info {
    font-weight: bold;
  }

  .item-name-label {
    color: rgb(117, 117, 117);
    font-weight: 800;
    font-size: 16px;
    text-wrap: nowrap;
  }
  .text-bold {
    font-weight: bold;
  }
  ::v-deep .el-step__title {
    font-size: 12px;
    line-height: 25px;
    font-weight: lighter;
  }

  .charge-normal,
  .charge-deep-charging {
    background-color: var(--charge-button-normal-color);
  }
  .charge-deep-charge-raising {
    background-color: var(--charge-button-deep-charge-raising-color);
    animation: charge-btn-deep-charge-raising-flash 2s infinite;
  }
  .charge-deep-charging {
    animation: charge-btn-deep-charging-flash 2s infinite;
  }

  @keyframes charge-btn-deep-charge-raising-flash {
    0%,
    100% {
      background-color: var(--charge-button-deep-charge-raising-color);
    }
    50% {
      background-color: rgb(136, 136, 136);
    }
  }

  @keyframes charge-btn-deep-charging-flash {
    0%,
    100% {
      background-color: var(--charge-button-normal-color);
    }
    50% {
      background-color: rgb(136, 136, 136);
    }
  }
}
.order-run {
  box-shadow: 2px -2px 6px 0px rgb(106 133 173);
}

.v-Offline {
  background-color: rgb(219, 219, 219);
  //   color: white !important;
  border: 1px solid rgb(148, 148, 148);
}
.v-Online {
  background-color: rgb(255, 255, 255);
  border: 3px solid rgb(212, 220, 228);
}
.vehicle-card-disconnect {
  background-color: rgb(255, 112, 112);
}
.vehicle-info-card:hover {
  border: 3px solid rgb(13, 110, 253);
  // animation: border-flow 3s linear infinite;
}

@keyframes status-down-border-blink {
  0%,
  100% {
    border: 4px solid rgb(212, 220, 228);
  }
  50% {
    border: 4px solid rgb(255, 28, 28);
  }
}

@keyframes border-flow {
  0% {
    border-image: linear-gradient(
        0deg,
        rgb(13, 110, 253) 0%,
        transparent 25%,
        transparent 75%,
        rgb(13, 110, 253) 100%
      )
      1;
  }
  25% {
    border-image: linear-gradient(
        90deg,
        rgb(13, 110, 253) 0%,
        transparent 25%,
        transparent 75%,
        rgb(13, 110, 253) 100%
      )
      1;
  }
  50% {
    border-image: linear-gradient(
        180deg,
        rgb(13, 110, 253) 0%,
        transparent 25%,
        transparent 75%,
        rgb(13, 110, 253) 100%
      )
      1;
  }
  75% {
    border-image: linear-gradient(
        270deg,
        rgb(13, 110, 253) 0%,
        transparent 25%,
        transparent 75%,
        rgb(13, 110, 253) 100%
      )
      1;
  }
  100% {
    border-image: linear-gradient(
        360deg,
        rgb(13, 110, 253) 0%,
        transparent 25%,
        transparent 75%,
        rgb(13, 110, 253) 100%
      )
      1;
  }
}
</style>
  