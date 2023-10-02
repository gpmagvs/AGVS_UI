<template>
  <div class="sys-settings custom-tabs-head-large p-1 ">
    <b-tabs>
      <b-tab title="AGV 電量設定" active>
        <div class="setting-tab">
          <AGVBatterySetting></AGVBatterySetting>
        </div>
      </b-tab>
      <b-tab title="用戶管理">
        <div class="setting-tab">
          <UserManager ref="user_manager"></UserManager>
        </div>
      </b-tab>
      <b-tab title="充電站設置">
        <div class="setting-tab">
          <ChargeStationView></ChargeStationView>
        </div>
      </b-tab>
      <b-tab title="設備管理">
        <div class="setting-tab">
          <EQManager></EQManager>
        </div>
      </b-tab>
      <b-tab title="HOT RUN">
        <div class="setting-tab">
          <HotRUniew></HotRUniew>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>

import UserManager from '@/components/SystemSettings/UserManager.vue';
import EQManager from '@/components/SystemSettings/EquipmentManager.vue';
import AGVBatterySetting from '@/components/SystemSettings/AGVBatterySetting.vue';
import ChargeStationView from '@/views/ChargeStation/ChargeStationHomeView.vue'
import HotRUniew from '@/views/HotRun.vue'

export default {
  components: {
    UserManager, EQManager, AGVBatterySetting, ChargeStationView, HotRUniew
  },
  data() {
    return {
      activeTab: 0,
      tabID: {
        user_manager: 'user_manager'
      }
    }
  },
  methods: {
    TabActiveHandle(tab) {
      if (tab == 2) {
        this.$refs['user_manager'].DownloadUsers();
      }
    },
    updateTabContent() {
      this.$nextTick(() => {
        // 在下一個異步更新周期中處理選項卡內容的更新
        // 這樣可以避免觸發無限循環和 ResizeObserver loop limit exceeded 錯誤
        // 在此處執行相應的選項卡內容更新操作
        // 例如，你可以根據實際需求來計算內容的高度或重新佈局等操作
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.updateTabContent(); // 初始化選項卡內容的更新
    });

  },
  watch: {
    activeTab(newValue) {
      if (newValue !== null) {
        this.updateTabContent(); // 切換選項卡時處理內容的更新
      }
    }
  }
}
</script>

<style lang="scss">
.sys-settings {
  position: absolute;
  top: 55px;
  width: 96vw;

  .setting-tab {
    padding: 12px;
    width: 100%;
  }
}
</style>