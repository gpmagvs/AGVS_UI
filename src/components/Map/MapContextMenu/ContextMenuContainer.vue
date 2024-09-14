<template>
  <div
    v-show="show"
    class="map-context-menu-container border rounded p-3"
    v-bind:style="locationStyle"
  >
    <div class="title text-light">{{ getTitle }}</div>
    <MenuForVehicle v-if="useFor=='agv'" :agvName="options.agvName"></MenuForVehicle>
    <MenuForEQStationSelected v-if="useFor=='eq'" :eqTag="stationTag"></MenuForEQStationSelected>
    <MenuForMultiPointsSelected
      v-if="useFor=='multi-point'"
      :selectedFeatures="options.selectedFeatures"
      @onDelete="()=>{
        show=false;
      }"
    ></MenuForMultiPointsSelected>
  </div>
</template>

<script>

/**地圖右鍵選單參數模型 */
export class ContextMenuOptions {
  constructor() {
    this.agvName = '';
    this.stationName = '';
    this.selectedFeatures = [];
    this.selectedFeature = new Feature();
  }
}

import MenuForVehicle from './MenuForVehicle.vue';
import MenuForMultiPointsSelected from './MenuForMultiPointsSelected.vue';
import MenuForEQStationSelected from './MenuForEQStationSelected.vue';
import { Feature } from 'ol';

/**地圖右鍵選單容器 */
export default {
  components: {
    MenuForVehicle, MenuForMultiPointsSelected, MenuForEQStationSelected
  },
  computed: {
    getTitle() {
      if (this.useFor == 'agv')
        return this.options.agvName;
      else if (this.useFor == 'eq') {
        return this.options.selectedFeature.get('data').Graph.Display;

      } else if (this.useFor == 'multi-point') {
        return `多點編輯 [${this.options.selectedFeatures.length}]`;
      }
      return '';
    },
    stationTag() {
      if (!this.options.selectedFeature)
        return -1;
      return this.options.selectedFeature.get('data').TagNumber;
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
      options: new ContextMenuOptions()
    }
  },
  methods: {
    showAt(mouseLocation = [0, 0], useFor = 'agv', option = new ContextMenuOptions()) {
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