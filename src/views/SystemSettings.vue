<template>
  <div class="sys-settings custom-tabs-head p-1">
    <b-tabs>
      <b-tab title="設備管理" active>
        <EQManager></EQManager>
      </b-tab>
      <b-tab title="用戶管理">
        <UserManager ref="user_manager"></UserManager>
      </b-tab>
      <b-tab title="電池管理">This is the content of Tab 2</b-tab>
    </b-tabs>
  </div>
</template>

<script>

import UserManager from '@/components/SystemSettings/UserManager.vue';
import EQManager from '@/components/SystemSettings/EquipmentManager.vue';

export default {
  components: {
    UserManager, EQManager
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
  top: 50px;
}
</style>