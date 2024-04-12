<template>
  <line x1="0" y1="0" :x2="_line1_length" y2="0" stroke-dasharray="5 5"
    :stroke="statusColor" />
  <line
    v-if="show_step"
    :x1="_line1_length"
    y1="0"
    :x2="_line1_length"
    :y2="-step_height"
    :stroke="statusColor"
    stroke-dasharray="5 5" />
  <line
    :x1="_line1_length"
    :y1="-step_height"
    :x2="_line1_length + (isShowRight ? 20 : -20)"
    :y2="-step_height"
    :stroke="statusColor"
    stroke-dasharray="5 5" />
  <line
    :x1="_line1_length + (isShowRight ? 20 : -20)"
    :y1="show_step ? (this.show_bottom ? 10 : -30) : -15"
    :x2="_line1_length + (isShowRight ? 20 : -20)"
    :y2="show_step ? (this.show_bottom ? 50 : 10) : 25"
    :stroke="statusColor"
    stroke-width="2" />
  <text
    :x="_line1_length + (isShowRight ? 66 : -60)"
    :y="show_step ? (this.show_bottom ? 20 : -20) : -5"
    text-anchor="middle"
    fill="white"
    font-size="14">{{ sensorData.name }}</text>
  <rect
    :x="_line1_length + (isShowRight ? 25 : -90)"
    :y="show_step ? (this.show_bottom ? 25 : -15) : 3"
    :width="60"
    :height="20"
    :fill="statusColor"
    text="123" />
  <text
    :x="_line1_length + (isShowRight ? 50 : -65)"
    :y="show_step ? (this.show_bottom ? 38 : 0) : 18"
    text-anchor="middle"
    fill="white"
    font-size="14">{{ SensorStatusText }} </text>
  <text
    v-for="item in module_data_itmes" :key="item.index + item.item"
    :x="_line1_length + (isShowRight ? 25 : -90)"
    :y="show_step ? (this.show_bottom ? 28 : 20 + (item.index * 12)) : 38 + (item.index * 12)"
    text-anchor="left"
    fill="gold"
    font-size="10">{{ item.item }} </text>
</template>

<script>
import clsSensorStatus from '@/ViewModels/clsSensorStatus';

export default {
  props: {

    line1_length: {
      type: Number,
      default: 60
    },
    position: {
      type: String,
      default: 'right-top'
    },
    xOffset: {
      type: Number,
      default: 0
    },

    sensorData: {
      type: Object,
      default() {
        return new clsSensorStatus('sensor')
      }
    }
  },
  computed: {
    isShowRight() {
      return this.position.includes('right')
    },
    _line1_length() {
      return (this.line1_length) * (this.isShowRight ? 1 : -1);
    },
    show_step() {
      return this.position.includes('-')
    },
    show_bottom() {
      return this.position.includes('bottom')
    },
    step_height() {
      return (this.show_bottom ? -1 : 1) * (this.show_step ? 20 : 0)
    },
    SensorStatusText() {
      if (this.sensorData.status == 0)
        return 'Normal'
      if (this.sensorData.status == 1)
        return 'Warning'
      if (this.sensorData.status == 2)
        return 'Alarm'
    },
    statusColor() {
      if (this.sensorData.status == 0)
        return 'limegreen'
      if (this.sensorData.status == 1)
        return 'orange'
      if (this.sensorData.status == 2)
        return 'red'
    },
    module_data_itmes() {
      var items_ary = this.sensorData.module_data.split(',')
      var outputs = []
      var index = 0;
      items_ary.forEach(element => {
        outputs.push({
          index: index,
          item: element
        })
        index += 1
      });
      return outputs
    }
  },
  data() {
    return {
    }
  },
}
</script>

<style lang="scss" scoped></style>