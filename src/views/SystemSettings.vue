<template>
  <div class="sys-settings p-3">
    <b-tabs @activate-tab="TabActiveHandle" size>
      <b-tab title="Tab 1">This is the content of Tab 1</b-tab>
      <b-tab title="電池管理">This is the content of Tab 2</b-tab>
      <b-tab title="用戶管理">
        <UserManager ref="user_manager"></UserManager>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>

import UserManager from '@/components/SystemSettings/UserManager.vue';

export default {
  components: {
    UserManager,
  },
  data() {
    return {
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
    }
  },
}
</script>

<style lang="scss">
.sys-settings {
  .nav-item {
    button {
      font-size: 20px;
      font-weight: bold;
    }
  }
}
</style>