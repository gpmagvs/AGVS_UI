<template>
  <div
    v-show="show"
    class="map-context-menu-container border rounded p-3"
    v-bind:style="locationStyle"
  >
    <div class="title text-light">{{ getTitle }}</div>
    <MenuForVehicle v-if="useFor=='agv'" :agvName="options.agvName"></MenuForVehicle>
  </div>
</template>

<script>
import MenuForVehicle from './MenuForVehicle.vue';
export default {
  components: {
    MenuForVehicle,
  },
  computed: {
    getTitle() {
      if (this.useFor == 'agv') {
        return this.options.agvName;
      }
      return '';
    }
  },
  data() {
    return {
      show: false,
      locationStyle: {
        top: '0px',
        left: '0px'
      },
      useFor: '',
      options: {
        agvName: '',
        stationName: ''
      }
    }
  },
  methods: {
    showAt(mouseLocation = [0, 0], useFor = 'agv', option = { agvName: '', stationName: '' }) {
      //   alert(mouseLocation)
      this.useFor = useFor;
      this.options = option;
      this.locationStyle.top = mouseLocation[1] + 'px';
      this.locationStyle.left = mouseLocation[0] + 'px';
      this.show = true;
    },
    hide() {
      this.show = false;
    }
  },
}
</script>

<style lang="scss" scoped>
.map-context-menu-container {
  background-color: rgba(46, 91, 158, 0.548);
  position: fixed;
  z-index: 3333333;
  top: 333px;
  left: 10px;
}
</style>