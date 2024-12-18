<template>
  <div>
    <div class="layer-control">
      <label>Opacity</label>
      <el-slider
        v-model="trafficStateLayerOptions.opacity"
        :min="0"
        :max="1"
        :step="0.01"
        size="small"
      />
      <label>Blur</label>
      <el-slider
        v-model="trafficStateLayerOptions.blur"
        :min="0"
        :max="50"
        :step="1"
        size="small"
        @input="UpdateTrafficStateLayerOptions"
      />
      <label>Radius</label>
      <el-slider
        v-model="trafficStateLayerOptions.radius"
        :min="1"
        :max="50"
        :step="1"
        size="small"
        @input="UpdateTrafficStateLayerOptions"
      />
    </div>
    <Map
      class="bg-light border"
      ref="map"
      id="traffic_map"
      :editable="false"
      :agv_show="false"
      :station_show="true"
      :rackInfoShow="false"
      :eq_lduld_status_show="false"
    ></Map>
  </div>
</template>

<script>
import Map from '@/components/Map/Map.vue'
import { Feature } from 'ol'
import { Point } from 'ol/geom.js';
import { GetTrafficStateData } from '@/api/TrafficStateQueryAPI'

export default {
  data() {
    return {
      trafficStateLayerOptions: {
        opacity: 1,
        blur: 25,
        radius: 15
      }
    }
  },
  components: {
    Map
  },
  computed: {
    map() {
      return this.$refs.map;
    },
    trafficStateLayer() {
      return this.map.TrafficStateLayer;
    }
  },
  methods: {
    UpdateTrafficStateLayerOptions() {
      this.trafficStateLayer.set('radius', this.trafficStateLayerOptions.radius);
      this.trafficStateLayer.set('blur', this.trafficStateLayerOptions.blur);
      this.trafficStateLayer.set('opacity', this.trafficStateLayerOptions.opacity);
    },
    UpdateTrafficStateLayer(traffic_state_data_features = []) {
      this.trafficStateLayer.getSource().clear();
      this.trafficStateLayer.getSource().addFeatures(traffic_state_data_features);
    },
    async Example() {
      let now = new Date();
      let taipeiOffset = 8; // UTC+8 for Taipei
      now.setHours(now.getHours() + taipeiOffset);
      let twoHoursAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      let data = await GetTrafficStateData(twoHoursAgo.toISOString(), now.toISOString());
      let traffic_state_data_features = []
      data.map(item => {
        var trafficFeature = new Feature({
          geometry: new Point(item.Coordination),
          weight: item.DurationNormalized
        })
        traffic_state_data_features.push(trafficFeature)
      })
      this.UpdateTrafficStateLayer(traffic_state_data_features);
    }
  },
  mounted() {
    this.Example();
    this.trafficStateLayer.set('radius', this.trafficStateLayerOptions.radius);
    this.trafficStateLayer.set('blur', this.trafficStateLayerOptions.blur);
    this.trafficStateLayer.set('opacity', this.trafficStateLayerOptions.opacity);
    this.trafficStateLayer.set('gradient', [
      'rgba(0, 0, 255, 0)',
      'rgba(0, 255, 0, 1)',
      'rgba(255, 255, 0, 1)',
      'rgba(255, 0, 0, 1)'
    ]);
  }
}
</script>

<style>
.layer-control {
  width: 150px;
  position: fixed;
  bottom: 51px;
  right: 135px;
  z-index: 1000;
  background-color: #ffffff80;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #3f3f3f47;
}
</style>