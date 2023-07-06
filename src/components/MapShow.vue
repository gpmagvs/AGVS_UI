<template>
  <div @mousemove="MapMouseMoveHandler">
    <b-alert class="map-notify py-1 px-2 text-start" v-if="!only_view" show variant="info">
      <div class="mode-text">{{Mode_Text}}</div>
      <div class="d-flex flex-row">
        <div class="tips-text" v-for="tip in Tips" :key="tip">
          <i class="bi bi-info-square"></i>
          {{tip}}
        </div>
      </div>
    </b-alert>
    <div class="map-show h-100 border py-2 px-2 d-flex flex-row bg-light">
      <div class="w-100">
        <div
          v-if="hoverPointData!=undefined"
          id="point-tooltip"
          class="rounded text-start p-2"
          v-bind:style="TooltipStyle"
        >
          <div>名稱 :{{ hoverPointData.Name }}</div>
          <div>Tag :{{ hoverPointData.TagNumber }} ({{ hoverPointData.X }},{{ hoverPointData.Y }},{{ hoverPointData.Direction }} )</div>
          <div>Tag :{{ hoverPointData.TagNumber }}</div>
        </div>
        <div class="header-div w-100 d-flex flex-row justify-content-between">
          <div class="options text-start d-flex flex-row">
            <div class="d-flex flex-row option-container">
              <span>
                <i class="bi bi-three-dots-vertical"></i>顯示方式
              </span>
              <b-form-group @change="NameDisplayChangeHandle" v-slot="{ ariaDescribedby }">
                <b-form-radio
                  v-model="display_selected"
                  :aria-describedby="ariaDescribedby"
                  name="some-radios"
                  value="Index"
                >Index</b-form-radio>
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
                  value="Name"
                >名稱</b-form-radio>
              </b-form-group>
            </div>
            <div class="d-flex flex-row option-container">
              <span>
                <i class="bi bi-three-dots-vertical"></i>AGV顯示
              </span>
              <b-form-group @change="AGVDisplayChangeHandle">
                <b-form-radio v-model="agv_display_mode_selected" value="hidden">隱藏</b-form-radio>
                <b-form-radio v-model="agv_display_mode_selected" value="show">顯示</b-form-radio>
              </b-form-group>
            </div>
          </div>
          <div>
            <b-form-input v-model="map_name" disabled size="sm" :state="map_data.Name!=undefined"></b-form-input>
          </div>
        </div>
        <div
          v-loading="loading"
          ref="map"
          :key="reload_key"
          class="map border"
          @click="HideAllMenus"
        >
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
            </div>
          </div>
        </div>
      </div>
      <MapPointSettingDrawer
        ref="point-setting-drawer"
        @OnPointSettingChanged="PointSettingChangedHandle"
      ></MapPointSettingDrawer>
    </div>
    <b-modal
      draggable
      title="移除路徑"
      v-model="selectPathVisible"
      :hide-header-close="true"
      hide-footer
      no-close-on-esc
      @cancel="()=>{selectPathVisible=false}"
      header-bg-variant="primary"
      header-text-variant="light"
    >
      <el-table height="150px" row-key="startPoint.Name" :data="PathesSelectedForDelete">
        <el-table-column label="起點" prop="startPoint.Name"></el-table-column>
        <el-table-column label="終點" prop="endPoint.Name"></el-table-column>
        <el-table-column>
          <template #default="scope">
            <b-button
              variant="danger"
              @click="RemovePathByPointsIndex( scope.row.startStation_Index, scope.row.endStation_Index)"
            >Remove</b-button>
          </template>
        </el-table-column>
      </el-table>
    </b-modal>
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
import { Pointer, DragPan } from 'ol/interaction'
import LineString from 'ol/geom/LineString';
import MapAPI from '@/api/MapAPI'
import bus from '@/event-bus'
import Notifier from '@/api/NotifyHelper';
import MapPointSettingDrawer from '@/components/MapPointSettingDrawer.vue'
export default {
  name: 'MapComponent',
  components: {
    MapPointSettingDrawer,
  },
  props: {
    edit_mode: {
      type: Object,
      default() {
        return {
          enabled: false,
          mode_selected: 'none'
        }
      }
    },
    task_allocatable: {
      type: Boolean,
      default: false
    },
    show_agv: {
      type: Boolean,
      default: true
    },
    only_view: {
      type: Boolean,
      default: true
    },
    zoom: {
      type: Number,
      default: 6
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
      showTaskAllocationMenu: false,
      showAGVMenu: false,
      selectPathVisible: false,
      PathesSelectedForDelete: [],
      path_plan_tags: [],
      contextMenu: {},
      agv_color_set: [
        'lime', 'rgb(51, 194, 255)', 'yellow', 'rgb(64, 158, 255)', 'pink', 'gold', 'red', 'grey'
      ],
      TooltipStyle: {
        top: '0px',
        left: '0px'
      },
      hoverPointData: undefined,
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
      station_features: [],
      agvList: [],
      path_start_end: {
        start: undefined,
        end: undefined
      },
      PathPlanLineStyle: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 8,
          lineDash: null,
        }),
      }),
      pointStyle: (feature) => {
        const GetPointFeatureInfo = function (feature) {

          var featureID = feature.getId();
          if (featureID) {
            //var featureID = `Point:${index}:${_tagID}:${stationType}:${Name}`;
            var split = featureID.split(':')
            var index = split[1];
            var tag = split[2];
            var stationType = split[3];
            var name = split[4];
            return {
              index: index,
              tag: tag,
              station_type: stationType,
              name: name
            }
          }
        }

        var pointRawData = feature.get('data');
        var pointInfo = GetPointFeatureInfo(feature)
        var text_display = '';
        var text_color = 'gold'
        if (this.display_selected == 'Name') {
          text_display = pointInfo.name;
          text_color = 'gold'
        }
        else if (this.display_selected == 'Tag') {
          text_display = pointInfo.tag;
          text_color = 'lime'
        }
        else {
          text_display = pointInfo.index;
          text_color = 'rgb(90, 213, 255)'
        }
        var eq_station_icon = new Icon({
          src: '/images/eq-icon.png', // 设置PNG图像的路径
          scale: 0.45,
          anchor: [0.5, 0.5],
          size: [64, 64],
          opacity: 1,
          color: 'white'
        })
        var rack_station_icon = new Icon({
          src: '/images/rack_station.png', // 设置PNG图像的路径
          scale: 0.45,
          anchor: [0.5, 0.5],
          size: [64, 64],
          opacity: 1,
          color: 'white'
        })
        var charge_station_icon = new Icon({
          src: '/images/charging-station.png', // 设置PNG图像的路径
          scale: 0.5,
          anchor: [0.5, 0.5],
          size: [64, 64],
          opacity: 1,
          color: 'white'

        })
        var icon_stroke = (selected) => {
          return new Stroke({
            color: selected ? 'red' : 'black',
            width: selected ? 2 : 1,
          })
        };
        var polygonImg = (points, rotation = 0, color = 'rgb(37, 172, 95)', selected = false) => {
          return new RegularShape({
            radius: 7,
            fill: new Fill({
              color: color,
            }),
            stroke: icon_stroke(selected),
            angle: rotation,
            points: points,
          })
        }

        var circleImg = (color, selected = false) => {
          return new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: color,
            }),
            stroke: icon_stroke(selected),
          })
        }
        var EQ_Ints = [1, 11, 21, 32];
        var STK_Ints = [2, 6, 12, 22];
        var Charge_Ints = [3, 5, 6];
        var polyPoint = 3;
        var polyRotation = 0;
        var color = 'rgb(243, 123, 55)'
        if (EQ_Ints.includes(pointRawData.StationType)) {
          polyPoint = 4;
          polyRotation = Math.PI / 180.0 * 45;
        }
        else if (STK_Ints.includes(pointRawData.StationType)) {
          polyPoint = 4;
          polyRotation = Math.PI / 180.0 * 90;
        }
        else if (Charge_Ints.includes(pointRawData.StationType)) {
          polyPoint = 3;
          polyRotation = Math.PI / 180.0 * 0;
        }

        if (!pointRawData.Enable)
          color = 'red';
        else {
          if (pointRawData.IsSegment | pointRawData.IsAvoid)
            color = 'rgb(0, 122, 255)';
          if (pointRawData.IsParking)
            color = 'pink';
        }
        var highlight = feature.get('highlight')
        var selected = feature.get('selected');
        var isEQ = feature.get('data').IsEquipment;
        var isCharge = feature.get('data').IsCharge;
        var isSTK = feature.get('data').IsSTK;

        var GetImage = () => {
          if (isEQ)
            return eq_station_icon;
          if (isSTK)
            return rack_station_icon;
          if (isCharge)
            return charge_station_icon;
          return pointRawData.StationType == 0 ? circleImg(color, selected) : polygonImg(polyPoint, polyRotation, color, selected)
        }

        return new Style({
          image: GetImage(),
          //image: eq_station_icon,
          text: new Text({
            text: text_display,
            offsetX: 12,
            offsetY: isEQ | isCharge ? -25 : -15,
            font: 'bold 14px sans-serif',
            fill: new Fill({
              color: pointRawData.Enable ? text_color : 'rgb(255, 106, 138)'
            }),
            stroke: new Stroke({
              color: highlight | selected ? 'red' : 'black',
              width: highlight ? 4 : 3
            })
          }),
        });

      },
      point_icon_style: (feature) => {
        return new Style({

        })
      },
      pathStyle: (feature) => {
        var isEQLink = feature.get('data').IsEQLink
        var isPathClose = feature.get('data').IsPathClose
        const geometry = feature.getGeometry();
        const styles = [
          new Style({
            stroke: new Stroke({
              color: isPathClose ? 'red' : (isEQLink ? 'rgb(115, 115, 115)' : 'rgb(176, 176, 178)'),
              width: 2.7,
              lineDash: isEQLink ? [4, 11] : null // 虛線模式（設定虛線段的長度和間隔）
            }),
          }),
        ];

        geometry.forEachSegment(function (start, end) {
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const rotation = Math.atan2(dy, dx);

          // arrows
          styles.push(
            new Style({
              geometry: new Point(end),
              image: new Icon({
                src: 'arrow.png',
                anchor: [1.2, 0.5],
                rotateWithView: true,
                rotation: -rotation,
                scale: 0.18,
                color: isPathClose ? 'red' : 'white'
              }),
            })
          );
          if (isPathClose) {
            start = [(end[0] + start[0]) / 2, (end[1] + start[1]) / 2]
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            // arrows
            styles.push(
              new Style({
                geometry: new Point(start),
                image: new Icon({
                  src: 'close.png',
                  anchor: [1.2, 0.5],
                  rotateWithView: true,
                  rotation: -rotation,
                  scale: 0.5,
                }),
              })
            );
          }
        });
        return styles;
      },
      UnloadIconStyle: (feature) => {

        if (!this.task_allocatable)
          return;

        var data = feature.get('data');
        if (data.StationType != 1) {
          return;
        }

        if (!feature.get('unload'))
          return;
        var unload_icon = new Icon({
          src: '/unloading.png', // 设置PNG图像的路径
          scale: 1, // 设置PNG图像的缩放比例
          anchor: [0, 1.3], // 设置PNG图像的锚点，即图片的中心点位置
          size: [44, 44],// 设置PNG图像的大小
          opacity: 1,
          offset: [0, 1]  // 向上移動10像素

        })

        return new Style({
          image: unload_icon,

        })
      }
    }
  },
  async mounted() {
    this.loading = true;
    if (!this.show_agv) {
      this.agv_display_mode_selected = 'hidden'

    }
    setTimeout(() => {
      this.FetchMap();
      bus.on('/agv_name_list', (agv_data) => {
        this.UpdateAGVLayer(agv_data);
      });
      bus.on('/nav_path_update', (dto) => {
        this.UpdateNavPathRender(dto.name, dto.tags)
      })
      bus.on('unload_eq_tags', (unload_tags) => {
        this.SetFeatureHasUnloadReq(unload_tags)
      })

    }, 1000);

  },
  computed: {
    Mode_Text() {
      if (!this.edit_mode.enabled)
        return "檢視模式"
      if (this.edit_mode.mode_selected == 'edit_point')
        return "編輯點位模式"
      if (this.edit_mode.mode_selected == 'add_point')
        return "新增點位模式"
      if (this.edit_mode.mode_selected == 'remove_point')
        return "移除點位模式"
      if (this.edit_mode.mode_selected == 'add_path')
        return "新增路徑模式"
      if (this.edit_mode.mode_selected == 'remove_path')
        return "移除路徑模式"
    },
    Tips() {
      if (!this.edit_mode.enabled)
        return []
      if (this.edit_mode.mode_selected == 'edit_point')
        return ["使用滑鼠【左鍵】拖曳點位。", "滑鼠【右鍵】點擊點位顯示編輯頁面。"]
      if (this.edit_mode.mode_selected == 'add_point')
        return ["使用滑鼠【右鍵】點擊地圖新增點位。"]
      if (this.edit_mode.mode_selected == 'remove_point')
        return ["使用滑鼠【左鍵】點擊欲移除的點位。"]
      if (this.edit_mode.mode_selected == 'add_path')
        return ["使用滑鼠【左鍵】點擊路徑起點點位以及終點點位。"]
      if (this.edit_mode.mode_selected == 'remove_path')
        return ["使用滑鼠【左鍵】點擊欲移除的路徑。"]
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

    is_agv_feature_selected() {
      if (!this.selected_feature)
        return false;
      var feature_id = this.selected_feature.getId();
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
    MapMouseMoveHandler(ev) {
      this.TooltipStyle.left = `${ev.x}px`
      this.TooltipStyle.top = `${ev.y - 110}px`
    },
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

          this.MapDataInit(map);
          this.MapInitializeRender();

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
    GetNormalStations() {
      if (!this.map_data)
        return [];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => st.StationType == 0);
    },
    GetLDULDableStations() {
      if (!this.map_data)
        return [];

      const lduldable_types = [1, 2, 6, 11, 12, 21, 22];

      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => lduldable_types.includes(st.StationType));
    },
    GetChargeStations() {
      if (!this.map_data)
        return [];
      const chargable_types = [3, 5, 6];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => chargable_types.includes(st.StationType));
    },
    GetParkStations() {
      if (!this.map_data)
        return [];
      var stations = Object.values(this.map_data.Points);
      return stations.filter(st => st.IsParking);
    },
    MapDataInit(map) {
      this.map_data = map;
      this.map_name = map.Name;
      this.stations = [];
      Object.keys(map.Points).forEach(index => {
        var pt_data = map.Points[index];
        var Graph = pt_data.Graph
        var _tagID = pt_data.TagNumber;
        var _stationType = pt_data.StationType;
        var _feature = new Feature({
          geometry: new Point([Graph.X * 1000, Graph.Y * -1000]),
          name: index,
        });

        this.SetPointFeatureIDByPointData(_feature, index, pt_data);
        _feature.set('StationType', _stationType)
        _feature.set('Tag', _tagID)
        this.AddStation(
          {
            index: index,
            tag: _tagID,
            feature: _feature,
          }

        );

      })
    },
    AddStation(data) {
      data.feature.set('highlight', false)
      this.stations.push(data);
      this.station_features.push(data.feature)
    },
    GetAllNormalPtFeature() {
      return this.station_features.filter(ft => ft.get('StationType') == 0);
    },

    GetAllParkPtFeature() {
      return this.station_features.filter(ft => ft.get('data').IsParking);
    },
    GetAllEQPtFeature() {
      return this.station_features.filter(ft => ft.get('data').IsEQLink);
    },
    GetAllChargePtFeature() {
      return this.station_features.filter(ft => ft.get('data').IsCharge);
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
          new VectorLayer({//1
            source: new VectorSource({
              features: this.station_features
            }),
            style: this.pointStyle,
            zIndex: 2,
          }),
          new VectorLayer({//3
            source: new VectorSource({
              features: lineFeatures
            }),
            style: this.pathStyle,
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
          new VectorLayer({ //Unload Icon 圖層
            source: new VectorSource({
              features: this.station_features
            }),
            style: this.UnloadIconStyle,
            zIndex: 122
          }),
          new VectorLayer({ //固定的圖標圖層
            source: new VectorSource({
              features: [
                new Feature({
                  geometry: new Point([0, 0]),
                  name: "原點",
                  id: "原點"
                })
              ]
            }),
            style: (feature) => new Style({
              text: new Text({
                text: feature.getId(),
                offsetX: 12,
                offsetY: -15,
                font: 'bold 14px sans-serif',
                fill: new Fill({
                  color: 'black'
                }),
                stroke: new Stroke({
                  color: 'black',
                  width: 3
                })
              }),
            }),
            zIndex: 122
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: this.zoom,
        }),
      });

      if (!this.show_agv) {
        this.AGVDisplayControl(false);
      }
      this.CreateMapEvent()
      this.CreateMeshLayer();
      this.$emit('loaded', '')
    },
    CreateMapEvent() {

      var that = this;
      var isEditMode = () => { return that.edit_mode.enabled };
      var isEditPointMode = () => { return that.edit_mode.mode_selected == 'edit_point' };
      var isRemovePointMode = () => { return that.edit_mode.mode_selected == 'remove_point' };
      var isAddPointMode = () => { return that.edit_mode.mode_selected == 'add_point' };
      var isRemovePathMode = () => { return that.edit_mode.mode_selected == 'remove_path' };
      var isAddPathMode = () => { return that.edit_mode.mode_selected == 'add_path' };

      var dragControl = (active) => {
        var interactions = that.map.getInteractions();
        interactions.forEach(function (interaction) {
          if (interaction instanceof DragPan) {
            interaction.setActive(active);
          }
        });
      }

      this.map.on('pointerup', event => {
        if (!that.selected_feature)
          return

        this.hoverPointData = undefined;
        if (isEditMode() && isAddPointMode() && event.originalEvent.button === 2) {
          document.addEventListener('contextmenu', function (event) {
            event.preventDefault();
          });

          that.AddNewPoint();
        }
        that.$emit('onStationClick', that.selected_feature.get('data'))
      })

      this.map.on('pointermove', (event) => {
        var feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
          return feature;
        });
        if (feature && feature.get('data')) {
          console.info(feature);
          var data = feature.get('data');
          this.hoverPointData = data;
        } else {
          this.hoverPointData = undefined;
        }
      })
      this.map.on('pointerdown', (event) => {

        that.mouse_click_coordinate = event.coordinate
        if (this.selected_feature) {
          this.selected_feature.set('selected', false);
        }
        this.selected_feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => {

          if (feature) {
            that.selected_feature = feature;
            that.selected_feature.set('selected', true);
            if (!isEditMode())
              return undefined;

            var feature_id = feature.getId();
            var isPathFeature = (feature_id + '').includes('path:')
            if (event.originalEvent.button === 2) { // 右键
              document.addEventListener('contextmenu', function (event) {
                event.preventDefault();
              });

              if (isEditPointMode()) {
                that.ShowPointSettingDrawer();
              }
            }
            else if (event.originalEvent.button === 0) {//左键
              if (isRemovePathMode()) {
                if (!isPathFeature)
                  return;
                that.RemovePath();
              }
              else if (isRemovePointMode()) {
                if (isPathFeature)
                  return;
                that.RemovePoint();
              }
              else if (isAddPathMode()) {
                if (isPathFeature)
                  return;
                if (that.path_start_end.start == undefined) {
                  that.path_start_end.start = feature
                } else {
                  that.path_start_end.end = feature
                  that.UpdatePathOfBetweenTags();
                }
              }
            }
          }

          return feature;
        });


      });
      // 创建一个拖动交互操作
      var dragInteraction = new Pointer({
        handleDownEvent: function (event) {
          var map = event.map;
          var feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });
          if (!feature)
            return false;
          that.selected_feature = feature;
          var feature_id = feature.getId();
          if (feature_id) {
            this.feature_ = feature;
            this.coordinate_ = event.coordinate;
            return true;
          }
          return false;
        },
        handleDragEvent: function (event) {
          if (isEditMode() && isAddPointMode() && event.originalEvent.button === 0)
            return;

          if (!isEditMode())
            return;
          if (!isEditPointMode() && !isAddPointMode()) {
            return;
          }
          var deltaX = event.coordinate[0] - this.coordinate_[0];
          var deltaY = event.coordinate[1] - this.coordinate_[1];
          var geometry = this.feature_.getGeometry();
          geometry.translate(deltaX, deltaY);
          this.coordinate_ = event.coordinate;

          that.UpdateStationPathLayer();

          //更新本地圖資
          var featureID = that.selected_feature.getId();
          var index = parseInt(featureID.split(':')[1])

          var coordinates = that.selected_feature.getGeometry().getCoordinates();
          that.map_data.Points[index].Graph.X = Math.round(coordinates[0] / 1000.0, 0);
          that.map_data.Points[index].Graph.Y = Math.round(coordinates[1] / -1000.0, 0);
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
    /**更新地圖路徑圖層 */
    UpdateStationPathLayer() {
      var New_lineFeatures = this.CreateLineFeaturesOfEachStaion();
      var source = this.Line_Layer.getSource();
      source.clear(); // 清空原有的要素
      source.addFeatures(New_lineFeatures); // 添加新的要素
      source.changed();
    },
    UpdatePathOfBetweenTags() {
      var start_ = this.GetPointDataByFeature(this.path_start_end.start)
      var end_ = this.GetPointDataByFeature(this.path_start_end.end)
      if (!start_ | !end_) {
        this.path_start_end = { start: undefined, end: undefined }
        return;
      }
      if (start_.index != end_.index) {
        var startPoint = this.map_data.Points[start_.index];
        var endPoint = this.map_data.Points[end_.index];
        if (startPoint.Target[end_.index] == undefined) {
          startPoint.Target[end_.index] = 1
          this.map_data.Pathes.push({ StartPoint: startPoint, EndPoint: endPoint });
        }
        this.UpdateStationPathLayer();
      }
      this.path_start_end = { start: undefined, end: undefined }
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
      if (!this.AGV_Layer)
        return;
      var output = this.CreateAGVFeatures(agv_data);
      var agv_layer_source = this.AGV_Layer.getSource()
      agv_layer_source.clear();
      agv_layer_source.addFeatures(output.agv_features);
      agv_layer_source.changed();

      var agv_nav_path_layer_source = this.Nav_Path_Layer.getSource()
      agv_nav_path_layer_source.clear();
      agv_nav_path_layer_source.addFeatures(output.agv_nav_path_features);
      agv_nav_path_layer_source.changed();


    },
    GetAgvProp(agv_name) {
      return this.agvList.find(av => av.name == agv_name);
    },
    HightlightAGV(agv_name) {
      this.agvList.forEach(prop => {
        prop.heighlight = false
        prop.isOnline = false
      })
      var agvProp = this.GetAgvProp(agv_name);
      if (agvProp) {
        this.GetAgvProp(agv_name).heighlight = true;
      }
    },
    CreateAGVFeatures(agv_data = []) {

      var agv_features = [];
      var agv_nav_path_features = [];
      var idx = 0;
      agv_data.forEach(info => {
        var agv_name = info.AGV_Name;
        var agv_current_tag = info.Current_Tag
        var agv_state = info.State
        var isOnline = info.IsOnline

        var agv_prop_exist = this.GetAgvProp(agv_name);
        if (agv_prop_exist) {
          agv_prop_exist.current_tag = agv_current_tag;
          agv_prop_exist.theta = info.Rotation;
          agv_prop_exist.state = agv_state;
        } else {
          agv_prop_exist = {
            name: agv_name,
            current_tag: agv_current_tag,
            previous_tag: -1,
            color: this.agv_color_set[idx],
            theta: info.Rotation,
            state: agv_state,
            heighlight: false
          }
          this.agvList.push(agv_prop_exist)
        }
        var agv_position = this.get_agv_position(agv_name);
        var agv_feature = new Feature({
          geometry: new Point(agv_position),
          name: agv_name,
        })
        agv_feature.setId('AGV_' + agv_name);
        agv_features.push(agv_feature);

        var agvIcon = new Icon({
          src: '/agv.png', // 设置PNG图像的路径
          scale: .4, // 设置PNG图像的缩放比例
          anchor: [0.5, 0.5], // 设置PNG图像的锚点，即图片的中心点位置
          size: [60, 60],// 设置PNG图像的大小
          opacity: 1,

        })

        agv_feature.setStyle(new Style({
          image: agvIcon,
          text: new Text({
            text: agv_name + `\r\n(${agv_state})`,
            offsetX: 10,
            offsetY: 30,
            font: 'bold 14px Arial',
            fill: new Fill({
              color: isOnline ? agv_prop_exist.color : 'rgb(192, 192, 192)'
            }),
            stroke: new Stroke({
              color: agv_prop_exist.heighlight ? 'red' : 'black',
              width: 3
            })
          }),
        }));
        agv_feature.getStyle().getImage().setRotation(-agv_prop_exist.theta);//設定旋轉角度

        var nav_path_feature = new Feature({
          geometry: new Point(agv_position),
          name: agv_name
        })
        agv_nav_path_features.push(nav_path_feature);
        idx += 1;
      });
      return { agv_features: agv_features, agv_nav_path_features: agv_nav_path_features }
    },
    /**顯示站點設定抽屜 */
    ShowPointSettingDrawer() {
      var pointData = this.GetPointDataByFeature(this.selected_feature);
      if (pointData) {
        this.$refs['point-setting-drawer'].Show(pointData);
      }
    },
    /**移除站點 */
    RemovePoint() {
      var pointData = this.GetPointDataByFeature(this.selected_feature);
      delete this.map_data.Points[pointData.index];
      var _index = this.stations.findIndex(p => p.index == pointData.index);
      this.stations.splice(_index, 1)
      this.Station_Layer.getSource().removeFeature(this.selected_feature)
      this.Station_Layer.getSource().changed();
      this.UpdateStationPathLayer();
    },
    /**設定Feature屬性Unload */
    SetFeatureHasUnloadReq(unload_tags) {
      //console.info(unload_eqs)
      this.station_features.forEach(feat => {
        var data = feat.get('data')
        var isUnload = unload_tags.includes(data.TagNumber)
        feat.set('unload', isUnload)
      })

    },
    async AddNewPoint() {

      var pt_index = this.GetNewPointIndex();
      var source = this.Station_Layer.getSource()
      var _feature = new Feature({
        geometry: new Point(this.mouse_click_coordinate),
        name: pt_index,
      });

      //新增資料
      var new_point = await this.CloneAPointData();
      new_point.Graph = {
        X: parseInt(this.mouse_click_coordinate[0] / (1000.0)),
        Y: parseInt(this.mouse_click_coordinate[1] / (-1000.0)),
        Display: pt_index + ''
      }
      new_point.TagNumber = (pt_index);
      new_point.Target = {}
      new_point.Name = pt_index + ''
      this.map_data.Points[pt_index] = new_point;
      this.SetPointFeatureIDByPointData(_feature, pt_index, new_point);
      this.AddStation(
        {
          index: pt_index,
          tag: pt_index,
          feature: _feature
        }
      );
      source.addFeature(_feature);
      this.UpdateStationPathLayer();
    },

    handleAGVMenuItemClick(action) {
      this.showAGVMenu = false;
      if (action === 'add_point') {
      }
    },
    handleTaskAllocatModeMenuClick(action) {
      this.showTaskAllocationMenu = false;
    },
    ChangeFillColorOfFeature(feature, color) {
      var fillStyle = new Fill({
        color: color // 设置填充颜色，例如绿色半透明
      });
      var style = new Style({
        fill: fillStyle // 设置要素的填充样式
      });
      feature.setStyle(style)
      this.GetLayerOfFeature(feature).getSource().refresh();
    },

    RemovePath(check_way = true) {

      var pathID = this.selected_feature.getId();
      var splited = pathID.split(':')
      var startStation_Index = parseInt(splited[1])
      var endStation_Index = parseInt(splited[2])
      var startPoint = this.map_data.Points[startStation_Index];
      var endPoint = this.map_data.Points[endStation_Index];

      //如果包含雙向
      var revertPathIndex = this.GetPathIndex(endPoint, startPoint);
      if (revertPathIndex != -1) {
        this.PathesSelectedForDelete = [
          {
            startPoint: startPoint,
            endPoint: endPoint,
            startStation_Index: startStation_Index,
            endStation_Index: endStation_Index
          },
          {
            startPoint: endPoint,
            endPoint: startPoint,
            startStation_Index: endStation_Index,
            endStation_Index: startStation_Index
          }
        ]
        this.selectPathVisible = true;
        return;
      }
      this.RemovePathByPointsIndex(startStation_Index, endStation_Index);
    },

    RemovePathByPointsIndex(startStation_Index, endStation_Index) {

      var startPoint = this.map_data.Points[startStation_Index];
      var endPoint = this.map_data.Points[endStation_Index];
      delete startPoint.Target[endStation_Index]
      var path_index = this.GetPathIndex(startPoint, endPoint)
      this.map_data.Pathes.splice(path_index, 1)
      this.UpdateStationPathLayer()
      this.path_start_end = { start: undefined, end: undefined }
      this.selectPathVisible = false;
    },
    GetPathIndex(startPt, endPt) {
      return this.map_data.Pathes.findIndex(path => path.StartPoint.TagNumber == startPt.TagNumber && path.EndPoint.TagNumber == endPt.TagNumber)
    },
    /**從圖資資料中產生一個新的Point Index */
    GetNewPointIndex() {
      if (this.stations.length == 0)
        return 1;
      const sortedKeys = Object.keys(this.map_data.Points).map(Number).sort((a, b) => a - b); // 小到大排序
      const lastKey = sortedKeys[sortedKeys.length - 1]; // 取得最後一個key
      return lastKey + 1;
    },
    async CloneAPointData() {
      if (this.stations.length == 0) {
        var template = await MapAPI.GetMapStationTemplate()
        return JSON.parse(JSON.stringify(template));
      }
      var points = Object.values(this.map_data.Points);
      var lastPoint = points[points.length - 1]
      return JSON.parse(JSON.stringify(lastPoint))
    },


    GetPointDataByFeature(feature) {

      // var featureID = `Point:${index}:${_tagID}:${stationType}`;
      var featureID = feature.getId();
      var index = parseInt(featureID.split(':')[1]);
      var tagID = parseInt(featureID.split(':')[2]);
      if (tagID) {
        var point = this.map_data.Points[index]
        return {
          index: index,
          point: point
        }
      } else
        return undefined;

    },

    NameDisplayChangeHandle() {
      this.UpdatePointDisplay();
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

      var path_vectorSource = new VectorSource();
      var path_vectorLayer = new VectorLayer({
        source: path_vectorSource,
        zIndex: 666,
        id: layerName
      });
      this.map.addLayer(path_vectorLayer)
      let source = path_vectorLayer.getSource();
      var agv_prop = this.agvList.find(agv => agv.name == agv_name);
      if (agv_prop) {
        var color = agv_prop.color;
        if (color) {
          var features = this.CreateLineFeaturesOfPath(tags, color);
        }
        source.addFeatures(features)
        source.changed();
      }
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
      var lineFeatures = [];

      this.map_data.Pathes.forEach(path => {
        //tag
        var start_tag = path.StartPoint.TagNumber;
        var end_tag = path.EndPoint.TagNumber;

        var startStation = this.stations.find(st => st.tag == start_tag);
        var endStation = this.stations.find(st => st.tag == end_tag);
        var startFeature = startStation.feature;
        var endFeature = endStation.feature;

        let lineFeature = new Feature(
          {
            geometry: new LineString([startFeature.getGeometry().getCoordinates(), endFeature.getGeometry().getCoordinates()]),
          },
        );

        lineFeature.setId(`path:${startStation.index}:${endStation.index}`);
        lineFeature.set('data', path)
        lineFeatures.push(lineFeature);
      })

      // Object.keys(this.map_data.Points).forEach(index_str => {
      //   var index = parseInt(index_str)
      //   var current_station = this.stations.find(st => st.index == index);
      //   var targets = this.map_data.Points[index_str].Target;
      //   Object.keys(targets).forEach(index_str => {
      //     var _index = parseInt(index_str)

      //     var station_link = this.stations.find(st => st.index == _index);
      //     if (station_link != undefined) {
      //       let lineFeature = new Feature(
      //         {
      //           geometry: new LineString([current_station.feature.getGeometry().getCoordinates(), station_link.feature.getGeometry().getCoordinates()]),
      //         },
      //       );

      //       lineFeature.setId(`path:${index}:${_index}`);
      //       lineFeatures.push(lineFeature);
      //     }
      //   })

      // })

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
      this.Nav_Path_Layer.setVisible(display);
    },

    UpdatePointDisplay() {
      this.Station_Layer.getSource().changed();
    },
    PointSettingChangedHandle(dto) {
      var index = dto.index;
      var pointData = dto.pointData;

      this.map_data.Points[index] = pointData;
      var feature = this.stations.filter(pt => pt.index == index)[0].feature;
      this.SetPointFeatureIDByPointData(feature, index, pointData);
      this.stations.filter(pt => pt.index == index)[0].feature = feature;
      //this.UpdatePointDisplay();

    },
    /**使用站點資料設定Point Feature ID */
    SetPointFeatureIDByPointData(feature, pt_index, pointData) {
      var featureID = `Point:${pt_index}:${pointData.TagNumber}:${pointData.StationType}:${pointData.Name}`;
      feature.setId(featureID);
      feature.set('data', pointData)
    },
    Highlight(layer = 'normal|eq|charge|park') {
      this.AllUnHighlight()
      var features = []
      if (layer == 'normal') {
        features = this.GetAllNormalPtFeature();
      }
      if (layer == 'eq') {
        features = this.GetAllEQPtFeature()
      }
      if (layer == 'charge') {
        features = this.GetAllChargePtFeature()
      }
      if (layer == 'park') {
        features = this.GetAllParkPtFeature()
      }
      this.HighlightControl(features, true)
    },
    AllUnHighlight() {
      this.HighlightControl(this.station_features, false);
    },
    HighlightControl(features = [], IsHighlight) {
      features.forEach(feature => {
        feature.set('highlight', IsHighlight)
      })
    }
  },
};
  </script>
  
<style lang="scss" scoped>
.map-notify {
  .mode-text {
    font-weight: bold;
    font-size: 20px;
  }

  .tips-text {
    color: "orange";
  }
}
.map-show {
  #point-tooltip {
    position: fixed;
    background-color: orange;
    color: white;
    opacity: 0.9;
    z-index: 9200;
    border: 2px dashed black;
  }
  .header-div {
    height: 26px;
    margin-bottom: 9px;
    .options {
      .option-container {
        background-color: rgb(235, 235, 235);
        margin-right: 3px;
        border-radius: 12px;
        padding-left: 8px;

        span {
          // background-color: pink;
          margin-right: 10px;
          font-weight: bold;
        }
      }
      .form-check {
        float: right;
        margin-right: 15px;
      }
    }
  }
}

.map {
  height: 95%;
  width: 100%;
}
</style>
  