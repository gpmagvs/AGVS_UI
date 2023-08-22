<template>
  <div class="map-quickly-action">
    <span v-text="mapname"></span>
  </div>
</template>

<script>
import { MapStore } from './store';
export default {
  computed: {
    mapname() {
      return MapStore.getters.MapName;
    }
  },
}
</script>

<style lang="scss" scoped>
.map-quickly-action {
  position: absolute;
  bottom: 37px;
  padding: 2px 5px;
  background-color: rgb(197, 197, 197);
  border: 1px solid rgb(136, 136, 136);
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
  opacity: 0.5;
}
</style>