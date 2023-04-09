<template>
  <div class="map card-like">
    <div class="title">
      <i class="bi bi-map"></i>MAP SHOW
    </div>
    <MapShow ref="home-map" :task_allocatable="true" style="height:95%"></MapShow>
  </div>
</template>

<script>
import MapShow from '../MapShow.vue';
import bus from '@/event-bus.js'

export default {
  components: {
    MapShow,
  },
  mounted() {
    // bus.emit('on_map_save_success', '');
    bus.on('on_map_save_success', () => {
      this.$refs['home-map'].Reload();
    });
  },
}
</script>

<style lang="scss" scoped>
.map {
}
</style>