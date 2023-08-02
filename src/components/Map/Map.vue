<template>
  <div>
    <div class="d-flex">
      <div v-if="editable" class="editor-option">
        <div class="edit-block">
          <span>模式</span>
          <el-radio-group v-model="EditorOption.EditMode" size="large">
            <el-radio-button size="small" label="view">檢視</el-radio-button>
            <el-radio-button size="small" label="edit">編輯</el-radio-button>
          </el-radio-group>
        </div>
        <div class="edit-block">
          <span>編輯動作</span>
          <el-radio-group
            :disabled="EditorOption.EditMode!='edit'"
            v-model="EditorOption.EditAction"
            size="large"
          >
            <el-radio-button size="small" label="none">無</el-radio-button>
            <el-radio-button size="small" label="add-station">新增點位</el-radio-button>
            <el-radio-button size="small" label="remove-station">移除點位</el-radio-button>
          </el-radio-group>
        </div>

        <div class="edit-block">
          <span></span>
          <el-radio-group
            :disabled="EditorOption.EditMode!='edit'"
            v-model="EditorOption.EditAction"
            @change="()=>{PathEditTempStore=[]}"
            size="large"
          >
            <el-radio-button size="small" label="add-path">新增路徑</el-radio-button>
            <el-radio-button size="small" label="remove-path">移除路徑</el-radio-button>
          </el-radio-group>
        </div>

        <div>{{ MouseCoordination }}</div>
      </div>
      <div class="flex-fill d-flex flex-column">
        <div class="border-bottom text-start w-100 p-1 d-flex">
          <div class="bg-light px-1 rounded">
            <span class="mx-1">顯示名稱</span>
            <el-radio-group
              v-model="station_name_display_mode"
              class="ml-4"
              @change="StationNameDisplayOptHandler"
            >
              <el-radio label="index" size="large">Index</el-radio>
              <el-radio label="name" size="large">Name</el-radio>
              <el-radio label="tag" size="large">Tag</el-radio>
            </el-radio-group>
          </div>
          <div class="mx-1 bg-light px-1 rounded">
            <span class="mx-1">AGV 顯示</span>
            <el-radio-group v-model="agv_display" class="ml-4" @change="AgvDisplayOptHandler">
              <el-radio label="visible" size="large">顯示</el-radio>
              <el-radio label="none" size="large">隱藏</el-radio>
            </el-radio-group>
          </div>
          <div class="mx-1 bg-light px-1 rounded">
            <span class="mx-1">Slam底圖顯示</span>
            <el-radio-group
              v-model="map_image_display"
              class="ml-4"
              @change="SlamImageDisplayOptHandler"
            >
              <el-radio label="visible" size="large">顯示</el-radio>
              <el-radio label="none" size="large">隱藏</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div id="agv_map" class="agv_map flex-fll"></div>
      </div>
    </div>
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

import { AGVOption, clsAGVDisplay, clsMapStation } from './mapjs';
import { StationPointStyle, StationTextStyle, CreateStationPathStyles, AGVPointStyle } from './mapjs'

export default {
  props: {
    map_stations: {
      type: Array,
      default() {
        return [new clsMapStation()]
      }
    },
    agv_option: {
      type: AGVOption,
      default() {
        return new AGVOption(1, [
          new clsAGVDisplay("AGV_1", "blue", [0, 0]),
          new clsAGVDisplay("AGV_2", "red", [12.30, 12.30]),
          new clsAGVDisplay("AGV_3", "orange", [-12.3, 12.30])
        ])
      }
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      map: new Map(),
      ImageLayer: new VectorLayer(),
      PointLayer: new VectorLayer(),
      PointLinksLayer: new VectorLayer(),//路網(路線)
      AGVLocLayer: new VectorLayer(),
      AGVFeatures: [
        new Feature({
          geometry: new Point([330, 330]),
        }),
      ],
      MouseCoordination: undefined,
      FeatureKeys: {
        Station: 'station',
        path: 'path',
        nav_path: 'nav_path'
      },
      IsDragging: false,
      IsAddPathMode: true,
      PathEditTempStore: [],
      EditorOption: {
        EditMode: 'view',
        EditAction: 'none'
      },
      /**顯示模式 : coordination 實際座標 ; router 整齊的路網*/
      map_display_mode: 'coordination',
      station_name_display_mode: 'name',
      agv_display: 'visible',
      map_image_display: 'visible',
    }
  },
  methods: {

    /**初始化站點塗層 */
    InitStationPointLayer() {
      var stationPointFeatures = []
      for (let index = 0; index < this.map_stations.length; index++) {
        var station = this.map_stations[index];
        const iconFeature = new Feature({
          geometry: new Point(station.coordination)
          // geometry: new Point(station.graph)
        });
        iconFeature.set('index', station.index)
        iconFeature.set('station_type', station.station_type)
        iconFeature.set('targets', station.targets)
        iconFeature.set('feature_type', this.FeatureKeys.Station)
        var name = station.name
        iconFeature.setStyle([StationPointStyle(station.station_type), StationTextStyle(name, station.station_type)]);
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
            var isEqLink = feature.get('station_type') == 1 | target_feature.get('station_type') == 1;
            var path_id = `${feature.get('index')}_${pt_index}`
            lineFeature.set('path_id', path_id)
            lineFeature.set('isEqLink', isEqLink)
            lineFeature.set('feature_type', this.FeatureKeys.path)
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
      this.AGVFeatures = [];
      this.agv_option.AGVDisplays.forEach(agv_opt => {
        var agvFeature = new Feature({
          geometry: new Point(agv_opt.InitCoordination)
        })
        agvFeature.setStyle(AGVPointStyle(agv_opt.AgvName, agv_opt.TextColor))
        this.AGVFeatures.push(agvFeature)
      });
      const source = new VectorSource({
        features: this.AGVFeatures
      })
      this.AGVLocLayer = new VectorLayer({
        source: source
      })
    },
    InitMapEventHandler() {
      var this_vue = this;
      var dragInteraction = new Pointer({
        /**滑鼠點下事件 */
        handleDownEvent: function (event) {

          this.coordinate_ = event.coordinate;
          if (this_vue.EditorOption.EditMode == 'view')
            return;

          var currentAction = this_vue.EditorOption.EditAction;
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });
          if (!feature) {
            this_vue.IsDragging = false;
            if (currentAction == 'add-station') {
              feature = new Feature({
                geometry: new Point(this.coordinate_)
              })
              var index = this_vue.GenNewIndexOfStation();
              feature.set('index', index)
              feature.set('feature_type', this_vue.FeatureKeys.Station)
              feature.setStyle(StationPointStyle(0))
            } else
              return false;
          }

          var featureType = feature.get('feature_type');
          this.feature_ = feature;
          this_vue.IsDragging = true;

          //左鍵
          if (event.originalEvent.button == 0) {

            if (featureType == this_vue.FeatureKeys.Station && currentAction == 'remove-station')
              this_vue.RemoveStation(feature);
            else if (featureType == this_vue.FeatureKeys.path && currentAction == 'remove-path')
              this_vue.RemovePath(feature);
            else if (currentAction == 'add-path')
              this_vue.PushPathData(feature)

          }
          return true;
        },
        /**滑鼠拖曳事件 */
        handleDragEvent: function (event) {
          if (this_vue.EditorOption.EditMode == 'view')
            return;
          var deltaX = event.coordinate[0] - this.coordinate_[0];
          var deltaY = event.coordinate[1] - this.coordinate_[1];
          var geometry = this.feature_.getGeometry();
          geometry.translate(deltaX, deltaY);
          this_vue.MouseCoordination = this.coordinate_ = event.coordinate;
        },

        /**滑鼠點擊後放開事件 */
        handleUpEvent: function (ev) {

          if (this_vue.EditorOption.EditMode == 'view')
            return;
          var currentAction = this_vue.EditorOption.EditAction;

          if (currentAction != 'add-path' && currentAction != 'remove-path') {
            if (currentAction == 'add-station') {
              this_vue.PointLayer.getSource().addFeature(this.feature_)
            } else {

              this_vue.IsDragging = false;
              try {
                this_vue.ResetPathLink(this.feature_)
              } catch (error) {
              }
            }
          }
          this.feature_ = null;
          this.coordinate_ = null;
        },

        /**滑鼠移動事件 */
        handleMoveEvent: function (event) {
          if (this_vue.EditorOption.EditMode == 'view')
            return;

          this_vue.MouseCoordination = event.coordinate
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            return feature;
          });
          if (feature) {
            map.getTargetElement().style.cursor = 'pointer';
          } else {
            this.feature_ = undefined;
            map.getTargetElement().style.cursor = '';
          }
        }
      });
      this.map.addInteraction(dragInteraction);

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
    },
    /**移除一個站點，並會把相關的路徑移除 */
    RemoveStation(feature = new Feature()) {
      this.PointLayer.getSource().removeFeature(feature)
      this.ResetPathLink(feature, true)
    },
    RemovePath(path_feature) {
      this.PointLinksLayer.getSource().removeFeature(path_feature)
    },
    ResetPathLink(feature = new Feature(), remove = false) {

      var path_features = this.PointLinksLayer.getSource().getFeatures();
      var index = feature.get('index');
      var targets_indexes = feature.get('targets');
      try {
        //起點是自己
        targets_indexes.forEach(targetIndex => {
          var path_id = `${index}_${targetIndex}`
          var path_featureFound = path_features.find(path_feat => path_feat.get('path_id') == path_id)

          if (path_featureFound) {
            if (remove) {
              this.PointLinksLayer.getSource().removeFeature(path_featureFound)
            } else {

              var ori_geo = path_featureFound.getGeometry()
              var ori_endCoord = ori_geo.getCoordinates()[1]
              var geometry = new LineString([feature.getGeometry().getCoordinates(), ori_endCoord])
              path_featureFound.setGeometry(geometry)
              path_featureFound.setStyle(CreateStationPathStyles(path_featureFound))
            }
          }
        });
      } catch (error) {
      }

      try {
        //終點是自己
        var lineStrings = path_features.filter(feat => feat.get('path_id').split('_')[1] == index)
        lineStrings.forEach(path_feature => {
          if (remove) {
            this.PointLinksLayer.getSource().removeFeature(path_feature)
          }
          else {
            var ori_geo = path_feature.getGeometry()
            var ori_startCoord = ori_geo.getCoordinates()[0]
            var geometry = new LineString([ori_startCoord, feature.getGeometry().getCoordinates()])
            path_feature.setGeometry(geometry)
            path_feature.setStyle(CreateStationPathStyles(path_feature))
          }

        });

      } catch (error) {
      }

    },
    PushPathData(feature = new Feature()) {
      if (this.PathEditTempStore.length == 2) {
        this.PathEditTempStore = []
      }
      else if (this.PathEditTempStore.length == 1) {
        if (this.PathEditTempStore[0].get('index') == feature.get('index')) {
          return
        }
      }
      this.PathEditTempStore.push(feature)
      if (this.PathEditTempStore.length == 2) {
        var startPoint = this.PathEditTempStore[0];
        var endPoint = this.PathEditTempStore[1];
        let lineFeature = new Feature(
          {
            geometry: new LineString([startPoint.getGeometry().getCoordinates(), endPoint.getGeometry().getCoordinates()]),
          },
        );
        var isEqLink = endPoint.get('station_type') == 1;
        var endPointIndex = endPoint.get('index');
        var path_id = `${startPoint.get('index')}_${endPointIndex}`

        if (this.PointLinksLayer.getSource().getFeatures().find(f => f.get('path_id') == path_id))
          return;
        var oritargets = startPoint.get('targets');
        if (!oritargets)
          oritargets = []
        oritargets.push(endPointIndex)
        startPoint.set('targets', oritargets)
        lineFeature.set('path_id', path_id)
        lineFeature.set('isEqLink', isEqLink)
        lineFeature.set('feature_type', this.FeatureKeys.path)
        console.info(`路線:${path_id} create.EQLink? =>${isEqLink}`);
        lineFeature.setStyle(CreateStationPathStyles(lineFeature))
        this.PointLinksLayer.getSource().addFeature(lineFeature)

      }
    },
    GenNewIndexOfStation() {
      var currentIndexes = this.PointLayer.getSource().getFeatures().map(fea => fea.get('index'))
      var sorted = currentIndexes.sort()
      return sorted.length == 0 ? 0 : sorted[sorted.length - 1] + 1;
    },
    AgvDisplayOptHandler() {
      this.AGVLocLayer.setVisible(this.agv_display == 'visible')
    },
    SlamImageDisplayOptHandler() {
      this.ImageLayer.setVisible(this.map_image_display == 'visible')
    },
    StationNameDisplayOptHandler() {
      var features = this.PointLayer.getSource().getFeatures();

      features.forEach(ft => {
        var index = ft.get('index');
        var mapStationData = this.map_stations.find(st => st.index == index)
        var displayName = mapStationData.name;
        if (this.station_name_display_mode == 'index')
          displayName = mapStationData.index + '';
        if (this.station_name_display_mode == 'name')
          displayName = mapStationData.name;
        if (this.station_name_display_mode == 'tag')
          displayName = mapStationData.tag + '';
        var station_type = mapStationData.station_type;
        debugger
        ft.setStyle([StationPointStyle(station_type), StationTextStyle(displayName, station_type)]);
      })

    }
  },
  mounted() {
    document.getElementById('agv_map').addEventListener('contextmenu', (ev) => {
      ev.preventDefault()
    })
    this.InitStationPointLayer();
    this.InitStationPathLayer();
    this.InitAGVLocLayer()
    // Map views always need a projection.  Here we just want to map image
    // coordinates directly to map coordinates, so we create a projection that uses
    // the image extent in pixels.
    const extent = [-37.5, -37.5, 37.5, 37.5];
    const projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent,
    });
    this.ImageLayer = new ImageLayer({
      source: new Static({
        url: 'Map.png',
        projection: projection,
        imageExtent: extent,
        imageSize: [1500, 1500],

      }),
    })

    this.map = new Map({
      layers: [this.ImageLayer, this.PointLinksLayer, this.PointLayer, this.AGVLocLayer],
      target: 'agv_map',
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 2,
        maxZoom: 20
      })
    })
    this.InitMapEventHandler();
  },
}
</script>

<style lang="scss" scoped>
.editor-option {
  width: 280px;
  background-color: rgb(51, 51, 51);
  color: white;
  border-radius: 3px;
  border: 1px solid grey;
  padding: 3px;
  margin-inline: 2px;
  .edit-block {
    font-size: 15px;
    font-weight: bold;
    display: flex;
    flex-direction: row;
    padding: 5px;
    span {
      width: 80px;
      text-align: left;
    }
  }
}
.agv_map {
  width: 100%;
  height: 786px;
  background-color: rgb(255, 255, 255);
}
</style>