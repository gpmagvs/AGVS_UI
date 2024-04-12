<template>
  <div class="d-flex flex-column">
    <!-- <el-input-number v-model="offset_x"></el-input-number>
    <el-input-number v-model="offset_y"></el-input-number>
    <el-input-number v-model="theta"></el-input-number>-->

    <div class="reader-info text-start my-3">
      <div class="border-bottom my-1">Tag中心偏差</div>
      <div class="d-flex">
        <div class="label">Tag</div>
        <div class="tag value">{{tag}}</div>
      </div>
      <div class="d-flex">
        <div class="label">X(mm)</div>
        <div class="value">{{offset_x}}</div>
      </div>
      <div class="d-flex">
        <div class="label">Y(mm)</div>
        <div class="value">{{offset_y}}</div>
      </div>
      <div class="d-flex">
        <div class="label">Theta(。)</div>
        <div class="value">{{theta}}</div>
      </div>
    </div>
    <svg class width="100px" height="100px" view-box="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="green" />
      <line
        x1="0"
        x2="100"
        y1="50"
        y2="50"
        stroke="white"
        stroke-dasharray="5 5"
        stroke-width="0.5"
      />
      <line
        x1="50"
        x2="50"
        y1="100"
        y2="0"
        stroke="white"
        stroke-dasharray="5 5"
        stroke-width="0.5"
      />
      <rect
        :transform="Transform"
        :x="40+offset_y"
        :y="25+offset_x"
        width="20"
        height="50"
        fill="#ff000087"
      />
      <!-- <circle :cx="loc_X" :cy="loc_Y" r="4" fill="#ed2727" /> -->
      <!-- <line x1="50" x2="50" y1="50" y2="25" stroke="white" stroke-width="2" /> -->
    </svg>
  </div>
</template>

<script>
import { AGVStatusStore } from '@/store'
export default {
  props: {

  },
  data() {
    return {
    }
  },
  computed: {
    tag() {
      return AGVStatusStore.getters.AGVStatus.BCR_State_MoveBase.tagID
    },
    offset_x() {
      return AGVStatusStore.getters.AGVStatus.BCR_State_MoveBase.xValue
    },
    offset_y() {
      return AGVStatusStore.getters.AGVStatus.BCR_State_MoveBase.yValue
    },
    theta() {
      return Math.round(AGVStatusStore.getters.AGVStatus.BCR_State_MoveBase.theta) + ''

    },
    loc_X() {
      return 50 + this.offset_x
    },
    loc_Y() {
      return 50 + this.offset_y
    },
    Transform() {
      return `rotate(${180 - this.theta} ${this.loc_X} ${this.loc_Y})`
    }
  },
}
</script>

<style lang="scss" scoped>
.reader-info {
  .label {
    background-color: black;
    width: 75px;
    padding: 2px;
    padding-left: 4px;
    text-align: left;

    border-bottom-left-radius: 3px;
    border-top-left-radius: 2px;
    border-right: 3px solid rgb(24, 112, 212);
  }
  .value {
    font-weight: 700;
    background-color: orange;
    text-align: center;
    width: 50px;
    border-bottom-right-radius: 3px;
    border-top-right-radius: 9px;
  }
  .tag {
    background-color: rgb(148, 148, 148);
  }
  div {
    margin-block: 1px;
  }
}
</style>