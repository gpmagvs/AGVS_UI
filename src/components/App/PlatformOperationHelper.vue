<template>
  <div class="platform-operation-helper-container">
    <el-collapse v-model="activeNames">
      <el-collapse-item title="用戶登入" name="1">
        <div class="d-flex flex-column">
          <b-button
            @click="()=>{openLoginTour = true;handleHelpItemsClicked()}"
            variant="light"
          >如何登入?</b-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="系統操作說明" name="2">
        <div class="d-flex flex-column">
          <b-button
            @click="()=>{openOperationSwitchTour = true;handleHelpItemsClicked()}"
            variant="light"
          >運轉模式、HOST模式切換?</b-button>

          <b-button disabled variant="light">如何指派搬運任務?</b-button>
          <b-button
            @click="()=>{openMapTour = true;handleHelpItemsClicked()}"
            variant="light"
          >為什麼地圖沒辦法拖拉、縮放?</b-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="AGV相關操作" name="3">
        <div class="d-flex flex-column">
          <b-button
            @click="()=>{openVehicleOnlineTour = true;closeDrawerRequest()}"
            variant="light"
          >如何將車輛上線?</b-button>
          <b-button
            @click="()=>{openChargeTaskTour = true;closeDrawerRequest()}"
            variant="light"
          >如何將車輛派送至充電站充電?</b-button>
          <b-button
            @click="()=>{openVehicleInfoCardUseTour = true;closeDrawerRequest()}"
            variant="light"
          >車輛資訊卡操作說明</b-button>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>

  <el-tour v-model="openLoginTour" show-close-button :mask="false" type="primary">
    <el-tour-step target="#user-login-container" title="使用者登入" description="點一下此按鈕進入登入頁面" />
  </el-tour>
  <el-tour v-model="openMapTour" show-close-button :mask="false" type="primary">
    <el-tour-step
      target="#map-pan-zoom-switch"
      title="地圖拖拉、縮放"
      description="點擊切換地圖拖拉、縮放"
      placement="left"
    />
  </el-tour>
  <el-tour v-model="openOperationSwitchTour" show-close-button>
    <el-tour-step
      target="#system_operation_mode"
      title="操作模式"
      description="點擊切換維護模式/運轉模式,在運轉模式下，系統會自動指派車輛充電任務。"
      placement="bottom"
    />
    <el-tour-step
      target="#host_conn_mode"
      title="Host連線"
      description="點擊切換上層系統Offline/Online。"
      placement="bottom"
    />
    <el-tour-step
      target="#host_operation_mode"
      title="HOST模式"
      description="點擊切換上層系統 Local/Remote,在Remote模式，由上層系統指派'搬送'任務。"
      placement="bottom"
    />
  </el-tour>
  <el-tour v-model="openChargeTaskTour" show-close-button @finish="openDrawer">
    <el-tour-step
      target="#charge-task-assignment-button"
      title="充電任務指派"
      description="點擊指派充電任務"
      placement="bottom"
    />
  </el-tour>
  <el-tour v-model="openVehicleOnlineTour" show-close-button @finish="openDrawer">
    <el-tour-step
      target="#vehicle-online-button"
      title="車輛上線"
      description="點擊車輛上線"
      placement="bottom"
    />
  </el-tour>
  <el-tour v-model="openVehicleInfoCardUseTour" show-close-button @finish="openDrawer">
    <el-tour-step
      target="#vehicle-info-card-name"
      title="車輛資訊-AGV名稱"
      description="AGV名稱顯示"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-icon"
      title="車輛資訊-AGV圖示"
      description="不同的車款，會有不同的顯示圖示"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-online-button"
      title="車輛上線"
      description="點擊按鈕請求 AGV上線/下線"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-web-site-icon"
      title="車輛資訊-AGV網站圖示"
      description="點擊顯示AGV車載系統操作網頁"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-status"
      title="車輛資訊-AGV狀態"
      description="AGV狀態顯示"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-position"
      title="車輛資訊-AGV位置"
      description="AGV位置顯示"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-carrier-id"
      title="車輛資訊-AGV載具ID"
      description="顯示AGV當前載具ID"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-task-id"
      title="車輛資訊-AGV任務ID"
      description="顯示AGV當前任務ID"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-from-station"
      title="車輛資訊-任務起點"
      description="顯示AGV當前任務之起點設備/Rack名稱"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-to-station"
      title="車輛資訊-任務終點"
      description="顯示AGV當前任務之終點設備/Rack名稱"
      placement="bottom"
    />
    <el-tour-step
      target="#vehicle-info-card-battery-info"
      title="車輛資訊-電池資訊"
      description="AGV當前電池狀態"
      placement="bottom"
    />
    <el-tour-step
      target="#charge-task-assignment-button"
      title="車輛資訊-充電任務指派"
      description="點擊指派充電任務"
      placement="bottom"
    />
  </el-tour>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['onCloseDrawerRequested', 'onOpenDrawerRequested']);

const activeNames = ref(['1', '2', '3']);

const openLoginTour = ref(false);
const openOperationSwitchTour = ref(false);
const openMapTour = ref(false);
const openTaskAssignmentTour = ref(false);
const openChargeTaskTour = ref(false);
const openVehicleOnlineTour = ref(false);
const openVehicleInfoCardUseTour = ref(false);
const handleHelpItemsClicked = () => {
  console.log('handleHelpItemsClicked');
};

const closeDrawerRequest = () => {
  emit('onCloseDrawerRequested');
};
const openDrawer = () => {
  emit('onOpenDrawerRequested');
};

</script>

<style lang="scss" scoped>
.platform-operation-helper-container {
  height: 100%;
  overflow-y: auto;
  button {
    text-align: left;
    width: 100%;
    color: rgb(13, 110, 253);
  }
}
</style>