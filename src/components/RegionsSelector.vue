<template>
  <!-- 這裡不可以有 div 否則雙向綁定會失效 -->
  <el-select style="width:120px" v-model="selectedRegion" @change="handleChange">
    <el-option
      v-for="opt in valid_map_regions_options"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"></el-option>
  </el-select>
</template>

<script>
import { MapStore } from './Map/store';
import { GetValidRegionOptions } from '@/api/MapAPI.js'
export default {
  props: {
    default: {
      type: String,
    },
  },
  data() {
    return {
      selectedRegion: this.default,
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
      this.valid_map_regions_options = MapStore.getters.RegionOptions
      if (!this.valid_map_regions_options)
        this.valid_map_regions_options = await GetValidRegionOptions();
      this.valid_map_regions_options.unshift({ label: '不分區', value: 'all' })
    }, 10);
  },
}
</script>

<style></style>