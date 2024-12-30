<template>
  <div
    class="vehicle-info-card"
    :class="[vehicleStateData.Connected?'connected':'vehicle-card-disconnect',vehicleStateData.OnlineStatus==0? 'v-Offline':'v-Online']"
  >
    <div class="vehicle-info-card-header p-2 border-bottom">
      <div class="vehicle-icon" :style="StyleOfAGVDisplayColor"></div>
      <h6 class="flex-fill">{{ vehicleStateData.AGV_Name }}</h6>
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
        <div
          class="text-truncate text-bold task-id"
          @click="HandleTaskIDClicked"
          style="width: 120px"
        >{{ CurrentOrderID }}</div>
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
      <div class="button-like-container battery-info">
        <el-progress
          :percentage="vehicleStateData.BatteryLevel_1"
          stroke-width="20"
          striped
          striped-flow
          duration="12"
        >
          <div class="battery-head"></div>
          <div
            class="battery-level-text"
          >{{vehicleStateData.BatteryLevel_1?vehicleStateData.BatteryLevel_1.toFixed(0):0}}%</div>
        </el-progress>
      </div>
      <div class="button-like-container mx-1" style="width: 290px;">
        <el-popover width="150" placement="right">
          <template #reference>
            <el-button
              type="success"
              v-bind:class="getChargeButtnClass()"
              @click="()=> $emit('ShowAGVChargeConfirmDialog',vehicleStateData)"
            >{{ vehicleStateData.Model == 2 ? $t('Exchange Battery') : $t('Charge') }}</el-button>
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
import moment from 'moment';
import { dot } from 'element-plus'
export default {
  name: 'vehicle-info-card',
  data() {
    return {
    }
  },
  props: {
    vehicleStateData: {
      type: clsAGVStateDto,
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
    StyleOfAGVDisplayColor() {
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
        tagType = 'default'
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
    }
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
      width: 10px;
      height: 20px;
      margin-right: 5px;
      position: relative;
      bottom: 3px;
    }
    color: black;
    display: flex;
    align-items: center;
    h6 {
      text-align: left;
      font-size: 1.3rem;
      font-weight: 700;
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
      border: 3px solid rgb(194, 194, 194);
      padding: 2px 10px;
      border-radius: 0.41rem;
    }
    .battery-info {
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
      .battery-level-text {
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

.connected {
}

.v-Offline {
  background-color: rgb(231, 231, 231);
  //   color: white !important;
  border: 1px solid rgb(148, 148, 148);
}
.vehicle-card-disconnect {
  background-color: rgb(255, 112, 112);
}
.vehicle-info-card:hover {
  border: 3px solid rgb(39, 82, 175);
}
</style>
  