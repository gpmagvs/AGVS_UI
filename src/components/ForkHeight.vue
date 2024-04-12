<template>
  <div @click="HandleClicked" class="fork-height">
    <div v-bind:class="IsForkHeightAboveSafty ? 'bg-warning text-light border' : ''"> {{ height }} <span>cm</span>
    </div>
    <!-- <div>{{ time }}</div> -->
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import { AGVStatusStore } from '@/store'
export default {
  data() {
    return {
    }
  },
  computed: {
    height() {
      return AGVStatusStore.getters.AGVStatus.ZAxisDriverState.position.toFixed(3);
    },
    IsForkHeightAboveSafty() {
      return AGVStatusStore.getters.AGVStatus.IsForkHeightAboveSafty;
    },

  },
  methods: {
    HandleClicked() {
      bus.emit('on-fork-height-click');
    }
  },
  mounted() {

  },
}
</script>

<style lang="scss">
.fork-height {
  font-size: 20px;

  span {
    font-size: smaller;
  }
}
</style>