<template>
  <b-tabs class="w-100 my-2" v-model="tabSelected">
    <b-tab class title="專用/優先車輛指派設定">
      <DedicatedVehiclesSetting />
    </b-tab>
    <b-tab class title="尚未開放">
      <!-- <div class="tab-container">AAA</div> -->
    </b-tab>
  </b-tabs>
</template>

<script>
import DedicatedVehiclesSetting from './DedicatedVehiclesSetting.vue'
export default {
  components: {
    DedicatedVehiclesSetting
  },
  data() {
    return {
      tabSelected: 0
    }
  },
}
</script>

<style>
</style>