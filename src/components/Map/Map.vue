<template>
  <div class="map-component">
    <div class="d-flex">
      <div class="flex-fill d-flex flex-column">
        <!-- 編輯選項 -->
        <div v-if="editable" class="editor-option">
          <div class="edit-block action-buttons">
            <b-button variant="primary" @click="HandlerSaveBtnClick">儲存</b-button>
            <b-button variant="danger" @click="ReloadMap">重新載入</b-button>
          </div>
          <div class="d-flex">
            <div class="edit-block">
              <span>
                <i class="bi bi-three-dots-vertical"></i>模式
              </span>
              <el-radio-group v-model="EditorOption.EditMode" size="large">
                <el-radio-button size="small" label="view">檢視</el-radio-button>
                <el-radio-button size="small" label="edit">編輯</el-radio-button>
              </el-radio-group>
            </div>
            <div class="edit-block d-flex">
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
              <el-radio-group
                class="mx-1"
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
          <div
            v-show="ShowWarningNotify"
            class="bg-warning text-light border rounded p-1"
          >目前為Slam座標模式，點位位置即為AGV真實走行座標，請小心操作</div>
        </div>
        <!-- map render -->
        <div :id="id" class="agv_map flex-fll" @contextmenu="showContextMenu($event)">
          <div v-if="true" class="ol-control custom-buttons">
            <button @click="HandleSettingBtnClick">
              <i class="bi bi-sliders"></i>
            </button>
            <button @click="HandleSettingBtnClick">?</button>
            <!-- <button>2</button> -->
          </div>
          <div class="ol-control cursour-coordination-show">
            <span style="color:#b3b3b3">{{ MouseCoordinationDisplay }}</span>
          </div>
        </div>
        <MapSettingsDialog ref="settings"></MapSettingsDialog>
      </div>
      <!-- 設定 -->
      <div class="options bg-light border-start text-start px-1 py-3">
        <div class="rounded">
          <span class="mx-1">地圖模式</span>
          <el-radio-group
            v-model="map_display_mode"
            class="ml-4"
            @change="MapDisplayModeOptHandler"
          >
            <el-radio label="coordination" size="large">Slam座標</el-radio>
            <el-radio label="router" size="large">路網</el-radio>
          </el-radio-group>
        </div>
        <div v-if="station_show" class="rounded d-flex flex-column">
          <span class="border-bottom">顯示名稱</span>
          <el-radio-group
            v-model="station_name_display_mode"
            @change="StationNameDisplayOptHandler"
          >
            <el-radio label="index" size="large">Index</el-radio>
            <el-radio label="name" size="large">Name</el-radio>
            <el-radio label="tag" size="large">Tag</el-radio>
          </el-radio-group>
        </div>
        <div v-if="agv_show" class="rounded">
          <span class="mx-1">
            <i class="bi bi-three-dots-vertical"></i>AGV 顯示
          </span>
          <el-radio-group v-model="agv_display" class="ml-4" @change="AgvDisplayOptHandler">
            <el-radio label="visible" size="large">顯示</el-radio>
            <el-radio label="none" size="large">隱藏</el-radio>
          </el-radio-group>
        </div>
        <div class="rounded">
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

        <div v-if="editable" class="rounded">
          <el-tooltip content="開啟後於車載畫面上傳座標資訊後將會自動新增點位至地圖上">
            <span class="mx-1">AGV上報點位模式</span>
          </el-tooltip>
          <el-switch
            class="my-2"
            inactive-text="OFF"
            active-text="ON"
            inline-prompt
            v-model="agv_upload_coordination_mode"
          ></el-switch>
        </div>
      </div>
    </div>

    <PointContextMenu
      ref="EditModeContextMenu"
      v-show="editModeContextMenuVisible"
      :mouse_click_position="[contextMenuTop,contextMenuLeft]"
      :options="contextMenuOptions"
      @OnTaskBtnClick="HandleMenuTaskBtnClick"
      @OnPtSettingBtnClick="HandlePtSettingBtnClick"
    ></PointContextMenu>
    <MapPointSettingDrawer ref="ptsetting" @OnPointSettingChanged="PointSettingChangedHandle"></MapPointSettingDrawer>
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
import { watch } from 'vue'
import bus from '@/event-bus.js'
import { AGVOption, clsAGVDisplay, clsMapStation, MapPointModel } from './mapjs';
import { GetStationStyle, CreateStationPathStyles, CreateLocusPathStyles, AGVPointStyle, AGVCargoIconStyle, MapContextMenuOptions, MenuUseTaskOption, ChangeCargoIcon } from './mapjs';
import MapSettingsDialog from './MapSettingsDialog.vue';
import PointContextMenu from './MapContextMenu.vue';
import MapPointSettingDrawer from '../MapPointSettingDrawer.vue';

export default {
  components: {
    MapSettingsDialog, PointContextMenu, MapPointSettingDrawer
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
        ])
      }
    },
    id: {
      type: String,
      default: 'agv_map'
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
    agv_upload_coordi_data: {
      type: Object,
      default() {
        return {}
      }
    },
    task_dispatch_menu_show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      map: new Map(),
      zoom: 2,
      zoom_route: 2,
      center: [0, 0],
      center_route: [0, 0],
      map_img_extent: [-37.5, -37.5, 37.5, 37.5],
      map_img_size: [1500, 1500],
      _map_stations: [],
      ImageLayer: new ImageLayer(),
      /**Slam座標圖層 */
      PointLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 2
      }),
      /**路網圖層 */
      PointRouteLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 2
      }),
      PointLinksLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 0
      }),//路網(路線)
      AGVLocLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 4
      }),
      AGVLocusLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 3
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
      map_display_mode: 'router',
      station_name_display_mode: 'name',
      agv_display: 'visible',
      map_image_display: 'none',

      previousSelectedFeatures: [],
      agv_upload_coordination_mode: false,
      editModeContextMenuVisible: false,
      taskDispatchContextMenuVisible: false,
      contextMenuTop: 0,
      contextMenuLeft: 0,
      contextMenuOptions: new MapContextMenuOptions(),
      firstUseFlag: true
    }
  },
  computed: {
    previousSelectedFeature() {
      return this.previousSelectedFeatures[0]
    },
    MouseCoordinationDisplay() {
      if (!this.MouseCoordination) {
        return '(-1,-1)'
      }
      return `(${this.MouseCoordination[0].toFixed(2)},${this.MouseCoordination[1].toFixed(2)})`
    },
    /**點位Feature集合 */
    StationPointsFeatures() {
      if (this.map_display_mode == "coordination") {
        return this.PointLayer.getSource().getFeatures();
      } else {
        return this.PointRouteLayer.getSource().getFeatures();
      }
    },
    ShowWarningNotify() {
      return this.EditorOption.EditMode != "view" && this.map_display_mode == "coordination";
    }
  },
  methods: {
    UpdateStationPointLayer() {
      var stationPointFeatures = []
      var stationPointFeatures_ForRouteShow = []//路網顯示用
      for (let index = 0; index < this._map_stations.length; index++) {
        var station = this._map_stations[index];
        var iconFeature = this.CreateStationFeature(station)
        stationPointFeatures.push(iconFeature)

        var routeUseFeature = iconFeature.get('routeModeFeature')
        if (routeUseFeature) {
          stationPointFeatures_ForRouteShow.push(routeUseFeature)
        }
      }
      var ptlayerSource = this.PointLayer.getSource();
      ptlayerSource.clear();
      ptlayerSource.addFeatures(stationPointFeatures);


      var ptRouteLayerSource = this.PointRouteLayer.getSource();
      ptRouteLayerSource.clear();
      ptRouteLayerSource.addFeatures(stationPointFeatures_ForRouteShow);

    },
    UpdateStationPathLayer() {
      var stationFeatures = this.StationPointsFeatures
      var stationLinkPathes = [];
      stationFeatures.forEach(feature => {
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
            var isEqLink = feature.get('station_type') != 0 | target_feature.get('station_type') != 0;
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
          var coordination = agv_opt.Coordination;
          var path_coordinations = agv_opt.NavPathCoordinationList
          if (this.map_display_mode == 'router') {
            path_coordinations = [];

            var ft = this.StationPointsFeatures.find(ft => ft.get('data').TagNumber == agv_opt.Tag)
            if (ft) {
              coordination = ft.getGeometry().getCoordinates()
            }
            var pts = this.PointLayer.getSource().getFeatures();
            for (let index = 0; index < agv_opt.NavPathCoordinationList.length; index++) {
              const coor = agv_opt.NavPathCoordinationList[index];
              var ft = pts.find(feature => feature.getGeometry().getCoordinates()[0] == coor[0] &&
                feature.getGeometry().getCoordinates()[1] == coor[1])

              var feature_ = this.StationPointsFeatures.find(feature => feature.get('index') == ft.get('index'))
              path_coordinations.push(feature_.getGeometry().getCoordinates())
            }

          }
          agvfeatures.agv_feature.setGeometry(new Point(coordination))
          agvfeatures.cargo_icon_feature.setGeometry(new Point(coordination))
          debugger

          var style = agvfeatures.agv_feature.getStyle();
          var image = style.getImage()
          image.setRotation((agv_opt.Theta - 90) * -1 * Math.PI / 180.0)
          style.setImage(image)
          agvfeatures.agv_feature.setStyle(style)
          agvfeatures.path_feature.setGeometry(new LineString(path_coordinations))
          ChangeCargoIcon(agvfeatures.cargo_icon_feature, agv_opt.CargoStatus)

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


          var _cargo_icon_feature = _agvfeature.clone()
          _cargo_icon_feature.setStyle(AGVCargoIconStyle())

          this.AGVFeatures[agv_opt.AgvName] = {
            agv_feature: _agvfeature,
            path_feature: nav_path_feature,
            cargo_icon_feature: _cargo_icon_feature
          };

          var source = this.AGVLocLayer.getSource();

          source.addFeature(_cargo_icon_feature);
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
          this_vue.editModeContextMenuVisible = false;

          this_vue.ClearSelectedFeature();
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });
          this.coordinate_ = event.coordinate;
          var currentAction = this_vue.EditorOption.EditAction;
          if (!feature) {

            this_vue.IsDragging = false;
            if (currentAction == 'add-station' && event.originalEvent.button == 2) {

              feature = CreateNewFeature(event.coordinate, feature);
              //this_vue.map_stations.push(station)
            } else
              return false;
          }

          this_vue.HighLightFeatureSelected([feature])
          if (this_vue.EditorOption.EditMode == 'view') {
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

          if (this_vue.map_display_mode == "coordination") {
            oriData.X = newCoordinates[0];
            oriData.Y = newCoordinates[1];
          }
          else {
            oriData.Graph.X = parseInt(Math.round(newCoordinates[0]));
            oriData.Graph.Y = parseInt(Math.round(newCoordinates[1]));
          }

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

        var feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          return feature;
        });

        if (feature) {
          this.map.getTargetElement().style.cursor = 'pointer';
        } else
          this.map.getTargetElement().style.cursor = '';

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
      this.map.on('moveend', event => {
        this.SaveSettingsToLocalStorage();

      })

      function CreateNewFeature(coordinate) {
        var station = new clsMapStation();
        station.coordination = coordinate;
        station.index = this_vue.GenNewIndexOfStation();
        station.station_type = 0;
        station.name = station.index + '';
        station.tag = station.index;

        var mapPtModel = new MapPointModel();
        mapPtModel.StationType = 0;
        mapPtModel.X = coordinate[0];
        mapPtModel.Y = coordinate[1];
        mapPtModel.Graph.X = parseInt(Math.round(coordinate[0]));
        mapPtModel.Graph.Y = parseInt(Math.round(coordinate[1]));
        mapPtModel.Name = station.index + '';
        mapPtModel.TagNumber = station.index;

        station.data = mapPtModel;
        var feature = this_vue.CreateStationFeature(station);
        return feature;
      }
    },
    SaveSettingsToLocalStorage() {
      var zoom = this.map.getView().getZoom()
      var center = this.map.getView().getCenter()

      if (this.map_display_mode == 'coordination') {
        this.zoom = zoom;
        this.center = center
      } else {
        this.zoom_route = zoom;
        this.center_route = center
      }
      //儲存目前的地圖設定
      localStorage.setItem(`map-${this.$route.name}`, JSON.stringify({
        zoom: this.zoom,
        zoom_route: this.zoom_route,
        mode: this.map_display_mode,
        center: this.center,
        center_route: this.center_route,
        station_name_display_mode: this.station_name_display_mode
      }))

    },
    RestoreSettingsFromLocalStorage() {
      var settings_json = localStorage.getItem(`map-${this.$route.name}`)
      if (settings_json) {
        var settings = JSON.parse(settings_json)
        this.station_name_display_mode = settings.station_name_display_mode
        this.map_display_mode = settings.mode
        this.zoom = settings.zoom;
        this.center = settings.center
        this.zoom_route = settings.zoom_route;
        this.center_route = settings.center_route
      }
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
      iconFeature.setStyle(GetStationStyle(name, station.station_type, station.data));
      var routeFeature = iconFeature.clone();
      if (station.data.Graph) {
        routeFeature.setGeometry(new Point([station.data.Graph.X, station.data.Graph.Y]))
      }
      iconFeature.set('routeModeFeature', routeFeature)
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
        var isEqLink = endPoint.get('station_type') != 0;
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
      var sorted = currentIndexes.filter(a => a != undefined).sort((a, b) => a - b)
      var index = sorted.length == 0 ? 0 : sorted[sorted.length - 1] + 1;

      return index;
    },
    AgvDisplayOptHandler() {
      this.AGVLocLayer.setVisible(this.agv_display == 'visible')
    },
    SlamImageDisplayOptHandler() {
      if (this.map_display_mode != 'coordination') {
        this.UpdateStationPathLayer()
      }
      this.ImageLayer.setVisible(this.map_image_display == 'visible')
    },
    MapDisplayModeOptHandler() {
      var isShowSlamCoordi = this.map_display_mode == "coordination";
      this.UpdateStationPathLayer()
      this.StationNameDisplayOptHandler();
      this.PointLayer.setVisible(isShowSlamCoordi);
      this.PointRouteLayer.setVisible(!isShowSlamCoordi);
      this.map.getView().setZoom(isShowSlamCoordi ? 4 : 1)
      this.map.getView().setCenter(isShowSlamCoordi ? [2, 2] : [0, 0]);
      //this.SaveSettingsToLocalStorage();
    },
    StationNameDisplayOptHandler() {

      this.StationPointsFeatures.forEach(ft => {
        var index = ft.get('index');
        var mapdata = ft.get('data')
        var displayName = ''
        if (this.station_name_display_mode == 'index')
          displayName = index + '';
        if (this.station_name_display_mode == 'name')
          displayName = mapdata.Name;
        if (this.station_name_display_mode == 'tag')
          displayName = mapdata.TagNumber + '';
        var station_type = mapdata.StationType;
        ft.setStyle(GetStationStyle(displayName, station_type, mapdata));
      })
      this.SaveSettingsToLocalStorage();
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
    HandlePtSettingBtnClick() {
      this.editModeContextMenuVisible = false;
      this.$refs.ptsetting.Show({
        index: this.previousSelectedFeature.get('index'),
        point: this.previousSelectedFeature.get('data')
      })
    },
    ReloadMap() {
      this.$swal.fire(
        {
          text: '確定要重新載入圖資?',
          title: '',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          customClass: 'my-sweetalert'
        }).then((res) => {
          if (res.isConfirmed) {

            this._map_stations = JSON.parse(JSON.stringify(this.map_stations))
            console.log('update map ')
            this.UpdateStationPointLayer();
            this.UpdateStationPathLayer();
          }
        })
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
        visible: false
      })

      const vectorSource = new VectorSource({
        features: [],
      });
      this.AGVLocusLayer = new VectorLayer({
        source: vectorSource,
      })

      this.map = new Map({
        layers: [this.ImageLayer, this.PointLinksLayer, this.PointLayer, this.PointRouteLayer, this.AGVLocLayer, this.AGVLocusLayer],
        target: this.id,
        view: new View({
          projection: projection,
          center: this.map_display_mode == 'coordination' ? this.center : this.center_route,
          zoom: this.map_display_mode == 'coordination' ? this.zoom : this.zoom_route,
          maxZoom: 20
        })
      })

      this.AGVLocLayer.setVisible(this.agv_show)
      this.PointLinksLayer.setVisible(this.station_show)
      this.PointLayer.setVisible(this.station_show)
      this.PointRouteLayer.setVisible(false)
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
    },
    ClearSelectedFeature() {
      try {
        this.previousSelectedFeatures.forEach(feature => {
          var oriStyle = feature.get('oristyle')
          feature.setStyle(oriStyle);
        })
        var oriStyle = this.previousSelectedFeature.get('oristyle')
        this.previousSelectedFeature.setStyle(oriStyle);
      } catch {

      }
      this.previousSelectedFeatures = []
    },
    HighLightFeatureSelected(features = [new Feature()], color = 'red') {
      try {

        this.ClearSelectedFeature();
        features.forEach(feature => {

          var style = feature.getStyle()
          if (!style)
            return;
          feature.set("oristyle", style.clone())
          var newStyle = style.clone()
          var text = newStyle.getText();
          if (text) {
            var stroke = text.getStroke()
            if (stroke) {
              var newStroke = stroke.clone();
              newStroke.setColor(color)
              text.setStroke(newStroke)
              feature.setStyle(newStyle)
              this.previousSelectedFeatures.push(feature)
            }
          }
        })
      } catch (error) {

      }
    },
    HighLightFeaturesByStationType(station_type = 0, color = 'red') {
      // feature.set('station_type', ptdata.StationType)
      var features = this.StationPointsFeatures.filter(ft => ft.get('station_type') == station_type)
      this.HighLightFeatureSelected(features, color)

    },
    HandleAGVUploadData(coordinates = [{ TagNumber: 0, X: 0, Y: 0, Theta: 0 }]) {

      var currentPtFeatures = this.PointLayer.getSource().getFeatures();

      Object.values(coordinates).forEach(coorInfo => {
        var existFeature = currentPtFeatures.find(pt => pt.get('data').TagNumber == coorInfo.TagNumber)
        if (existFeature) {
          existFeature.setGeometry(new Point([coorInfo.X, coorInfo.Y]))
          var oriData = existFeature.get('data');
          oriData.Direction = parseInt(Math.round(coorInfo.Theta));
          existFeature.set('data', oriData)
        } else {

          var station = new clsMapStation()
          station.coordination = [coorInfo.X, coorInfo.Y];
          station.index = this.GenNewIndexOfStation();
          station.station_type = 0;
          station.name = coorInfo.TagNumber + ''
          station.tag = coorInfo.TagNumber

          var mapPtModel = new MapPointModel()
          mapPtModel.StationType = 0
          mapPtModel.X = coorInfo.X
          mapPtModel.Y = coorInfo.Y
          mapPtModel.Graph.X = parseInt(Math.round(coorInfo.X));
          mapPtModel.Graph.Y = parseInt(Math.round(coorInfo.Y));
          mapPtModel.Name = coorInfo.TagNumber + ''
          mapPtModel.TagNumber = coorInfo.TagNumber
          mapPtModel.Direction = parseInt(Math.round(coorInfo.Theta));
          station.data = mapPtModel
          var feature = this.CreateStationFeature(station)
          this.PointLayer.getSource().addFeature(feature)
        }
      })
    },
    showContextMenu(event) {
      event.preventDefault();
      if (this.EditorOption.EditAction == 'add-station')
        return;

      if (this.previousSelectedFeature) {
        this.contextMenuTop = event.clientY;
        this.contextMenuLeft = event.clientX;
        var data = this.previousSelectedFeature.get('data');

        this.contextMenuOptions.title = data.Name
        this.contextMenuOptions.point_data = data

        this.contextMenuOptions.task_options = new MenuUseTaskOption(data.StationType)
        this.contextMenuOptions.show_task_dispatch = this.task_dispatch_menu_show



        this.editModeContextMenuVisible = true;
      }
    },
    PointSettingChangedHandle(data_dto) {

      var index = data_dto.index;
      var ptdata = data_dto.pointData;

      //reset ptinformation
      var feature = this.PointLayer.getSource().getFeatures().find(ft => ft.get('index') == index);
      feature.set('data', ptdata)
      feature.set('station_type', ptdata.StationType)
      feature.setStyle(GetStationStyle(ptdata.Name, ptdata.StationType, ptdata));

      //rename display
      var style = feature.getStyle()
      var newStyle = style.clone()
      var text = newStyle.getText();
      text.setText(ptdata.Name);

      var stroke = text.getStroke()
      if (stroke) {
        var newStroke = stroke.clone();
        newStroke.setColor('blue')
        text.setStroke(newStroke)
      }

      feature.setStyle(newStyle)

    },
    HandleMenuTaskBtnClick(data = { action: '', station_data: {} }) {
      this.editModeContextMenuVisible = false;
      var highlight_station_type = 0;
      if (data.action == 'move') {
        highlight_station_type = 0;
      }
      else if (data.action == 'load' | data.action == 'unload' | data.action == 'carry') {
        highlight_station_type = 1;
      }
      else if (data.action == 'charge') {
        highlight_station_type = 3;
      }
      this.HighLightFeaturesByStationType(highlight_station_type, 'blue')
      bus.emit('bus-show-task-allocation', data);
    }
  },

  mounted() {

    this.RestoreSettingsFromLocalStorage();
    this.InitMap();
    watch(
      () => this.map_stations, (newval, oldval) => {
        this._map_stations = JSON.parse(JSON.stringify(newval))
        this.UpdateStationPointLayer();
        this.UpdateStationPathLayer();
        this.MapDisplayModeOptHandler();

        // setTimeout(() => {
        //   if (this.firstUseFlag) {
        //     this.MapDisplayModeOptHandler();
        //     this.firstUseFlag = false
        //   }
        // }, 500);

      }, { deep: true, immediate: true }
    )

    watch(() => this.agv_option, (newval, oldval) => {
      this.UpdateAGVLayer()
    }, { deep: true, immediate: true })

    bus.on('/show_agv_at_center', agv_name => {
      // alert(agv_name)
      this.ResetMapCenterViaAGVLoc(agv_name)
    })

    watch(
      () => this.agv_upload_coordi_data, (newval = {}, oldval) => {
        if (this.agv_upload_coordination_mode) {
          this.HandleAGVUploadData(newval)
        }

      }, { deep: true, immediate: true }
    )

    document.getElementById('agv_map').addEventListener('contextmenu', (ev) => {
      ev.preventDefault()
    })
  },
}
</script>

<style lang="scss" scoped>
.map-component {
  width: 100%;
}
.custom-buttons {
  // top: 133px;
  text-align: right;
  z-index: 1;
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
  z-index: 0;
  padding-left: 37px;
  margin-top: 10px;
  width: 120px;
  span {
    font-weight: bold;
  }
}

.cursour-coordination-show,
.custom-buttons {
  position: absolute;
  background-color: transparent;
  display: flex;
}

.options {
  text-align: left;
  label {
    width: 100%;
    margin-right: auto;
    height: 25px;
  }
  div {
    display: flex;
    flex-direction: column;
    margin-bottom: 6px;
    padding: 3px;
    span {
      border-bottom: 1px solid gainsboro;
      font-weight: bold;
    }
  }
}

.editor-option {
  width: 100%;
  border-radius: 3px;
  border: 1px solid rgb(218, 218, 218);
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
      text-align: left;
      margin-right: 10px;
    }
  }
}
.agv_map {
  width: 100%;
  height: 786px;
}
</style>