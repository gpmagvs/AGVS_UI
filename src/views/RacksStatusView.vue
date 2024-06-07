<template>
  <div class="rack-status-view custom-tabs-head p-1">
    <b-tabs>
      <b-tab v-for="Rack in WIPData" :key="Rack.WIPName" :title="Rack.WIPName">
        <div class="rack-container d-flex flex-row justify-content-center border">
          <RackStatus :rack_info="Rack"></RackStatus>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>
<script>
import RackStatus from '@/components/RacksStatusView/RackStatus.vue'
import { EqStore } from '@/store'
export default {
  components: {
    RackStatus,
  },
  data() {
    return {
    }
  },
  computed: {
    WIPData() {
      return EqStore.getters.WIPData
    },
  }
}
</script>
<style lang="scss">
.rack-status-view {}
</style>