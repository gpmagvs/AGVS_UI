<template>
  <div class="map-legend">
    <div class="legend-item-container">
      <div class="image-icon unloadable"></div>
      <div class="desc">{{ $t('Map.MapLegend.Unloadble') }}</div>
    </div>
    <div class="legend-item-container">
      <div class="image-icon loadable"></div>
      <div class="desc">{{ $t('Map.MapLegend.Loadable') }}</div>
    </div>
    <div class="legend-item-container">
      <div class="image-icon maintain"></div>
      <div class="desc">{{ $t('Map.MapLegend.Maintaining') }}</div>
    </div>

    <div class="legend-item-container" v-for="(item,key) in CustomAGVStyles" :key="key">
      <div class="image-icon agv">
        <div class="agv-icon" v-bind:style="{ backgroundColor:item.DisplayColor }"></div>
      </div>
      <div class="desc">{{key}}</div>
    </div>
  </div>
</template>

<script>
import { MapStore } from './store';
export default {
  computed: {
    CustomAGVStyles() {
      return MapStore.getters.CustomAGVStyles
      // this.DisplayText = text
      //this.DisplayColor = color//
    },
  },
}
</script>

<style lang="scss" scoped>
.map-legend {
  .legend-item-container {
    margin: 5px;
    display: flex;
    .image-icon {
      background-color: blue;
      width: 20%;
      border-radius: 0.5rem;
      opacity: 0.9;
    }
    .desc {
      margin-left: 15px;
      color: rgb(92, 92, 92);
      letter-spacing: 2px;
      font-weight: bold;
    }

    .loadable {
      background-color: rgb(255, 244, 136);
    }
    .unloadable {
      background-color: rgb(180, 213, 248);
    }
    .maintain {
      background-color: rgb(255, 127, 127);
    }
    .agv {
      background-color: transparent;
      padding-left: 1.2%;
      .agv-icon {
        width: 2rem;
        background-color: blue;
        height: 2rem;
        border-radius: 6rem;
      }
    }
  }
}
</style>