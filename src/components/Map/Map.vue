<template>
  <div>
    <button @click="AddNewAGV('test')">Change AGV LOC TEST</button>
    {{ MouseCoordination }}
    <div id="agv_map" class="agv_map"></div>
  </div>
</template>

<script>

import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import VectorSource from 'ol/source/Vector.js';
import LineString from 'ol/geom/LineString';
import { Pointer, DragPan } from 'ol/interaction'

import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import { getCenter } from 'ol/extent.js';
import View from 'ol/View.js';
import ImageLayer from 'ol/layer/Image.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { createStringXY } from 'ol/coordinate.js';
import { defaults as defaultControls } from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';

import { StationPointStyle, StationTextStyle, CreateStationPathStyles, AGVPointStyle } from './mapjs'

export default {
  data() {
    return {
      map: new Map(),
      PointLayer: new VectorLayer(),
      PointLinksLayer: new VectorLayer(),//路網(路線)
      AGVLocLayer: new VectorLayer(),
      AGVFeatures: [
        new Feature({
          geometry: new Point([330, 330]),

        }),
      ],
      MouseCoordination: undefined
    }
  },
  methods: {

    /**初始化站點塗層 */
    InitStationPointLayer() {

      var demo = [0, 1, 2, 3, 4]
      var stationPointFeatures = []
      for (let index = 0; index < demo.length; index++) {
        var demo_x = demo[index];
        const iconFeature = new Feature({
          geometry: new Point([demo_x * 1e2, 0])
        });
        iconFeature.set('index', demo_x)
        iconFeature.set('station_type', demo_x)
        iconFeature.set('targets', [demo_x + 1, demo_x - 2])
        var name = iconFeature.get('index') + '-Station'
        iconFeature.setStyle([StationPointStyle(demo_x), StationTextStyle(name)]);
        stationPointFeatures.push(iconFeature)
      }

      const vectorSource = new VectorSource({
        features: stationPointFeatures,
      });
      this.PointLayer = new VectorLayer({
        source: vectorSource,
      })
    },
    /**初始化路網路徑圖層 */
    InitStationPathLayer() {
      var stationFeatures = this.PointLayer.getSource().getFeatures()
      var stationLinkPathes = [];
      this.PointLayer.getSource().forEachFeature(feature => {
        var target_indexes = feature.get('targets')
        for (let index = 0; index < target_indexes.length; index++) {
          const pt_index = target_indexes[index];
          var target_feature = stationFeatures.find(f => f.get('index') == pt_index)
          if (target_feature) {
            let lineFeature = new Feature(
              {
                geometry: new LineString([feature.getGeometry().getCoordinates(), target_feature.getGeometry().getCoordinates()]),
              },
            );
            var isEqLink = target_feature.get('station_type') == 1;
            var path_id = `${feature.get('index')}_${pt_index}`
            lineFeature.set('path_id', path_id)
            lineFeature.set('isEqLink', isEqLink)
            // lineFeature.set('isPathClose', isEqLink)
            console.info(`路線:${path_id} create.EQLink? =>${isEqLink}`);
            lineFeature.setStyle(CreateStationPathStyles(lineFeature))
            stationLinkPathes.push(lineFeature)
          }
        }
      })
      console.info(stationLinkPathes)
      const vectorSource = new VectorSource({
        features: stationLinkPathes,
      });
      this.PointLinksLayer = new VectorLayer({
        source: vectorSource,
      })
    },
    InitAGVLocLayer() {

      this.AGVFeatures[0].setStyle(AGVPointStyle('AGV#1', 'orange'))
      const source = new VectorSource({
        features: this.AGVFeatures
      })
      this.AGVLocLayer = new VectorLayer({
        source: source
      })
    },
    InitMapEventHandler() {
      var this_vue = this;
      // 创建一个拖动交互操作
      var dragInteraction = new Pointer({

        handleDownEvent: function (event) {
          debugger
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });
          if (!feature)
            return false;

          this.feature_ = feature;
          this.coordinate_ = event.coordinate;
          return true;
        },
        handleDragEvent: function (event) {

          var deltaX = event.coordinate[0] - this.coordinate_[0];
          var deltaY = event.coordinate[1] - this.coordinate_[1];
          var geometry = this.feature_.getGeometry();
          geometry.translate(deltaX, deltaY);
          this_vue.MouseCoordination = this.coordinate_ = event.coordinate;
          //   that.UpdateStationPathLayer();
          //   //更新本地圖資
          //   var featureID = that.selected_feature.getId();
          //   var index = parseInt(featureID.split(':')[1])

          //   var coordinates = that.selected_feature.getGeometry().getCoordinates();
          //   that.map_data.Points[index].Graph.X = Math.round(coordinates[0] / 1000.0, 0);
          //   that.map_data.Points[index].Graph.Y = Math.round(coordinates[1] / -1000.0, 0);
          //   that.UpdatePathPlanRender(that.path_plan_tags);

        },

        handleUpEvent: function (ev) {
          this.feature_ = null;
          this.coordinate_ = null;
          this_vue.InitStationPathLayer();
        },
        handleMoveEvent: function (event) {
          debugger
          this_vue.MouseCoordination = event.coordinate
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            return feature;
          });
          if (feature) {
            map.getTargetElement().style.cursor = 'pointer';
          } else {
            map.getTargetElement().style.cursor = '';
          }
        }
      });
      this.map.addInteraction(dragInteraction);

      //   this.map.on('pointermove', (ev) => {
      //     this.MouseCoordination = ev.coordinate
      //   })
      //   this.map.on('click', (ev) => {

      //     debugger
      //     this.AddPoint(ev.coordinate);
      //     var selected_feature = this.map.forEachFeatureAtPixel(ev.pixel, (feature) => { return feature })
      //   })
      //   this.map.on('pointerdrag', (ev) => {
      //     debugger
      //     var selected_feature = this.map.forEachFeatureAtPixel(ev.pixel, (feature) => { return feature })
      //     var deltaX = ev.coordinate[0] - this.MouseCoordination[0];
      //     var deltaY = ev.coordinate[1] - this.MouseCoordination[1];
      //     var geometry = selected_feature.getGeometry();
      //     geometry.translate(deltaX, deltaY);
      //     this.MouseCoordination = ev.coordinate;
      //   })
    },
    AddPoint(coordinate) {
      this.PointLayer.getSource().addFeature(new Feature({
        geometry: new Point(coordinate)
      }))
    },
    AddNewAGV(agvName) {
      var newAgvFeature = new Feature({
        geometry: new Point([0, 0])
      })
      newAgvFeature.setStyle(AGVPointStyle(agvName, 'red'))
      this.AGVFeatures.push(newAgvFeature)
      this.AGVLocLayer.getSource().addFeature(newAgvFeature)
    }
  },
  mounted() {
    this.InitStationPointLayer();
    this.InitStationPathLayer();
    this.InitAGVLocLayer()
    // Map views always need a projection.  Here we just want to map image
    // coordinates directly to map coordinates, so we create a projection that uses
    // the image extent in pixels.
    const extent = [-3750, -3750, 3750, 3750];
    const projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent,
    });
    var imgLayer = new ImageLayer({
      source: new Static({
        url: 'Map.png',
        projection: projection,
        imageExtent: extent,
        imageSize: [1500, 1500],

      }),
    })

    this.map = new Map({
      layers: [imgLayer, this.PointLinksLayer, this.PointLayer, this.AGVLocLayer],
      target: 'agv_map',
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 1,
        maxZoom: 8
      })
    })
    this.InitMapEventHandler();
  },
}
</script>

<style lang="scss" scoped>
.agv_map {
  width: 100%;
  height: 786px;
  background-color: grey;
}
</style>