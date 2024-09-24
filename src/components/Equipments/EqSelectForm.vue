<template>
  <el-dialog draggable v-model="visible" :modal="false" @close="updateVisible(false)">
    <div class="d-flex py-3">
      <h3 class="flex-fill text-start">
        <b>選擇設備</b>
      </h3>
      <el-button size="large" type="primary" @click="confirm">確認選取</el-button>
    </div>
    <el-table ref="table" :data="eq_store" border :height="800">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="Name" label="Name"></el-table-column>
      <el-table-column prop="TagID" label="Tag"></el-table-column>
    </el-table>
  </el-dialog>
</template>
<script>
import { EqStore } from '@/store';
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      visible: this.value,
    }
  },
  computed: {
    eq_store() {
      return EqStore.state.EqOptions;
    }
  },
  watch: {
    value(newValue) {
      this.visible = newValue;  // 監聽父組件的 value 變化

    },
    visible(newValue) {
      this.$emit('input', newValue);  // 當 visible 改變時，通知父組件
    }
  },
  methods: {
    updateVisible(val) {
      this.visible = val;  // 更新 visible
      if (!val) {
        this.cancelSelectAll();
      }
    },
    selectAll() {
      this.$refs.table.clearSelection();  // 清除選擇
      this.eq_store.forEach(row => {
        this.$refs.table.toggleRowSelection(row, true);  // 選擇所有行
      });
    },
    cancelSelectAll() {
      this.$refs.table.clearSelection();  // 清除選擇
    },
    confirm() {
      this.$emit('confirm', this.$refs.table.getSelectionRows());
    }
  }
}
</script>
