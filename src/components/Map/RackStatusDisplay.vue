<template>
  <div class="rack-status-display" :style="dynamicStyle">
    <div class="buffer-cargo-exist-container">
      <!-- rack column display -->
      <div
        v-for="index in [2,1,0]"
        :key="`${tagNumber}-${index}`"
        class="port"
        v-bind:class="[getCargoExisStateClass(tagNumber,index),index==0?'first-slot':'']"
        @click="HandleRackPortClicked(tagNumber,index)"
        @mouseover="HandleRackPortMouseOver(index)  "
        @mouseleave="HandleRackPortMouseLeave(index)"
      >
        <!-- <div v-if="true" class="port-tooltip" :style="dynamicTooltipStyle"> -->
        <div v-if="isPortHover[index] && !IsRotated" class="port-tooltip" style="z-index: 2323;">
          <div class="tooltip-content">
            <div>Cargo ID:</div>
            <el-button :loading="cargoIdLoading" text class="text-primary">{{displayCargoID}}</el-button>
          </div>
        </div>
        <div v-if="isPortHover[index] && IsRotated" :style="dynamicTooltipStyle">
          <div class="tooltip-content" :style="dynamicToolTipContentStyle">
            <div>Cargo ID:</div>
            <el-button :loading="cargoIdLoading" text class="text-primary">{{displayCargoID}}</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store, { EqStore, TaskStore } from '@/store';
import bus from '@/event-bus.js';
import { MapPointModel } from './mapjs';
export default {
  props: {
    tagNumber: {
      type: Number,
      default: 0
    },
    pointData: {
      type: Object,
      default() {
        return new MapPointModel();
      }
    },
    dynamicStyle: {
      type: Object,
      default() {
        return {
          position: 'absolute',
          left: '0px',
          top: '0px',
          transform: 'translate(0, -50%)', // 垂直置中
          zIndex: 1
        }
      }
    }
  },
  data() {
    return {
      isPortHover: {
        2: false,
        1: false,
        0: false
      },
      displayCargoID: '556BBDDDS',
      cargoIdLoading: false
    }
  },
  methods: {
    getCargoExisStateClass(tagNumber, slot) {
      let className = '';
      const cargoState = EqStore.getters.QueryCargoStateOfRackPort(tagNumber, slot);
      if (cargoState.cargoExist)
        className += ' exist-cargo';
      if (!cargoState.cargoExist && cargoState.cargoID != undefined && cargoState.cargoID != '')
        className += ' no-cargo-but-id-exist';
      if (TaskStore.getters.AnyOrderAssignTagAndSlot(tagNumber, slot))//TODO 是否有任務的終點或起點是這個儲格
        className += ' port-order-assigned';
      if (EqStore.getters.QueryPortDisabled(tagNumber, slot))
        className += ' port-disable';
      return className;
    },
    HandleRackPortClicked(tag, slot) {
      bus.emit('map-rack-port-clicked', { tag: tag, ptData: this.pointData, slot: slot })
    },
    HandleRackPortMouseOver(slot) {
      this.displayCargoID = '';
      this.isPortHover[slot] = true;
      this.cargoIdLoading = true;
      EqStore.dispatch('QueryCargoID', { tag: this.tagNumber, slot: slot }).then((res) => {
        setTimeout(() => {
          this.displayCargoID = res;
          this.cargoIdLoading = false;
        }, 200);
      });
    },
    HandleRackPortMouseLeave(slot) {
      this.isPortHover[slot] = false;
      this.cargoIdLoading = false;
      this.displayCargoID = '';
    }
  },
  computed: {
    dynamicTooltipStyle() {
      let rotateTheta = 0;
      let isRotated = false;
      if (this.dynamicStyle.transform) {
        rotateTheta = this.getRotationFromTransform;
        isRotated = rotateTheta != 0;
      }
      if (isRotated)
        return {
          transform: `rotate(${rotateTheta * -1}deg)`,
        }
      else
        return {};
    },
    dynamicToolTipContentStyle() {
      const rotateTheta = this.getRotationFromTransform;
      if (rotateTheta > 0 && rotateTheta <= 90)
        return {
          position: 'relative',
          right: '-40px',
          top: '-40px'
        }
      else if (rotateTheta < 0 && rotateTheta >= -90)
        return {
          position: 'relative',
          right: '10px',
          top: '-40px'
        }
      else {
        return {
          position: 'relative',
          right: '-30px',
          top: '-10px'
        };
      }
    },
    IsRotated() {
      let rotateTheta = 0;
      let isRotated = false;
      if (this.dynamicStyle.transform) {
        rotateTheta = this.getRotationFromTransform;
        isRotated = rotateTheta != 0;
      }
      return isRotated;
    },
    getRotationFromTransform() {
      const matches = this.dynamicStyle.transform.match(/rotate\(([-\d.]+)deg\)/);
      return matches ? parseFloat(matches[1]) : 0;
    }

  }
}
</script>

<style scoped lang="scss">
.rack-status-display {
  .buffer-cargo-exist-container {
    // background-color: red;
    // transform: rotate(-90deg);
    transform-origin: left top;
    .first-slot {
      border-bottom: 7px solid rgb(0, 0, 0) !important;
      height: calc(var(--map-rack-port-display-height) + 4px) !important;
      // background: red !important;
    }
    .port {
      width: var(--map-rack-port-display-width);
      height: var(--map-rack-port-display-height);
      background-color: rgba(161, 161, 161, 1);
      border: 1px dashed black;
    }
    .port:hover {
      cursor: pointer;
      border: 4px solid rgb(115, 255, 0);
    }
    .exist-cargo {
      background-color: var(--map-rack-port-cargo-exist-color);
    }
    .no-cargo-but-id-exist {
      background-color: var(--map-rack-port-no-cargo-but-id-exist-color);
    }
    .port-disable {
      border: 4px solid red;
    }
    .port-order-assigned {
      animation: rackHasOrderFlash 1s infinite;
    }

    @keyframes rackHasOrderFlash {
      0%,
      100% {
        border: 4px solid rgb(0, 3, 204);
      }
      50% {
        border: 3px solid grey;
      }
    }
    .port-tooltip {
      position: absolute;
      left: calc(var(--map-rack-port-display-width) + 10px);
      transform-origin: none !important;
    }
    .tooltip-content {
      font-size: 18px;
      background-color: white;
      border: 1px solid black;
      padding: 5px;
      border-radius: 5px;
      white-space: nowrap;
      width: fit-content;
      pointer-events: none;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 1px;
      font-weight: bold;
      .el-button {
        padding: 2px;
        font-size: 20px;
      }
    }
  }
}
</style>