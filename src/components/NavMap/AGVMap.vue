<template>
  <div style="height: 600px; width: 800px">
    <l-map :zoom="mapZoom" :center="mapCenter" style="height: 100%">
      <!-- <l-tile-layer :url="tileLayerUrl"></l-tile-layer> -->

      <!-- 圖層一：顯示三個點 -->
      <l-geo-json :geojson="pointsGeoJson" :options="pointsGeoJsonOptions" />

      <!-- 圖層二：顯示點之間的連線 -->
      <l-geo-json :geojson="linesGeoJson" :options="linesGeoJsonOptions" />
    </l-map>
  </div>
</template>
  
  <script>
import { ref } from 'vue';
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { MapStore } from '@/store';

export default {
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
  },
  setup() {
    const mapCenter = ref([0, 0]); // 设置地图初始中心为 [0, 0]
    const mapZoom = ref(2); // 设置初始缩放级别
    const tileLayerUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    // 圖層一的 GeoJSON 數據
    var pointsGeoJson = ref({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            color: "red",
            name: "red658856885687"
          },
          geometry: {
            type: "Point",
            coordinates: [0, 1], // 第一個點的經緯度坐標
          },
        },
        {
          type: "Feature",
          properties: {
            color: "blue",
            name: "blue"
          },
          geometry: {
            type: "Point",
            coordinates: [0, 2], // 第二個點的經緯度坐標
          },
        },
        {
          type: "Feature",
          properties: {
            color: "green",
            name: "green"
          },
          geometry: {
            type: "Point",
            coordinates: [0, 3], // 第三個點的經緯度坐標
          },
        },
      ],
    });
    // 圖層二的 GeoJSON 數據
    var linesGeoJson = ref({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 1], // 第一個點的經緯度坐標
              [0, 2], // 第二個點的經緯度坐標
            ],
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 1], // 第一個點的經緯度坐標
              [22, 3], // 第三個點的經緯度坐標
            ],
          },
        },
      ],
    });

    // 圖層一的 GeoJSON 样式选项
    const pointsGeoJsonOptions = ref({
      pointToLayer: (feature, latLng) => {
        const icon = L.divIcon({
          className: "custom-icon station-icon", // 添加 CSS 类名，用于样式控制
          html: `<span>${feature.properties.name}</span>`, // 在标记上方添加文字
        });
        return L.marker(latLng, { icon });
      },
    });
    // 圖層二的 GeoJSON 样式选项
    const linesGeoJsonOptions = ref({
      style: {
        color: "green", // 线段的颜色为绿色
        weight: 3, // 线段的宽度
      },
    });

    async function GetMapData() {
      var geoMapdata = await MapStore.dispatch('DownloadGeoMapData')
      return geoMapdata;
    }
    return {
      mapCenter,
      mapZoom,
      tileLayerUrl,
      pointsGeoJson,
      pointsGeoJsonOptions,
      linesGeoJson,
      linesGeoJsonOptions,
      GetMapData
    };
  },
  async mounted() {
    var mapdata = await this.GetMapData()
    this.pointsGeoJson = mapdata.PointsGeoJsonData
    this.linesGeoJson = mapdata.LinesGeoJsonData
  }
};
  </script>
  
  <style lang="scss">
.custom-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #464646;
  border: 2px solid #333;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: #333;
  font-weight: bold;

  span {
    position: absolute;
    color: blue;
    top: -20px;
    right: -40px;
    width: 50px;
    text-align: left;
  }
}

.station-icon {
  background-color: #ff0077;
}
</style>
  