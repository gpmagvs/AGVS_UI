<template>
  <div class="status-overview h-100 bg-dark text-light d-flex p-3">
    <!-- {{ SensorStatus }} -->
    <div v-if="AsMainPageMode" class="text-start py-3 px-1">
      <!-- <div>
        <span class="agv-name-text">AGV_001</span>
      </div>-->
      <div class="status-card sub_status">
        <div class="vertical_bar" v-bind:class="'bar-' + AGVStatesData.SubState.toLowerCase()"></div>
        <div
          class="status-text"
          v-bind:class="AGVStatesData.SubState.toLowerCase()">{{ AGVStatesData.SubState }}</div>
      </div>
      <div class="my-divider"></div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 目前位置 <span>System Error</span>
          </div>
          <div
            class="item-val">{{ AGVStatesData.Last_Visit_MapPoint.Graph.Display + '(' + AGVStatesData.Last_Visited_Tag + ')' }}</div>
        </div>
      </div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 定位狀態 <span>Localization</span>
          </div>
          <div
            class="item-val"
            v-bind:style="{ color: LocStatusDisplay() == 'System-Error' ? 'red' : 'white' }">{{ LocStatusDisplay() }}</div>
        </div>
      </div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 載物ID <span>Cargo ID</span>
          </div>
          <div class="item-val">{{ AGVStatesData.CST_Data }}</div>
        </div>
      </div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 電量 <span>Battery</span>
          </div>
          <div class="d-flex">
            <div
              class="item-val d-flex battery"
              v-for="bat in AGVStatesData.BatteryStatus"
              :key="bat.BatteryID">
              <span>NO.{{ bat.BatteryID }}</span> {{ bat.BatteryLevel }}% <span class="mx-1"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 里程數 <span>Mileage</span>
          </div>
          <div class="item-val"> {{ AGVStatesData.Mileage.toFixed(2) }} <span>km</span>
          </div>
        </div>
      </div>
    </div>
    <AGVStatusView class="flex-fill" status="safe" :sensor_data="SensorStatus"></AGVStatusView>
    <div v-if="AsMainPageMode" class="text-start" style="padding-top:62px;">
      <div class="status-card-info my-5">
        <div class>
          <div class="item-text"> 速度資訊 <span>Velocity</span>
          </div>
          <div class="velocitys d-flex my-2">
            <div class="item-val d-flex flex-column">
              <span class="linear-text">Linear</span>
              <div> {{ AGVStatesData.LinearSpeed }} <span class="unit">m/s</span>
              </div>
            </div>
            <div class="item-val d-flex flex-column mx-4">
              <span class="linear-text">Angular</span>
              <div> {{ AGVStatesData.AngularSpeed }} <span class="unit">rad/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 座標資訊 <span>Location</span>
          </div>
          <div
            class="item-val">( {{ AGVStatesData.Pose.position.x.toFixed(2) }}, {{ AGVStatesData.Pose.position.y.toFixed(2) }})</div>
        </div>
      </div>
      <div class="status-card-info">
        <div class>
          <div class="item-text"> 雷射模式 <span>Laser Mode</span>
          </div>
          <div class="item-val">{{ AGVStatesData.Current_LASER_MODE }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AGVStatusStore } from '@/store';
import AGVStatusView from '@/components/AGVStatusView.vue'
export default {
  components: {
    AGVStatusView,
  },
  props: {
    AsMainPageMode: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
    }
  },
  computed: {
    SensorStatus() {
      return AGVStatusStore.getters.AGV_Sensors_States
    },
    AGVStatesData() {
      return AGVStatusStore.getters.AGVStatus
    },

  },
  methods: {
    LocStatusDisplay() {
      //  1 byte LocalizationStatus [10: OK, 20: Warning, 30: Not localized, 40: System error] -->
      var locStatus = this.AGVStatesData.LocStatus;
      if (locStatus == 10) {
        return "OK"
      }
      else if (locStatus == 20) {
        return "Warning"
      }
      else if (locStatus == 30) {
        return "Not-Localized"
      }
      else if (locStatus == 40) {
        return "System-Error"
      }
      else {
        return "Unknown"
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.status-overview {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;

  .primary-info-text {
    font-size: 30px;
  }

  .agv-name-text {
    font-size: 30px;
  }

  .my-divider {
    width: 100%;
    height: 2px;
    background-color: rgb(66, 66, 66);
    margin-block: 10px;
  }

  .status-card,
  .status-card-info {
    display: flex;
    flex-direction: row;
    height: 60px;
    width: 200px;
  }

  .status-card-info {
    margin-block: 20px;

    .item-text {
      color: #adadad;
      font-size: 16px;
      letter-spacing: 2px;

      span {
        font-size: smaller;
        visibility: hidden;
      }
    }

    .item-val {
      font-size: 24px;
      position: relative;
      top: -7px;
    }

    .velocitys {
      span {
        font-size: 14px;
        color: grey;
      }
    }

    .battery {
      span {
        font-size: small;
        padding-right: 7px;
        padding-top: 13px;
      }
    }
  }

  .vertical_bar {
    height: 100%;
    width: 13px;
    //background-color: limegreen;
    border-radius: 5px;
  }

  .status-text {
    position: relative;
    font-size: 48px;
    /* padding-block: 0px; */
    padding-left: 5px;
    top: -8px;
  }

  .System-Error {
    color: red;
  }

  .sub_status {

    .bar-down,
    .bar-stop {
      background-color: red;
    }

    .bar-idle {
      background-color: orange;
    }

    .bar-run,
    .bar-charging {
      background-color: limegreen;
    }

    .bar-initializing {
      background-color: rgb(255, 255, 255);
    }

    .down,
    .stop {
      color: red;
    }

    .idle {
      color: orange;
    }

    .run,
    .charging {
      color: limegreen;
    }

    .initializing {
      color: rgb(240, 176, 38);
    }
  }
}
</style>