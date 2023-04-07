<template>
  <div class="map-show border py-2 px-2 d-flex flex-row bg-light">
    <div class="text-start m-3 py-3" style="width:117px">
      <span>顯示方式</span>
      <b-form-group
        @change="NameDisplayChangeHandle"
        class="w-100 px-3"
        v-slot="{ ariaDescribedby }"
      >
        <b-form-radio
          v-model="display_selected"
          :aria-describedby="ariaDescribedby"
          name="some-radios"
          value="Tag"
        >Tag</b-form-radio>
        <b-form-radio
          v-model="display_selected"
          :aria-describedby="ariaDescribedby"
          name="some-radios"
          value="Index"
        >Index</b-form-radio>
      </b-form-group>
      <span>AGV顯示</span>
      <b-form-group @change="AGVDisplayChangeHandle" class="w-100 px-3">
        <b-form-radio v-model="agv_display_mode_selected" value="hidden">隱藏</b-form-radio>
        <b-form-radio v-model="agv_display_mode_selected" value="show">顯示</b-form-radio>
      </b-form-group>
    </div>
    <div class="w-100">
      <div class="w-100 d-flex flex-row justify-content-end">
        <span class="p-1">MAP</span>
        <div>
          <b-form-input v-model="map_name" disabled size="sm" :state="map_data.Name!=undefined"></b-form-input>
        </div>
      </div>
      <div
        v-loading="loading"
        ref="map"
        :key="reload_key"
        class="map border"
        @contextmenu.prevent="showContextMenu"
        @click="HideAllMenus"
      >
        <!--編輯模式選單(有站點被選擇)-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showStationMenu"
          ref="contextMenu"
          :style="map_contextmenu_style"
        >
          <div class="p-2 text-start">
            Tag:
            <b>{{ current_select_featureID}}</b>
          </div>
          <div class="px-1" style="position:absolute;left:6px">
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="danger"
              @click="handleEditModeMenuClick('remove')"
            >移除</b-button>
            <b-button
              variant="primary"
              class="w-100 my-1"
              size="sm"
              @click="handleEditModeMenuClick('point_setting')"
            >點位設定</b-button>
            <!-- <b-button class="w-100 my-1" size="sm" @click="handleEditModeMenuClick('cut')">剪切</b-button> -->
          </div>
        </div>

        <!--編輯模式選單(無站點被選擇)-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showNoPointSelectedMenu"
          ref="contextMenu"
          :style="map_contextmenu_style"
        >
          <div class="px-1" style="position:absolute;left:6px">
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="danger"
              @click="handleNoPointSelectedMenuClick('add_point')"
            >新增站點</b-button>
            <!-- <b-button class="w-100 my-1" size="sm" @click="handleEditModeMenuClick('cut')">剪切</b-button> -->
          </div>
        </div>

        <!--任務選單-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showTaskAllocationMenu"
          ref="contextMenu"
          :style="map_contextmenu_style"
        >
          <div class="p-2 text-start">
            <span v-show="!is_agv_feature_selected">Tag:</span>
            <span v-show="is_agv_feature_selected">AGV:</span>
            <b>{{is_agv_feature_selected? current_select_agv_name:current_select_featureID}}</b>
          </div>
          <div class="px-1" style="position:absolute;left:6px">
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="primary"
              @click="handleTaskAllocatModeMenuClick('move')"
            >移動</b-button>
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="primary"
              @click="handleTaskAllocatModeMenuClick('load')"
            >放貨</b-button>
            <b-button
              class="w-100 my-1"
              size="sm"
              variant="primary"
              @click="handleTaskAllocatModeMenuClick('unload')"
            >取貨</b-button>
          </div>
        </div>

        <!--AGV選單-->
        <div
          class="edit-mode-menu bg-light border rounded"
          v-if="showAGVMenu"
          ref="contextMenu"
          :style="map_contextmenu_style"
        >
          <div class="p-2 text-start border-bottom">
            <span>AGV :</span>
            <b>{{ current_select_agv_name}}</b>
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
    <MapPointSettingDrawer ref="point-setting-drawer"></MapPointSettingDrawer>
  </div>
</template>
  
  <script>
import 'ol/ol.css';
import ContextMenu from 'ol-contextmenu';

import { Map, View, Feature } from 'ol';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Point } from 'ol/geom';
import { Circle as CircleStyle, Fill, Stroke, Style, Text, RegularShape, Image, Icon } from 'ol/style';
import { Pointer } from 'ol/interaction'
import LineString from 'ol/geom/LineString';
import MapAPI from '@/api/MapAPI'
import bus from '@/event-bus'
import { my_data } from '@/gpm_param.js'
import Notifier from '@/api/NotifyHelper';
import MapPointSettingDrawer from '@/components/MapPointSettingDrawer.vue'
import { watch, ref } from 'vue';

export default {
  name: 'MapComponent',
  components: {
    MapPointSettingDrawer,
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
      display_selected: "Tag",
      agv_display_mode_selected: "show",
      map: new Map(),
      showStationMenu: false,
      showTaskAllocationMenu: false,
      showNoPointSelectedMenu: false,
      showAGVMenu: false,
      path_plan_tags: [],
      contextMenu: {},
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
      agvList: [{
        name: 'AGV-1',
        current_tag: 50,
        previous_tag: -1,
        color: 'rgb(255, 101, 70)'
      },
      {
        name: 'AGV-2',
        current_tag: 49,
        previous_tag: -1,
        color: 'rgb(18, 141, 70)'
      },
      {
        name: 'AGV-3',
        current_tag: 47,
        previous_tag: -1,
        color: 'rgb(43, 165, 255)'
      },
      {
        name: 'AGV-4',
        current_tag: 45,
        previous_tag: -1,
        color: 'rgb(255, 183, 8)'
      }],
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
      agvIcon: new Icon({
        src: '/emo.png', // 设置PNG图像的路径
        scale: 1, // 设置PNG图像的缩放比例
        anchor: [0.5, 1], // 设置PNG图像的锚点，即图片的中心点位置
        size: [50, 50] // 设置PNG图像的大小
      })

    }
  },
  async mounted() {
    this.loading = true;
    setTimeout(() => {
      this.FetchMap();
      bus.on('/agv_name_list', (agv_data) => {
        this.UpdateAGVLayer(agv_data);
      });

    }, 1000);

  },
  computed: {
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

      MapAPI.GetMapFromLocal().then((map) => {
        this.loading = false;
        if (map == undefined) {
          Notifier.Danger('圖資取得失敗(後端伺服器異常)', 'bottom', 3000);
        }
        else if (map.Points == undefined) {
          Notifier.Danger('圖資取得失敗(AGVS伺服器異常)', 'bottom', 3000);
        }
        else {
          Notifier.Success('Success Fetch Map Data From Server.', 'bottom', 2000);

          this.map_data = map;
          this.map_name = map.Name;

          this.stations = [];
          Object.keys(map.Points).forEach(index => {
            var Graph = map.Points[index].Graph
            var _tagID = map.Points[index].TagNumber;
            var _feature = new Feature({
              geometry: new Point([Graph.X * 1000, Graph.Y * -1000]),
              //   name: Graph.Display,
              name: index,
            });
            _feature.setId(_tagID);

            this.stations.push(
              {
                index: parseInt(index),
                tag: _tagID,
                feature: _feature
              }

            );
          })

          this.MapInitializeRender();
          bus.on('/agv_current_tag', (tag) => {

            if (tag != 0 && this.agv.previous_tag != tag) {
              this.agv.current_tag = tag;
              this.AGV_Feature.setGeometry(new Point(this.agv_position));
              this.AGV_Layer.getSource().changed();
            }
            this.agv.previous_tag = tag;
          })

        }

      });
    },
    get_agv_position(name) {
      var agv = this.agvList.find(agv => agv.name == name);
      var station = this.stations.find(st => st.tag == agv.current_tag);
      if (station == undefined)
        return [0, 0];
      else {
        return station.feature.getGeometry().getCoordinates();
      }
    },
    GetAgvFeatureByName(name) {

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
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => st.StationType == 2);
    },
    GetChargeStations() {
      if (!this.map_data)
        return [];
      const chargable_types = [3, 5, 6];
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
            zIndex: 4
          }),
          new VectorLayer({//5:導航任務路徑顯示
            source: new VectorSource({
              features: []
            }),
            style: this.NavPathLineStyle
          }),

          new VectorLayer({//路徑規劃測試顯示
            source: new VectorSource({
              features: []
            }),
            style: this.PathPlanLineStyle
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 6,
        }),
      });

      // this.UpdateAGVLayer(['AGV_1', 'AGV_2', 'AGV_3']);

      this.CreateMapEvent()
      // add text to each point
      this.CreateMeshLayer();
      this.StationStyleRender();



      //this.Line_Layer.getSource().addFeature(lineFeature);
    },
    CreateMapEvent() {
      this.map.on('click', (evt) => {
        this.showTaskAllocationMenu = this.showStationMenu = this.showNoPointSelectedMenu = false;
      })

      // 监听 feature 的右键点击事件
      this.map.on('pointerdown', (event) => {
        if (event.originalEvent.button === 2) {
          this.selected_feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
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
    UpdateAGVLayer(agv_data) {

      var output = this.CreateAGVFeatures(agv_data);
      var agv_layer_source = this.AGV_Layer.getSource()
      var agv_nav_path_layer_source = this.Nav_Path_Layer.getSource()
      agv_layer_source.clear();
      agv_nav_path_layer_source.clear();
      agv_layer_source.addFeatures(output.agv_features);
      agv_nav_path_layer_source.addFeatures(output.agv_nav_path_features);
      agv_layer_source.changed();
      agv_nav_path_layer_source.changed();
      this.AGVStyleRender();
    },
    CreateAGVFeatures(agv_data = []) {

      var agv_features = [];
      var agv_nav_path_features = [];
      this.agvList = [];
      agv_data.forEach(info => {
        var agv_name = info.AGV_Name;
        var agv_current_tag = info.Current_Tag
        this.agvList.push({
          name: agv_name,
          current_tag: agv_current_tag,
          previous_tag: -1,
          color: 'red'
        })

        var agv_position = this.get_agv_position(agv_name);
        var agv_feature = new Feature({
          geometry: new Point(agv_position),
          name: agv_name,
        })
        agv_feature.setId('AGV_' + agv_name);
        agv_features.push(agv_feature);

        var nav_path_feature = new Feature({
          geometry: new Point(agv_position),
          name: agv_name
        })
        agv_nav_path_features.push(nav_path_feature);
      });
      return { agv_features: agv_features, agv_nav_path_features: agv_nav_path_features }
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
    StationStyleRender() {
      this.map.getLayers().item(this.layer_index.station).getSource().getFeatures().forEach((feature) => {
        var station = this.stations.find(st => st.feature == feature);
        var showTagNumber = this.display_selected == 'Tag';
        const name = (showTagNumber ? station.tag : station.index) + '';
        var nameInt = parseInt(name);
        var isEQStation = nameInt % 2 == 0

        var trangleImg = new RegularShape({
          radius: 6,
          fill: new Fill({
            color: 'rgb(37, 172, 95)',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 2,
          }),
          angle: 0,
          points: 3,
        })

        var circleImg = new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: 'rgb(243, 123, 55)',
          }),
          stroke: new Stroke({
            color: 'black',
            width: 2,
          }),
        })

        feature.setStyle(new Style({
          image: isEQStation ? trangleImg : circleImg,
          text: new Text({
            text: name,
            offsetX: -18,
            offsetY: -18,
            font: 'bold 14px sans-serif',
            fill: new Fill({
              color: showTagNumber ? 'black' : 'grey'
            })
          }),
        }));
      });

      this.Station_Layer.getSource().changed();
    },

    AGVStyleRender() {

      this.AGV_Layer.getSource().getFeatures().forEach(agv_feature => {
        const name = agv_feature.get('name');
        var agv_prop = this.agvList.find(agv => agv.name == name);
        if (agv_prop) {
          var agvIcon = new Icon({
            src: '/station.png', // 设置PNG图像的路径
            scale: .4, // 设置PNG图像的缩放比例
            anchor: [-0.1, 1], // 设置PNG图像的锚点，即图片的中心点位置
            size: [70, 70],// 设置PNG图像的大小
            opacity: .7,
          })

          agv_feature.setStyle(new Style({
            image: agvIcon,
            text: new Text({
              text: name,
              offsetX: 30,
              offsetY: -38,
              font: 'bold 18px sans-serif',
              fill: new Fill({
                color: 'white'
              }),
              backgroundFill: new Fill({
                color: agv_prop.color
              })
            }),
          }));

        }
      })



    },
    NameDisplayChangeHandle() {
      this.StationStyleRender();
    },
    AGVDisplayChangeHandle() {

      this.AGVDisplayControl(this.agv_display_mode_selected == 'show');
    },
    ClearNavPath() {
      let source = this.Nav_Path_Layer.getSource();
      source.clear(); //把原有的feature移除
    },
    UpdateNavPathRender(tags = []) {

      my_data.test = Date.now();
      this.ClearNavPath();
      if (tags.length == 0) {
        return;
      }
      let source = this.Nav_Path_Layer.getSource();
      var features = this.CreateLineFeaturesOfPath(tags);
      features.forEach(feature => {
        source.addFeature(feature)
      })
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
      features.forEach(feature => {
        source.addFeature(feature)
      })
      source.changed();
    },
    CreateLineFeaturesOfPath(tags = []) {
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
            geometry: new LineString([current_station.feature.getGeometry().getCoordinates(), next_station.feature.getGeometry().getCoordinates()]),
          });
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
  
<style scoped>
.map-show {
}

.map {
  height: 95%;
  width: 100%;
}
</style>
  