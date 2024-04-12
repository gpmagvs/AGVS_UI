<template>
  <div class="d-flex justify-content-center">
    <!-- <div class="options">
      <el-checkbox label="僅顯示異常" v-model="only_show_abnormal_sensors"></el-checkbox>
    </div>-->
    <svg
      :width="diameter"
      :height="diameter"
      :viewBox="`${-center} ${-center} ${diameter} ${diameter}`">
      <!-- 绘制圆 -->
      <circle cx="0" cy="0" :r="radius" fill="transparent" stroke="grey" stroke-width="1" />
      <text
        v-for="deg in degrees"
        :key="deg"
        :x="0"
        :y="diameter / 2"
        text-anchor="middle"
        :fill="primary_color"
        font-size="14"
        :transform="`rotate(${deg - agv_angle} 0 0)`">{{ deg - 180 }}</text>
      <polygon
        :points="`0,${-radius} -15,${-radius + 15} 15,${-radius + 15}`"
        :fill="primary_color"
        stroke="black"
        stroke-width="0" />
      <!-- <line
        :x1="-radius"
        :y1="0"
        :x2="radius"
        :y2="0"
        stroke="grey"
        stroke-width="1"
        stroke-dasharray="5 5"
      />
      <line
        :x1="0"
        :y1="-radius"
        :x2="0"
        :y2="radius"
        stroke="grey"
        stroke-width="1"
        stroke-dasharray="5 5"
      />-->
      <!-- AGV旋轉圓周顯示 -->
      <line
        v-for="deg in degrees"
        :key="deg"
        class="line2"
        :x1="0"
        :y1="agv_radius"
        :x2="0"
        :y2="agv_radius - 5"
        :stroke="'grey'"
        stroke-width="1"
        :transform="`rotate(${deg - agv_angle} 0 0)`" />
      <circle v-if="false" :cx="0" :cy="0" :r="agv_radius" fill="transparent" stroke="grey" />
      <image
        xlink:href="@/assets/images/fork_sketch_topview.png"
        :x="-agv_car_size.width * 1.2 / 2"
        :y="-agv_car_size.length * 1.2 / 2"
        :width="agv_car_size.width * 1.2"
        :height="agv_car_size.length * 1.2" />
      <!-- 感測器狀態 -->
      <svg
        v-for="(data, key) in sensor_data"
        v-show="data.visible"
        :key="key"
        :width="440"
        :height="180"
        viewBox="-190 -50 380 100"
        :x="data.position.x - 222 + data.position.x_offset"
        :y="(-data.position.y) - 90"
        @click="SensorDotClickHandler(key)"
        @mousemove="SensorDotMouseHover"
        @mouseover="SensorDotMouseHoverDataTransfer(data)"
        @mouseleave="() => { sensorTooltipStyle.visibility = 'hidden' }">
        <!-- 點 -->
        <circle
          :cx="0"
          :cy="0"
          r="5"
          :fill="GetSensorColorByStatus(data.status)"
          :stroke="GetSensorColorByStatus(data.status)" />
        <!-- 外環 -->
        <circle
          :cx="0"
          :cy="0"
          r="9"
          fill="transparent"
          :stroke="GetSensorColorByStatus(data.status)" />
        <SensorStatusTooltipVue
          v-if="!only_show_abnormal_sensors || data.status != 0 || data.always_show_info"
          :sensorData="data"
          :position="data.textPosition"
          :xOffset="-data.position.x" />
      </svg>
    </svg>
    <div v-bind:style="sensorTooltipStyle" class="sensor-tooltip">{{ sensorTooltipStyle.name }}</div>
  </div>
</template>
  
<script>
import SensorStatusTooltipVue from './SensorStatusTooltip.vue';
import { AGVStatusStore } from '@/store'
import { ROS_STORE } from '@/store/ros_store'
export default {

  name: 'AngleMarks',
  props: {
    diameter: {
      type: Number,
      default: 550,
    },
    agv_car_size: {
      type: Object,
      default() {
        return {
          length: 300,
          width: 150
        }
      }
    },
    agv_laser_options: {
      type: Object,
      default() {
        return {
        }
      }
    },
    status: {
      type: String,
      default: 'safe'
    },
    sensor_data: {
      type: Object,
      default() {
        return {

        }
      }
    }
  },
  components: {
    SensorStatusTooltipVue,
  },
  data() {
    return {
      only_show_abnormal_sensors: true,
      center: this.diameter / 2,
      radius: this.diameter / 2 - 10,
      agv_radius: Math.sqrt(Math.pow(this.agv_car_size.length / 2, 2) + Math.pow(this.agv_car_size.width / 2, 2)),
      degrees: [],
      //
      sensorTooltipStyle: {
        top: '0',
        left: '0',
        name: ''
      }
    };
  },
  computed: {
    primary_color() {
      return this.status == 'safe' ? 'limegreen' : (this.status == 'warning' ? 'yellow' : 'red');
    },
    agv_angle() {
      return AGVStatusStore.getters.CurrentAngle;
    },
    module_information() {
      return ROS_STORE.getters.Module_Information;
    }
  },
  methods: {
    SensorDotClickHandler(key) {
      alert(key + ' clcickedddddd!!!')
    },
    CalulateVerticalLineX(style_data) {
      return style_data.line1.x_length * Math.cos(style_data.line1.rotation)
    },
    GetSensorColorByStatus(status) {
      if (status == 2)
        return 'red'
      if (status == 1)
        return 'orange'
      else
        return 'limegreen'
    },
    GetTextPosition(position) {
      if (position == 'top') {
        return { x: '110', y: '-20' }
      }
      else if (position == 'top-start') {
        return { x: '110', y: '-20' }
      }
      else if (position == 'top-end') {
        return { x: '110', y: '-20' }
      }
      else if (position == 'bottom') {
        return { x: '0', y: '18' }
      }
      else if (position == 'bottom-start') {
        return { x: '-15', y: '18' }
      }
      else if (position == 'bottom-end') {
        return { x: '15', y: '18' }
      }
      else {
        return { x: '0', y: '-18' }

      }
    },
    SensorDotMouseHover(e) {
      this.sensorTooltipStyle.top = `${e.pageY - 20}px`
      this.sensorTooltipStyle.left = `${e.pageX + 20}px`
      this.sensorTooltipStyle.visibility = 'visible'
    },
    SensorDotMouseHoverDataTransfer(data) {
      console.info(data)
      this.sensorTooltipStyle.name = data.name
    }
  },
  mounted() {
    // 生成0到360度，每隔10度的角度数组
    this.degrees = Array.from({ length: 37 }, (_, index) => index * 10);
  },
};
</script>
<style lang="scss" scoped>
.options {
  position: relative;
  left: 10px;
  top: 10px;
}

.line2 {
  color: #008000;
}

.sensor-tooltip {
  position: fixed;
  color: pink;
}
</style>