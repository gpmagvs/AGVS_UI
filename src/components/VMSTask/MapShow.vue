<template>
  <div class="map-show border py-2 px-2 d-flex flex-row bg-light">
    <div class="w-100">
      <div class="my-1 d-flex flex-row justify-content-between">
        <el-tooltip content="Go to Location Of AGV">
          <el-button @click="OriginalZomm()"><i class="bi bi-house-door-fill"></i></el-button>
        </el-tooltip>
        <el-tooltip content="Go to Location Of AGV">
          <el-button @click="GoToAGVLoc()"><i class="bi bi-geo-alt-fill"></i></el-button>
        </el-tooltip>
        <el-button type="primary" :loading="reloadMapRequesting" @click="ReloadMapFromAGVS()">{{ $t('VMSTask.MapShow.ReLoadMapFromAGVS') }}</el-button>
        <div class="w-100 d-flex flex-row justify-content-end">
          <span class="p-1">MAP</span>
          <div>
            <b-form-input v-model="map_name" disabled size="sm" :state="map_data.Name != undefined"></b-form-input>
          </div>
          <!-- <b-button  varint="primary" size="sm" @click="DownloadMapData">重新下載圖資</b-button> -->
        </div>
      </div>
      <div
        v-loading="loading || reloadMapRequesting"
        ref="map"
        :key="reload_key"
        class="map border"
        @contextmenu.prevent="showContextMenu"
        @click="HideAllMenus">
        <!--編輯模式選單(有站點被選擇)-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showStationMenu"
          ref="contextMenu"
          :style="map_contextmenu_style">
          <div class="p-2 text-start"> Tag: <b>{{ current_select_featureID }}</b>
          </div>
          <div class="px-1" style="position:absolute;left:6px">
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="danger"
              @click="handleEditModeMenuClick('remove')">移除</b-button>
            <b-button
              variant="primary"
              class="w-100 my-1"
              size="sm"
              @click="handleEditModeMenuClick('point_setting')">點位設定</b-button>
            <!-- <b-button class="w-100 my-1" size="sm" @click="handleEditModeMenuClick('cut')">剪切</b-button> -->
          </div>
        </div>
        <!--編輯模式選單(無站點被選擇)-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showNoPointSelectedMenu"
          ref="contextMenu"
          :style="map_contextmenu_style">
          <div class="px-1" style="position:absolute;left:6px">
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="danger"
              @click="handleNoPointSelectedMenuClick('add_point')">新增站點</b-button>
            <!-- <b-button class="w-100 my-1" size="sm" @click="handleEditModeMenuClick('cut')">剪切</b-button> -->
          </div>
        </div>
        <!--任務選單-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showTaskAllocationMenu"
          ref="contextMenu"
          :style="map_contextmenu_style">
          <div class="p-2 text-start">
            <span v-show="!is_agv_feature_selected">Tag:</span>
            <span v-show="is_agv_feature_selected">AGV:</span>
            <b>{{ is_agv_feature_selected ? current_select_agv_name : current_select_featureID }}</b>
          </div>
          <div class="px-1" style="position:absolute;left:6px">
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="primary"
              @click="handleTaskAllocatModeMenuClick('move')">移動</b-button>
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="primary"
              @click="handleTaskAllocatModeMenuClick('load')">放貨</b-button>
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="primary"
              @click="handleTaskAllocatModeMenuClick('unload')">取貨</b-button>
          </div>
        </div>
        <!--AGV選單-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showAGVMenu"
          ref="contextMenu"
          :style="map_contextmenu_style">
          <div class="p-2 text-start border-bottom">
            <span>AGV :</span>
            <b>{{ current_select_agv_name }}</b>
          </div>
          <div class="px-1" style="position:absolute;left:6px">
            <el-color-picker v-model="color" show-alpha />
            <!-- <b-button
              class="w-100 my-1"
              size="sm"
              variant="danger"
              @click="handleAGVMenuItemClick('setting-color')"
            >設定顏色</b-button>-->
            <!-- <b-button class="w-100 my-1" size="sm" @click="handleEditModeMenuClick('cut')">剪切</b-button> -->
          </div>
        </div>
      </div>
    </div>
    <!-- <MapPointSettingDrawer ref="point-setting-drawer"></MapPointSettingDrawer> -->
  </div>
</template>
<script>
import 'ol/ol.css';
import ContextMenu from 'ol-contextmenu';
import { Map, View, Feature } from 'ol';
import { Layer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Circle as CircleStyle, Fill, Stroke, Style, Text, RegularShape, Image, Icon } from 'ol/style';
import { Pointer } from 'ol/interaction'
import LineString from 'ol/geom/LineString';
import MapAPI from '@/api/MapAPI'
import bus from '@/event-bus'
import Notifier from '@/api/NotifyHelper';
import { map_store, AGVStatusStore, UIStore } from '@/store'
// import MapPointSettingDrawer from '@/components/MapPointSettingDrawer.vue'

export default {
  name: 'MapComponent',
  components: {
    // MapPointSettingDrawer,
  },
  props: {
    edit_mode: {
      type: Boolean,
      default: false
    },
    task_allocatable: {
      type: Boolean,
      default: false
    },
    show_agv: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      reload_key: 1,
      loading: false,
      selected_feature: undefined,
      mouse_click_coordinate: undefined,
      map_name: 'Unknown',
      display_selected: "Name",
      agv_display_mode_selected: "show",
      map: new Map(),
      original_zoom: 1,
      showStationMenu: false,
      showTaskAllocationMenu: false,
      showNoPointSelectedMenu: false,
      showAGVMenu: false,
      reloadMapRequesting: false,
      path_plan_tags: [],
      contextMenu: {},
      agv_color_set: [
        'red', 'rgb(51, 194, 255)', 'yellow', 'rgb(64, 158, 255)', 'pink', 'gold', 'red', 'grey'
      ],
      map_contextmenu_style: {
        position: 'absolute',
        top: '112px',
        left: '400px',
        visibility: 'visible',
        zIndex: 200,
        width: '170px',
        height: '157px',
        //style="visibility: visible; z-index: 200;"
      },
      layer_index: {
        station: 1,
        station_line: 2,
        eq_station: 3,
        agv: 4,
        move_path: 5,
        path_plan: 6,
        mesh: 7,
      },
      map_data: {},
      stations: [],
      agvList: [],
      doubleArrowStyle: new Style({
        stroke: new Stroke({
          color: 'grey',
          width: 3,
          lineDash: null,
        }),
      }),
      NavPathLineStyle: new Style({
        stroke: new Stroke({
          color: 'red',
          width: 8,
          lineDash: null,
        }),
      }),
      PathPlanLineStyle: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 8,
          lineDash: null,
        }),
      }),
    }
  },
  async mounted() {
    this.loading = true;
    this.FetchMap();
  },
  computed: {
    isViewing() {
      return UIStore.getters.CurrentTabSelected == 7;
    },
    current_select_featureID() {
      if (this.selected_feature) {
        return this.selected_feature.getId();
      } else
        return "";
    },
    current_select_agv_name() {
      return (this.current_select_featureID + '').replace("AGV_", "");
    },
    station_features() {
      let features = [];
      this.stations.forEach(st => {
        if (st.feature != undefined)
          features.push(st.feature);
      });
      return features;
    },
    is_agv_feature_selected() {
      if (!this.selected_feature)
        return false;
      var feature_id = this.selected_feature.getId();
      console.info(feature_id);
      return (feature_id + '').includes('AGV')
    },
    Station_Layer() {
      return this.map.getLayers().item(this.layer_index.station);
    },
    Line_Layer() {
      return this.map.getLayers().item(this.layer_index.station_line);
    },
    AGV_Layer() {
      return this.map.getLayers().item(this.layer_index.agv);
    },
    Nav_Path_Layer() {
      return this.map.getLayers().item(this.layer_index.move_path);
    },
    PathPlan_Layer() {
      return this.map.getLayers().item(this.layer_index.path_plan);
    },
    Mesh_Layer() {
      return this.map.getLayers().item(this.layer_index.mesh);
    },
  },
  methods: {
    Reload() {
      //TODO RELOAD MAP
    },
    FetchMap() {
      var map = map_store.getters.GetMapData;
      this.loading = false;
      if (map == undefined || map.Points == undefined) {
        Notifier.Danger('圖資取得失敗(後端伺服器異常)', 'bottom', 3000);
      }
      else {
        Notifier.Success('Success Fetch Map Data From Server.', 'bottom', 2000);

        this.map_data = map;
        this.map_name = map.Name;

        this.stations = [];
        Object.keys(map.Points).forEach(index => {
          var Graph = map.Points[index].Graph
          var _tagID = map.Points[index].TagNumber;
          var _x = map.Points[index].X;
          var _y = map.Points[index].Y;
          var _IsVirtual = map.Points[index].IsVirtualPoint;
          var _name = map.Points[index].Graph.Display;
          if (_name == "" | _name == undefined) {
            _name = map.Points[index].Name;
          }
          var _station_type = map.Points[index].StationType;
          var _is_eq_station = map.Points[index].IsEquipment;
          var _is_charge_station = map.Points[index].IsCharge;
          var _feature = new Feature({
            geometry: new Point([_x, _y]),
            name: index,
          });
          _feature.setId(_tagID);
          _feature.set('name', _name)
          _feature.set('station_type', _is_eq_station ? 'eq' : (_is_charge_station ? 'charge' : 'normal'))
          _feature.set('isVirtual', _IsVirtual)

          this.stations.push(
            {
              index: parseInt(index),
              tag: _tagID,
              feature: _feature
            }

          );
        })

        this.MapInitializeRender();
        this.CreateAGVFeature();

        setInterval(() => {
          if (this.isViewing)
            this.UpdateAGVState();
        }, 100)

      }
    },
    CreateAGVFeature() {
      var _agv_state = AGVStatusStore.getters.MapUseState;
      console.log(_agv_state.Coordination)
      var _geometry = new LineString(_agv_state.Coordination)
      console.info('agv state updated' + `${JSON.stringify(_agv_state)}`);
      var agv_feature = new Feature({
        geometry: new Point(_agv_state.Coordination),
        name: _agv_state.AGV_Name,
      })
      var cargo_feature = new Feature({
        geometry: new Point(_agv_state.Coordination),
      })
      agv_feature.setId(_agv_state.AGV_Name);
      agv_feature.setStyle(new Style({
        image: new Icon({
          src: '/agv.png', // 设置PNG图像的路径
          scale: .8, // 设置PNG图像的缩放比例
          anchor: [0.5, 0.5], // 设置PNG图像的锚点，即图片的中心点位置
          size: [70, 70],// 设置PNG图像的大小
          opacity: 1,

        }),
        text: new Text({
          text: _agv_state.AGV_Name,
          offsetX: 4,
          offsetY: 46,
          font: 'bold 18px Arial',
          fill: new Fill({
            color: _agv_state.State == 'DOWN' ? 'red' : _agv_state.State == 'RUN' ? 'rgb(0, 139, 0)' : 'orange',
          }),
          backgroundFill: new Fill({
            color: 'rgb(186, 219, 255,0.7)',
          })
        }),
      }));
      cargo_feature.setStyle(new Style({
        image: new Icon({
          src: '/images/tray.png', // 设置PNG图像的路径
          scale: 1, // 设置PNG图像的缩放比例
          anchor: [-0.0, .7], // 设置PNG图像的锚点，即图片的中心点位置
          size: [70, 70],// 设置PNG图像的大小
          opacity: 0,
        }),
        text: new Text({
          text: '',
          offsetX: 55,
          offsetY: -52,
          font: 'bold 12px Arial',
          fill: new Fill({
            color: 'blue',
          })
        })
      }))
      agv_feature.set('cargo_feature', cargo_feature)
      var _agv_layer_source = this.AGV_Layer.getSource();
      // this.AGV_Layer.getSource().changed();
      console.info('AGV Feature created.');
      _agv_layer_source.addFeature(agv_feature);
      _agv_layer_source.addFeature(cargo_feature);
    },
    GoToAGVLoc() {
      var agv_map_state = AGVStatusStore.getters.MapUseState;
      this.map.getView().setCenter(agv_map_state.Coordination)
    },
    async ReloadMapFromAGVS() {
      this.reloadMapRequesting = true;
      var result = await map_store.dispatch('ReloadMapFromAGVS', "abc");
      console.log(result)
      this.reloadMapRequesting = false;
      if (!result || !result.confirm) {
        this.$swal.fire(
          {
            title: '地圖下載失敗',
            text: '',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        return;
      } else {
        this.map.setTarget(null);
        this.FetchMap();
        this.$swal.fire(
          {
            title: '地圖重新下載成功!',
            text: '',
            icon: 'success',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
      }


    },
    UpdateAGVState() {
      var _agv_state = AGVStatusStore.getters.MapUseState;
      var _agv_layer_source = this.AGV_Layer.getSource();
      var _agv_feature = _agv_layer_source.getFeatures().find(feature => feature.getId() == _agv_state.AGV_Name);
      if (!_agv_feature)
        return;
      var style = _agv_feature.getStyle();
      var text = style.getText();
      if (text) {
        var fill = text.getFill()
        fill.setColor(_agv_state.State == 'DOWN' ? 'red' : _agv_state.State == 'RUN' ? 'rgb(0, 139, 0)' : 'Orange')
        text.setFill(fill);
        text.setText(`${_agv_state.AGV_Name}\r\n(${_agv_state.State})`);
      }
      var image = style.getImage()
      if (image) {
        image.setRotation((_agv_state.Rotation - 90) * -1 * Math.PI / 180.0)
        style.setImage(image)
      }
      _agv_feature.setStyle(style)
      _agv_feature.setGeometry(new Point(_agv_state.Coordination))

      var SetCargoVisible = (agv_feature, agv_state) => {
        var _agv_corrdination = agv_feature.getGeometry().getCoordinates();
        var _cargo_feature = agv_feature.get('cargo_feature')
        if (!_cargo_feature)
          return;
        var _style = _cargo_feature.getStyle().clone();
        var _cargo_image = _style.getImage();
        _cargo_image.setOpacity(agv_state.CargoExist ? 1 : 0)
        _cargo_feature.setGeometry(new Point(_agv_corrdination))
        _style.setImage(_cargo_image)

        var text = _style.getText();
        if (text) {
          text.setText(agv_state.CargoID);
          _style.setText(text);
        }
        _cargo_feature.setStyle(_style);
      }
      SetCargoVisible(_agv_feature, _agv_state)
      this.UpdateNavPathRender(_agv_state.AGV_Name, AGVStatusStore.getters.AGV_Naving_Tags)
    },
    OriginalZomm() {
      this.GoToAGVLoc();
      this.map.getView().setZoom(this.original_zoom);

    },
    GetNormalStations() {
      if (!this.map_data)
        return [];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => st.StationType == 0);
    },
    GetSTKStations() {
      if (!this.map_data)
        return [];

      const lduldable_types = [1, 2, 4, 5, 6, 11, 12, 21, 22];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => st.IsEquipment);
    },
    GetChargeStations() {
      if (!this.map_data)
        return [];
      const chargable_types = [3, 5, 6];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => chargable_types.includes(st.StationType));
    },
    GetBatExchangerStations() {
      if (!this.map_data)
        return [];
      const chargable_types = [7];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => chargable_types.includes(st.StationType));
    },
    MapInitializeRender() {

      const lineFeatures = this.CreateLineFeaturesOfEachStaion();
      this.map = new Map({
        target: this.$refs.map,
        layers: [
          // add a vector layer with no source
          new VectorLayer({//0
            source: new VectorSource(),
            name: '1'
          }),
          // add a vector layer with three points
          new VectorLayer({//1
            source: new VectorSource({
              features: this.station_features
            }),
            zIndex: 2
          }),
          new VectorLayer({//3
            source: new VectorSource({
              features: lineFeatures
            }),
            style: this.doubleArrowStyle,
            zIndex: 1
          }),
          new VectorLayer({//2
            source: new VectorSource(),
          }),

          new VectorLayer({//4
            source: new VectorSource({
              features: [],
            }
            ),
            zIndex: 11111
          }),
          new VectorLayer({//5:導航任務路徑顯示
            source: new VectorSource({
              features: []
            }),
            zIndex: 122
          }),

          new VectorLayer({//路徑規劃測試顯示
            source: new VectorSource({
              features: []
            }),
            style: this.PathPlanLineStyle
          }),
        ],
        view: new View({
          center: [57000, 52000],
          zoom: 9,
        }),
      });

      // this.UpdateAGVLayer(['AGV_1', 'AGV_2', 'AGV_3']);

      this.CreateMapEvent()
      // add text to each point
      this.CreateMeshLayer();
      this.StationStyleRender();

      var map_view_cache = localStorage.getItem('map_view');
      if (map_view_cache) {
        var map_view_options = JSON.parse(map_view_cache)
        this.map.getView().setCenter(map_view_options.center)
        this.map.getView().setZoom(map_view_options.zoom)
        this.original_zoom = map_view_options.zoom;
      }


      //this.Line_Layer.getSource().addFeature(lineFeature);
    },
    CreateMapEvent() {
      this.map.on('click', (evt) => {
        this.showTaskAllocationMenu = this.showStationMenu = this.showNoPointSelectedMenu = false;
      })
      this.map.on('moveend', (evt) => {
        var zoom = this.map.getView().getZoom();
        var center = this.map.getView().getCenter();
        localStorage.setItem('map_view', JSON.stringify({ zoom: zoom, center: center }));
      })
      // 监听 feature 的右键点击事件
      this.map.on('pointerdown', (event) => {
        if (event.originalEvent.button === 2 | event.originalEvent.button === 0) {
          this.selected_feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
            setTimeout(() => {
              this.$emit('OnFeatureClicked', feature)
            }, 100);
            return feature;
          });
        }
      });
      // 创建一个拖动交互操作
      var that = this;
      var dragInteraction = new Pointer({
        handleDownEvent: function (event) {

          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });
          that.mouse_click_coordinate = event.coordinate
          that.selected_feature = feature;
          if (!that.edit_mode)
            return false;
          if (!feature) {
            return false;
          }

          var feature_id = feature.getId();
          if (feature_id) {
            this.feature_ = feature;
            this.coordinate_ = event.coordinate;
            return true;
          }
          return false;
        },
        handleDragEvent: function (event) {
          var deltaX = event.coordinate[0] - this.coordinate_[0];
          var deltaY = event.coordinate[1] - this.coordinate_[1];
          var geometry = this.feature_.getGeometry();
          geometry.translate(deltaX, deltaY);
          this.coordinate_ = event.coordinate;

          var New_lineFeatures = that.CreateLineFeaturesOfEachStaion();
          var source = that.Line_Layer.getSource();
          source.clear(); // 清空原有的要素
          source.addFeatures(New_lineFeatures); // 添加新的要素
          //更新本地圖資
          var tagID = that.selected_feature.getId();
          var coordinates = that.selected_feature.getGeometry().getCoordinates();
          // 找到 tagid 为 3 的对象并替换其 value 属性
          for (let pt_index in that.map_data.Points) {
            if (that.map_data.Points[pt_index].TagNumber === tagID) {
              that.map_data.Points[pt_index].Graph.X = Math.round(coordinates[0] / 1000.0, 0);
              that.map_data.Points[pt_index].Graph.Y = Math.round(coordinates[1] / -1000.0, 0);
              break; // 找到一个即可停止循环
            }
          }

          that.UpdatePathPlanRender(that.path_plan_tags);

        },
        handleUpEvent: function () {
          this.feature_ = null;
          this.coordinate_ = null;
          return false;
        },
        handleMoveEvent: function (event) {
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

      // 将拖动交互操作添加到地图中
      this.map.addInteraction(dragInteraction);
    },
    CreateMeshLayer() {
      // 创建一个矢量图层和矢量数据源
      var mesh_vectorSource = new VectorSource();
      var mesh_vectorLayer = new VectorLayer({
        source: mesh_vectorSource,
        zIndex: -1
      });

      // 创建一个网格样式
      var gridStyle = new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.1)',
          width: 1,
        })
      });


      // 创建一个网格要素并添加到矢量数据源中
      var extent = this.map.getView().getProjection().getExtent(); // 获取地图范围
      var gridInterval = 80000; // 设置网格间距为10000米
      for (var x = extent[0]; x < extent[2]; x += gridInterval) {
        var gridLine = new LineString([[x, extent[1]], [x, extent[3]]]); // 创建垂直网格线
        var gridFeature = new Feature({
          geometry: gridLine
        });
        gridFeature.setStyle(gridStyle);
        mesh_vectorSource.addFeature(gridFeature);
      }
      for (var y = extent[1]; y < extent[3]; y += gridInterval) {
        var gridLine = new LineString([[extent[0], y], [extent[2], y]]); // 创建水平网格线
        var gridFeature = new Feature({
          geometry: gridLine
        });
        gridFeature.setStyle(gridStyle);
        mesh_vectorSource.addFeature(gridFeature);
      }
      this.map.addLayer(mesh_vectorLayer);
    },
    GetAgvProp(agv_name) {
      return this.agvList.find(av => av.name == agv_name);
    },
    HightlightAGV(agv_name) {
      this.agvList.forEach(prop => {
        prop.heighlight = false
        prop.isOnline = false
      })
      this.GetAgvProp(agv_name).heighlight = true;
    },
    handleEditModeMenuClick(action) {
      console.log(action);
      this.showStationMenu = false;
      if (action === 'point_setting') {
        var pointData = this.GetPointDataByFeature(this.selected_feature);
        if (pointData)
          this.$refs['point-setting-drawer'].Show(pointData);
      }
    },
    handleNoPointSelectedMenuClick(action) {
      console.log(action);
      this.showNoPointSelectedMenu = false;
      if (action === 'add_point') {
        var pt_index = this.GetNewPointIndex();
        var source = this.Station_Layer.getSource()
        var _feature = new Feature({
          geometry: new Point(this.mouse_click_coordinate),
          //   name: Graph.Display,
          name: pt_index,
        });
        _feature.setId(pt_index);
        this.stations.push(
          {
            index: pt_index,
            tag: pt_index,
            feature: _feature
          }
        );

        source.addFeature(_feature);
        //新增資料
        var new_point = this.CloneAPointData();
        new_point.Graph.Display = new_point.Name = pt_index + '';
        new_point.TagNumber = (pt_index);

        this.map_data.Points[pt_index] = new_point;
        this.StationStyleRender();
      }
    },

    handleAGVMenuItemClick(action) {
      console.log(action);
      this.showAGVMenu = false;
      if (action === 'add_point') {
      }
    },
    handleTaskAllocatModeMenuClick(action) {
      console.log(action);
      this.showTaskAllocationMenu = false;
    },
    /**從圖資資料中產生一個新的Point Index */
    GetNewPointIndex() {
      const sortedKeys = Object.keys(this.map_data.Points).map(Number).sort((a, b) => a - b); // 小到大排序
      const lastKey = sortedKeys[sortedKeys.length - 1]; // 取得最後一個key
      return lastKey + 1;
    },
    CloneAPointData() {
      var points = Object.values(this.map_data.Points);
      return points[points.length - 1]
    },
    HideAllMenus() {
      this.showAGVMenu = this.showNoPointSelectedMenu = this.showStationMenu = this.showTaskAllocationMenu = false;
    },
    showContextMenu(event) {
      event.preventDefault();

      this.showStationMenu = false;
      this.map_contextmenu_style.top = event.clientY + 'px'
      this.map_contextmenu_style.left = event.clientX + 'px'

      if (this.selected_feature) {

        this.map_contextmenu_style.height = '157px';

        if (this.edit_mode) {

          if (this.is_agv_feature_selected) {

            this.showAGVMenu = true;
          } else {
            this.showStationMenu = true;
          }
        }
        if (this.task_allocatable) {
          this.showTaskAllocationMenu = true;
        }
      } else {
        if (this.edit_mode) {
          this.map_contextmenu_style.height = '100px';
          this.showNoPointSelectedMenu = true;
        }
      }
    },
    GetPointDataByFeature(feature) {
      var tagID = feature.getId();
      if (tagID) {
        var point = Object.values(this.map_data.Points).find(pt => pt.TagNumber == tagID);
        var index = Object.keys(this.map_data.Points).find(key => this.map_data.Points[key] == point);
        return {
          index: index,
          point: point
        }
      } else
        return undefined;

    },

    StationStyleRender() {
      this.map.getLayers().item(this.layer_index.station).getSource().getFeatures().forEach((feature) => {
        var station = this.stations.find(st => st.feature == feature);
        var showTagNumber = this.display_selected == 'Tag';
        var showName = this.display_selected == 'Name';
        var station_name = station.feature.get('name')
        var station_type = station.feature.get('station_type') //'eq','normal'
        //_feature.set('station_type', _is_eq_station ? 'eq' : 'normal')

        const name = (showTagNumber ? station.tag : (showName ? station_name : station.index)) + '';
        var nameInt = parseInt(name);
        var isCharge = station_type == 'charge';
        var isEQOrCharge = station_type == 'eq' || isCharge


        var EqImg = new RegularShape({
          radius: 11,
          fill: new Fill({
            color: isCharge ? 'pink' : 'grey',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 3,
          }),
          angle: 0,
          points: 3,
        })

        var NormalPtImg = new CircleStyle({
          radius: 9,
          fill: new Fill({
            color: 'gold',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 3,
          }),
        })

        feature.setStyle(new Style({
          image: isEQOrCharge ? EqImg : NormalPtImg,
          text: new Text({
            text: name,
            offsetX: -18,
            offsetY: -18,
            font: 'bold 18px sans-serif',
            fill: new Fill({
              color: isEQOrCharge ? isCharge ? 'pink' : 'lime' : 'gold'
            }),
            stroke: new Stroke({
              color: 'black',
              width: 3
            })
          }),
        }));
      });

      this.Station_Layer.getSource().changed();
    },

    NameDisplayChangeHandle() {
      this.StationStyleRender();
    },
    AGVDisplayChangeHandle() {

      this.AGVDisplayControl(this.agv_display_mode_selected == 'show');
    },
    UpdateNavPathRender(agv_name, tags) {
      var layerName = `agv_path_layer_${agv_name}`
      var layer = this.map.getLayers().getArray().find(layer => layer.get('id') == layerName);
      if (layer) {
        this.map.removeLayer(layer);
      }
      // 创建一个矢量图层和矢量数据源
      var path_vectorSource = new VectorSource();
      var path_vectorLayer = new VectorLayer({
        source: path_vectorSource,
        zIndex: 666,
        id: layerName
      });
      this.map.addLayer(path_vectorLayer)
      let source = path_vectorLayer.getSource();
      var features = this.CreateLineFeaturesOfPath(tags, 'red');
      source.addFeatures(features)
      source.changed();
    },
    UpdatePathPlanRender(tags = []) {

      this.path_plan_tags = tags;
      let source = this.PathPlan_Layer.getSource();
      source.clear();

      if (tags.length == 0) {
        return;
      }
      var features = this.CreateLineFeaturesOfPath(tags);
      source.addFeatures(features);
      source.changed();
    },
    CreateLineFeaturesOfEachStaion() {
      // 创建一条线要素，连接两个点要素
      var lineFeatures = [];
      Object.keys(this.map_data.Points).forEach(index_str => {
        var index = parseInt(index_str)
        var current_station = this.stations.find(st => st.index == index);
        var targets = this.map_data.Points[index_str].Target;
        Object.keys(targets).forEach(index_str => {
          var _index = parseInt(index_str)
          //找到
          var station_link = this.stations.find(st => st.index == _index);
          if (station_link != undefined) {

            let lineFeature = new Feature({
              geometry: new LineString([current_station.feature.getGeometry().getCoordinates(), station_link.feature.getGeometry().getCoordinates()]),
            });

            lineFeatures.push(lineFeature);
          }
        })

      })

      return lineFeatures;
    },
    CreateLineFeaturesOfPath(tags = [], color) {
      // 创建一条线要素，连接两个点要素
      var lineFeatures = [];

      for (let index = 0; index < tags.length; index++) {
        const tag = tags[index];
        const next_tag = tags[index + 1];
        //找出feature
        if (next_tag != undefined) {

          var current_station = this.stations.find(st => st.tag == tag);
          var next_station = this.stations.find(st => st.tag == next_tag);
          let lineFeature = new Feature({
            geometry: new LineString(
              [current_station.feature.getGeometry().getCoordinates(), next_station.feature.getGeometry().getCoordinates()],
            ),
          });
          lineFeature.setStyle(new Style(
            {
              stroke: new Stroke({
                color: color,
                width: 6
              }),
            }
          ));
          lineFeatures.push(lineFeature);

        }
      }
      return lineFeatures;
    },
    AGVDisplayControl(display) {
      this.AGV_Layer.setVisible(display);
    }

  },
};
</script>
<style>
.map-show {}

.ol-zoom .ol-zoom-in,
.ol-zoom .ol-zoom-out {
  font-size: 2.5rem;
}

.map {
  height: 95%;
  width: 100%;
}
</style>