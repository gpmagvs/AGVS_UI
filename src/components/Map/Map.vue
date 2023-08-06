<template>
  <div>
    <div class="d-flex">
      <div v-if="editable" class="editor-option">
        <div class="edit-block action-buttons">
          <b-button variant="primary" @click="HandlerSaveBtnClick">儲存</b-button>
          <b-button variant="danger">重新載入</b-button>
        </div>
        <el-divider></el-divider>
        <div class="edit-block">
          <span>
            <i class="bi bi-three-dots-vertical"></i>模式
          </span>
          <el-radio-group v-model="EditorOption.EditMode" size="large">
            <el-radio-button size="small" label="view">檢視</el-radio-button>
            <el-radio-button size="small" label="edit">編輯</el-radio-button>
          </el-radio-group>
        </div>
        <div class="edit-block">
          <span>
            <i class="bi bi-three-dots-vertical"></i>編輯動作
          </span>
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
      </div>

      <div class="flex-fill d-flex flex-column">
        <div class="border-bottom text-start w-100 p-1 d-flex">
          <div v-if="station_show" class="bg-light px-1 rounded">
            <span class="mx-1">
              <i class="bi bi-three-dots-vertical"></i>顯示名稱
            </span>
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
          <div v-if="agv_show" class="mx-1 bg-light px-1 rounded">
            <span class="mx-1">
              <i class="bi bi-three-dots-vertical"></i>AGV 顯示
            </span>
            <el-radio-group v-model="agv_display" class="ml-4" @change="AgvDisplayOptHandler">
              <el-radio label="visible" size="large">顯示</el-radio>
              <el-radio label="none" size="large">隱藏</el-radio>
            </el-radio-group>
          </div>
          <div class="mx-1 bg-light px-1 rounded">
            <span class="mx-1">
              <i class="bi bi-three-dots-vertical"></i>Slam底圖顯示
            </span>
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

        <div id="agv_map" class="agv_map flex-fll">
          <div v-if="true" class="ol-control custom-buttons">
            <button @click="HandleSettingBtnClick">
              <i class="bi bi-sliders"></i>
            </button>
            <!-- <button>2</button> -->
          </div>
          <div class="ol-control cursour-coordination-show">
            <span style="color:#b3b3b3">{{ MouseCoordinationDisplay }}</span>
          </div>
        </div>
        <MapSettingsDialog ref="settings"></MapSettingsDialog>
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
import { watch } from 'vue'
import bus from '@/event-bus.js'
import { AGVOption, clsAGVDisplay, clsMapStation, MapPointModel } from './mapjs';
import { StationPointStyle, StationTextStyle, CreateStationPathStyles, CreateLocusPathStyles, AGVPointStyle } from './mapjs'
import MapSettingsDialog from './MapSettingsDialog.vue';
export default {
  components: {
    MapSettingsDialog,
  },
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
    },
    agv_show: {
      type: Boolean,
      default: true
    },
    station_show: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      map: new Map(),
      map_img_extent: [-37.5, -37.5, 37.5, 37.5],
      map_img_size: [1500, 1500],
      _map_stations: [],
      ImageLayer: new ImageLayer(),
      PointLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        })
      }),
      PointLinksLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        })
      }),//路網(路線)
      AGVLocLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        })
      }),
      AGVLocusLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        })
      }), //軌跡圖顯示圖層
      AGVFeatures: {},
      MouseCoordination: undefined,
      FeatureKeys: {
        Station: 'station',
        path: 'path',
        nav_path: 'nav_path',
        agv: 'agv'
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
  computed: {
    MouseCoordinationDisplay() {
      if (!this.MouseCoordination) {
        return '(-1,-1)'
      }
      return `(${this.MouseCoordination[0].toFixed(2)},${this.MouseCoordination[1].toFixed(2)})`
    }
  },
  methods: {
    UpdateStationPointLayer() {
      var stationPointFeatures = []
      for (let index = 0; index < this._map_stations.length; index++) {
        var station = this._map_stations[index];
        var iconFeature = this.CreateStationFeature(station)
        stationPointFeatures.push(iconFeature)
      }
      var source = this.PointLayer.getSource();
      source.clear();
      source.addFeatures(stationPointFeatures);

    },
    UpdateStationPathLayer() {
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
            lineFeature.setStyle(CreateStationPathStyles(lineFeature))
            stationLinkPathes.push(lineFeature)
          }
        }
      })

      var source = this.PointLinksLayer.getSource();
      source.clear();
      source.addFeatures(stationLinkPathes);
    },
    UpdateAGVLayer() {
      this.agv_option.AGVDisplays.forEach(agv_opt => {

        var agvfeatures = this.AGVFeatures[agv_opt.AgvName]
        if (agvfeatures) {
          //以新增
          agvfeatures.agv_feature.setGeometry(new Point(agv_opt.Coordination))
          agvfeatures.path_feature.setGeometry(new LineString(agv_opt.NavPathCoordinationList))
        } else {

          var _agvfeature = new Feature({
            geometry: new Point(agv_opt.Coordination)
          })
          _agvfeature.setStyle(AGVPointStyle(agv_opt.AgvName, agv_opt.TextColor))
          _agvfeature.set('agvname', agv_opt.AgvName)
          _agvfeature.set("feature_type", this.FeatureKeys.agv)

          //
          var nav_path_feature = new Feature({
            geometry: new LineString([])
          })
          nav_path_feature.setStyle(CreateLocusPathStyles(agv_opt.TextColor, 5))
          this.AGVFeatures[agv_opt.AgvName] = {
            agv_feature: _agvfeature,
            path_feature: nav_path_feature
          };

          var source = this.AGVLocLayer.getSource();

          source.addFeature(_agvfeature);
          source.addFeature(nav_path_feature);

        }
      });
    },
    /**事件處理 */
    InitMapEventHandler() {
      var this_vue = this;
      var dragInteraction = new Pointer({
        /**滑鼠點下事件 */
        handleDownEvent: function (event) {

          this.coordinate_ = event.coordinate;
          if (this_vue.EditorOption.EditMode == 'view') {
            return false;
          }

          var currentAction = this_vue.EditorOption.EditAction;
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });

          if (!feature) {
            this_vue.IsDragging = false;
            if (currentAction == 'add-station' && event.originalEvent.button == 2) {

              var station = new clsMapStation()
              station.coordination = event.coordinate;
              station.index = this_vue.GenNewIndexOfStation();
              station.station_type = 0;
              station.name = station.index + ''
              station.tag = station.index

              var mapPtModel = new MapPointModel()
              mapPtModel.StationType = 0
              mapPtModel.X = event.coordinate[0]
              mapPtModel.Y = event.coordinate[1]
              mapPtModel.Name = station.index + ''
              mapPtModel.TagNumber = station.index

              station.data = mapPtModel
              feature = this_vue.CreateStationFeature(station)
              //this_vue.map_stations.push(station)
            } else
              return false;
          }

          var featureType = feature.get('feature_type');
          this.feature_ = feature;
          this_vue.IsDragging = true;

          if (currentAction == "none" && featureType != this_vue.FeatureKeys.Station)
            return false;

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
          if (this_vue.EditorOption.EditMode == 'view') {
            return;
          }
          var deltaX = event.coordinate[0] - this.coordinate_[0];
          var deltaY = event.coordinate[1] - this.coordinate_[1];
          var geometry = this.feature_.getGeometry();
          geometry.translate(deltaX, deltaY);
          this_vue.MouseCoordination = this.coordinate_ = event.coordinate;
          geometry = this.feature_.getGeometry();
          var oriData = this.feature_.get('data')
          var newCoordinates = geometry.getCoordinates();
          oriData.X = newCoordinates[0];
          oriData.Y = newCoordinates[1];
          this.feature_.set('data', oriData)
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
          var currentAction = this_vue.EditorOption.EditAction;
          if (this_vue.EditorOption.EditMode == 'view')
            return;
          this_vue.MouseCoordination = event.coordinate
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            return feature;
          });
          var cursor = ''
          if (feature) {
            var featureType = feature.get('feature_type');
            if (currentAction == "add-path" && featureType != this_vue.FeatureKeys.Station) {
              cursor = 'not-allowed'
            }
            else if (currentAction == "remove-station" && featureType != this_vue.FeatureKeys.Station)
              cursor = 'not-allowed'

            else if (currentAction == "remove-path" && featureType != this_vue.FeatureKeys.path)
              cursor = 'not-allowed'
            else
              cursor = 'pointer'

          }
          else {
            if (currentAction == "add-station") {
              cursor = 'crosshair';
            }
            this.feature_ = undefined;
          }
          map.getTargetElement().style.cursor = cursor;

        }
      });
      this.map.addInteraction(dragInteraction);
      this.map.on('pointermove', (event) => {
        this.MouseCoordination = event.coordinate

      })
      this.map.on('pointerup', (e) => {

        if (this.EditorOption.EditAction == 'add-station')
          this.map.getTargetElement().style.cursor = 'crosshair';
        else
          this.map.getTargetElement().style.cursor = 'default';
      })
      this.map.on('pointerdown', (e) => {
        this.map.getTargetElement().style.cursor = 'grabbing';
      })

    },
    CreateStationFeature(station = new clsMapStation()) {
      const iconFeature = new Feature({
        geometry: new Point(station.coordination)
        // geometry: new Point(station.graph)
      });
      iconFeature.set('index', station.index)
      iconFeature.set('station_type', station.station_type)
      iconFeature.set('targets', station.targets)
      iconFeature.set('feature_type', this.FeatureKeys.Station)
      iconFeature.set('data', station.data)
      var name = station.name
      iconFeature.setStyle([StationPointStyle(station.station_type, station.data), StationTextStyle(name, station.station_type)]);
      return iconFeature;
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
      var pathID = path_feature.get('path_id')
      var pathIDSplited = pathID.split('_')
      var startPtIndex = parseInt(pathIDSplited[0])
      var endPtIndex = parseInt(pathIDSplited[1])
      var startFeature = this.PointLayer.getSource().getFeatures().find(ft => ft.get('index') == startPtIndex)
      var mapPointModel = startFeature.get('data')
      delete mapPointModel.Target[endPtIndex]
      var mapPointModel = startFeature.set('data', mapPointModel)
      this.PointLinksLayer.getSource().removeFeature(path_feature)
    },
    RemovePtTarget() {

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

      if (feature.get("feature_type") != this.FeatureKeys.Station)
        return;

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
        var startPtMapData = startPoint.get('data')
        startPtMapData.Target[endPointIndex] = 1//
        startPoint.set('data', startPtMapData)
        oritargets.push(endPointIndex)
        startPoint.set('targets', oritargets)
        lineFeature.set('path_id', path_id)
        lineFeature.set('isEqLink', isEqLink)
        lineFeature.set('feature_type', this.FeatureKeys.path)
        lineFeature.setStyle(CreateStationPathStyles(lineFeature))
        this.PointLinksLayer.getSource().addFeature(lineFeature)

      }
    },
    GenNewIndexOfStation() {
      var currentIndexes = this.PointLayer.getSource().getFeatures().map(fea => fea.get('index'))
      var sorted = currentIndexes.sort((a, b) => a - b)
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
        var mapdata = ft.get('data')
        var mapStationData = this._map_stations.find(st => st.index == index)
        var displayName = mapStationData.name;
        if (this.station_name_display_mode == 'index')
          displayName = mapStationData.index + '';
        if (this.station_name_display_mode == 'name')
          displayName = mapStationData.name;
        if (this.station_name_display_mode == 'tag')
          displayName = mapStationData.tag + '';
        var station_type = mapStationData.station_type;
        ft.setStyle([StationPointStyle(station_type, mapdata), StationTextStyle(displayName, station_type)]);
      })

    },
    /**顯示軌跡 */
    ShowLocus(coordinate_list = [], color = 'red', width = 1) {
      var source = this.AGVLocusLayer.getSource()
      if (source) {
        var features = []
        source.clear()
        //創建軌跡 LineString
        let lineFeature = new Feature(
          {
            geometry: new LineString(coordinate_list),
          },
        );
        lineFeature.setStyle(CreateLocusPathStyles(color, width))
        features.push(lineFeature)
        source.addFeatures(features)
      }
    },
    /**儲存按鈕處理 */
    HandlerSaveBtnClick() {
      //把feature中的 'data' 物件資料取出
      var mapData = {}
      this.PointLayer.getSource().getFeatures().forEach(ft => {
        var index = ft.get('index')
        var data = ft.get('data')
        mapData[index] = data;
      })
      this.$emit('save', mapData)
    },
    InitMap() {
      const extent = this.map_img_extent;
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
          imageSize: this.map_img_size,

        }),
      })

      const vectorSource = new VectorSource({
        features: [],
      });
      this.AGVLocusLayer = new VectorLayer({
        source: vectorSource,
      })

      this.map = new Map({
        layers: [this.ImageLayer, this.PointLinksLayer, this.PointLayer, this.AGVLocLayer, this.AGVLocusLayer],
        target: 'agv_map',
        view: new View({
          projection: projection,
          center: getCenter(extent),
          zoom: 2,
          maxZoom: 20
        })
      })

      this.AGVLocLayer.setVisible(this.agv_show)
      this.PointLinksLayer.setVisible(this.station_show)
      this.PointLayer.setVisible(this.station_show)
      this.InitMapEventHandler();
    },
    ResetMapCenterViaAGVLoc(agv_name) {
      //Get AGV Coordination
      var agvfeatures = this.AGVFeatures[agv_name]
      if (agvfeatures) {
        var coordination = agvfeatures.agv_feature.getGeometry().getCoordinates()
        this.map.getView().setCenter(coordination)
      }
    },
    HandleSettingBtnClick() {
      this.$refs.settings.show = true;
    }
  },

  mounted() {

    this.InitMap();
    watch(
      () => this.map_stations, (newval, oldval) => {
        this._map_stations = JSON.parse(JSON.stringify(newval))
        console.log('update map ')
        this.UpdateStationPointLayer();
        this.UpdateStationPathLayer();
      }, { deep: true, immediate: true }
    )

    watch(() => this.agv_option, (newval, oldval) => {

      this.UpdateAGVLayer()
    }, { deep: true, immediate: true })

    bus.on('/show_agv_at_center', agv_name => {
      // alert(agv_name)
      this.ResetMapCenterViaAGVLoc(agv_name)

    })

    document.getElementById('agv_map').addEventListener('contextmenu', (ev) => {
      ev.preventDefault()
    })
  },
}
</script>

<style lang="scss" scoped>
.custom-buttons {
  // top: 133px;
  text-align: right;

  flex-direction: column;
  margin-top: 55px;
  padding-left: 7px;
  height: 300px;
  button {
    border: 1px solid #d5d5d5;
    border-radius: 3px;
    height: 22px;
    width: 24px;
  }
  button:hover {
    cursor: pointer;
    border: 0.01rem solid black;
  }
}
.cursour-coordination-show {
  padding-left: 37px;
  margin-top: 10px;
  width: 120px;
  span {
    font-weight: bold;
  }
}

.cursour-coordination-show,
.custom-buttons {
  z-index: 2;
  position: absolute;
  background-color: transparent;
  display: flex;
}
.editor-option {
  width: 280px;
  background-color: rgb(51, 51, 51);
  color: white;
  border-radius: 3px;
  border: 1px solid grey;
  padding: 3px;
  margin-inline: 2px;

  .action-buttons {
    button {
      width: 120px;
      margin-right: 5px;
    }
  }
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