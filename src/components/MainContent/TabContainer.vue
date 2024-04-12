<template>
  <!--主要內容 TabControl-->
  <div class="flex-fill border mt-1 p-1">
    <b-tabs :model-value="current_tab" @activate-tab="HandleTabpageChanged" pills>
      <!-- 狀態 -->
      <b-tab :title="$t('status')" active>
        <div class="mt-3 border p-1">
          <status_card></status_card>
        </div>
      </b-tab>
      <!--Alarm Table-->
      <b-tab :title="$t('abnormal-record')">
        <div class="table-container-div mt-3 border p-1">
          <alarm_warn_table></alarm_warn_table>
        </div>
      </b-tab>
      <!-- 操作 -->
      <b-tab :title="$t('operation')">
        <div class="mt-3 border p-1">
          <agv_operator :agv_type="VMSData.Agv_Type"></agv_operator>
        </div>
      </b-tab>
      <!-- Battery -->
      <b-tab v-if="false" title="電池">
        <div class="mt-3 border p-1">
          <BatteryView></BatteryView>
        </div>
      </b-tab>
      <b-tab :title="$t('eq-handshake-e84')">
        <div class="mt-3 border p-1">
          <EQHandshakeView></EQHandshakeView>
        </div>
      </b-tab>
      <!-- CST READER -->
      <b-tab v-if="!IsVisitor" title="CST Reader">
        <div class="mt-3 border p-1">
          <CSTReader></CSTReader>
        </div>
      </b-tab>IsGodUser <b-tab v-if="!IsVisitor" title="Overview">
        <div class="mt-3 border p-1">
          <AgvOverview :AsMainPageMode="false"></AgvOverview>
        </div>
      </b-tab>
      <b-tab v-if="IsGodMod" title="Log">
        <div class="mt-3 border p-1">
          <LogQuery></LogQuery>
        </div>
      </b-tab>
      <!-- 本地任務派送 -->
      <b-tab v-if="IsGodMod || IsDevUser" title="Local派工">
        <div class="mt-3 border p-1">
          <TaskDeliveryVue></TaskDeliveryVue>
        </div>
      </b-tab>
      <!-- 3D Model Display -->
      <b-tab v-if="false" :title="$t('3d_model')">
        <div class="mt-3 border p-1">
          <ForkAGV3D></ForkAGV3D>
        </div>
      </b-tab>
      <b-tab v-if="false" title="AGVS MSG">
        <div class="mt-3 border p-1">
          <AGVSMsgDisplay ref="agvs_msg_table"></AGVSMsgDisplay>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import status_card from "@/components/StatusInfoCard.vue"
import alarm_warn_table from '@/components/AlarmWarningTable.vue'
import agv_operator from '@/components/Operator/AgvOperator.vue'
import ForkAGV3D from '@/components/3DModel/ForkAGV3DModel.vue'
import AGVSMsgDisplay from '@/components/AGVSMsgDisplay.vue'
import TaskDeliveryVue from '@/components/VMSTask/TaskDelivery.vue'
import CSTReader from '@/components/CSTReaderView.vue'
import EQHandshakeView from '@/components/E84/EQHandshakeView.vue'
import AgvOverview from '@/components/AGVStatusOverview.vue';
import Notifier from "@/api/NotifyHelper.js";
import BatteryView from "@/views/BatteryView.vue"
import VMSData from '@/ViewModels/VMSData.js';
import bus from '@/event-bus.js'
import { UserStore, UIStore } from '@/store'
import EQHandshakeViewVue from '../E84/EQHandshakeView.vue'
import LogQuery from '@/components/Log/LogQuery.vue'
import { ROS_STORE } from "@/store/ros_store"
import { ElNotification } from 'element-plus'
export default {
  components: { status_card, alarm_warn_table, agv_operator, ForkAGV3D, AGVSMsgDisplay, TaskDeliveryVue, CSTReader, EQHandshakeView, AgvOverview, LogQuery, BatteryView },
  props: {
    VMSData: {
      type: Object,
      default() {
        return new VMSData();
      }
    },
  },
  data() {
    return {
      current_tab: 0
    }
  },
  mounted() {
    bus.on('on-fork-height-click', () => {
      this.current_tab = 2;
    });
    bus.on('on-manual-lsr-setting-show-invoke', () => {
      this.current_tab = 2;
    });
  },
  methods: {
    HandleTabpageChanged(currentTabs, previousTabs) {
      this.current_tab = currentTabs;
      UIStore.commit('SetCurrentTabSelected', currentTabs)
      if (currentTabs == previousTabs)
        return;
      if (currentTabs == 1) {
        bus.emit('/alarmtable_tab_click')
      }

      if (currentTabs == 6) {
        bus.emit('local-task-view-shown')
      }

      ROS_STORE.dispatch('keyboard_move_enable', currentTabs == 2)
      if (currentTabs != 2) {
        ROS_STORE.dispatch('force_stop')
      }
      this.$emit('OnTabChanged', this.currentTabs);
    },
  },
  computed: {
    IsGodMod() {
      return UserStore.getters.IsGodUser
    },
    IsDevUser() {
      return UserStore.getters.IsDevUser
    },
    IsEngUser() {
      return UserStore.getters.IsEngUser;
    },
    IsEngUser() {
      return UserStore.getters.IsEngUser;
    },
    IsVisitor() {
      return UserStore.getters.IsVisitor;
    }
  }
}
</script>
<style lang="scss"></style>