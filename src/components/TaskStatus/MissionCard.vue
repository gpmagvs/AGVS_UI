<template>
  <div class="mission-card" v-bind:class="[this.mission.State==1?'executing':'waiting']">
    <div class="mission-card-header py-1 border-bottom">
      <h6
        class="mx-2 border py-1 px-2 rounded text-light text-nowrap"
        :class="actionTagClass"
      >{{ action }}</h6>
      <h6 class="flex-fill text-nowrap"># {{ mission.TaskName }}</h6>
      <!-- <label>Local</label> -->
      <el-button
        type="danger"
        size="sm"
        @click="CancelTaskHandler(mission.TaskName)"
      >{{ mission.State==1 ?$t('MissionCard.AbortOrder') :$t('MissionCard.CancelOrder')}}</el-button>
    </div>
    <div class="from-to-info d-flex p-2 m-1">
      <div style="width: 140px;">
        <label class="item-name-label">{{ $t('TaskTable.Source') }}</label>
        <div>{{ source }}</div>
      </div>
      <div class="flex-fill">
        <el-steps
          style="width:100%;padding-top: 30px; padding-right: 40px;"
          :active="currentStep"
          finish-status="success"
        >
          <el-step :style=" isCarryOrder?{}: {visibility: 'hidden'}" :title="$t('Move')" />
          <el-step :style=" isCarryOrder?{}: {visibility: 'hidden'}" :title="$t('Unload')" />
          <el-step :title="$t('Move')" />
          <el-step :title="finalStepActionDisplay" />
        </el-steps>
      </div>
      <div style="width: 140px;">
        <label class="item-name-label w-100 text-end">{{ $t('TaskTable.Destine') }}</label>
        <div class="w-100 text-end">{{ destine }}</div>
      </div>
    </div>
    <div class="d-flex justify-content-between p-2 m-1 border-top">
      <div>
        <label class="item-name-label">{{$t('TaskTable.RecievedTime')}}</label>
        <div>{{ recieveTime }}</div>
      </div>
      <div>
        <label class="item-name-label">{{$t('TaskTable.Dispatcher')}}</label>
        <div>{{ dispatcherName }}</div>
      </div>
      <div>
        <label class="item-name-label">VEHICLE</label>
        <div>
          <el-tag effect="dark">{{ vehicleName }}</el-tag>
        </div>
      </div>
      <div style="width: 140px;">
        <label class="item-name-label w-100 text-end">{{$t('TaskTable.CstID')}}</label>
        <div class="w-100 text-end">{{ carrierID }}</div>
      </div>
      <!-- {{ state }} -->
    </div>
    <!-- <pre class="text-start" style="font-size: 20px;"> {{ mission }}</pre> -->
  </div>
</template>
<script>
import clsTaskState from '@/ViewModels/TaskState'
import { TaskAllocation } from '@/api/TaskAllocation'
import { MapStore } from '../Map/store';
import { userStore } from '@/store';
import moment from 'moment';
export default {
  data() {
    return {
      MapPoints: Object.values(MapStore.state.MapData.Points),
      show: false,
      isLeaving: false,
    }
  },
  props: {
    mission: {
      type: clsTaskState,
      default() {
        return new clsTaskState({})
      }
    }
  },
  computed: {
    action() {
      const _actionInt = this.mission.Action;
      switch (_actionInt) {
        case 0:
          return this.$t('Move')
        case 1:
          return this.$t('Unload')
        case 7:
          return this.$t('Load')
        case 8:
          return this.$t('Charge')
        case 9:
          return this.$t('Transfer')
        case 12:
          return this.$t('Park')
        case 17:
          return this.$t('DeepCharge')
        default:
          return _actionInt;
      }
    },
    actionTagClass() {
      if (this.isCarryOrder)
        return 'bg-primary';
      else if (this.isChargeOrder)
        return 'bg-success';
      return 'bg-dark'
    },
    isCarryOrder() {
      return this.mission.Action == 9;
    },
    isChargeOrder() {
      return this.mission.Action == 8 || this.mission.Action == 17;
    },
    finalStepActionDisplay() {
      const _actionInt = this.mission.Action;
      switch (_actionInt) {
        case 0:
          return 'Destine'
        case 1:
          return this.$t('Unload')
        case 7:
          return this.$t('Load')
        case 8:
          return this.$t('Charge')
        case 9:
          return this.$t('Load')
        case 12:
          return this.$t('Park')
        case 17:
          return this.$t('DeepCharge')
        default:
          return _actionInt;
      }
    },
    vehicleName() {
      if (this.mission.DesignatedAGVName == '')
        return 'Not Assigned'
      return this.mission.DesignatedAGVName;
    },
    recieveTime() {
      return moment(this.mission.RecieveTime).format('y/M/D HH:mm:ss');
    },
    state() {
      return this.mission.StateName + `(${this.mission.State})`;
    },
    source() {
      if (!this.isCarryOrder)
        return '-';
      const _slot = this.mission.From_Slot < 0 ? 0 : this.mission.From_Slot;
      return this.GetStationName(this.mission.From_Station) + `(Slot:${_slot})`;
    },
    destine() {
      const _slot = this.mission.To_Slot < 0 ? 0 : this.mission.To_Slot;
      const _stationName = this.GetStationName(this.mission.To_Station);
      if (this.mission.Action == 0)
        return _stationName;
      return `${_stationName}(Slot:${_slot})`;
    },
    carrierID() {
      return this.mission.Carrier_ID == '-1' ? '' : this.mission.Carrier_ID;
    },
    dispatcherName() {
      return this.mission.DispatcherName;
    },
    currentStep() {
      const _currentProgress = this.mission.currentProgress;
      if (_currentProgress == 2) {
        //move to source
        return 0;
      }
      if (_currentProgress == 4) {
        //move to source
        return 1;
      }
      if (_currentProgress == 3) {
        //move to source
        return 2;
      }
      if (_currentProgress == 5) {
        //move to source
        return 3;
      }
      return 0;
    }
  },
  methods: {
    GetStationName(tag) {
      if (tag == -1) return "-";
      var station = this.MapPoints.find(station => station.TagNumber + '' == tag)
      if (station)
        return station.Graph.Display
      return tag
    },
    CancelTaskHandler(task_name) {
      this.cancelTaskName = task_name;
      var isHotRunTask = task_name.includes('HR')
      this.$swal.fire(
        {
          title: '確定要取消任務?',
          text: '任務ID ' + task_name,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (res.isConfirmed) {
            this.SendCancelTaskRequest()
          }
        })
    },
    async SendCancelTaskRequest() {
      try {
        await TaskAllocation.Cancel(this.mission.TaskName);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access. Please log in again.");
          userStore.commit('setUser', null);
          // bus.emit('/show-login-view-invoke')
          this.$swal.fire(
            {
              text: '',
              title: '請先進行登入',
              icon: 'warning',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            }).then(() => {

              bus.emit('/show-login-view-invoke')
            })
        }
      }
    },
  },
  mounted() {
  },
  beforeUnmount() {
    this.isLeaving = true;
  }
}
</script>

<style lang="scss" scoped>
.mission-card {
  border: 1px solid #818181;
  padding: 10px;
  margin: 10px;
  border-radius: 4px;
  font-size: 16px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: rgb(198 198 198);
  color: rgb(54, 54, 54);
  flex-wrap: nowrap;
  .mission-card-header {
    display: flex;
    align-items: center;
    h6 {
      text-align: left;
    }
  }

  .from-to-info {
    font-weight: bold;
  }

  .item-name-label {
    color: rgb(117, 117, 117);
    font-size: 12px;
    text-wrap: nowrap;
  }

  ::v-deep .el-step__title {
    font-size: 12px;
    line-height: 25px;
    font-weight: lighter;
  }
}
.executing {
  background-color: rgb(255, 255, 255);
  color: black;
}

.mission-card:hover {
  border: 3px solid rgb(39, 82, 175);
}
</style>
