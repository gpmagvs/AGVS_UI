<template>
  <div class="map-component">
    <el-alert v-if="map_name=='Unkown'" title="圖資異常" type="warning" effect="dark" />

    <div class="d-flex h-100">
      <div class="flex-fill d-flex flex-column">
        <!-- 編輯選項 -->
        <div
          v-if="editable"
          class="editor-option fixed-top bg-light"
          style="margin-top:49px;margin-left:70px"
        >
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
        <div
          :id="id"
          v-bind:style="{height:canva_height ,marginTop:editable? ( ShowWarningNotify?'120px': '80px'):'0px'}"
          class="agv_map flex-fll"
          @contextmenu="showContextMenu($event)"
        >
          <div v-if="true" class="ol-control custom-buttons">
            <button @click="HandleSettingBtnClick">
              <i class="bi bi-sliders"></i>
            </button>
            <button @click="HandleSettingBtnClick">?</button>
            <!-- <button>2</button> -->
          </div>
          <div class="ol-control cursour-coordination-show">
            <span style="color:rgb(24, 24, 24)">{{ MouseCoordinationDisplay }}</span>
          </div>
          <QuicklyAction></QuicklyAction>
        </div>
        <MapSettingsDialog ref="settings"></MapSettingsDialog>
      </div>
      <!-- 設定 -->
      <div
        class="options bg-light border-start text-start px-1 py-3"
        v-bind:style="{marginTop:editable? ( ShowWarningNotify?'120px': '80px'):'0px'}"
      >
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
        <div>
          <span class="mx-1">地圖模式</span>
          <el-switch
            @change="MapDisplayModeOptHandler"
            inactive-value="router"
            active-value="coordination"
            width="70"
            v-model="map_display_mode"
            inline-prompt
            inactive-text="路網"
            active-text="Slam"
            inactive-color="seagreen"
          ></el-switch>
        </div>
        <div v-if="agv_show">
          <span class="mx-1">AGV 顯示</span>
          <el-switch
            @change="AgvDisplayOptHandler"
            inactive-value="none"
            active-value="visible"
            width="70"
            v-model="agv_display"
            inline-prompt
            inactive-text="隱藏"
            active-text="顯示"
            inactive-color="rgb(146, 148, 153)"
          ></el-switch>
        </div>
        <div>
          <span class="mx-1">Slam底圖</span>
          <el-switch
            v-model="map_image_display"
            inactive-value="none"
            inactive-text="隱藏"
            active-value="visible"
            active-text="顯示"
            inactive-color="rgb(146, 148, 153)"
            inline-prompt
            width="70"
            @change="SlamImageDisplayOptHandler"
          ></el-switch>
        </div>

        <div>
          <span class="mx-1">路網顯示</span>
          <el-switch
            v-model="routePathsVisible"
            inactive-text="隱藏"
            active-text="顯示"
            inline-prompt
            inactive-color="rgb(146, 148, 153)"
            width="70"
            @change="(visible)=>{
              PointLinksLayer.setVisible(visible);
              HideNormalStations(!visible);
            }"
          ></el-switch>
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
import { Tile as TileLayer, Vector as VectorLayer, Graticule } from 'ol/layer.js';
import { watch } from 'vue'
import bus from '@/event-bus.js'
import { AGVOption, clsAGVDisplay, clsMapStation, MapPointModel } from './mapjs';
import { GetStationStyle, CreateStationPathStyles, CreateLocusPathStyles, AGVPointStyle, AGVCargoIconStyle, MapContextMenuOptions, MenuUseTaskOption, ChangeCargoIcon, createBezierCurvePoints, CreateNewStationPointFeature, CreateStationFeature } from './mapjs';
import { MapStore } from './store'
import { Fill, Stroke, Style, Circle } from 'ol/style';

import MapSettingsDialog from './MapSettingsDialog.vue';
import PointContextMenu from './MapContextMenu.vue';
import MapPointSettingDrawer from '../MapPointSettingDrawer.vue';
import QuicklyAction from './QuicklyActionMenu.vue'

import MapAPI from '@/api/MapAPI';

export default {
  components: {
    QuicklyAction, MapSettingsDialog, PointContextMenu, MapPointSettingDrawer
  },
  props: {
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
    },
    id: {
      type: String,
      default() {
        return 'map'
      }
    },
    canva_height: {
      type: String,
      default: '670px'
    }
  },
  data() {
    return {
      map: new Map(),
      map_name: 'Unkown',
      zoom: 2,
      zoom_route: 2,
      center: [0, 0],
      center_route: [0, 0],
      map_img_extent: [-20, -20, 20, 20],//32*24
      // map_img_size: [1500, 1500],
      map_img_size: [400, 400],
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
      CustomLayer: new VectorLayer({
        source: new VectorSource(
          {
            features: []
          }
        )
      }),
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
      map_image_display: 'visible',

      previousSelectedFeatures: [],
      agv_upload_coordination_mode: false,
      editModeContextMenuVisible: false,
      taskDispatchContextMenuVisible: false,
      routePathsVisible: true,
      contextMenuTop: 0,
      contextMenuLeft: 0,
      contextMenuOptions: new MapContextMenuOptions(),
      firstUseFlag: true
    }
  },
  computed: {
    MapServerUrl() {
      return MapStore.getters.MapServerUrl;
    },
    PathesSegments() {
      return MapStore.getters.Pathes;
    },
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
    },
    map_station_data() {
      return MapStore.getters.MapStations
    },
    BezierCurves() {
      return MapStore.getters.BezierCurves
    },
    agvs_info() {
      return MapStore.getters.AGVNavInfo;
    }
  },
  methods: {
    UpdateStationPointLayer() {
      var stationPointFeatures = []
      var stationPointFeatures_ForRouteShow = []//路網顯示用
      for (let index = 0; index < this._map_stations.length; index++) {
        var station = this._map_stations[index];
        var iconFeature = CreateStationFeature(station)
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
      debugger
      var source = this.PointLinksLayer.getSource();
      source.clear();
      var stationLinkPathes = [];

      var pathSegments = this.PathesSegments
      pathSegments.forEach(path => {
        var lineCoordinations = [path.StartCoordination, path.EndCoordination]
        // if (path.IsBezier) {
        //   var points = createBezierCurvePoints(2, [path.StartCoordination, path.BezierMiddleCoordination, path.EndCoordination])
        //   var midFeature = new Feature({
        //     geometry: new Point(path.BezierMiddleCoordination)
        //   })
        //   source.addFeature(midFeature);
        //   lineCoordinations = points
        // }
        let lineFeature = new Feature(
          {
            geometry: new LineString(lineCoordinations),
          },
        );
        lineFeature.set('path_id', path.PathID)
        lineFeature.set('isEqLink', path.IsEQLink)
        lineFeature.set('feature_type', this.FeatureKeys.path)
        lineFeature.setStyle(CreateStationPathStyles(lineFeature))
        stationLinkPathes.push(lineFeature)
      })
      source.addFeatures(stationLinkPathes);
      return;

      var stationFeatures = this.StationPointsFeatures
      var stationLinkPathes = [];
      stationFeatures.forEach(feature => {
        var data = feature.get('data')
        var graph = data.Graph;
        var target_indexes = feature.get('targets')
        for (let index = 0; index < target_indexes.length; index++) {
          const pt_index = target_indexes[index];
          var target_feature = stationFeatures.find(f => f.get('index') == pt_index)

          if (target_feature) {
            var target_data = target_feature.get('data')
            var target_graph = target_data.Graph
            var segment = [];
            var startPoint = feature.getGeometry().getCoordinates()
            var endPoint = target_feature.getGeometry().getCoordinates()
            segment = [startPoint, endPoint]
            if (graph.IsBezierCurvePoint && target_graph.IsBezierCurvePoint) {
              var bezier_curve_id = graph.BezierCurveID
              var beziercurve_model = this.BezierCurves[bezier_curve_id]
              if (beziercurve_model) {
                var midpoint = beziercurve_model.MidPointCoordination
                var points = createBezierCurvePoints(2, [startPoint, midpoint, endPoint])
                segment = points
                var midFeature = new Feature({
                  geometry: new Point(midpoint)
                })
                source.addFeature(midFeature);
              }
            }
            let lineFeature = new Feature(
              {
                geometry: new LineString(segment),
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

    },
    UpdateAGVLayer() {
      this.agvs_info.AGVDisplays.forEach(agv_information => {

        var agvfeatures = this.AGVFeatures[agv_information.AgvName]
        if (agvfeatures) {
          //以新增
          var coordination = agv_information.Coordination;
          var path_coordinations = agv_information.NavPathCoordinationList
          if (this.map_display_mode == 'router') {
            path_coordinations = [];

            var ft = this.StationPointsFeatures.find(ft => ft.get('data').TagNumber == agv_information.Tag)
            if (ft) {
              coordination = ft.getGeometry().getCoordinates()
            }
            var pts = this.PointLayer.getSource().getFeatures();
            for (let index = 0; index < agv_information.NavPathCoordinationList.length; index++) {
              const coor = agv_information.NavPathCoordinationList[index];
              var ft = pts.find(feature => feature.getGeometry().getCoordinates()[0] == coor[0] &&
                feature.getGeometry().getCoordinates()[1] == coor[1])

              var feature_ = this.StationPointsFeatures.find(feature => feature.get('index') == ft.get('index'))
              path_coordinations.push(feature_.getGeometry().getCoordinates())
            }

          }

          agvfeatures.agv_feature.setGeometry(new Point(coordination))
          agvfeatures.cargo_icon_feature.setGeometry(new Point(coordination))

          var style = agvfeatures.agv_feature.getStyle();
          var image = style.getImage()
          image.setRotation((agv_information.Theta - 90) * -1 * Math.PI / 180.0)
          style.setImage(image)
          var actionString = agv_information.CurrentAction
          var text = style.getText();
          var agvText = agv_information.AgvName + (actionString == '' ? '' : `(${actionString})`);
          agvText += agv_information.WaitingInfo.IsWaiting ? `\r\n等待${agv_information.WaitingInfo.WaitingPoint.Name} Release..` : '';
          text.setText(agvText);

          var fill = text.getBackgroundFill()
          fill.setColor(!agv_information.AgvStates.is_online ? 'rgb(147, 147, 147)' : (agv_information.WaitingInfo.IsWaiting ? 'orange' : agv_information.TextColor))
          text.setBackgroundFill(fill);
          agvfeatures.agv_feature.setStyle(style)
          agvfeatures.path_feature.setGeometry(new LineString(path_coordinations))
          ChangeCargoIcon(agvfeatures.cargo_icon_feature, agv_information.CargoStatus)

        } else {

          var _agvfeature = new Feature({
            geometry: new Point(agv_information.Coordination)
          })
          _agvfeature.setStyle(AGVPointStyle(agv_information.AgvName, agv_information.TextColor))
          _agvfeature.set('agvname', agv_information.AgvName)
          _agvfeature.set("feature_type", this.FeatureKeys.agv)

          //
          var nav_path_feature = new Feature({
            geometry: new LineString([])
          })
          nav_path_feature.setStyle(CreateLocusPathStyles(agv_information.TextColor, 5))


          var _cargo_icon_feature = _agvfeature.clone()
          _cargo_icon_feature.setStyle(AGVCargoIconStyle())

          this.AGVFeatures[agv_information.AgvName] = {
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
          const isRightClick = event.originalEvent.button == 2
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
            if (currentAction == 'add-station' && isRightClick) {

              feature = CreateNewStationPointFeature(event.coordinate, this_vue.GenNewIndexOfStation());
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
              this_vue.PushPathEndPointData(feature)

          }
          return true;
        },
        /**滑鼠拖曳事件 */
        handleDragEvent: function (event) {
          var edit_action = this_vue.EditorOption.EditAction;
          if (this_vue.EditorOption.EditMode == 'view') {
            return;
          }
          if (edit_action == 'add-path' | edit_action == 'remove-path')
            return;

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
            if (currentAction == 'add-station' && ev.originalEvent.button == 2) {
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


    },

    HideNormalStations(hide) {


      var normalPtFeatures = this.StationPointsFeatures.filter(feature => feature.get('station_type') == 0)
      normalPtFeatures.forEach(feature => {
        if (hide) {


          var invisibleStyle = new Style({
            fill: new Fill({
              color: 'rgba(0, 0, 0, 0)' // 透明填充颜色
            }),
            stroke: new Stroke({
              color: 'rgba(0, 0, 0, 0)' // 透明边界颜色
            }),
            image: new Circle({
              radius: 0 // 半径为0，不显示 
            })
          });
          var oriStyle = feature.getStyle().clone()
          feature.set('visible-style', oriStyle)
          feature.setStyle(invisibleStyle)
        } else {
          var _oriStyle = feature.get('visible-style')
          feature.setStyle(_oriStyle)
        }
      })
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

              //TODO create bazier curve 
              // var points = createBezierCurvePoints(3, [feature.getGeometry().getCoordinates(), ori_endCoord, [20, 30]])
              // var geometry = new LineString(points)

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
    PushPathEndPointData(feature = new Feature()) {

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
        var startPointFeature = this.PathEditTempStore[0];
        var endPointFeature = this.PathEditTempStore[1];
        var startPoint = startPointFeature.getGeometry().getCoordinates();
        var endPoint = endPointFeature.getGeometry().getCoordinates();
        var midPoint = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2]
        var mindfeature = CreateNewStationPointFeature(midPoint, this.GenNewIndexOfStation());
        //this.PointLayer.getSource().addFeature(mindfeature)
        var points = createBezierCurvePoints(2, [startPoint, midPoint, endPoint])

        let lineFeature = new Feature(
          {
            geometry: new LineString(points),
          },
        );
        var isEqLink = endPointFeature.get('station_type') != 0;
        var endPointIndex = endPointFeature.get('index');
        var path_id = `${startPointFeature.get('index')}_${endPointIndex}`

        if (this.PointLinksLayer.getSource().getFeatures().find(f => f.get('path_id') == path_id))
          return;
        var oritargets = startPointFeature.get('targets');
        if (!oritargets)
          oritargets = []
        var startPtMapData = startPointFeature.get('data')
        startPtMapData.Target[endPointIndex] = 1//
        startPointFeature.set('data', startPtMapData)
        oritargets.push(endPointIndex)
        startPointFeature.set('targets', oritargets)
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
      // this.map.getView().setZoom(isShowSlamCoordi ? 4 : 1)
      // this.map.getView().setCenter(isShowSlamCoordi ? [2, 2] : [0, 0]);
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
            MapStore.dispatch('DownloadMapData', '')
            this._map_stations = JSON.parse(JSON.stringify(this.map_station_data))
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
      this.map_name = MapStore.getters.MapName
      this.ImageLayer = new ImageLayer({
        source: new Static({
          // url: 'Map.png',
          url: `${this.MapServerUrl}/MapFiles/${this.map_name}.png`,
          projection: projection,
          imageExtent: extent,
          imageSize: this.map_img_size,

        }),
        visible: this.map_image_display == 'visible'
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

      this.PointLinksLayer.setVisible(this.station_show && this.routePathsVisible)
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
        //this.map.getView().setZoom(4)
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
          if (style) {


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
              }
            }

          }

          this.previousSelectedFeatures.push(feature)
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
          var feature = CreateStationFeature(station)
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
        var feature_type = this.previousSelectedFeature.get('feature_type');
        this.contextMenuOptions.feature_type = feature_type;
        var data = this.previousSelectedFeature.get('data');
        if (data) {
          this.contextMenuOptions.title = data.Name
          this.contextMenuOptions.point_data = data
          this.contextMenuOptions.task_options = new MenuUseTaskOption(data.StationType)
          this.contextMenuOptions.show_task_dispatch = this.task_dispatch_menu_show
        }
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

    MapStore.dispatch('DownloadMapData').then(() => {
      this.RestoreSettingsFromLocalStorage();
      this.InitMap();
      watch(
        () => this.map_station_data, (newval, oldval) => {
          if (!newval)
            return;
          console.log('map_station_data_change');
          this._map_stations = JSON.parse(JSON.stringify(newval))
          this.UpdateStationPointLayer();
          this.UpdateStationPathLayer();
          this.MapDisplayModeOptHandler();
        }, { deep: true, immediate: true }
      )

      watch(() => this.agvs_info, (newval, oldval) => {
        if (!newval)
          return
        setTimeout(() => {
          this.UpdateAGVLayer()
        }, 100);
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

      document.getElementById(this.id).addEventListener('contextmenu', (ev) => {
        ev.preventDefault()
      })

    })
  },
}
</script>

<style lang="scss" scoped>
.map-component {
  width: 100%;
  height: 100%;
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
  width: 108px;
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
  .el-switch {
    position: relative;
    top: 6px;
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
}
</style>