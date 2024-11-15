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
      ></div>
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
    }
  }
}
</script>

<style scoped lang="scss">
.rack-status-display {
  .buffer-cargo-exist-container {
    // background-color: red;
    .port {
      width: 18px;
      height: 18px;
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
  }
}
</style>