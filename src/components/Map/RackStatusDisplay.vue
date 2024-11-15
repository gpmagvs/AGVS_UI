<template>
  <div class="rack-status-display" :style="dynamicStyle">
    <div class="buffer-cargo-exist-container">
      <!-- rack column display -->
      <div
        v-for="index in [2,1,0]"
        :key="`${tagNumber}-${index}`"
        class="port"
        v-bind:class="getCargoExisStateClass(tagNumber,index)"
        @click="HandleRackPortClicked(tagNumber,index)"
        @mouseover="HandleRackPortMouseOver(index)  "
        @mouseleave="HandleRackPortMouseLeave(index)"
      >
        <div v-if="isPortHover[index]" class="port-tooltip">
          <div class="tooltip-content">
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
      if (EqStore.getters.QueryCargoExist(tagNumber, slot))
        className += ' exist-cargo';
      if (TaskStore.getters.AnyOrderAssignTagAndSlot(tagNumber, slot))//TODO 是否有任務的終點或起點是這個儲格
        className += ' port-order-assigned';
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
  }
}
</script>

<style scoped lang="scss">
.rack-status-display {
  .buffer-cargo-exist-container {
    // background-color: red;
    .port {
      width: var(--map-rack-port-display-width);
      height: var(--map-rack-port-display-height);
      background-color: rgba(161, 161, 161, 1);
      border: 1px dashed black;
    }
    .port:hover {
      cursor: pointer;
      border: 4px solid red;
    }
    .exist-cargo {
      background-color: var(--map-rack-port-cargo-exist-color);
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
      top: 0;
      font-size: 18px;
      left: calc(var(--map-rack-port-display-width) + 10px);
      background-color: white;
      border: 1px solid black;
      padding: 5px;
      border-radius: 5px;
      z-index: 32;
      white-space: nowrap;
      pointer-events: none;
      .tooltip-content {
        display: flex;
        flex-direction: row;
        gap: 8px;
        min-width: min-content;
        font-weight: bold;
        .el-button {
          padding: 2px;
          font-size: 20px;
        }
      }
    }
  }
}
</style>