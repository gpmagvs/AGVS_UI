<template>
  <div class="permission-settings">
    <div class="text-start py-2">
      <el-button class type="primary" @click="savePermissions" :loading="isSaving">儲存權限設置</el-button>
    </div>
    <el-form label-position="left" label-width="200px" class="permission-form">
      <div
        v-for="(section, sectionKey) in permissionSections"
        :key="sectionKey"
        class="permission-section"
      >
        <h3>{{ section.title }}</h3>
        <el-form-item
          v-for="(value, key) in PermissionSetting[sectionKey]"
          :key="key"
          :label="translateLabel(key)"
        >
          <el-switch
            v-model="PermissionSetting[sectionKey][key]"
            :active-value="1"
            :inactive-value="0"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import { GetPermissionSettings, SavePermissionSettings } from '@/api/UserAPI'
import { WebViewPermission } from '@/api/AuthHelper'
import { userStore } from '@/store';


export default {
  props: {
    PermissionSettingSender: {
      type: Object,
      default() {
        return {
          userName: '',
          role: -1
        }
      }
    }
  },
  data() {
    return {
      PermissionSetting: new WebViewPermission(),
      permissionSections: {
        menu: { title: '選單權限' },
        dataQuerySubMenu: { title: '資料查詢子選單權限' },
        systemConfigurationSubMenu: { title: '系統設定子選單權限' },
        systemModesOperations: { title: '系統運行模式操作權限' },
        chargeActionsPermission: { title: '充電操作權限' },
        taskDispatchPermission: { title: '任務派送權限' }
      },
      isSaving: false
    }

  },
  watch: {
    PermissionSettingSender: {
      handler(newValue, oldValue) {
        console.log('PermissionSettingSender changed:', newValue);
        GetPermissionSettings(newValue.userName).then(res => {
          Object.assign(this.PermissionSetting, res);
        })
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    translateLabel(key) {
      const translations = {
        // 主菜單權限
        'SystemAlarm': '系統警報',
        'WIPInfo': 'WIP資訊',
        'VehicleManagnment': '車輛管理',
        'Map': '地圖',
        'DataQuery': '資料查詢',
        'HotRun': 'HOT RUN',
        'SystemConfiguration': '系統配置',

        // 資料查詢子菜單
        'TaskHistory': '任務歷史',
        'AlarmHistory': '警報歷史',
        'VehicleTrajectory': '車輛軌跡查詢',
        'InstrumentsMeasure': '儀器測量查詢',
        'Utilization': '稼動率查詢',

        // 系統配置子菜單
        'BatteryLevelManagnment': '電池電量管理',
        'EquipmentlManagnment': '設備管理',
        'RackManagnment': 'RACK管理',
        'UserManagnment': '用戶管理',
        'ChargerManagnment': '充電站管理',

        // 系統運行模式操作權限
        'RunModeSwitch': '運行模式切換',
        'AutoTransferModeSwitch': '派工模式切換',
        'HostOnlineSwitch': 'HOST Online 切換',
        'HostRemoteSwitch': 'HOST Remote 切換',

        // 充電操作權限
        'NormalCharge': '一搬充電',
        'DeepCharge': '深度充電',
        'StopDeepCharge': '停止深充',

        'LocalOrderDispatchWhenHostRemote': 'Remote模式下派送Local任務'
      };
      return translations[key] || key; // 如果沒有翻譯,返回原始key
    },

    async savePermissions() {
      this.isSaving = true;
      try {
        await SavePermissionSettings(this.PermissionSettingSender.userName, this.PermissionSetting);
        this.$message.success('權限設置已成功儲存');
        if (this.PermissionSettingSender.userName == userStore.state.user.UserName) {
          var _clone = JSON.parse(JSON.stringify(this.PermissionSetting))
          userStore.commit('updateCurrentUserPermission', _clone);
        }
      } catch (error) {
        console.error('保存權限設置時出錯:', error);
        this.$message.error('儲存權限設置失敗，請稍後再試');
      } finally {
        this.isSaving = false;
      }
    }
  }
}
</script>
<style scoped>
.permission-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-name {
  text-align: center;
  color: #409eff;
  margin-bottom: 20px;
}

.permission-form {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
}

.permission-section {
  margin-bottom: 30px;
}

.permission-section h3 {
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-form-item__label {
  font-weight: bold;
}

.el-button {
  margin-top: 20px;
}
</style>