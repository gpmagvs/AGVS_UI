<template>
  <div class="mission-card" :class="[mission.State == 1 ? 'executing' : 'waiting', selectedClassName]">
    <div class="mission-card-header py-1 border-bottom">
      <h6 class="mx-2 border py-1 px-2 rounded text-light text-nowrap" :class="actionTagClass">{{ action }}</h6>
      <div class="flex-fill d-flex text-truncate">
        <h6 class="text-nowrap" @click="copyText(mission.TaskName)"># {{ mission.TaskName }}</h6>
        <i class="bi bi-clipboard mx-2" style="cursor: pointer;"></i>
      </div>
      <!-- <label>Local</label> -->
      <el-button type="danger" @click="CancelTaskHandler(mission.TaskName)">{{ mission.State == 1 ? t('MissionCard.AbortOrder') : t('MissionCard.CancelOrder') }}</el-button>
    </div>
    <div class="from-to-info d-flex p-2 m-1">
      <div style="width: 140px;">
        <label class="item-name-label">{{ t('TaskTable.Source') }}</label>
        <div :class="mission.State == 1 ? 'executing' : ''">{{ source }}</div>
      </div>
      <div class="flex-fill">
        <el-steps style="width:100%;padding-top: 0px; padding-right: 10px;" :active="currentStep" finish-status="success">
          <el-step :style="isCarryOrder ? {} : { visibility: 'hidden' }" :title="t('Move')" />
          <el-step :style="isCarryOrder ? {} : { visibility: 'hidden' }" :title="t('Unload')" />
          <el-step :title="t('Move')" />
          <el-step :title="finalStepActionDisplay" />
        </el-steps>
      </div>
      <div style="width: 140px;">
        <label class="item-name-label w-100 text-end">{{ t('TaskTable.Destine') }}</label>
        <div class="w-100 text-end" :class="mission.State == 1 ? 'executing' : ''">{{ destine }}</div>
      </div>
    </div>
    <div class="d-flex justify-content-between p-2 m-1 border-top">
      <div>
        <label class="item-name-label">{{ t('TaskTable.RecievedTime') }}</label>
        <div>{{ recieveTime }}</div>
      </div>
      <div>
        <label class="item-name-label">{{ t('TaskTable.Dispatcher') }}</label>
        <div>{{ dispatcherName }}</div>
      </div>
      <div>
        <label class="item-name-label">VEHICLE</label>
        <div>
          <!-- <el-tooltip v-if="executingVehicleInfo" placement="bottom-end" effect="light">
            <template #content>
              <vehicleInfoCard :vehicleStateData="executingVehicleInfo"></vehicleInfoCard>
            </template>
<el-tag effect="dark">{{ vehicleName }}</el-tag>
</el-tooltip>
<el-tag v-else effect="dark">{{ vehicleName }}</el-tag>--> <el-tag effect="dark">{{ vehicleName }}</el-tag>
        </div>
      </div>
      <div style="width: 140px;">
        <label class="item-name-label w-100 text-end">{{ t('TaskTable.CstID') }}</label>
        <div class="w-100 text-end">{{ carrierID }}</div>
      </div>
      <!-- {{ state }} -->
    </div>
    <!-- <pre class="text-start" style="font-size: 20px;"> {{ mission }}</pre> -->
  </div>
</template>
<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import clsTaskState from '@/ViewModels/TaskState';
import { TaskAllocation } from '@/api/TaskAllocation';
import { MapStore } from '../Map/store';
import { userStore, agv_states_store } from '@/store';
import moment from 'moment';
import vehicleInfoCard from '../Vehicle/VehicleInfoCard.vue';
import { CopyText } from '@/api/Common/UtilityTools';
import { useI18n } from 'vue-i18n';
import { ElMessageBox } from 'element-plus';
import Swal from 'sweetalert2';
const { t } = useI18n();
// Props 定義
const props = defineProps({
  mission: {
    type: Object,
    default: () => new clsTaskState()
  },
  selected: {
    type: Boolean,
    default: false
  }
});

// 響應式數據
const show = ref(false);
const isLeaving = ref(false);
const selectedClassName = ref('');
const MapPoints = ref(Object.values(MapStore.state.MapData.Points));

// Watch
watch(() => props.selected, (newVal) => {
  selectedClassName.value = newVal ? 'selected' : '';
});

// Methods
const copyText = (text) => {
  CopyText(text);
};

const GetStationName = (tag) => {
  if (tag == -1) return "-";
  const station = MapPoints.value.find(station => station.TagNumber + '' == tag);
  if (station) return station.Graph.Display;
  return tag;
};

const CancelTaskHandler = (task_name) => {
  const cancelTaskName = task_name;
  const isHotRunTask = task_name.includes('HR');

  Swal.fire(
    {
      text: '任務ID ' + task_name,
      title: '確定要取消任務?',
      icon: 'question',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'rgb(13, 110, 253)',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        SendCancelTaskRequest();
      }
    });
};

const SendCancelTaskRequest = async () => {
  try {
    const canclerName = userStore.state.user.UserName;
    await TaskAllocation.Cancel(props.mission.TaskName, "Cancel From GUI Cancel Button", canclerName);
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Unauthorized access. Please log in again.");
      userStore.commit('setUser', null);
      ElMessageBox.alert('請先進行登入', '', {
        confirmButtonText: 'OK',
        callback: () => {
          bus.emit('/show-login-view-invoke');
        }
      });
    }
  }
};

// Computed properties
const action = computed(() => {
  const _actionInt = props.mission.Action;
  switch (_actionInt) {
    case 0: return t('Move');
    case 1: return t('Unload');
    case 7: return t('Load');
    case 8: return t('Charge');
    case 9: return t('Transfer');
    case 12: return t('Park');
    case 17: return t('DeepCharge');
    default: return _actionInt;
  }
});

const dispatcherName = computed(() => {
  return props.mission.DispatcherName == '' ? 'Not Assigned' : props.mission.DispatcherName;
});

const isCarryOrder = computed(() => props.mission.Action == 9);
const isChargeOrder = computed(() => props.mission.Action == 8 || props.mission.Action == 17);

const actionTagClass = computed(() => {
  if (isCarryOrder.value) return 'bg-primary';
  if (isChargeOrder.value) return 'bg-success';
  return 'bg-dark';
});

const vehicleName = computed(() => {
  return props.mission.DesignatedAGVName == '' ? 'Not Assigned' : props.mission.DesignatedAGVName;
});

const currentStep = computed(() => {
  const _currentProgress = props.mission.currentProgress;
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
});

const finalStepActionDisplay = computed(() => {
  const _actionInt = props.mission.Action;
  switch (_actionInt) {
    case 0:
      return 'Destine'
    case 1:
      return t('Unload')
    case 7:
      return t('Load')
    case 8:
      return t('Charge')
    case 9:
      return t('Load')
    case 12:
      return t('Park')
    case 17:
      return t('DeepCharge')
    default:
      return _actionInt;
  }
});

const recieveTime = computed(() => {
  return moment(props.mission.RecieveTime).format('M/D HH:mm:ss');
});

const source = computed(() => {
  if (!isCarryOrder.value) return '-';
  const _slot = props.mission.From_Slot < 0 ? 0 : props.mission.From_Slot;
  if (_slot == 0) return GetStationName(props.mission.From_Station);
  return GetStationName(props.mission.From_Station) + `(Slot:${_slot})`;
});

const destine = computed(() => {
  const _slot = props.mission.To_Slot < 0 ? 0 : props.mission.To_Slot;
  const _stationName = GetStationName(props.mission.To_Station);
  if (props.mission.Action == 0) return _stationName;
  if (_slot == 0) return _stationName;
  return `${_stationName}(Slot:${_slot})`;
});

const executingVehicleInfo = computed(() => {
  if (!vehicleName.value || vehicleName.value == '') return undefined;
  const vehicleStates = agv_states_store.getters.AGVStatesData;
  return vehicleStates.find(v => v.AGV_Name == vehicleName.value);
});
//carrierID
const carrierID = computed(() => {
  return props.mission.Carrier_ID == '' ? '' : props.mission.Carrier_ID;
});

// Lifecycle hooks
onBeforeUnmount(() => {
  isLeaving.value = true;
});
</script>
<style lang="scss" scoped>
.mission-card {
  --card-border: 1px solid #818181;
  --selected-card-border: 1px solid #818181;
  border: var(--card-border);
  padding: 10px;
  margin: 10px;
  border-radius: 4px;
  font-size: 16px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: rgb(231, 231, 231);
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

    .executing {
      color: rgb(64, 158, 255) !important;
    }
  }

  .item-name-label {
    color: rgb(117, 117, 117);
    font-size: 12px;
    text-wrap: nowrap;
  }

  :deep(.el-step__title.is-process) {
    color: rgb(13, 110, 253);
    font-weight: bold;
    font-size: 14px;
    animation: in-process-title-flash 1s infinite;
  }

  @keyframes in-process-title-flash {

    0%,
    100% {
      color: rgb(125, 125, 125);
    }

    50% {
      color: rgb(13, 110, 253);
    }
  }

  :deep(.el-step__head.is-process) {
    color: rgb(13, 110, 253);
  }


  :deep(.el-step__title) {
    font-size: 12px;
    line-height: 25px;
    font-weight: lighter;
  }

}

.selected {
  animation: blink-border 1s 3;
  border: 3px solid rgb(64, 158, 255);

  @keyframes blink-border {

    0%,
    100% {
      border-color: rgb(78, 78, 78);
    }

    50% {
      border-color: rgb(64, 158, 255);
    }
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
