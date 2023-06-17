<template>
  <!-- 這裡不可以有 div 否則雙向綁定會失效 -->
  <el-select v-model="selectedRegion" @change="handleChange">
    <el-option
      v-for="opt in valid_map_regions_options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    ></el-option>
  </el-select>
</template>

<script>
import { GetValidRegionOptions } from '@/api/MapAPI.js'
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectedRegion: this.value,
      valid_map_regions_options: [],

    }
  },
  methods: {
    handleChange(value) {
      this.selectedRegion = value;
      this.$emit('input', value);
    },
  },
  mounted() {
    setTimeout(async () => {
      this.valid_map_regions_options = await GetValidRegionOptions();
      this.valid_map_regions_options.unshift({ label: '不分區', value: 'all' })
    }, 10);
  },
}
</script>

<style>
</style>