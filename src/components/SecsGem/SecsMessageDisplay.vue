<template>
  <div class="border rounded p-1">
    <div class="d-flex justify-content-end p-2" style="background: #1d1e1f; color: #ffffff">
      <span>Messages: {{ secsmessages.length }}</span>
    </div>
    <div class="mb-2">
      <el-input
        v-model="searchText"
        clearable
        placeholder="Input keyword to search messages"
        style="background: #2b2b2b; color: #ffffff; border: 1px solid #4a4a4a"
        class="dark-theme-input"
      >
        <template #prefix>
          <i class="el-icon-search" style="color: #909399"></i>
        </template>
      </el-input>
    </div>
    <div>
      <el-button
        size="small"
        @click="scrollToTop"
        style="position: fixed; bottom: 50px; right: 40px; z-index: 1000"
      >Scroll to Top</el-button>
      <el-table
        ref="secsTable"
        :data="filterMessages"
        height="980px"
        style="width: 100%;"
        :header-cell-style="{background:'#1d1e1f',color:'#ffffff'}"
        :cell-style="{background:'#2b2b2b',color:'#ffffff'}"
        :empty-text="''"
      >
        <el-table-column prop="message" label="Message">
          <template #default="scope">
            <template
              v-if="scope.row.message.match(/\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\.\d{4}/)"
            >
              <span
                class="timestamp"
              >{{ scope.row.message.match(/\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\.\d{4}/)[0] }}</span>
              <pre class="message-text">{{ scope.row.message.substring(scope.row.message.match(/\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}\.\d{4}/)[0].length) }}</pre>
            </template>
            <template v-else>
              <pre class="message-text"> {{ scope.row.message }} </pre>
            </template>
          </template>
        </el-table-column>
        <template #empty>
          <div style="background: #2b2b2b; height: 100%; width: 100%;"></div>
        </template>
      </el-table>
    </div>
  </div>
</template>
<script>

import store from '@/store';

export default {
  data() {
    return {
      searchText: '',
    }
  },
  computed: {
    secsmessages() {
      return store.state.secsmessages.reverse().map(message => {
        return {
          message: message,
        }
      });
    },
    filterMessages() {
      if (this.secsmessages.length === 0) {
        return [];
      }

      if (!this.searchText) {
        return this.secsmessages;
      }
      try {
        const searchTerms = this.searchText.trim().toLowerCase().split(/\s+/);
        return this.secsmessages.filter(message => {
          const messageText = message.message.toLowerCase();
          return searchTerms.every(term => messageText.includes(term));
        });
      } catch (error) {
        console.error('Error filtering messages:', error);
        return [];
      }
    }
  },
  mounted() {
    store.dispatch('DownLoadSecsNewestMessages')
  },
  methods: {
    scrollToTop() {
      this.$refs.secsTable.scrollTo(0, 0);
    }
  }
}
</script>

<style scoped>
.timestamp {
  color: #dbc605;
}
.message-text {
  color: #ffffff;
}
</style>
