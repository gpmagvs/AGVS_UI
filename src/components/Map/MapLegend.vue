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

    <div class="legend-item-container" v-if="IsAnyTowLayerEQExist">
      <div class="image-icon unload-and-loadable"></div>
      <div class="desc">{{ $t('Map.MapLegend.UnLoadLoadable') }}</div>
    </div>
    <div class="legend-item-container">
      <div class="image-icon maintain"></div>
      <div class="desc">{{ $t('Map.MapLegend.Maintaining') }}</div>
    </div>

    <div class="legend-item-container agv-container" v-for="(item,key) in CustomAGVStyles" :key="key" @click="HandleAGVLedgendClick(key)" @contextmenu.prevent="onContextMenu($event, item)">
      <div class="image-icon agv">
        <div class="agv-icon" v-bind:style="{ backgroundColor:item.DisplayColor }"></div>
      </div>
      <div class="desc">{{key}}</div>
    </div>
    <div v-if="showAgvContextmenu" ref="agv_contextmenu" class="agv-contextmunu border rounded" v-bind:style="contextmunuStyle">
      <div class="header d-flex flex-row border-bottom">
        <span class="flex-fill text-start font-weight-bold">{{ selectedAGVName }}</span>
        <i style="cursor: pointer; " @click="()=>{showAgvContextmenu=false;}" class="bi bi-x-circle-fill text-danger"></i>
      </div>
      <div class="d-flex flex-column">
        <b-button variant="primary" @click="HandleLockAGVBtnClick">鎖定</b-button>
        <!-- <b-button @click="HandleLockAGVBtnClick">鎖定</b-button> -->
      </div>
    </div>
  </div>
</template>

<script>
import { MapStore } from './store';
import { EqStore } from '@/store';
import bus from '@/event-bus';
export default {
  data() {
    return {
      showAgvContextmenu: false,
      selectedAGVName: '',
      contextmunuStyle: {
        bottom: '0px'
      }
    }
  },
  computed: {
    CustomAGVStyles() {
      return MapStore.getters.CustomAGVStyles
      // this.DisplayText = text
      //this.DisplayColor = color//
    },
    IsAnyTowLayerEQExist() {
      return EqStore.getters.AnyTwoLayerEqExist;
    }
  },
  methods: {
    HandleAGVLedgendClick(agvName) {
      bus.emit('/cancel_tracking_agv');
      bus.emit('/show_agv_at_center', agvName)
      this.showAgvContextmenu = false;

    },
    onContextMenu(event, item) {
      //alert(key)
      console.log(item)
      this.selectedAGVName = item.DisplayText;
      var totalAGVNum = Object.keys(this.CustomAGVStyles).length;
      this.contextmunuStyle.bottom = item.Index + 1 == totalAGVNum ? '15px' : `${55 * (totalAGVNum - item.Index - 1)}px`;
      this.showAgvContextmenu = true;
    },
    HandleLockAGVBtnClick() {
      bus.emit('invoke-agv-lock', this.selectedAGVName)

    }
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
    .unload-and-loadable {
      background-color: rgba(10, 101, 69, 0.6);
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

  .agv-container:hover {
    background-color: rgb(13, 110, 253);
    .desc {
      color: white;
    }
    cursor: pointer;
  }

  .agv-contextmunu {
    position: absolute;
    width: 140px;
    left: 95%;
    height: auto;
    padding-inline: 3px;
    background-color: white;
  }
}
</style>