<template>
  <div class="agv-operator">
    <b-tabs :model-value="current_tab" pills small @activate-tab="HandleTabpageChanged">
      <b-tab :title="$t('agv_control')" active>
        <div class="mt-1 p-1">
          <AgvControl></AgvControl>
        </div>
      </b-tab>
      <b-tab v-show="agv_type == 0" :title="agv_type == 0 ? $t('zaxis_up_down') : ''">
        <div class="mt-1 p-1">
          <ZAxisControl :enabled="operation_enabled_return"></ZAxisControl>
        </div>
      </b-tab>
      <b-tab title="Input">
        <div class="table-container-div mt-1 p-1">
          <IOTable digital_type="input" :table_data="DIOTableData.Inputs"></IOTable>
        </div>
      </b-tab>
      <b-tab title="Output">
        <div class="table-container-div mt-1 p-1">
          <IOTable
            :readonly="false"
            digital_type="output"
            :enabled="operation_enabled_return"
            :super_user="isGodMode"
            :table_data="DIOTableData.Outputs"
            :isOutput="true"></IOTable>
        </div>
      </b-tab>
      <b-tab v-show="operation_enabled_return" :title="operation_enabled_return ? $t('manual-operation') : ''">
        <div class="mt-1 p-1">
          <ManualSettings :enabled="operation_enabled_return"></ManualSettings>
        </div>
      </b-tab>
      <b-tab v-if="operation_enabled_return && isAMCAGV" :title="operation_enabled_return ? 'Sensor/儀器控制' : ''">
        <div class="mt-1 p-1">
          <SensorAndEquipmentControl></SensorAndEquipmentControl>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import AgvControl from './AgvcControl.vue'
import ZAxisControl from './ZAxisControl.vue'
import IOTable from './IOTable.vue';
import { param } from '@/gpm_param';
import clsDIOTable from '@/ViewModels/clsDIOTable';
import ManualSettings from './ManualSettings.vue';
import SensorAndEquipmentControl from './SensorAndEquipmentControl.vue';
import bus from '@/event-bus.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserStore, DIOStore, AGVStatusStore } from '@/store'
import { ROS_STORE } from "@/store/ros_store"
import { ElNotification } from 'element-plus'

export default {

  components: {
    AgvControl, ZAxisControl, IOTable, ManualSettings, SensorAndEquipmentControl
  },
  data() {
    return {
      type: '',

      trigger_admin_dialog_count: 5,
      version_text_click_count: 0,
      modal_key: '',
      current_tab: 0
    }
  },
  mounted() {
    bus.on('on-fork-height-click', () => {
      this.current_tab = 1;
    });
    bus.on('on-manual-lsr-setting-show-invoke', () => {
      this.current_tab = 4;
    });
  },
  methods: {
    VersionTextClickHandle() {
      this.version_text_click_count += 1;
      if (this.version_text_click_count > this.trigger_admin_dialog_count) {
        this.ConfirmGODTriggering();
      }
    },
    ConfirmGODTriggering() {
      this.$swal.fire({
        title: 'Warning',
        text: `Do you known what are you doing now?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        allowOutsideClick: false
      }).then((result) => {
        this.AdminSwitchDialogResultHandle(result.isConfirmed);
      })

    },
    AdminSwitchDialogResultHandle(checked = false) {
      this.version_text_click_count = 0;
      if (checked) {
        UserStore.commit('setUser', {
          UserName: 'GOD',
          Role: 3
        });
      }
    },
    HandleTabpageChanged(currentTabs, previousTabs) {
      this.current_tab = currentTabs;
      if (currentTabs == previousTabs)
        return;
      ROS_STORE.dispatch('keyboard_move_enable', currentTabs == 0)
      if (currentTabs != 0) {
        ROS_STORE.dispatch('force_stop')
      }
      this.$emit('OnTabChanged', this.currentTabs);
    },
  },
  props: {
    ModuleInformation: {
      type: Object,
      default() {
        return {

        }
      }
    },
    operation_enabled: {
      type: Boolean,
      default: false
    },
    agv_type: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  computed: {
    isGodMode() {
      return UserStore.getters.IsGodUser;
    },
    operation_enabled_return() {
      if (this.isGodMode)
        return true;
      else
        return this.operation_enabled
    },
    isAMCAGV() {
      return AGVStatusStore.getters.IsInspectionAGV
    },
    DIOTableData() {
      return DIOStore.getters.DIOStates
    }
  }
}
</script>
<style scoped lang="scss">
.admin-dialog-modal {
  p {
    //
    font-weight: bold;
    user-select: none;
  }

  .admin-dialog-buttons {
    button {
      width: 220px;
      font-size: 50px;
      color: white;
      border-radius: 9px;
      margin: 4px;
    }

    button:hover {
      background-color: gray;
      color: white;
    }

    .yes-btn {
      background-color: rgb(0, 123, 255);
    }

    .no-btn {
      background-color: rgb(220, 53, 69);
    }
  }
}
</style>