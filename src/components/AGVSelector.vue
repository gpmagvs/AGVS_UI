<template>
  <el-select v-model="selected" @change="HandleSelectChanged">
    <el-option v-for="name in agvNameList" :key="name" :label="name" :value="name"></el-option>
  </el-select>
</template>
<script>
import { agv_states_store } from '@/store'

export default {
  props: {
    default: {
      type: String,
    },
  },
  data() {
    return {
      selected: this.value
    }
  },
  methods: {
    HandleSelectChanged() {
      //this.$emit('switch', this.isChecked);
    }
  },
  computed: {
    agvNameList() {
      return agv_states_store.getters.AGVNameList;
    },
  },
  mounted() {
    this.selected = this.default;
  },
}
</script>
<style></style>