<template>
  <div id="map" class="map-component" v-loading="loading" :key="renderKey">
    <div class="d-flex flex-row h-100">
      <div class="flex-fill d-flex flex-column">
        <div
          class="w-100 bg-primary text-light rounded p-2 select-mode"
          v-if="IsSelectAGVMode"
        >選擇 AGV</div>
        <div
          class="w-100 rounded p-1 select-mode"
          v-if="IsSelectEQStationMode"
          v-bind:class="TaskDispatchOptions.action_type == 'charge' || TaskDispatchOptions.direction == 'destine' ? 'select-destine-notify' : 'select-source-notify'"
        >
          {{ TaskDispatchOptions.action_type == 'charge' ? '選擇[充電站]' : `${TaskDispatchOptions.direction == 'source' ? $t('Map.Notification.SelectSource') :
          $t('Map.Notification.SelectDestine')}` }}
        </div>
        <!-- 點位與路徑顯示 -->
        <div class="d-flex h-100" style="overflow-y: hidden;">
          <!-- settings tabcontrol -->
          <div
            v-if="EditorOption.EditMode == 'edit' && editable"
            v-bind:class="left_tab_class_name"
            class="border bg-light"
          >
            <div class="p-0 m-0 w-100" v-if="left_tab_class_name == 'tab-close'">
              <i
                @click="() => {
                  left_tab_class_name = left_tab_class_name == 'tab-open' ? 'tab-close' : 'tab-open'
                }"
                class="bi bi-chevron-double-right"
              ></i>
            </div>
            <div v-else class="tab-open text-start">
              <i
                @click="() => {
                  left_tab_class_name = left_tab_class_name == 'tab-open' ? 'tab-close' : 'tab-open'
                }"
                class="bi bi-chevron-double-left"
              ></i>
              <div class="p-2 action-buttons border-bottom">
                <b-button size="sm" variant="primary" @click="HandlerSaveBtnClick">儲存</b-button>
                <b-button size="sm" variant="danger" @click="ReloadMap">重新載入</b-button>
                <b-button size="sm" variant="danger" @click="ClearMap">重置圖資</b-button>
              </div>

              <div class="designer">
                <el-collapse v-model="designToolCollapseActive">
                  <el-collapse-item name="1">
                    <template #title>
                      <span class="designer-collapse-title">路網編輯</span>
                    </template>
                    <div class="text-start border p-3">
                      <el-form size="large">
                        <el-form-item label="點位">
                          <el-radio-group
                            :disabled="EditorOption.EditMode != 'edit'"
                            v-model="EditorOption.EditAction"
                            @change="() => { RemoveAllInteractions(); RemoveInteraction(draw_forbid_regions_interaction); AddEditMapInteraction() }"
                            size="large"
                          >
                            <el-radio-button size="small" value="add-station">新增點位[1]</el-radio-button>
                            <el-radio-button size="small" value="edit-station">編輯點位[2]</el-radio-button>
                            <el-radio-button size="small" value="remove-station">移除點位[3]</el-radio-button>
                          </el-radio-group>
                        </el-form-item>
                        <el-form-item label="路徑">
                          <el-radio-group
                            class="mx-1"
                            :disabled="EditorOption.EditMode != 'edit'"
                            v-model="EditorOption.EditAction"
                            @change="() => { RemoveAllInteractions(); PathEditTempStore = []; RemoveInteraction(draw_forbid_regions_interaction); AddEditMapInteraction(); }"
                            size="large"
                          >
                            <el-radio-button size="small" value="add-path">新增路徑[4]</el-radio-button>
                            <el-radio-button size="small" value="edit-path">編輯路徑[5]</el-radio-button>
                            <el-radio-button size="small" value="remove-path">移除路徑[6]</el-radio-button>
                          </el-radio-group>
                        </el-form-item>
                        <el-form-item label="區域">
                          <el-radio-group
                            class="mx-1"
                            :disabled="EditorOption.EditMode != 'edit'"
                            v-model="EditorOption.EditAction"
                            size="large"
                          >
                            <el-radio-button
                              @click="HandleAddForbidRegionClicked(EditorOption.AddRegionMode.Mode)"
                              size="small"
                              value="add-forbid-region"
                            >新增管制區[7]</el-radio-button>
                            <el-radio-button
                              @click="HandleEditForbidRegionClicked"
                              size="small"
                              value="edit-forbid-region"
                            >編輯管制區[8]</el-radio-button>
                            <el-radio-button
                              @click="HandleDeleteForbidRegionClicked"
                              size="small"
                              value="remove-forbid-region"
                            >移除管制區[9]</el-radio-button>
                            <el-radio-button
                              @click="HandleDrawGlobalPathRegionClicked"
                              size="small"
                              value="add-global-path-region"
                            >繪製道路區域</el-radio-button>
                          </el-radio-group>
                        </el-form-item>
                      </el-form>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item name="2">
                    <template #title>
                      <span class="designer-collapse-title">地圖與網格</span>
                    </template>
                    <div class="border p-3">
                      <el-form size="large" label-width="120" label-position="left">
                        <el-form-item label="網格尺寸(公尺)">
                          <el-input-number
                            :min="1"
                            :step="0.1"
                            @change="ModifyGridSize"
                            v-model="MapGridSizeStore"
                          ></el-input-number>
                        </el-form-item>
                        <el-form-item label="水平Offset(公尺)">
                          <el-input-number
                            :step="0.1"
                            @change="ModifyGridOffset"
                            v-model="MapGridSizeXOffset"
                          ></el-input-number>
                        </el-form-item>
                        <el-form-item label="垂直Offset(公尺)">
                          <el-input-number
                            :step="0.1"
                            @change="ModifyGridOffset"
                            v-model="MapGridSizeYOffset"
                          ></el-input-number>
                        </el-form-item>
                        <el-form-item label="旋轉">
                          <el-input-number
                            :step="1"
                            :min="-180"
                            :max="180"
                            @change="ModifyMapRotation"
                            v-model="MapRotation"
                          ></el-input-number>
                        </el-form-item>
                        <el-divider></el-divider>
                        <el-form-item class label="地圖背景編輯">
                          <el-button size="large" @click="ImageEditClick">上傳與修改</el-button>
                          <el-dialog v-model="ShowImageEditorDialog" class>
                            <ImageEditor @onCropDone="HandleImageCropedDone" ref="imageEditor"></ImageEditor>
                          </el-dialog>
                        </el-form-item>
                        <el-form-item label="調整圖片位置">
                          <el-switch
                            size="large"
                            active-text="開啟"
                            inactive-text="關閉"
                            inline-prompt
                            v-model="DragBackgroundImageMode"
                            @change="() => {
                          new_map_img_extent = map_img_extent;
                          if (map_image_display != 'visible' && DragBackgroundImageMode) {
                            map_image_display = 'visible';
                            SlamImageDisplayOptHandler();
                          }
                        }"
                          ></el-switch>
                        </el-form-item>
                        <el-divider></el-divider>
                        <el-form-item label="重置路網顯示">
                          <el-button type="danger" @click="ResetRouteModeDisplay">重置</el-button>
                        </el-form-item>
                      </el-form>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item name="3">
                    <template #title>
                      <span class="designer-collapse-title">樣式</span>
                    </template>
                    <div class="border p-3">
                      <el-form size="large" label-position="left">
                        <el-divider content-position="left">路徑</el-divider>
                        <el-form-item label="顏色">
                          <el-color-picker
                            show-alpha
                            size="large"
                            v-model="MapStyles.PathColor"
                            @active-change="HandlePathColorSelected"
                          ></el-color-picker>
                        </el-form-item>
                        <el-divider content-position="left">一般點位</el-divider>
                        <el-form-item label="顯示顏色">
                          <el-color-picker
                            show-alpha
                            size="large"
                            v-model="MapStyles.NormalPointNameColor"
                            @active-change="HandleNormalPointNameColorSelected"
                          ></el-color-picker>
                        </el-form-item>
                        <el-form-item label="字體大小">
                          <el-slider
                            @change="HandleNormalStationTextSizeChanged"
                            size="large"
                            v-model="MapStyles.NormalPointTextFontSize"
                          ></el-slider>
                        </el-form-item>
                        <el-divider content-position="left">設備點位</el-divider>
                        <el-form-item label="顯示顏色">
                          <el-color-picker
                            show-alpha
                            size="large"
                            v-model="MapStyles.WorkStationPointNameColor"
                            @active-change="HandleWorkStationNameColorSelected"
                          ></el-color-picker>
                        </el-form-item>
                        <el-form-item label="字體大小">
                          <el-slider
                            @change="HandleWorkStationTextSizeChanged"
                            size="large"
                            v-model="MapStyles.WorkStationPointTextFontSize"
                          ></el-slider>
                        </el-form-item>
                      </el-form>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
          <div class="w-100 h-100 d-flex" style="position: relative">
            <!-- Map Render -->
            <!--提示-->
            <div class="notifiers" style="position:absolute;width: 622px;margin: 12px 60px;">
              <el-alert
                v-if="showRedrawControl"
                style="margin-top: 6px; z-index:4;border: 2px solid #409EFF;"
                title="區域重繪"
                type="info"
                :closable="false"
                class="redraw-control-alert"
              >
                <div style="position:absolute;right:10px;top:6px;" class="d-flex">
                  <el-button type="danger" @click="HandleCancleRegionRedraw">取消</el-button>
                  <el-button
                    :disabled="!isRedrawConfirmable"
                    type="info"
                    @click="HandleResetRegionRedraw"
                  >重置</el-button>
                  <el-button
                    :disabled="!isRedrawConfirmable"
                    type="primary"
                    @click="HandleCompleteRegionRedraw"
                  >完成</el-button>
                </div>
              </el-alert>
            </div>
            <div class="notify-and-coor-container d-flex">
              <NotifyDisplay
                v-if="editable"
                :EditorOption="EditorOption"
                :DragBackgroundImageMode="DragBackgroundImageMode"
              ></NotifyDisplay>
              <div
                v-if="true"
                class="cursour-coordination-show d-flex flex-column"
                :style="{'position':'relative','top':'0','right':settingCollapsed?'-76px':'40px'}"
              >
                <span
                  :style="map_theme_select=='dark'?'color:white':'color:rgb(24, 24, 24)'"
                >{{ MouseCoordinationDisplay }}</span>
                <div class="grid-size-text">Grid Size:{{ MapGridSize }}m</div>
              </div>
            </div>
            <BuildToolContainer
              class="build-tool"
              :operation="EditorOption.EditAction"
              @onRegionToolComponentChange="HandleRegionToolComponentChange"
              @onPathToolComponentChange="HandlePathToolComponentChange"
              v-if="mapToolShow"
            ></BuildToolContainer>

            <!-- 地圖渲染 -->
            <div
              :id="id"
              v-bind:style="map_theme_select=='dark'? map_theme_dark:{}"
              class="agv_map flex-fll border"
            >
              <ActionUndoTool
                v-if="editable"
                class="action-undo-tool"
                ref="undoTool"
                @onUnDo="HandleUnDoBtnClicked"
              ></ActionUndoTool>
              <AlignmentToos
                :map_display_mode="map_display_mode"
                :selectedFeatures="SelectedFeatures"
                :rotation="MapRotation"
                v-if="SelectedFeatures.length!=0"
                class="align-tool"
              ></AlignmentToos>
              <div
                class="multi-select-info"
                v-show="SelectedFeatures.length!=0"
              >已選擇 [{{ SelectedFeatures.length }}] 個點位</div>
              <!-- 選染RACK PORT 旁邊的貨物在席狀態 -->
              <div v-if="rackInfoShow  &&rackVisible">
                <RackStatusDisplay
                  v-for="feature in RackPortPointFeatures"
                  :key="feature.get('data')?.TagNumber+'-rack-display'||feature.id"
                  :pointData="feature.get('data')"
                  :dynamicStyle="getRackCargoExistStateFeatureLabelStyle(feature)"
                  :tagNumber="feature.get('data')?.TagNumber"
                ></RackStatusDisplay>
              </div>
              <!-- 車子電量顯示渲染 -->
              <div v-if="agv_display=='visible'&&vehicleBatVisible">
                <VehicleBatteryStatusDisplay
                  v-for="(featureSet,key ) in AGVFeatures"
                  :key="'vehicle_bat_status_'+key"
                  :dynamicStyle="getVehicleBatStatusDisplayStyle(featureSet.agv_feature)"
                  :agvName="featureSet.agv_feature.get('agvname')"
                ></VehicleBatteryStatusDisplay>
              </div>
            </div>
            <!------------->
            <!-- 圖例 -->
            <MapLegend
              v-if="!editable&&legendShow&&id!='locus_map'"
              class="map-ledgend border rounded"
              v-bind:style="LegendStyle"
            ></MapLegend>

            <div class="custom-buttons">
              <el-tooltip content="原點" placement="right">
                <button @click="GoOriginal">
                  <i class="bi bi-house-door-fill"></i>
                </button>
              </el-tooltip>
            </div>
            <i
              class="bi bi-list"
              style="position:absolute;top:-2px;right:6px;z-index:2;font-size: 25px;color: rgb(13, 110, 253);"
              @click="settingCollapsed=!settingCollapsed"
            ></i>
            <!-- 設定 -->
            <transition name="el-zoom-in-top">
              <div
                v-if="!settingCollapsed"
                class="options bg-light border-start text-start px-1 py-3"
              >
                <!-- <div v-if="station_show&&!IsOpUsing" class="rounded d-flex flex-column"> -->
                <div v-if="false" class="rounded d-flex flex-column">
                  <span class="border-bottom">Theme</span>
                  <el-switch
                    v-model="map_theme_select"
                    active-value="dark"
                    active-text="Dark"
                    inactive-value="custom"
                    inactive-text="Custom"
                    inline-prompt
                    width="70"
                    @change="HanldeThemeChanged"
                  ></el-switch>
                </div>
                <div v-if="station_show&&!IsOpUsing" class="rounded d-flex flex-column">
                  <span class="border-bottom">{{ $t('Map.Options.DisplayMode') }}</span>
                  <el-radio-group
                    v-model="station_name_display_mode"
                    @change="StationNameDisplayOptHandler"
                  >
                    <el-radio value="index" size="large">Index</el-radio>
                    <el-radio value="name" size="large">Name</el-radio>
                    <el-radio value="name_tag" size="large">Name & Tag</el-radio>
                    <el-radio value="tag" size="large">Tag</el-radio>
                  </el-radio-group>
                </div>
                <div v-if="!IsOpUsing" v-bind:class="mapModeCLass">
                  <span class="mx-1">{{ $t('Map.Options.MapMode') }}</span>
                  <el-tooltip placement="left">
                    <template #content>
                      <div>
                        ■ Slam:點位位置使用真實座標
                        <br />■ 路網:點位顯示位置可隨意變更。
                      </div>
                    </template>
                    <el-switch
                      @change="MapDisplayModeOptHandler"
                      inactive-value="router"
                      active-value="coordination"
                      width="70"
                      v-model="map_display_mode"
                      inline-prompt
                      :inactive-text="$t('PathNetwork')"
                      active-text="Slam"
                      inactive-color="seagreen"
                    ></el-switch>
                  </el-tooltip>
                </div>
                <div v-if="agv_show">
                  <span class="mx-1">{{ $t('Map.Options.AgvVisible') }}</span>
                  <el-switch
                    @change="AgvDisplayOptHandler"
                    inactive-value="none"
                    active-value="visible"
                    width="70"
                    v-model="agv_display"
                    inline-prompt
                    :inactive-text="$t('hidden')"
                    :active-text="$t('Show')"
                    inactive-color="rgb(146, 148, 153)"
                  ></el-switch>
                  <span class="mx-1">{{ $t('Map.Options.AgvBatVisible') }}</span>
                  <el-switch
                    :disabled="agv_display=='none'"
                    @change="()=>{SaveSettingsToLocalStorage();}"
                    :inactive-value="false"
                    :active-value="true"
                    width="70"
                    v-model="vehicleBatVisible"
                    inline-prompt
                    :inactive-text="$t('hidden')"
                    :active-text="$t('Show')"
                    inactive-color="rgb(146, 148, 153)"
                  ></el-switch>
                </div>
                <div v-if="!IsOpUsing">
                  <span class="mx-1">{{ $t('Map.Options.BackgroundImage') }}</span>
                  <el-switch
                    v-model="map_image_display"
                    inactive-value="none"
                    :inactive-text="$t('hidden')"
                    active-value="visible"
                    :active-text="$t('Show')"
                    inactive-color="rgb(146, 148, 153)"
                    inline-prompt
                    width="70"
                    @change="SlamImageDisplayOptHandler"
                  ></el-switch>
                </div>
                <div v-if="!IsOpUsing">
                  <span class="mx-1">{{ $t('Map.Options.PathVisible') }}</span>
                  <el-switch
                    v-model="routePathsVisible"
                    :inactive-text="$t('hidden')"
                    :active-text="$t('Show')"
                    inline-prompt
                    inactive-color="rgb(146, 148, 153)"
                    width="70"
                    @change="(visible) => {
                  if (visible) {
                    if (map_display_mode == 'router') {
                      PathLayerForCoordination.setVisible(false);
                      PathLayerForRouter.setVisible(true);
                    } else {
                      PathLayerForCoordination.setVisible(true);
                      PathLayerForRouter.setVisible(false);
                    }
                  } else {
                    PathLayerForCoordination.setVisible(false);
                    PathLayerForRouter.setVisible(false);
                  }
                  HideNormalStations(!visible);
                }"
                  ></el-switch>
                </div>
                <div v-if="!IsOpUsing">
                  <span class="mx-1">{{ $t('Map.Options.RegionVisible') }}</span>
                  <el-switch
                    :disabled="map_display_mode != 'coordination'"
                    v-model="regionsVisible"
                    :inactive-text="$t('hidden')"
                    :active-text="$t('Show')"
                    inline-prompt
                    inactive-color="rgb(146, 148, 153)"
                    width="70"
                    @change="(visible) => {
                  RegionLayer.setVisible(visible && map_display_mode == 'coordination');
                }"
                  ></el-switch>
                </div>
                <div v-if="!editable" class="rounded">
                  <span class="mx-1">圖例顯示</span>
                  <el-switch
                    class="my-2"
                    inactive-text="OFF"
                    active-text="ON"
                    inline-prompt
                    width="70"
                    v-model="legendShow"
                    @change="HandleLedgendShowChanged"
                  ></el-switch>
                </div>
                <div class="rounded">
                  <span class="mx-1">Rack顯示</span>
                  <el-switch
                    class="my-2"
                    inactive-text="OFF"
                    active-text="ON"
                    :active-value="true"
                    :inactive-value="false"
                    inline-prompt
                    width="70"
                    v-model="rackVisible"
                    @change="()=>{SaveSettingsToLocalStorage();}"
                  ></el-switch>
                </div>
                <div v-if="!editable" class="rounded">
                  <span class="mx-1">Pan/Zoom</span>
                  <el-switch
                    class="my-2"
                    inactive-text="Disable"
                    active-text="Enable"
                    inline-prompt
                    width="70"
                    v-model="dragActionLock"
                    @change="HandleDragLockSwitchChanged"
                  ></el-switch>
                </div>
                <!-- 點位搜尋 -->
                <div class="rounded">
                  <span class="mx-1">Search</span>
                  <el-select
                    filterable
                    clearable
                    v-model="searchTag"
                    @change="HandleSearchTagSelected"
                  >
                    <el-option
                      v-for="opt in allPointsSimpleOptions"
                      :key="opt.value"
                      :value="opt.value"
                      :label="opt.label"
                    ></el-option>
                  </el-select>
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
                    width="70"
                    v-model="agv_upload_coordination_mode"
                    @change="HandleAGVUploadCorrdinationChanged"
                  ></el-switch>
                </div>
              </div>
            </transition>
          </div>
        </div>
        <!-- <MapSettingsDialog ref="settings"></MapSettingsDialog> -->
      </div>
    </div>

    <MapPointSettingDrawer
      ref="ptsetting"
      @OnLeve="HandlePtSettingDrawerLeaved"
      @OnPointSettingChanged="PointSettingChangedHandle"
    ></MapPointSettingDrawer>
    <MapPathSettingDrawer
      :SettingsChangedHandler="() => {
      UpdateStationPathLayer();
      HandlePathTbRowClick(SelectedPathData);

    }"
      @closed="HandlePathSetingDrawerClosed"
      ref="path_editor"
    ></MapPathSettingDrawer>
    <MapRegionEditDrawer
      @closed="HandleForbidRegionEditDrawerClosed"
      @onRedraw="HandleRegionRedraw"
      ref="forbid_region_editor"
      :SettingsChangedHandler="() => {

    }"
    ></MapRegionEditDrawer>
    <el-dialog
      @closed="() => {
      if (selected_path_feature) {
        RestoreOriginalPathStyle(selected_path_feature)
      }
    }"
      draggable
      width="600"
      title="路徑選取"
      v-model="ShowPathSelectDialog"
    >
      <div class="bg-light text-start d-flex py-2">
        <b-button
          size="sm"
          variant="success"
          @click="() => {
          PathesCandicats.forEach(path_setting => {
            path_setting.IsPassable = true
          });
          UpdateStationPathLayer();
          HandlePathTbRowClick(SelectedPathData);
        }"
        >開放所有道路</b-button>
        <b-button
          class="mx-2"
          variant="danger"
          size="sm"
          @click="() => {
          PathesCandicats.forEach(path_setting => {
            path_setting.IsPassable = false
          });
          UpdateStationPathLayer();
          HandlePathTbRowClick(SelectedPathData);
        }"
        >關閉所有道路</b-button>
      </div>
      <el-table :data="PathesCandicats" border>
        <el-table-column label="ID" prop="PathID">
          <template #default="scope">
            <el-tag effect="dark">{{ scope.row.PathID }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="起點Index" prop="StartPtIndex"></el-table-column>
        <el-table-column label="終點Index" prop="EndPtIndex"></el-table-column>
        <el-table-column label="狀態" prop="IsPassable">
          <template #default="scope">
            <el-tag
              effect="dark"
              :type="scope.row.IsPassable ? 'success' : 'danger'"
            >{{ scope.row.IsPassable ? '開放' : '封閉' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <b-button variant="primary" @click="HandlePathSelected(scope.row)">選取</b-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <!-- <el-drawer v-model="AgvOperation.display"></el-drawer> -->
    <ContextMenuContainer v-show="!editable" ref="contextMenu2"></ContextMenuContainer>
  </div>
</template>
<script>
import html2canvas from 'html2canvas';
import { watch } from 'vue'; // Vue 內建模組

// OpenLayers 相關模組
import Draw from 'ol/interaction/Draw.js';
import Feature from 'ol/Feature.js';
import ImageLayer from 'ol/layer/Image.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point.js';
import { Circle, Polygon } from 'ol/geom';
import { Fill, Stroke, Style, Text, Icon, Circle as CircleStyle } from 'ol/style';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import VectorSource from 'ol/source/Vector.js';
import Static from 'ol/source/ImageStatic.js';
import { defaults as defaultInteractions, Pointer, MouseWheelZoom, DragPan, DoubleClickZoom, DragBox, Select } from 'ol/interaction';
import Projection from 'ol/proj/Projection.js';
import { noModifierKeys, platformModifierKeyOnly } from 'ol/events/condition';
import { getWidth } from 'ol/extent.js';
import { Heatmap as HeatmapLayer } from 'ol/layer.js';

// 本地模組
import bus from '@/event-bus.js';
import { clsMapStation, MapPointModel, clsAGVDisplay, MapRegion } from './mapjs';
import { GetStationStyle, CreateStationPathStyles, CreateEQLDULDFeature, CreateLocusPathStyles, AGVPointStyle, AGVCargoIconStyle, MapContextMenuOptions, MenuUseTaskOption, ChangeCargoIcon, createBezierCurvePoints, CreateNewStationPointFeature, CreateStationFeature, GetPointByIndex, CreateLocIcon, CreateTransTaskMark, CreateRegionPolygon, SimpleAGVStyle, normal_station_image, AGVOption, MapLocalStorage } from './mapjs';
import { MapStore } from './store';
import store, { EqStore, TaskStore, agv_states_store, userStore } from '@/store';
import MapSettingsDialog from './MapSettingsDialog.vue';
import MapPointSettingDrawer from '../MapPointSettingDrawer.vue';
import MapPathSettingDrawer from './MapPathSettingDrawer.vue';
import MapRegionEditDrawer from './MapRegionEditDrawer.vue';
import QuicklyAction from './QuicklyActionMenu.vue';
import { ElNotification } from 'element-plus';
import ImageEditor from '@/components/General/ImageEditor.vue';
import EQStatusDIDto from '@/ViewModels/clsEQStates.js';
import param from '@/gpm_param';
import NotifyDisplay from './EditTool/NotifyDisplay.vue';
import MapLegend from './MapLegend.vue';
import ContextMenuContainer, { ContextMenuOptions } from './MapContextMenu/ContextMenuContainer.vue';
import AlignmentToos from './EditTool/AlignmentToos.vue';
import ActionUndoTool from './EditTool/ActionUndoTool.vue';
import BuildToolContainer from './MapPointBuilder/BuildToolContainer.vue';
import { MarkIconTranslate } from './mapjs'
import { LogMapFeatureClicked } from '@/api/WebSiteAPI.js'
import RackStatusDisplay from './RackStatusDisplay.vue';
import VehicleBatteryStatusDisplay from './VehicleBatteryStatusDisplay.vue'
export default {
  components: {
    RackStatusDisplay, VehicleBatteryStatusDisplay, QuicklyAction, NotifyDisplay, MapLegend, MapSettingsDialog, MapPointSettingDrawer, MapPathSettingDrawer, MapRegionEditDrawer, ImageEditor, ContextMenuContainer, AlignmentToos, ActionUndoTool, BuildToolContainer

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
    rackInfoShow: {
      type: Boolean,
      default: true
    },
    eq_lduld_status_show: {
      type: Boolean,
      default: false
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
      settingCollapsed: false,
      settings: new MapLocalStorage(),
      map: new Map(),
      map_name: 'Unkown',
      renderKey: 1,
      zoom: 2,
      zoom_route: 2,
      center: [0, 0],
      center_route: [0, 0],
      loading: false,
      ShowPathSelectDialog: false,
      DragBackgroundImageMode: false,
      ShowImageEditorDialog: false,
      IsPathEditing: false,
      selectedSettingTabIndex: 0,
      new_map_img_extent: [],
      SelectedPathData: {},
      PathesCandicats: [],
      _map_stations: [],
      dragStartPosition: null,
      map_img_url_for_editor: null,
      to_upload_image_file: null,
      ImageLayer: new ImageLayer(),
      /**Slam座標圖層 */
      PointLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 12
      }),
      /**路網圖層 */
      PointRouteLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 13
      }),
      /**路網圖層 */
      EQLDULDStatusLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 20
      }),
      PathLayerForCoordination: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 5
      }),
      PathLayerForRouter: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 6
      }),
      //路網(路線)
      AGVLocLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 17
      }),
      /**設備維修中ICON圖層 */
      EQMaintainIconLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 4
      }),
      AGVLocusLayer: new VectorLayer({
        source: new VectorSource({
          features: [],
        }),
        zIndex: 18
      }), //軌跡圖顯示圖層
      CustomLayer: new VectorLayer({
        source: new VectorSource(
          {
            features: []
          }
        )
      }),
      TrafficStateLayer: new HeatmapLayer({
        source: new VectorSource(),
        blur: 23,
        radius: 23,
        opacity: 1,
        gradient: [
          'rgba(0, 0, 255, 0)',
          'rgba(0, 255, 0, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 0, 0, 1)'
        ],
        zIndex: 100
      }),
      gridLayer: new VectorLayer(),
      TransferTaskIconLayer: new VectorLayer({
        source: new VectorSource(
          {
            features: []
          }
        ),
        zIndex: 22
      }),
      RegionLayer: new VectorLayer({
        source: new VectorSource(
          {
            features: []
          }
        ),
        zIndex: 1
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
        // EditMode: 'view',
        EditMode: 'edit',
        EditAction: 'none',
        AddPathMode: {
          Direction: 'bi-direction'
        },
        AddRegionMode: {
          Mode: () => {
            return MapStore.state.toolState.selectedComponentName;
          }
        }
      },
      /**顯示模式 : coordination 實際座標 ; router 整齊的路網*/
      map_display_mode: 'coordination',
      /**name/tag/index */
      station_name_display_mode: 'name',
      agv_display: 'visible',
      /**地圖背景顯示 */
      map_image_display: 'visible',
      left_tab_class_name: 'tab-open',
      previousSelectedFeatures: [],
      clickedFeature: new Feature(),
      agv_upload_coordination_mode: false,
      editModeContextMenuVisible: false,
      taskDispatchContextMenuVisible: false,
      legendShow: true,
      dragActionLock: true,
      routePathsVisible: true,
      regionsVisible: false,
      rackVisible: true,
      vehicleBatVisible: true,
      contextMenuTop: 0,
      contextMenuLeft: 0,
      contextMenuOptions: new MapContextMenuOptions(),
      firstUseFlag: true,
      selected_path_feature: undefined,
      path_highlight_style: new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 8
        })
      }),
      PathesSegmentsForEdit: [],
      IsSelectAGVMode: false,
      IsSelectEQStationMode: false,
      TaskDispatchOptions: {
        action_type: '',
        direction: '',
        stations_to_show: []
      },
      draw_forbid_regions_interaction: undefined,
      draw_global_path_regions_interaction: undefined,
      delete_forbid_regions_interaction: undefined,
      edit_forbid_regions_interaction: undefined,
      mapEditsInteraction: undefined,
      MapGridSizeStore: 0,
      MapGridSizeXOffset: 0,
      MapGridSizeYOffset: 0,
      MapRotation: 0,
      MapStyles: {
        PathColor: 'red',
        NormalPointNameColor: 'orange',
        WorkStationPointNameColor: 'lime',
        NormalPointTextFontSize: 12,
        WorkStationPointTextFontSize: 18,

      },
      AgvOperation: {
        operatingAgvName: '',
        display: false,
        Show(agvName) {
          this.operatingAgvName = agvName;
          this.display = true
        }
      },
      featureHighlightTimerID: '',
      highlightingFeatures: [],
      renderLDULD_StatusTimerId: '',
      trackingAGVTimer: '',
      agvSelectedState: {
        isClicked: false,
        agvName: undefined
      },
      designToolCollapseActive: ['1'],
      map_theme_select: 'light',
      map_theme_dark: {
        backgroundColor: 'black',
        color: 'white',
        normalPtTextColor: 'white',
        stationPtTextColor: 'gold',
        pathColor: 'lime'
      },
      SelectedFeatures: [],
      showRedrawControl: false,
      tempHiddenFeaturesOfRegion: [],
      isRedrawConfirmable: false,
      searchTag: undefined,
      rackPortFeatures: [], // 需要顯示標籤的 features
      postRenderThrottleTimer: null,
      agvRenderDebounceTimer: null,
    }
  },
  computed: {
    mapToolShow() {
      const currentAction = this.EditorOption.EditAction;
      return this.editable && (currentAction == 'add-station' || currentAction == 'add-path' || currentAction == 'add-path' || currentAction == 'add-forbid-region');
    },
    mapModeCLass() {
      return this.map_display_mode + `_${this.editable ? 'editMode' : ''}`
    },
    IsCtrlPressing() {
      return store.state.isCtrlPressing;
    },
    IsUserLogin() {
      return userStore.getters.IsLogin;
    },
    IsOpUsing() {
      return userStore.getters.IsOPLogining;
    },
    userLevel() {
      return userStore.state.user.Role;
    },
    MapServerUrl() {
      return MapStore.getters.MapServerUrl;
    },
    map_image_url() {

      if (this.map_img_url_for_editor)
        return this.map_img_url_for_editor
      return `${this.MapServerUrl}/MapFiles/${MapStore.getters.MapImageName}?version=1`
    },
    map_name_with_url() {
      return `map-${this.$route.name}`
    },
    /**[xmin,ymin,xmax,ymax] */
    map_img_extent() {
      return MapStore.getters.Map_Image_Boundary;
    },
    map_img_size() {
      return MapStore.getters.Map_Image_Size;
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
    /**點位類型是 buffer類的點Feature集合 */
    RackPortPointFeatures() {

      let _isBufferPt = (stationType) => {
        const bufferStationTypeValues = [4, 5, 41];
        return bufferStationTypeValues.includes(stationType);
      }
      //StationType == 4 ,5,41;
      return this.StationPointsFeatures.filter(ft => _isBufferPt(ft.get('data').StationType));

    },
    AGVMapFeatures() {
      return this.AGVLocLayer.getSource().getFeatures();
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
      var _AGVOption = new AGVOption(0, [new clsAGVDisplay()]);
      Object.assign(_AGVOption, MapStore.getters.AGVNavInfo)
      return _AGVOption;
    },
    agvs_info_other_system() {
      return MapStore.state.OthersAGVLocateInfo;
    },
    /**dictionary<string:path_id,MapPath> */
    ControledPathesBySystem() {
      return MapStore.getters.ControledPathesBySystem;
    },
    MapGridSize() {
      return MapStore.state.MapData.Options.gridSize;
    },
    redrawingRegionName() {
      if (!this.tempHiddenFeaturesOfRegion)
        return '';
      return this.tempHiddenFeaturesOfRegion[0].get('name');
    },
    allPointsSimpleOptions() {
      return Object.values(MapStore.state.MapData.Points).sort((a, b) => a.TagNumber - b.TagNumber).map(pt => {
        return {
          value: pt.TagNumber,
          label: pt.TagNumber + `(${pt.Graph.Display})`
        }
      })
    },
    toolState() {
      return MapStore.state.toolState;
    },
    LegendStyle() {
      return { bottom: (this.IsOpUsing ? '0.6rem' : '5rem') }
    }
  },
  methods: {
    saveMapImage(filename = `MapImageShot_${Date.now()}.png`) {
      html2canvas(this.map.getTargetElement()).then(canvas => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    },
    getRackCargoExistStateFeatureLabelStyle(feature = new Feature()) {
      if (!feature || !this.map)
        return {};
      // 將地理座標轉換為螢幕像素座標
      const tagNumber = feature.get('data').TagNumber;
      const pixel = this.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());

      if (!pixel) return { display: 'none' };

      //Get Rack Display Options from map model;
      // 設置偏移量 (例如右側 10px, 上方 5px)
      let offsetX = 20;
      let offsetY = 0;
      let rotation = 0;
      const ptData = feature.get('data');
      if (ptData) {
        const rackDisplay = ptData.Graph.rackDisplay;
        offsetX = rackDisplay.OffsetX;
        offsetY = rackDisplay.OffsetY;
        rotation = rackDisplay.Rotation;

      }
      return {
        position: 'absolute',
        left: `${parseFloat(pixel[0]) + parseFloat(offsetX)}px`,
        top: ` ${parseFloat(pixel[1]) + parseFloat(offsetY)}px`,
        transform: `rotate(${rotation}deg) translate(0,-50%)`, // 垂直置中
        transformOrigin: 'center center',
        zIndex: 1
      }
    },

    getVehicleBatStatusDisplayStyle(feature = new Feature()) {
      if (!feature || !this.map)
        return {};
      // 將地理座標轉換為螢幕像素座標
      const pixel = this.map.getPixelFromCoordinate(feature.getGeometry().getCoordinates());

      if (!pixel) return { display: 'none' };

      // 設置偏移量 (例如右側 10px, 上方 5px)
      const offsetX = 20;
      const offsetY = -5;

      return {
        position: 'absolute',
        left: `${pixel[0] + offsetX}px`,
        top: `${pixel[1] + offsetY}px`,
        transform: 'translate(0, -50%)', // 垂直置中
        zIndex: 1
      }
    },

    HandleRegionToolComponentChange(val) {
      this.HandleAddForbidRegionClicked(val)
    },
    HandlePathToolComponentChange(val) {
      this.EditorOption.AddPathMode.Direction = val;
    },
    async HandleUnDoBtnClicked() {
      //this.renderKey += 1;
      const lastMapStates = await MapStore.dispatch('GetLastMapData')
      this.RefreshMap(lastMapStates);
    },
    GoOriginal() {

      this.map.getView().setCenter([0, 0]);
      this.map.getView().setZoom(1);

    },
    GetPointName(index) {
      var pt = GetPointByIndex(index)
      if (pt) {
        return pt.Name;
      }
    },
    ClearMap() {
      this.$swal.fire(
        {
          text: '地圖資料將會被清空，變成空白地圖',
          title: '確定要重置地圖?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          customClass: 'my-sweetalert'
        }).then(res => {
          if (!res.isConfirmed)
            return;
          this.PathesSegmentsForEdit = [];
          this.PathLayerForCoordination.getSource().clear();
          this.PathLayerForRouter.getSource().clear();
          this.PointRouteLayer.getSource().clear();
          this.PointLayer.getSource().clear();
          this.TransferTaskIconLayer.getSource().clear();
        })

    },
    HandlePathRemoveBtnClick(path_data) {
      var index = this.PathesSegmentsForEdit.indexOf(path_data);
      this.PathesSegmentsForEdit.splice(index, 1);
      this.UpdateStationPathLayer();
    },
    HandlePathTbRowClick(row, column, event) {
      if (this.selected_path_feature) {
        this.RestoreOriginalPathStyle(this.selected_path_feature)
      }
      //alert(JSON.stringify(row))
      var path_source = this.PathLayerForCoordination.getSource();
      var path_feature = path_source.getFeatures().find(ft => ft.get('path_id') == row.PathID)
      if (path_feature) {
        var oriStyles = path_feature.getStyle();
        oriStyles[0] = this.path_highlight_style
        path_feature.setStyle(oriStyles)
        this.selected_path_feature = path_feature
        if (!this.IsPathEditing) {
          var path_coor = path_feature.getGeometry().getCoordinates()[0];
          this.map.getView().setCenter(path_coor);
        }
      }
    },
    RestoreOriginalPathStyle(path_feature) {
      if (!path_feature)
        return;
      var ori_style = path_feature.get('ori_stroke_style')
      var styles = path_feature.getStyle();
      styles[0] = ori_style
      path_feature.setStyle(styles)
    },
    UpdateStationPointLayer() {
      var stationPointFeatures = []
      var stationPointFeatures_ForRouteShow = []//路網顯示用
      var maintainingFeatures = []
      var maintainingFeatures_ForRouteShow = []
      for (let index = 0; index < this._map_stations.length; index++) {
        var station = this._map_stations[index];
        var iconFeature = CreateStationFeature(station)

        stationPointFeatures.push(iconFeature)
        if (station.data.StationType != 0)
          maintainingFeatures.push(this.CreateEqMaintainingFeature(station.data, iconFeature.getGeometry().getCoordinates()))
        //this.ShowEqMaintainIcon(station.data.TagNumber)
        var routeUseFeature = iconFeature.get('routeModeFeature')
        if (routeUseFeature) {
          stationPointFeatures_ForRouteShow.push(routeUseFeature)
          //maintainingFeatures_ForRouteShow.push(this.CreateEqMaintainingFeature(routeUseFeature.getGeometry().getCoordinates()))
        }
      }
      var ptlayerSource = this.PointLayer.getSource();
      ptlayerSource.clear();
      ptlayerSource.addFeatures(stationPointFeatures);
      this.EQMaintainIconLayer.getSource().addFeatures(maintainingFeatures);


      var ptRouteLayerSource = this.PointRouteLayer.getSource();
      ptRouteLayerSource.clear();
      ptRouteLayerSource.addFeatures(stationPointFeatures_ForRouteShow);
      //ptRouteLayerSource.addFeatures(maintainingFeatures_ForRouteShow);
      this.UpdateEQLDULDFeature();
    },
    UpdateStationPathLayer() {

      var source_coordination_mode = this.PathLayerForCoordination.getSource();
      var source_router_mode = this.PathLayerForRouter.getSource();

      source_coordination_mode.clear();
      source_router_mode.clear();

      var path_feature_collection_coordinatino_mode = [];
      var path_feature_collection_router_mode = [];
      var pathSegments = this.PathesSegmentsForEdit

      var setPathFeatureProperties = function (feature, pathData) {
        feature.set('start_pt_index', pathData.StartPtIndex)
        feature.set('end_pt_index', pathData.EndPtIndex)
        feature.set('path_id', pathData.PathID)
        feature.set('isEqLink', pathData.IsEQLink)
        feature.set('feature_type', 'path')
        feature.set('isClose', !pathData.IsPassable)
        var styles = CreateStationPathStyles(feature);
        feature.setStyle(styles)
        feature.set('ori_stroke_style', styles[0])

      }

      pathSegments.forEach(path => {
        let path_Feature_coordination_mode = new Feature(
          {
            geometry: new LineString([path.StartCoordination, path.EndCoordination]),
          },
        );

        var startPt = this._map_stations.find(pt => pt.index == path.StartPtIndex);
        var endPt = this._map_stations.find(pt => pt.index == path.EndPtIndex);

        if (startPt && endPt) {
          let path_feature_route_mode = new Feature({
            geometry: new LineString([[startPt.data.Graph.X, startPt.data.Graph.Y], [endPt.data.Graph.X, endPt.data.Graph.Y]]),

          })
          setPathFeatureProperties(path_Feature_coordination_mode, path);
          setPathFeatureProperties(path_feature_route_mode, path);
          path_feature_collection_coordinatino_mode.push(path_Feature_coordination_mode)
          path_feature_collection_router_mode.push(path_feature_route_mode)
        }
      })

      source_coordination_mode.addFeatures(path_feature_collection_coordinatino_mode);
      source_router_mode.addFeatures(path_feature_collection_router_mode);
      return [...path_feature_collection_router_mode, ...path_feature_collection_coordinatino_mode];

    },
    UpdateEQLDULDFeature() {

      if (this.editable) //編輯地圖模式下不更新
        return;

      var eqLDULDFeatures = []

      for (let index = 0; index < this._map_stations.length; index++) {
        var station = this._map_stations[index];
        var lduldFeature = CreateEQLDULDFeature(station, this.map_display_mode)
        eqLDULDFeatures.push(lduldFeature);

      }
      var EQLDULDStatusLayerSource = this.EQLDULDStatusLayer.getSource();
      EQLDULDStatusLayerSource.clear();
      EQLDULDStatusLayerSource.addFeatures(eqLDULDFeatures);
    },
    UpdateForbidPointLayer() {
      this.RegionLayer.getSource().clear();
      var _regions = MapStore.getters.Regions;
      _regions.forEach(element => {
        var _RegionObj = CreateRegionPolygon(element.Name, element.PolygonCoordinations, element.RegionType);
        _RegionObj.region_feature.set('data', element)
        this.RegionLayer.getSource().addFeatures([_RegionObj.region_feature, _RegionObj.text_feature])
      });
    },
    /**
     * 
     * @param {*} payload  :ex.[ {"AGVName":"AGV_001","Location":"DEMOS001"},{}..]
     */
    UpdateAGVLocationOfOtherSystem(payload = []) {
      var source = this.AGVLocLayer.getSource();
      var agvFeatures = source.getFeatures();
      var _GetCoordinationByDisplayName = (name) => {
        var feature = this.StationPointsFeatures.find(ft => ft.get('data').Graph.Display == name)
        if (feature) {
          return feature.getGeometry().getCoordinates();
        } else {
          return [0, 0];
        }
      }

      payload.forEach(info => {
        var agvName = info.AGVName;
        if (agvName && agvName != '') {
          var agvLocation = info.Location;
          var featureKey = `other-agv-${agvName}`;
          var featureFound = agvFeatures.find(ft => ft.get('agv-addition') == featureKey);
          var coordination = _GetCoordinationByDisplayName(agvLocation);

          var isCoordinationNotFound = coordination[0] == 0 && coordination[1] == 0;
          if (!isCoordinationNotFound) {

            if (featureFound) {
              //TODO Update Coordination by location name
              featureFound.setGeometry(new Point(coordination));
            } else {
              var _agvfeature = new Feature({
                geometry: new Point(coordination)
              })

              var _style = SimpleAGVStyle(agvName, 'blue')
              _agvfeature.setStyle(_style)
              _agvfeature.set('agvname', agvName)
              _agvfeature.set("feature_type", this.FeatureKeys.agv)
              _agvfeature.set("agv-addition", featureKey)
              source.addFeature(_agvfeature);
            }
          }
        }



      });
    },
    //TODO UpdateAGVLayer
    UpdateAGVLayer() {
      if (this.agv_display != 'visible')
        return;
      const isDevelopment = process.env.NODE_ENV === 'development';
      var saveAgvDataToLocalStorage = (agvName, JSONData) => {
        localStorage.setItem(agvName, JSONData);
      }

      var getAgvDataFromLocalStorage = (agvName) => {
        var jsonStr = localStorage.getItem(agvName);
        if (jsonStr) {
          return jsonStr;
        } else
          return ''
      }

      this.agvs_info.AGVDisplays.forEach(agv_information => {

        let getAGVType = (modelInt) => {
          if (modelInt == 0)
            return 'forklift'
          else if (modelInt == 3)
            return 'submarine'
          return 'unknown';
        };

        const vehicleLength = agv_information.vehicleLength / 100.0; //unit:m
        const vehicleWidth = agv_information.vehicleWidth / 100.0;//unit:m
        const agvType = getAGVType(agv_information.AgvModel);
        const vehicleSaftyRotationRadious = Math.sqrt(Math.pow(vehicleLength / 2, 2) + Math.pow(vehicleWidth / 2, 2));//unit:m
        var _polygon_coordinations = this.CalculateAGVPolygonCoordination(agv_information.Coordination, vehicleLength, vehicleWidth, agv_information.Theta)
        var agvfeatures = this.AGVFeatures[agv_information.AgvName]
        if (agvfeatures) {  //以新增
          var currentDataJsonStr = JSON.stringify(agv_information);
          var cacheData = getAgvDataFromLocalStorage(agv_information.AgvName);
          if (currentDataJsonStr != cacheData) {
            saveAgvDataToLocalStorage(agv_information.AgvName, currentDataJsonStr);
          } else {
            return;
          }

          var coordination = agv_information.Coordination;
          var path_coordinations = agv_information.NavPathCoordinationList
          if (this.map_display_mode == 'router') {
            path_coordinations = [];

            var ft = this.StationPointsFeatures.find(ft => ft.get('data').TagNumber == agv_information.Tag)
            if (ft) {
              coordination = ft.getGeometry().getCoordinates()
              _polygon_coordinations = this.CalculateAGVPolygonCoordination(coordination, vehicleLength, vehicleWidth, agv_information.Theta)
            }
            var pts = this.PointLayer.getSource().getFeatures();
            const pathLength = agv_information.NavPathCoordinationList.length;
            const isPathEmpty = pathLength == 0;
            if (!isPathEmpty) {
              for (let index = 0; index < pathLength; index++) {
                const coor = agv_information.NavPathCoordinationList[index];
                var ft = pts.find(feature => feature.getGeometry().getCoordinates()[0] == coor[0] &&
                  feature.getGeometry().getCoordinates()[1] == coor[1])
                if (ft) {
                  var feature_ = this.StationPointsFeatures.find(feature => feature.get('index') == ft.get('index'))
                  path_coordinations.push(feature_.getGeometry().getCoordinates())
                }
              }
            }
          }

          agvfeatures.agv_feature.setGeometry(new Point(coordination))
          agvfeatures.cargo_icon_feature.setGeometry(new Point(coordination))
          agvfeatures.safty_region_feture.getGeometry().setCenter(coordination)
          agvfeatures.agv_body_feture.setGeometry(new Polygon(_polygon_coordinations))
          var style = agvfeatures.agv_feature.getStyle();
          var image = style.getImage()

          if (this.map_display_mode != 'router') {
            image.setRotation((agv_information.Theta - 90 - this.MapRotation) * -1 * Math.PI / 180.0)
            style.setImage(image)
          }

          var actionString = agv_information.CurrentAction
          var text = style.getText();
          var agvText = agv_information.DisplayText + (actionString == '' ? '' : `(${actionString})`);
          agvText += agv_information.WaitingInfo.IsWaiting ? '\r\n' + agv_information.WaitingInfo.Descrption : '';
          text.setText(agvText);

          var fill = text.getBackgroundFill()
          fill.setColor(!agv_information.AgvStates.is_online ? 'rgb(147, 147, 147)' : agv_information.TextColor)
          text.setBackgroundFill(fill);
          agvfeatures.agv_feature.setStyle(style)
          agvfeatures.path_feature.setGeometry(new LineString(path_coordinations))
          const _isHighestPriorityTask = TaskStore.getters.IsRunningHighestPriorityTask(agv_information.AgvName); //TODO 取得當前任務訂單是否為最高優先度任務
          const _pathColorUse = _isHighestPriorityTask ? this.convertColorNameToRGBA(agv_information.TextColor, 0.5) : agv_information.TextColor;
          agvfeatures.path_feature.setStyle(CreateLocusPathStyles(_pathColorUse, 7, _isHighestPriorityTask ? '#ff3636' : undefined))


          ChangeCargoIcon(agvfeatures.cargo_icon_feature, agv_information.CargoStatus)

          //this.UpdateAGVLocByMapMode(this.map_display_mode, agv_information);
        }
        else {//動態新增AGV Feature
          try {
            var _agvfeature = new Feature({
              geometry: new Point(agv_information.Coordination)
            })

            //AGV車體與迴轉半徑顯示
            const _agvSaftyCircle = new Circle(agv_information.Coordination, vehicleSaftyRotationRadious) //TODO 車輛安全區域半徑數據取得
            const _agvBodyPolygon = new Polygon(_polygon_coordinations)
            // 構造一個新的 RGBA 字串
            var nameFillColor = this.convertColorNameToRGBA(agv_information.TextColor, 1);
            var bodyColor = this.convertColorNameToRGBA(agv_information.TextColor, 0.4);
            var safyRegionColor = this.convertColorNameToRGBA(agv_information.TextColor, 0.2);
            var safyRegionStrokeColor = this.convertColorNameToRGBA(agv_information.TextColor, 0.8);
            const _agvSaftyRegionFeature = new Feature(_agvSaftyCircle)
            _agvSaftyRegionFeature.setStyle(new Style({
              fill: new Fill({ color: safyRegionColor }),
              stroke: new Stroke({
                color: safyRegionStrokeColor, width: 1, lineDash: [13, 12]
              }),
              text: new Text({
                text: "",
              })
            }))

            //AGV車體顯示
            const _agvBodyFeature = new Feature(_agvBodyPolygon)
            _agvBodyFeature.setStyle(new Style({
              fill: new Fill({ color: bodyColor }),
              stroke: new Stroke({
                color: 'grey',
                width: 1,
                lineCap: 'round',
                lineJoin: 'round'
              }),
            }))
            var _style = AGVPointStyle(agv_information.DisplayText, nameFillColor, agvType)
            // var _style = AGVPointStyle(agv_information.DisplayText, nameFillColor, vehicleImageName + `?version=${Date.now()}`)
            _agvfeature.setStyle(_style)
            _agvfeature.set('agvname', agv_information.AgvName)
            _agvfeature.set("feature_type", this.FeatureKeys.agv)

            //
            var nav_path_feature = new Feature({
              geometry: new LineString([])
            })
            nav_path_feature.setStyle(CreateLocusPathStyles(nameFillColor, 7))


            var _cargo_icon_feature = _agvfeature.clone()
            _cargo_icon_feature.setStyle(AGVCargoIconStyle())

            this.AGVFeatures[agv_information.AgvName] = {
              agv_feature: _agvfeature,
              path_feature: nav_path_feature,
              cargo_icon_feature: _cargo_icon_feature,
              safty_region_feture: _agvSaftyRegionFeature,
              agv_body_feture: _agvBodyFeature
            };

            var source = this.AGVLocLayer.getSource();
            source.addFeature(_cargo_icon_feature);
            source.addFeature(_agvfeature);
            source.addFeature(_agvSaftyRegionFeature);
            source.addFeature(_agvBodyFeature);
            source.addFeature(nav_path_feature);
          } catch {
            console.log('errror')
          }

        }
      });
    },
    /**將點的Graph X Y 重新設為實際座標 */
    async ResetRouteModeDisplay() {

      this.$swal.fire(
        {
          text: '',
          title: '確定要重置路網模式?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(async (res) => {
          if (!res.isConfirmed)
            return;
          var response = await MapStore.dispatch('ResetMapXYGraphAsCoordinations', "")
          console.log(response);
          var success = response.confirm;
          var msg = response.message
          this.$swal.fire(
            {
              text: success ? '' : msg,
              title: success ? '重置成功' : '重置失敗',
              icon: success ? 'success' : 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
          this.ReloadMap(false);
        })


    },
    CalculateAGVPolygonCoordination(coordination, length, width, theta) {
      let radians = theta * Math.PI / 180; // 將角度轉換為弧度
      let cosTheta = Math.cos(radians);
      let sinTheta = Math.sin(radians);
      // 中心點
      let [a, b] = coordination;
      // 未旋轉矩形的角點座標
      let corners = [
        [a - length / 2, b - width / 2],
        [a + length / 2, b - width / 2],
        [a + length / 2, b + width / 2],
        [a - length / 2, b + width / 2]
      ];
      // 旋轉角點座標
      let rotated_corners = corners.map(corner => {
        let [x, y] = corner;
        let x_relative = x - a;
        let y_relative = y - b;
        let x_rotated = x_relative * cosTheta - y_relative * sinTheta + a;
        let y_rotated = x_relative * sinTheta + y_relative * cosTheta + b;

        return [x_rotated, y_rotated];
      });
      var olPolygonCoords = [rotated_corners.map(coord => [coord[0], coord[1]])];
      return olPolygonCoords;
    },
    /**根據地圖顯示模式變更現有Agv的顯示位置 */
    UpdateAGVLocByMapMode(mode = 'router' || 'coordination', agv_information = new clsAGVDisplay()) {

      var agvfeature = this.AGVFeatures[agv_information.AgvName]
      if (!agvfeature)
        return;
      var currentStationFeature = this.StationPointsFeatures.find(ft => ft.get('data').TagNumber == agv_information.Tag)
      if (currentStationFeature) {
        var coordination = currentStationFeature.getGeometry().getCoordinates()
        agvfeature.agv_feature.setGeometry(new Point(coordination))
        agvfeature.safty_region_feture.getGeometry().setCenter(coordination)
        const vehicleSize = agv_states_store.getters.VehicleSize(agv_information.AgvName);//[length,width]
        const vehicleLength = vehicleSize[0] / 100.0; //unit:m
        const vehicleWidth = vehicleSize[1] / 100.0;//unit:m
        agvfeature.agv_body_feture.setGeometry(new Polygon(this.CalculateAGVPolygonCoordination(coordination, vehicleLength, vehicleWidth)))
      }

    },
    convertColorNameToRGBA(colorName, alpha = 1) {
      var tempElem = document.createElement("div");
      tempElem.style.color = colorName;
      document.body.appendChild(tempElem);
      var rgbColor = window.getComputedStyle(tempElem).color;
      document.body.removeChild(tempElem);
      var rgbaColor = rgbColor.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
      return rgbaColor;
    },
    setDragPanEnabled(enabled) {
      this.map.getInteractions().forEach(function (interaction) {
        if (interaction instanceof DragPan) {
          interaction.setActive(enabled);
        }
        if (interaction instanceof MouseWheelZoom) {
          interaction.setActive(enabled);
        }
        if (interaction instanceof DoubleClickZoom) {
          interaction.setActive(enabled);
        }
      });
    },
    /**事件處理 */
    InitMapEventHandler() {
      let IsVehicleClicked = (pixel) => {
        var _agvName = this.map.forEachFeatureAtPixel(pixel, (feature) => {
          if (feature.get('feature_type') === 'agv') {
            const agvName = feature.get('agvname')
            return agvName;
          }
        });
        this.agvSelectedState.isClicked = _agvName != undefined;
        this.agvSelectedState.agvName = _agvName;
        // this.agvSelectedState.agvName = agvName;
      }
      let FeatureClicked = (pixel) => {
        var _featureClicked = this.map.forEachFeatureAtPixel(pixel, (feature) => {
          if (feature) {
            return feature;
          }
        });
        return _featureClicked;
      }
      this.map.on('pointermove', (event) => {

        if (this.DragBackgroundImageMode && this.dragStartPosition) {
          event.preventDefault();
          // 计算位移增量
          let deltaX = event.coordinate[0] - this.dragStartPosition[0];
          let deltaY = event.coordinate[1] - this.dragStartPosition[1];
          console.log(deltaX, deltaY)

          this.new_map_img_extent[0] += deltaX,
            this.new_map_img_extent[1] += deltaY,
            this.new_map_img_extent[2] += deltaX,
            this.new_map_img_extent[3] += deltaY,

            this.ResetImageExtend(this.new_map_img_extent)

          this.dragStartPosition = event.coordinate;
        }


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

        if (this.DragBackgroundImageMode) {
          this.dragStartPosition = null;
        }

        if (this.EditorOption.EditAction == 'add-station')
          this.map.getTargetElement().style.cursor = 'crosshair';
        else
          this.map.getTargetElement().style.cursor = 'default';

        if (e.originalEvent.button == 2) {
          var menuUseFor = '';
          var option = new ContextMenuOptions();


          if (this.agvSelectedState.isClicked && !this.editable) {
            menuUseFor = 'agv';
            option.agvName = this.agvSelectedState.agvName;
          }
          if (this.editable && this.SelectedFeatures.length > 0) {
            menuUseFor = 'multi-point';
            option.selectedFeatures = this.SelectedFeatures;
          }

          if (!this.editable && this.clickedFeature && !this.agvSelectedState.isClicked && this.clickedFeature.get('data') && this.clickedFeature.get('data').IsEquipment) {
            menuUseFor = 'eq'
            option.selectedFeature = this.clickedFeature;
          }

          if (menuUseFor != '' && this.userLevel > 0)
            this.$refs['contextMenu2'].showAt([e.originalEvent.x, e.originalEvent.y], menuUseFor, option);
        }
      })
      this.map.on('pointerdown', (evt) => {
        IsVehicleClicked(evt.pixel);
        var feature = FeatureClicked(evt.pixel);

        if (feature) {
          //TODO Post to backend
          LogMapFeatureClicked(feature)
          this.clickedFeature = feature;
          if (this.editable)
            this.previousSelectedFeatures = [feature]
        }
        const isRightClick = evt.originalEvent.button == 2;
        if (!isRightClick && this.$refs['contextMenu2']) {
          this.$refs['contextMenu2'].hide();
        }

        if (this.DragBackgroundImageMode && isRightClick) {
          this.dragStartPosition = evt.coordinate;
          return;
        }
        this.map.getTargetElement().style.cursor = 'grabbing';
      })
      this.map.on('moveend', event => {
        this.SaveSettingsToLocalStorage();
      })
      this.map.on('click', (evt) => {//TODO map click event2
        var featureClicked = FeatureClicked(evt.pixel);

        if (!this.IsCtrlPressing) {
          this.RestoreStyleOfSelectedFeatures(this.SelectedFeatures)
          this.SelectedFeatures = [];
        }
        if (this.IsCtrlPressing && featureClicked != undefined) {
          if (this.SelectedFeatures.includes(featureClicked)) {
            this.RestoreStyleOfSelectedFeatures([featureClicked]);
            this.SelectedFeatures.splice(this.SelectedFeatures.indexOf(featureClicked), 1);
          } else {
            featureClicked.set('oriStyle', featureClicked.getStyle().clone())
            this.SelectedFeatures.push(featureClicked);
            this.HighLightFeatureSelected(this.SelectedFeatures, 'rgb(13, 110, 253)')
          }
        }
      });
      this.map.on('postrender', () => {
        if (this.postRenderThrottleTimer) {
          return;
        }

        this.postRenderThrottleTimer = setTimeout(() => {
          this.$forceUpdate();
          this.postRenderThrottleTimer = null;
        }, 500); // 每 100ms 最多執行一次

      });
    },
    /**切換為刪除禁制區模式 */
    HandleDeleteForbidRegionClicked() {
      var _RemoveInteractions = () => {
        this.RemoveInteraction(this.draw_forbid_regions_interaction);
        this.RemoveInteraction(this.mapEditsInteraction);
        this.RemoveInteraction(this.edit_forbid_regions_interaction);
      }
      //移除事件
      _RemoveInteractions();
      this.regionsVisible = true
      var _displayModeChanged = this.map_display_mode != 'coordination'
      this.map_display_mode = 'coordination'
      this.MapDisplayModeOptHandler(_displayModeChanged);
      this.AddRemoveForbidRegionInteraction();

    },
    /**切換為編輯禁制區模式 */
    HandleEditForbidRegionClicked() {
      var _RemoveInteractions = () => {
        this.RemoveInteraction(this.draw_forbid_regions_interaction);
        this.RemoveInteraction(this.delete_forbid_regions_interaction);
        this.RemoveInteraction(this.mapEditsInteraction);
      }
      this.regionsVisible = true
      _RemoveInteractions();
      var _displayModeChanged = this.map_display_mode != 'coordination'
      this.map_display_mode = 'coordination'
      this.MapDisplayModeOptHandler(_displayModeChanged);
      this.AddEditForbidRegionInteraction();
    },
    /**切換為繪製禁制區模式 */
    HandleAddForbidRegionClicked(type) {
      var _RemoveInteractions = () => {
        this.RemoveInteraction(this.mapEditsInteraction);
        this.RemoveInteraction(this.delete_forbid_regions_interaction);
        this.RemoveInteraction(this.edit_forbid_regions_interaction);
      }
      _RemoveInteractions();
      this.regionsVisible = true;
      var _displayModeChanged = this.map_display_mode != 'coordination'
      this.map_display_mode = 'coordination'
      this.MapDisplayModeOptHandler(_displayModeChanged);
      this.AddDrawForbidActionInteraction(type)

    },
    HandleDrawGlobalPathRegionClicked() {
      var _displayModeChanged = this.map_display_mode != 'coordination'
      this.map_display_mode = 'coordination'
      this.MapDisplayModeOptHandler(_displayModeChanged);
      this.AddDrawGlobalPathActionInteraction();
    },
    AddEditMapInteraction() {
      this.RemoveForbidRegionOperationInteractions();
      var this_vue = this;
      this.mapEditsInteraction = new Pointer({
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


          if (isRightClick && feature && feature.get('feature_type') == 'path' && currentAction == 'add-station') {
            this_vue.InsertPointAtPathes(feature, event.coordinate);
            return;
          }

          if (!feature || feature.get('grid_line')) {

            this_vue.IsDragging = false;
            if (currentAction == 'add-station' && isRightClick) {

              feature = CreateNewStationPointFeature(event.coordinate, this_vue.GenNewIndexOfStation());
              //this_vue.map_stations.push(station)
            } else
              return false;
          } else {

            if (feature.get('type') == 'polygon' || feature.get('type') == 'text')
              return false;
            var _featureType = feature.get('feature_type')

            var _isAGVSelected = () => (this_vue.IsSelectAGVMode || this_vue.IsSelectEQStationMode) && _featureType == 'agv';
            var _isEquipmentSelected = () => this_vue.IsSelectEQStationMode && _featureType == 'station';


            if (_isAGVSelected()) {
              var _agvname = feature.get('agvname');
              bus.emit('/map/agv_selected', _agvname)
              bus.emit('/map/station_selected', { isAGV: true, agvName: _agvname })
            }

            if (_isEquipmentSelected()) {
              var _station_data = feature.get('data');
              bus.emit('/map/station_selected', _station_data)
            }

          }


          if (feature.get('feature_type') == 'lduld') {
            var action = feature.get('action')
            this_vue.HandleLDULDLabelClick(feature.get('data'), action);
            return false;
          }
          if (this_vue.EditorOption.EditMode == 'view') {
            return false;
          }

          var featureType = feature.get('feature_type');
          this.feature_ = feature;
          this_vue.IsDragging = isRightClick ? false : true;

          if (currentAction == "none" && featureType != this_vue.FeatureKeys.Station)
            return false;

          if (event.originalEvent.button == 0) {//左鍵

            if (featureType == this_vue.FeatureKeys.Station && currentAction == 'remove-station')
              this_vue.RemoveStation(feature);
            else if (featureType == this_vue.FeatureKeys.path && currentAction == 'remove-path')
              this_vue.RemovePath(feature);
            else if (currentAction == 'add-path')
              this_vue.PushPathEndPointData(feature)
          }
          else if (event.originalEvent.button == 2) { //右鍵
            if (featureType == this_vue.FeatureKeys.path && currentAction == 'edit-path') {
              this_vue.OpenPath_editor(feature);
            }
          }
          return true;
        },
        /**滑鼠拖曳事件 */ //TODO滑鼠拖曳事件
        handleDragEvent: function (event) {
          if (!this_vue.IsDragging)
            return;
          var is_editable = this_vue.editable;
          var edit_mode = this_vue.EditorOption.EditMode;
          var edit_action = this_vue.EditorOption.EditAction;

          if (!is_editable || edit_mode != 'edit')
            return;

          if (edit_action == 'add-path' || edit_action == 'edit-path' || edit_action == 'remove-path')
            return;

          if (this.feature_.get('feature_type') === 'path')
            return;

          var deltaX = event.coordinate[0] - this.coordinate_[0];
          var deltaY = event.coordinate[1] - this.coordinate_[1];

          this_vue.MouseCoordination = this.coordinate_ = event.coordinate;
          var changeCoordinate = (__feature = new Feature()) => {
            var geometry = __feature.getGeometry();
            geometry.translate(deltaX, deltaY);

            geometry = __feature.getGeometry();
            var oriData = __feature.get('data')

            if (!oriData)
              return;
            var newCoordinates = geometry.getCoordinates();

            if (this_vue.map_display_mode == "coordination") {
              oriData.X = newCoordinates[0];
              oriData.Y = newCoordinates[1];
            }
            else {
              oriData.Graph.X = newCoordinates[0];
              oriData.Graph.Y = newCoordinates[1];
            }

            __feature.set('data', oriData)
          }

          if (this_vue.SelectedFeatures.length > 0)
            this_vue.SelectedFeatures.forEach(_ft => changeCoordinate(_ft))
          else
            changeCoordinate(this.feature_)

        },

        /**滑鼠點擊後放開事件 */
        handleUpEvent: function (ev) {

          if (this_vue.EditorOption.EditMode == 'view') {

            return;
          }
          var currentAction = this_vue.EditorOption.EditAction;
          if (currentAction != 'add-path' && currentAction != 'remove-path') {
            if (ev.originalEvent.button == 2) {//滑鼠右鍵
              if (currentAction == 'edit-station') {
                this_vue.HandlePtSettingBtnClick();
              }
              else if (currentAction == 'add-station') {
                try {
                  this_vue.AddFeatureToMapLayers(this.feature_);
                }
                catch (error) {//若該座標已經有新增feature會跳錯=>變成顯示設定面板
                  console.error(error);
                  this_vue.HandlePtSettingBtnClick();
                }
              }
            }
            this_vue.IsDragging = false;
            try {
              let _ResetPath = (__feature = new Feature()) => {
                var index = __feature.get('index')
                this_vue.ResetPathLinkOfRouteMode(index);
                this_vue.ResetPathLinkOfCoordinationMode(index);
              }
              if (this_vue.SelectedFeatures.length > 0) {
                this_vue.SelectedFeatures.forEach(_ft => {
                  _ResetPath(_ft);
                });
              } else {
                _ResetPath(this.feature_);
              }

            } catch (error) {
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
            var isGridFeature = feature.get('grid_line')
            if (isGridFeature) {
              return;
            }
            var featureType = feature.get('feature_type');
            var allowedActions = {
              "add-path": this_vue.FeatureKeys.Station,
              "remove-station": this_vue.FeatureKeys.Station,
              "remove-path": this_vue.FeatureKeys.path
            };
            cursor = 'pointer';
            // 检查当前操作是否在允许的动作列表中，且特征类型不匹配
            if (allowedActions[currentAction] && featureType != allowedActions[currentAction]) {
              cursor = 'not-allowed';
            }
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
      this.map.addInteraction(this.mapEditsInteraction);
    },
    AddDrawGlobalPathActionInteraction() {
      this.RemoveForbidRegionOperationInteractions();
      this.RemoveInteraction(this.draw_global_path_regions_interaction);

      const fill_color = 'rgba(152, 209, 224,.5)';
      this.draw_global_path_regions_interaction = new Draw({
        source: this.RegionLayer.getSource(),
        type: 'Polygon',
        condition: noModifierKeys,
        style: new Style({
          fill: new Fill({
            color: fill_color
          }),
          stroke: new Stroke({
            color: 'blue',
            width: 1
          })
        })
      })
      var that = this;
      this.draw_global_path_regions_interaction.on('drawend', (event) => {
        var RegionCount = that.GetGlobalPathRegionCount();
        var _name = `道路區域-${RegionCount}`;
        const region_type = "path";
        const feature = event.feature; // 獲取繪製的多邊形要素
        feature.set('type', 'polygon')
        feature.set('name', _name)
        feature.set('region_type', region_type)
        const center = feature.getGeometry().getInteriorPoint().getCoordinates();
        console.info(center)
        feature.setStyle(new Style({
          fill: new Fill({
            color: fill_color
          }),
          stroke: new Stroke({
            width: 1 // 邊框寬度,
          })
        }));

        // 新增文字要素
        const textFeature = new Feature({
          geometry: new Point(center), // 文字的位置為多邊形中心點
        });
        textFeature.set('type', 'text')
        textFeature.set('name', _name)
        textFeature.set('region_type', region_type)

        // 定義文字樣式
        textFeature.setStyle(new Style({
          text: new Text({
            text: _name, // 使用文字內容
            scale: 1.2, // 文字標籤的縮放比例
            fill: new Fill({
              color: 'black' // 文字顏色
            })
          })
        }));
        that.RegionLayer.getSource().addFeature(textFeature);
      })

      this.map.addInteraction(this.draw_global_path_regions_interaction);

    },
    AddDrawForbidActionInteraction(region_type = "forbid|passible", speficName = undefined, drawStartEvent = undefined) {
      this.RemoveInteraction(this.draw_forbid_regions_interaction);
      this.RemoveInteraction(this.draw_global_path_regions_interaction);
      const value = 'Polygon';
      var that = this;
      var _isForbidRegion = region_type == 'forbid';
      var _fillColor = _isForbidRegion ? 'rgba(255, 0, 0,0.5)' : 'rgba(116, 249, 42,0.5)';
      var _strokeColor = _isForbidRegion ? 'red' : 'seagreen';
      if (value !== 'None') {
        this.draw_forbid_regions_interaction = new Draw({
          source: this.RegionLayer.getSource(),
          type: value,
          condition: noModifierKeys,
          style: new Style({
            fill: new Fill({
              color: _fillColor
            }),
            stroke: new Stroke({
              color: 'blue',
              width: 1
            })
          })
        });
        ///繪製完成後的事件觸發
        if (drawStartEvent) {
          this.draw_forbid_regions_interaction.on('drawstart', drawStartEvent)
        }
        this.draw_forbid_regions_interaction.on('drawend', (event) => {

          this.saveTempMapData();
          setTimeout(() => {

            var currnetForbidRegionCount = _isForbidRegion ? that.GetForbidRegionCount() : that.GetPassibleRegionCount();

            var _textBgColor = _isForbidRegion ? 'orange' : 'rgb(139, 171, 206)';
            var _name = _isForbidRegion ? `禁制區-${currnetForbidRegionCount + 1}` : `通行區-${currnetForbidRegionCount + 1}`;
            if (speficName)
              _name = speficName;

            const feature = event.feature; // 獲取繪製的多邊形要素
            feature.set('type', 'polygon')
            feature.set('name', _name)
            feature.set('region_type', region_type)
            if (speficName) {
              feature.set('redraw', true)
              //從舊數據拷貝數據
              var regionData = new MapRegion(_name, [])
              _.merge(regionData, this.tempHiddenFeaturesOfRegion.find(ft => ft.get('name') == _name && ft.get('type') == 'polygon').get('data'));
              regionData.PolygonCoordinations = feature.getGeometry().getCoordinates();
              feature.set('data', regionData);
            }
            const center = feature.getGeometry().getInteriorPoint().getCoordinates();
            console.info(center)
            feature.setStyle(new Style({
              fill: new Fill({
                color: _fillColor
              }),
              stroke: new Stroke({
                color: _strokeColor,
                width: 1 // 邊框寬度,
              })
            }));

            // 新增文字要素
            const textFeature = new Feature({
              geometry: new Point(center), // 文字的位置為多邊形中心點
            });
            textFeature.set('type', 'text')
            textFeature.set('name', _name)
            textFeature.set('region_type', region_type)
            if (speficName)
              textFeature.set('redraw', true)
            // 定義文字樣式
            textFeature.setStyle(new Style({
              text: new Text({
                text: _name,
                scale: 1.1,
                font: 'bold 22px Arial',
                fill: new Fill({
                  color: 'white'
                }),
                backgroundFill: new Fill({
                  color: _textBgColor
                }),
                padding: [5, 5, 5, 5]

              })
            }));
            that.RegionLayer.getSource().addFeature(textFeature);
            that.isRedrawConfirmable = true;

          }, 100);
        })
        this.map.addInteraction(this.draw_forbid_regions_interaction);
      }
    },
    AddRemoveForbidRegionInteraction() {
      this.RemoveInteraction(this.delete_forbid_regions_interaction);
      this.RemoveInteraction(this.draw_global_path_regions_interaction);
      var _forbidRegion_source = this.RegionLayer.getSource();
      this.delete_forbid_regions_interaction = new Pointer({
        handleDownEvent: function (event) {
          var _map = event.map;
          var feature = _map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });

          if (!feature || feature.get('type') != 'polygon')
            return;

          // this.saveTempMapData();

          var _forbidRegionName = feature.get('name');
          _forbidRegion_source.removeFeature(feature);
          var _textFeature = _forbidRegion_source.getFeatures().find(f => f.get('name') == _forbidRegionName);
          _forbidRegion_source.removeFeature(_textFeature);
          //alert(_forbidRegionName)
          ElNotification({
            title: '管制區修改',
            message: `管制區-${_forbidRegionName} 已刪除`,
            position: 'bottom-right',
            duration: 1000,
          })
        }
      })
      this.map.addInteraction(this.delete_forbid_regions_interaction)
    },

    AddEditForbidRegionInteraction() {
      this.RemoveInteraction(this.edit_forbid_regions_interaction);
      this.RemoveInteraction(this.draw_global_path_regions_interaction);
      var _forbid_region_editor = this.$refs['forbid_region_editor'];
      var _remove_keyboard_press_event_listner = this.RemoveKeyboardPressEventListener;
      let _this = this;
      this.edit_forbid_regions_interaction = new Pointer({
        handleDownEvent: function (event) {
          var _map = event.map;
          var feature = _map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });
          if (!feature || feature.get('type') != 'polygon')
            return;
          if (_this.showRedrawControl) //正在重繪區域 右鍵點擊顯示drawer禁止
            return;
          var _forbidRegionName = feature.get('name');

          let featuresInLayer = _this.RegionLayer.getSource().getFeatures();
          var textFeature = featuresInLayer.find(ft => ft.get('name') == _forbidRegionName && ft.get('type') == 'text')
          var ploygonFeature = featuresInLayer.find(ft => ft.get('name') == _forbidRegionName && ft.get('type') == 'polygon')

          _remove_keyboard_press_event_listner();
          var regionData = new MapRegion(_forbidRegionName, [])
          _.merge(regionData, ploygonFeature.get('data'));
          console.log(regionData);
          _forbid_region_editor.Show(regionData, textFeature, ploygonFeature);
        }
      })
      this.map.addInteraction(this.edit_forbid_regions_interaction)
    },
    RemoveAllInteractions() {
      if (this.draw_forbid_regions_interaction)
        this.map.removeInteraction(this.draw_forbid_regions_interaction);
      if (this.draw_global_path_regions_interaction)
        this.map.removeInteraction(this.draw_global_path_regions_interaction);
      if (this.delete_forbid_regions_interaction)
        this.map.removeInteraction(this.delete_forbid_regions_interaction);
      if (this.edit_forbid_regions_interaction)
        this.map.removeInteraction(this.edit_forbid_regions_interaction);
      if (this.mapEditsInteraction)
        this.map.removeInteraction(this.mapEditsInteraction);
    },
    /**移除指定的滑鼠事件 */
    RemoveInteraction(interaction) {
      if (interaction)
        this.map.removeInteraction(interaction);
    },
    RemoveKeyboardPressEventListener() {
      document.removeEventListener('keydown', this.EditModeKeybordEvents)
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
            image: new CircleStyle({
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
      this.settings.zoom = this.zoom;
      this.settings.zoom_route = this.zoom_route;
      this.settings.mode = this.map_display_mode;
      this.settings.center = this.center;
      this.settings.center_route = this.center_route;
      this.settings.station_name_display_mode = this.station_name_display_mode;
      this.settings.map_image_display = this.map_image_display;
      this.settings.legendShow = this.legendShow;
      this.settings.dragActionLock = this.dragActionLock;
      this.settings.vehicleBatStatus = this.vehicleBatVisible;
      this.settings.rackStatusDisplay = this.rackVisible;
      localStorage.setItem(this.map_name_with_url, JSON.stringify(this.settings))
    },
    RestoreSettingsFromLocalStorage() {
      var settings_json = localStorage.getItem(this.map_name_with_url)
      if (settings_json) {
        this.settings = new MapLocalStorage();
        _.merge(this.settings, JSON.parse(settings_json));
        this.station_name_display_mode = this.settings.station_name_display_mode
        this.map_image_display = this.settings.map_image_display
        this.map_display_mode = this.editable ? 'coordination' : this.settings.mode
        this.zoom = this.settings.zoom;
        this.legendShow = this.settings.legendShow;
        this.map.getView().setCenter(this.settings.center);
        this.map.getView().setZoom(this.settings.zoom);
        this.ImageLayer.setVisible(this.map_image_display == 'visible')

        if (this.editable)
          this.dragActionLock = true;
        else {
          if (this.IsOpUsing) {
            this.dragActionLock = false;
          } else {
            this.dragActionLock = this.settings.dragActionLock;
          }
        }
        this.setDragPanEnabled(this.dragActionLock)
        this.vehicleBatVisible = this.settings.vehicleBatStatus;
        this.rackVisible = this.settings.rackStatusDisplay;

      }
    },

    /**移除一個站點，並會把相關的路徑移除 */
    RemoveStation(feature = new Feature()) {

      this.saveTempMapData();

      var RemoveFeatureFromSource = function (source, _ptIndex) {
        var _feature = source.getFeatures().find(f => f.get('index') == _ptIndex)
        source.removeFeature(_feature)

      }
      var RemovePath = function (soure, path_data_reference, _feature) {
        var ptIndex = _feature.get('index')
        var paths_to_remove = path_data_reference.filter(path => path.StartPtIndex == ptIndex || path.EndPtIndex == ptIndex);
        paths_to_remove.forEach(path => {
          var path_id = path.PathID;
          var feature_to_remove = soure.getFeatures().find(ft => ft.get('path_id') == path_id);
          soure.removeFeature(feature_to_remove);
          var index = path_data_reference.indexOf(path);
          if (index != -1) {
            path_data_reference.splice(index, 1);
          }
        })
      }
      var ptIndex = feature.get('index')
      RemoveFeatureFromSource(this.PointLayer.getSource(), ptIndex);
      RemoveFeatureFromSource(this.PointRouteLayer.getSource(), ptIndex);

      RemovePath(this.PointLayer.getSource(), this.PathesSegmentsForEdit, feature);
      let pathesFeatures = this.UpdateStationPathLayer();
    },
    /**新增一個feature至點位圖層 */
    AddFeatureToMapLayers(feature) {
      this.saveTempMapData();
      this.PointLayer.getSource().addFeature(feature)
      this.PointRouteLayer.getSource().addFeature(feature)
      var ptStation = new clsMapStation()
      ptStation.index = ptStation.name = feature.get('index')
      ptStation.tag = feature.get('tag')
      ptStation.station_type = feature.get('station_type')
      ptStation.targets = feature.get('targets')
      ptStation.coordination = feature.get('coordination')
      ptStation.graph = feature.get('graph')
      ptStation.data = feature.get('data')
      this._map_stations.push(ptStation);
    },
    /** bi_direction_remove => 自動將雙向路徑移除 */
    RemovePath(path_feature, bi_direction_remove = false) {

      var removed_path = []
      var pathID = path_feature.get('path_id')
      var pathIDSplited = pathID.split('_')
      var startPtIndex = parseInt(pathIDSplited[0])
      var endPtIndex = parseInt(pathIDSplited[1])
      var startFeature = this.PointLayer.getSource().getFeatures().find(ft => ft.get('index') == startPtIndex)
      var mapPointModel = startFeature.get('data')
      delete mapPointModel.Target[endPtIndex]
      var mapPointModel = startFeature.set('data', mapPointModel)
      this.PathLayerForCoordination.getSource().removeFeature(path_feature);
      var path = this.PathesSegmentsForEdit.find(path => path.PathID == pathID);
      if (path) {
        var index = this.PathesSegmentsForEdit.indexOf(path);
        if (index != -1) {
          this.saveTempMapData();
          this.PathesSegmentsForEdit.splice(index, 1);
          this.UpdateStationPathLayer();

          removed_path.push(path);
        }

        if (bi_direction_remove) {
          var _reverse_path_id = `${endPtIndex}_${startPtIndex}`;
          var _reverd_path_feature = this.PathLayerForCoordination.getSource().getFeatures().find(ft => ft.get('path_id') == _reverse_path_id);
          if (_reverd_path_feature) {
            var _removed_pathes = this.RemovePath(_reverd_path_feature, false);


            _removed_pathes.forEach(p => {
              removed_path.push(p);
            })
          }
        }
      }

      return removed_path;
      //this.PointLinksLayer.getSource().removeFeature(path_feature)
    },
    InsertPointAtPathes(removePathFeature, new_pt_coordinate) {

      var new_pt_feature = CreateNewStationPointFeature(new_pt_coordinate, this.GenNewIndexOfStation());
      //新增點位而且新增的位置是在既有的路徑線段上
      var _removedPathes = this.RemovePath(removePathFeature, true); //移除現有路徑
      this.AddFeatureToMapLayers(new_pt_feature)
      //產生多組路徑
      var stationFeatures = this.map_display_mode == 'router' ? this.PointRouteLayer.getSource().getFeatures() : this.PointLayer.getSource().getFeatures();
      _removedPathes.forEach(path => {
        if (path && path.StartPtIndex && path.EndPtIndex) {
          var _startPtFeature1 = stationFeatures.find(ft => ft.get('index') == path.StartPtIndex);
          var _endPtFeature1 = new_pt_feature
          var _startPtFeature2 = new_pt_feature;
          var _endPtFeature2 = stationFeatures.find(ft => ft.get('index') == path.EndPtIndex);
          this.GenPath([_startPtFeature1, _endPtFeature1])
          this.GenPath([_startPtFeature2, _endPtFeature2])
        }
      })
      var ratio_from_start = this.CalculateNewPointRatioOfPathStart(_removedPathes[0], new_pt_feature);
      //alert(ratio_from_start)
      //this.ResetNewPointCoordination(ratio_from_start, new_pt_feature);
    },
    CalculateNewPointRatioOfPathStart(_path, new_pt_feature) {
      if (!_path)
        return;
      var stationFeatures = this.map_display_mode == 'router' ? this.PointRouteLayer.getSource().getFeatures() : this.PointLayer.getSource().getFeatures();
      //計算新增的點其位置在路徑上的比例
      var _startPt = stationFeatures.find(ft => ft.get('index') == _path.StartPtIndex)
      var _endPt = stationFeatures.find(ft => ft.get('index') == _path.EndPtIndex)

      var _start_coordination = _startPt.getGeometry().getCoordinates();
      var _end_coordination = _endPt.getGeometry().getCoordinates();
      var _new_coordination = new_pt_feature.getGeometry().getCoordinates();

      var totalDistance = Math.sqrt(Math.pow(_start_coordination[0] - _end_coordination[0], 2) + Math.pow(_start_coordination[1] - _end_coordination[1], 2));
      var distanceFromStart = Math.sqrt(Math.pow(_start_coordination[0] - _new_coordination[0], 2) + Math.pow(_start_coordination[1] - _new_coordination[1], 2));
      var _ratio = distanceFromStart / totalDistance;


      return _ratio;
    },
    ResetNewPointCoordination(ratio, new_pt_feature) {
      var stationFeaturesOfRouteMode = this.PointRouteLayer.getSource().getFeatures();
      var stationFeaturesOfCoordinationMode = this.PointLayer.getSource().getFeatures();

      var pt_index = new_pt_feature.get('index');

      // var _start_from = stationFeaturesOfRouteMode.find(ft => ft.get('targets').includes(pt_index));
      // var _end_to = stationFeaturesOfRouteMode.find(ft => ft.get('index') == new_pt_feature.get('targets')[0]);

      // var _start_coord = _start_from.getGeometry().getCoordinates();
      // var _end_coord = _end_to.getGeometry().getCoordinates();

      // var newX = _start_coord[0] + (_end_coord[0] - _start_coord[0]) * ratio
      // var newY = _start_coord[1] + (_end_coord[1] - _start_coord[1]) * ratio



      var _start_from = stationFeaturesOfCoordinationMode.find(ft => ft.get('targets').includes(pt_index));
      var _end_to = stationFeaturesOfCoordinationMode.find(ft => ft.get('index') == new_pt_feature.get('targets')[0]);

      var _start_coord = _start_from.getGeometry().getCoordinates();
      var _end_coord = _end_to.getGeometry().getCoordinates();

      var newX = _start_coord[0] + (_end_coord[0] - _start_coord[0]) * ratio
      var newY = _start_coord[1] + (_end_coord[1] - _start_coord[1]) * ratio

      //更新slam模式的新座標位置
      var feature_ = stationFeaturesOfCoordinationMode.find(pt => pt.get('index') == pt_index)
      var oriData = feature_.get('data')
      var newCoordinates = [newX, newY];
      oriData.X = newCoordinates[0];
      oriData.Y = newCoordinates[1];
      feature_.set('data', oriData)
      // alert(JSON.stringify([newX, newY]))



      this.ResetPathLinkOfRouteMode(pt_index);
      this.ResetPathLinkOfCoordinationMode(pt_index);

    },
    ResetPathLinkOfCoordinationMode(pt_index, remove = false) {
      var feature = this.PointLayer.getSource().getFeatures().find(f => f.get('index') == pt_index);
      var path_features = this.PathLayerForCoordination.getSource().getFeatures();
      try {
        //起點是自己
        var pathes = path_features.filter(path_feat => path_feat.get('start_pt_index') == pt_index);
        for (var i = 0; i < pathes.length; i++) {
          var path_featureFound = pathes[i];
          var path_id = path_featureFound.get('path_id')
          var path_seq_data = this.PathesSegmentsForEdit.find(path => path.PathID == path_id);
          if (path_featureFound) {
            if (remove) {
              source.removeFeature(path_featureFound);
              this.PathesSegmentsForEdit.remove(path_seq_data);
            }
            else {
              var ori_geo = path_featureFound.getGeometry()
              var ori_endCoord = ori_geo.getCoordinates()[1]
              var newStartCoordinates = feature.getGeometry().getCoordinates();
              var geometry = new LineString([newStartCoordinates, ori_endCoord])
              path_featureFound.setGeometry(geometry)
              path_featureFound.setStyle(CreateStationPathStyles(path_featureFound))
              path_seq_data.StartCoordination = newStartCoordinates;
            }
          }
        }
      } catch (error) {
      }
      try {
        //終點是自己
        var pathes = path_features.filter(feat => feat.get('end_pt_index') == pt_index)
        for (var i = 0; i < pathes.length; i++) {
          var path_feature = pathes[i]
          var pathSeqmentData = this.PathesSegmentsForEdit.find(path => path.PathID == path_feature.get('path_id'));
          if (remove) {
            source.removeFeature(path_feature)
            this.PathesSegmentsForEdit.remove(pathSeqmentData);
          }
          else {
            var ori_geo = path_feature.getGeometry()
            var ori_startCoord = ori_geo.getCoordinates()[0]
            var newEndCoordinates = feature.getGeometry().getCoordinates();
            var geometry = new LineString([ori_startCoord, newEndCoordinates])
            path_feature.setGeometry(geometry)
            path_feature.setStyle(CreateStationPathStyles(path_feature))
            pathSeqmentData.EndCoordination = newEndCoordinates;

          }
        }
      } catch (error) {

      }
    },
    ResetPathLinkOfRouteMode(pt_index, remove = false) {
      var feature = this.PointRouteLayer.getSource().getFeatures().find(f => f.get('index') == pt_index);
      var path_features = this.PathLayerForRouter.getSource().getFeatures();
      try {
        //起點是自己
        var pathes = path_features.filter(path_feat => path_feat.get('start_pt_index') == pt_index);
        for (var i = 0; i < pathes.length; i++) {
          var path_featureFound = pathes[i];
          var path_id = path_featureFound.get('path_id')
          var path_seq_data = this.PathesSegmentsForEdit.find(path => path.PathID == path_id);
          if (path_featureFound) {
            if (remove) {
              source.removeFeature(path_featureFound);
              this.PathesSegmentsForEdit.remove(path_seq_data);
            }
            else {
              var ori_geo = path_featureFound.getGeometry()
              var ori_endCoord = ori_geo.getCoordinates()[1]
              var newStartCoordinates = feature.getGeometry().getCoordinates();
              var geometry = new LineString([newStartCoordinates, ori_endCoord])
              path_featureFound.setGeometry(geometry)
              path_featureFound.setStyle(CreateStationPathStyles(path_featureFound))
              //path_seq_data.StartCoordination = newStartCoordinates;
            }
          }
        }
      } catch (error) {
      }
      try {
        //終點是自己
        var pathes = path_features.filter(feat => feat.get('end_pt_index') == pt_index)
        for (var i = 0; i < pathes.length; i++) {
          var path_feature = pathes[i]
          var pathSeqmentData = this.PathesSegmentsForEdit.find(path => path.PathID == path_feature.get('path_id'));
          if (remove) {
            source.removeFeature(path_feature)
            this.PathesSegmentsForEdit.remove(pathSeqmentData);
          }
          else {
            var ori_geo = path_feature.getGeometry()
            var ori_startCoord = ori_geo.getCoordinates()[0]
            var newEndCoordinates = feature.getGeometry().getCoordinates();
            var geometry = new LineString([ori_startCoord, newEndCoordinates])
            path_feature.setGeometry(geometry)
            path_feature.setStyle(CreateStationPathStyles(path_feature))
          }
        }
      } catch (error) {

      }
    },
    ResetPathLink(path_layer, pt_index, remove = false) {
      var source = path_layer.getSource();
      var path_features = source.getFeatures();
      var feature = path_features.find(ft => ft.get('index') == pt_index)
      try {
        //起點是自己
        var pathes = path_features.filter(path_feat => path_feat.get('start_pt_index') == pt_index)
        pathes.forEach(path_featureFound => {
          var path_id = path_featureFound.get('path_id')
          var path_seq_data = this.PathesSegmentsForEdit.find(path => path.PathID == path_id);
          if (path_featureFound) {
            if (remove) {
              source.removeFeature(path_featureFound)
              this.PathesSegmentsForEdit.remove(path_seq_data);
            } else {
              var ori_geo = path_featureFound.getGeometry()
              var ori_endCoord = ori_geo.getCoordinates()[1]
              var newStartCoordinates = feature.getGeometry().getCoordinates();
              var geometry = new LineString([newStartCoordinates, ori_endCoord])
              path_featureFound.setGeometry(geometry)
              path_featureFound.setStyle(CreateStationPathStyles(path_featureFound))
              path_seq_data.StartCoordination = newStartCoordinates;
            }
          }
        })

      } catch (error) {
      }

      try {
        //終點是自己
        var lineStrings = path_features.filter(feat => feat.get('end_pt_index') == pt_index)
        lineStrings.forEach(path_feature => {
          var pathSeqmentData = this.PathesSegmentsForEdit.find(path => path.PathID == path_feature.get('path_id'));
          if (remove) {
            source.removeFeature(path_feature)
            this.PathesSegmentsForEdit.remove(pathSeqmentData);
          }
          else {
            var ori_geo = path_feature.getGeometry()
            var ori_startCoord = ori_geo.getCoordinates()[0]
            var newEndCoordinates = feature.getGeometry().getCoordinates();
            var geometry = new LineString([ori_startCoord, newEndCoordinates])
            path_feature.setGeometry(geometry)
            path_feature.setStyle(CreateStationPathStyles(path_feature))
            pathSeqmentData.EndCoordination = newEndCoordinates;
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


        this.saveTempMapData();
        this.GenPath(this.PathEditTempStore);

        if (this.EditorOption.AddPathMode.Direction == 'bi-direction') {
          var reverse = [this.PathEditTempStore[1], this.PathEditTempStore[0]]
          this.GenPath(reverse);
        }
      }
    },
    GenPath(start_end_features = []) {
      var startPointFeature = start_end_features[0];
      var endPointFeature = start_end_features[1];
      var startPtIndex = startPointFeature.get('index');
      var endPtIndex = endPointFeature.get('index');
      var startPtTagX = startPointFeature.get('data').X;
      var startPtTagY = startPointFeature.get('data').Y;

      var endPtTagX = endPointFeature.get('data').X;
      var endPtTagY = endPointFeature.get('data').Y;

      var startPointCoordinate = startPointFeature.getGeometry().getCoordinates();
      var endPointCoordinate = endPointFeature.getGeometry().getCoordinates();
      var midPoint = [(startPointCoordinate[0] + endPointCoordinate[0]) / 2, (startPointCoordinate[1] + endPointCoordinate[1]) / 2]
      var mindfeature = CreateNewStationPointFeature(midPoint, this.GenNewIndexOfStation());
      //this.PointLayer.getSource().addFeature(mindfeature)
      var isEqLink = endPointFeature.get('station_type') != 0 || startPointFeature.get('station_type') != 0;
      var path_id = `${startPtIndex}_${endPtIndex}`

      if (this.PathLayerForCoordination.getSource().getFeatures().find(f => f.get('path_id') == path_id))
        return;

      var New_MapPath_V2 = {
        PathID: path_id,
        StartPtIndex: startPtIndex,
        EndPtIndex: endPtIndex,
        StartCoordination: [startPtTagX, startPtTagY],
        EndCoordination: [endPtTagX, endPtTagY],
        IsEQLink: isEqLink,
        IsSingleCar: false,
        IsPassable: true,
        IsExtinguishingPath: false,
        Speed: 1,
        LsrMode: 0,
        DodgeMode: 0,
        SpinMode: 0,
      }
      this.PathesSegmentsForEdit.push(New_MapPath_V2);

      var oritargets = startPointFeature.get('targets');
      if (!oritargets)
        oritargets = []
      var startPtMapData = startPointFeature.get('data')
      startPtMapData.Target[endPtIndex] = 1//
      startPointFeature.set('data', startPtMapData)
      oritargets.push(endPtIndex)
      startPointFeature.set('targets', oritargets)

      this.UpdateStationPathLayer();
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
      this.SaveSettingsToLocalStorage();
    },
    MapDisplayModeOptHandler(setViewCenter = true) {

      var isShowSlamCoordi = this.map_display_mode == "coordination";
      this.UpdateStationPathLayer()
      this.StationNameDisplayOptHandler();
      this.PointLayer.setVisible(isShowSlamCoordi);
      this.PointRouteLayer.setVisible(!isShowSlamCoordi);
      this.PathLayerForCoordination.setVisible(isShowSlamCoordi);
      this.PathLayerForRouter.setVisible(!isShowSlamCoordi);
      this.RegionLayer.setVisible(isShowSlamCoordi && this.regionsVisible);

      this.UpdateEQLDULDFeature();
      this.UpdateAGVLocLocation();

      if (setViewCenter)
        this.map.getView().setCenter(isShowSlamCoordi ? this.GetMidPointOfCoordinationMode() : this.GetMidPointOfRouterMode());
    },
    UpdateAGVLocLocation() {

      this.agvs_info.AGVDisplays.forEach(agv_information => {
        this.UpdateAGVLocByMapMode(this.map_display_mode, agv_information);
      })
    },
    GetMidPointOfRouterMode() {
      var map_stations_copy = [...this._map_stations]
      map_stations_copy.sort((a, b) => a.graph[0] - b.graph[0]);
      var first = map_stations_copy[0]
      var last = map_stations_copy[map_stations_copy.length - 1]
      var mid_x = (last.graph[0] + first.graph[0]) / 2

      map_stations_copy.sort((a, b) => a.graph[1] - b.graph[1]);
      first = map_stations_copy[0]
      last = map_stations_copy[map_stations_copy.length - 1]
      var mid_y = (last.graph[1] + first.graph[1]) / 2
      return [mid_x, mid_y]
    },
    GetMidPointOfCoordinationMode() {
      var map_stations_copy = [...this._map_stations]
      map_stations_copy.sort((a, b) => a.coordination[0] - b.coordination[0]);
      var first = map_stations_copy[0]
      var last = map_stations_copy[map_stations_copy.length - 1]
      var mid_x = (last.coordination[0] + first.coordination[0]) / 2

      map_stations_copy.sort((a, b) => a.coordination[1] - b.coordination[1]);
      first = map_stations_copy[0]
      last = map_stations_copy[map_stations_copy.length - 1]
      var mid_y = (last.coordination[1] + first.coordination[1]) / 2
      console.log(mid_x, mid_y)
      return [mid_x, mid_y]
    },
    StationNameDisplayOptHandler() {
      this.SetDisplayString(this.station_name_display_mode);
      // this.StationPointsFeatures.forEach(ft => {
      //   var index = ft.get('index');
      //   var mapdata = ft.get('data')
      //   var displayName = ''
      //   if (this.station_name_display_mode == 'index')
      //     displayName = index + '';
      //   if (this.station_name_display_mode == 'name')
      //     displayName = mapdata.Graph.Display;
      //   if (this.station_name_display_mode == 'tag')
      //     displayName = mapdata.TagNumber + '';
      //   var station_type = mapdata.StationType;
      //   ft.setStyle(GetStationStyle(displayName, station_type, mapdata));
      // })
      this.SaveSettingsToLocalStorage();
    },
    ToggleLocus(id) {
      if (this.AGVLocusLayer.getSource().getFeatures().find(f => f.get('id') == id)) {
        this.HideLocus(id);
      } else {
        this.ShowLocus(id);
      }
    },
    /**顯示軌跡 */
    ShowLocus(coordinate_list = [], color = 'red', width = 1, marker_color = 'red', id = '') {
      //Hide AGV layer while showing locus
      this.AGVLocLayer.setVisible(false);
      var source = this.AGVLocusLayer.getSource()
      if (source) {
        var features = []
        //創建起終點圖標
        let iconFeature_end = CreateLocIcon(coordinate_list[coordinate_list.length - 1], false, '', marker_color);
        iconFeature_end.set('id', id)
        //features.push(iconFeature_start);
        //創建軌跡 LineString
        let lineFeature = new Feature(
          {
            geometry: new LineString(coordinate_list),
          },
        );
        lineFeature.set('id', id)
        lineFeature.setStyle(CreateLocusPathStyles(color, width))
        lineFeature.set('oriGeometry', lineFeature.getGeometry())
        iconFeature_end.set('oriGeometry', iconFeature_end.getGeometry())
        features.push(lineFeature)
        features.push(iconFeature_end);

        source.addFeatures(features)
      }
    },
    HideLocusByID(id) {
      var source = this.AGVLocusLayer.getSource()
      var features = source.getFeatures()
      var feature = features.filter(f => f.get('id') == id)
      feature.forEach(f => {
        f.setGeometry(null)
      })
    },
    ShowLocusByID(id) {
      var source = this.AGVLocusLayer.getSource()
      var features = source.getFeatures()
      var feature = features.filter(f => f.get('id') == id)
      feature.forEach(f => {
        f.setGeometry(f.get('oriGeometry'))
      })
    },
    ClearLocus() {
      this.AGVLocusLayer.getSource().clear();
    },
    HiddenAgvLayer() {
      this.AGVLocLayer.setVisible(false);
    },
    ShowAgvLayer() {
      this.AGVLocLayer.setVisible(true);
    },
    /**儲存按鈕處理 */
    async HandlerSaveBtnClick() {
      //如果有任務在運行中須詢問
      if (TaskStore.state.IncompletedTaskListData.find(task => task.State == 1)) {
        const result = await this.$swal.fire({
          title: '圖資修改警告',
          text: '有任務正在運行中，變更地圖可能會造成不可預期的錯誤，確定要繼續嗎？',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          customClass: 'my-sweetalert'
        });

        if (!result.isConfirmed) {
          return; // 如果用戶取消，則中止儲存操作
        }
      }
      //檢查是否正重繪區域且可按下完成的狀態,若是則自動按下完成，並將settig drawwer 關閉
      if (this.showRedrawControl) {

        if (this.isRedrawConfirmable) {
          //先詢問是否要儲存
          const result = await this.$swal.fire({
            title: '提示',
            text: '正在重繪管制區域且尚未儲存，是否要儲存當前重繪結果?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            customClass: 'my-sweetalert'
          });
          if (result.isConfirmed) {
            this.HandleCompleteRegionRedraw();
          } else {
            //取消重繪
            this.HandleCancleRegionRedraw();
          }
        } else {
          this.HandleCancleRegionRedraw();
        }

      }

      const _forbid_region_editor = this.$refs['forbid_region_editor'];
      _forbid_region_editor.Hide();
      this.$emit('save', this._GetMapDataCurrent())
      this.SelectedFeatures = [];
    },
    saveTempMapData() {
      var _data = JSON.parse(JSON.stringify(this._GetMapDataCurrent()));
      this.$emit('tempSave', _data)
    },
    _GetMapDataCurrent() {
      var Points = {}
      this.PointLayer.getSource().getFeatures().forEach(ft => {
        var index = ft.get('index')
        var data = ft.get('data')
        Points[index] = data;
      })
      var mapDataSave = {
        Points: Points,
        Pathes: this.PathesSegmentsForEdit,
        Regions: this.GetRegionsDataFromLayer(),
        ImageFile: this.to_upload_image_file,
        ImageExtent: this.new_map_img_extent
      }
      return mapDataSave;
    },
    HandlePtSettingBtnClick() {
      if (this.isCtrlPressing || this.SelectedFeatures.length > 0)
        return;
      this.RemoveKeyboardPressEventListener();
      this.editModeContextMenuVisible = false;
      this.$refs.ptsetting.Show({
        index: this.previousSelectedFeature.get('index'),
        point: this.previousSelectedFeature.get('data')
      })
    },
    ReloadMap(confirm = true) {
      var reload = async () => {
        this.loading = confirm;
        this.map_img_url_for_editor = null;
        await MapStore.dispatch('DownloadMapData', '');
        console.log('re-done');
        this.RefreshMap();
        this.loading = false;
      }
      if (confirm) {
        this.$swal.fire(
          {
            title: '確定要重新載入圖資?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            customClass: 'my-sweetalert'
          }).then(async (res) => {
            if (res.isConfirmed) {
              // reload()
              location.reload();
            }
          })
      }
      else {
        reload();
      }
    },
    DeepClonePathSegmentData(source = undefined) {
      if (source) {
        this.PathesSegmentsForEdit = source
      } else {
        this.PathesSegmentsForEdit = JSON.parse(JSON.stringify(this.PathesSegments))
      }
    },
    //TODO 地圖初始化
    InitMap() {
      this.map_image_display = MapStore.getters.DefaultShowBackgroundImage ? 'visible' : '';
      const rotation = MapStore.getters.Rotation;
      this.new_map_img_extent = this.map_img_extent
      const extent = this.map_img_extent;
      const projection = new Projection({
        code: 'xkcd-image',
        units: 'pixels',
        extent: extent,
      });
      this.map_name = MapStore.getters.MapName
      this.ImageLayer = new ImageLayer({
        source: new Static({
          url: this.map_image_url,
          projection: projection,
          imageExtent: extent,
          imageSize: this.map_img_size,

        }),
        visible: this.map_image_display == 'visible'
      })

      this.AGVLocusLayer = new VectorLayer({
        source: new VectorSource({ features: [] }),
      })
      this.map = new Map({
        layers: [this.ImageLayer, this.RegionLayer, this.EQMaintainIconLayer, this.TransferTaskIconLayer, this.EQLDULDStatusLayer, this.PathLayerForCoordination, this.PathLayerForRouter, this.PointLayer, this.PointRouteLayer, this.AGVLocLayer, this.AGVLocusLayer, this.TrafficStateLayer],
        target: this.id,
        renderer: 'canvas',
        view: new View({
          projection: projection,
          center: [0, 0],
          zoom: 1,
          maxZoom: 20,
          rotation: rotation * Math.PI / 180.0,
          animation: false,
          duration: 0,
          smoothResolutionConstraint: false,
          smoothExtentConstraint: false,
          showFullExtent: true

        })
      })

      this.AGVLocLayer.setVisible(this.agv_show);
      if (this.editable) {
        this.PointLayer.setVisible(false);
        this.PathLayerForCoordination.setVisible(false);
        this.PointRouteLayer.setVisible(true);
        this.PathLayerForRouter.setVisible(true);
      } else {
        // this.PathLayerForCoordination.setVisible(this.map_display_mode == 'coordination');
        // this.PathLayerForRouter.setVisible(this.map_display_mode == 'router');
      }
      this.EQLDULDStatusLayer.setVisible(!this.editable)
      this.InitMapEventHandler();
      this.initGrid(this.map, this.MapGridSize, extent)

      if (this.IsOpUsing) {
        this.HideGridLayer();
      }

      if (this.editable) {
        this.agv_display = 'hide'
      }
      // this.map.addControl(new ZoomSlider());
      //this.AddDrawBoxInteraction();
    },
    UpdateTrafficStateLayer(traffic_state_data_features = []) {
      this.TrafficStateLayer.getSource().clear();
      this.TrafficStateLayer.getSource().addFeatures(traffic_state_data_features);
    },
    ResetImageExtend(newExtent) {

      var _static = new Static({
        // url: 'Map.png',
        url: this.map_image_url,
        projection: new Projection({
          code: 'xkcd-image',
          units: 'pixels',
          extent: newExtent,
        }),
        imageExtent: newExtent,
        imageSize: this.map_img_size,

      })
      this.ImageLayer.setSource(_static)
    },
    ResetImage(_url) {
      var _static = new Static({
        // url: 'Map.png',
        url: _url,
        projection: new Projection({
          code: 'xkcd-image',
          units: 'pixels',
          extent: this.map_img_extent,
        }),
        imageExtent: this.map_img_extent,
        imageSize: this.map_img_size,

      })
      this.ImageLayer.setSource(_static)
    },
    initGrid(_map, grid_size, _extent = [-25, -25, 15, 15], offsetX = -2, offsetY = 0) {
      const extent = _extent.map(val => val * 10);
      const interval = grid_size; // 間隔:單位公尺
      const vectorSource = new VectorSource();
      for (let x = extent[0]; x <= extent[2]; x += interval) {
        const lineFeature = new Feature(new LineString([[x + offsetX, extent[1] + offsetY], [x + offsetX, extent[3] + offsetY]]));
        lineFeature.set("grid_line", true)
        vectorSource.addFeature(lineFeature);
      }
      for (let y = extent[1]; y <= extent[3]; y += interval) {
        const lineFeature = new Feature(new LineString([[extent[0] + offsetX, y + offsetY], [extent[2] + offsetX, y + offsetY]]));
        lineFeature.set("grid_line", true)
        vectorSource.addFeature(lineFeature);
      }

      this.gridLayer = new VectorLayer({
        source: vectorSource,
        name: 'gridLayer',
        style: new Style({
          stroke: new Stroke({
            color: 'rgb(197, 206, 255)',
            width: 1
          })
        })
      });

      _map.addLayer(this.gridLayer);

    },
    GetForbidRegionCount() {
      var _features = this.RegionLayer.getSource().getFeatures()
      var _polygons = _features.filter(f => f.get('type') == 'polygon' && f.get('region_type') == 'forbid')
      return _polygons.length;
    },

    GetPassibleRegionCount() {
      var _features = this.RegionLayer.getSource().getFeatures()
      var _polygons = _features.filter(f => f.get('type') == 'polygon' && f.get('region_type') == 'passible')
      return _polygons.length;
    },

    GetGlobalPathRegionCount() {
      var _features = this.RegionLayer.getSource().getFeatures()
      var _polygons = _features.filter(f => f.get('type') == 'polygon' && f.get('region_type') == 'path')
      return _polygons.length;
    },
    GetRegionsDataFromLayer() {//TODO GetRegionsDataFromLayer
      let output = [];
      var _features = this.RegionLayer.getSource().getFeatures()

      var _polygons = _features.filter(f => f.get('type') == 'polygon')

      _polygons.forEach(polygon_feature => {
        var _name = polygon_feature.get('name')
        var _regionType = polygon_feature.get('region_type')
        let _regionData = new MapRegion("", [], -1);
        Object.assign(_regionData, polygon_feature.get('data'))
        var flatCoordinates = polygon_feature.getGeometry().flatCoordinates;

        function createPolygons(coordinates) {
          const polygons = [];
          let currentPolygon = [];
          for (let i = 0; i < coordinates.length; i++) {
            currentPolygon.push(coordinates[i]);
            if (i % 2 === 1) {
              // 當經過每一個頂點時，將當前多邊形的頂點數組存入多邊形陣列
              polygons.push(currentPolygon);
              currentPolygon = [];
            }
          }
          return polygons;
        }
        let coordinate_list = createPolygons(flatCoordinates);
        _regionData.Name = _name ? _name : `禁制區-${GetForbidRegionCount() + 1}`;
        _regionData.PolygonCoordinations = coordinate_list;
        _regionData.RegionType = _regionType == 'forbid' ? 0 : 1;
        output.push(_regionData)
      })
      console.log(output)
      return output;
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
    ClearSelectedFeature(useForSearchResult = false) {
      if (this.editable && !useForSearchResult)
        return;

      try {
        this.previousSelectedFeatures.forEach(feature => {
          var oriStyle = feature.get('oriStyle')
          feature.setStyle(oriStyle);
        })
        var oriStyle = this.previousSelectedFeature.get('oriStyle')
        this.previousSelectedFeature.setStyle(oriStyle);
      } catch {

      }
      this.previousSelectedFeatures = []
    },
    HighLightFeatureSelected(features = [new Feature()], color = 'red', useForSearchResult = false) {
      var _workStationTextFontSize = MapStore.state.MapData.Options.workStationTextFontSize;

      features.forEach(_ft => {
        try {
          var style = _ft.getStyle().clone();
          if (style) {
            var text = style.getText().clone();
            if (text) {
              text.setBackgroundFill(new Fill({
                color: color
              }))
              text.setFill(new Fill({ color: 'white' }))
              text.setPadding([5, 5, 5, 5]);

              if (useForSearchResult) {
                text.setOffsetY(-20);
                text.setFont(`bold ${_workStationTextFontSize}px Calibri,sans-serif`);
              } else {
                text.setOffsetX(0);
                text.setOffsetY(0);
                text.setFont(`bold ${_workStationTextFontSize}px Calibri,sans-serif`);
              }
              style.setText(text); // 更新樣式
              _ft.setStyle(style); // 設定新的樣式
            }

          }
        }
        catch (error) {

        }

      });
    },
    RestoreStyleOfSelectedFeatures(features = [new Feature()]) {

      features.forEach(_ft => {
        try {
          var oriStyle = _ft.get('oriStyle');
          _ft.setStyle(oriStyle);
        } catch (error) {

        }
      });
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
      if (this.editable)
        return;
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
    HandlePtSettingDrawerLeaved() {
      this.RemoveKeyboardPressEventListener();
      document.addEventListener('keydown', this.EditModeKeybordEvents)
    },
    EditModeKeybordEvents(event) {
      var name = event.key.toLowerCase();

      if (this.selectedSettingTabIndex != 0 ||
        this.IsPathEditing ||
        this.EditorOption.EditMode != 'edit') {
        return
      }
      if (name == 'e') {
        this.EditorOption.EditMode = 'edit'
      } if (name == 'v') {
        this.EditorOption.EditMode = 'view'
      }

      if (name == 'escape') {

        if (this.draw_forbid_regions_interaction)
          this.draw_forbid_regions_interaction.abortDrawing();
        if (this.draw_global_path_regions_interaction)
          this.draw_global_path_regions_interaction.abortDrawing();

      }
      if (name == '1') {
        this.RemoveForbidRegionOperationInteractions();
        this.EditorOption.EditAction = 'add-station'
        this.AddEditMapInteraction();
      }
      if (name == '2') {
        this.RemoveForbidRegionOperationInteractions();
        this.EditorOption.EditAction = 'edit-station'
        this.AddEditMapInteraction();
      }
      if (name == '3') {
        this.RemoveForbidRegionOperationInteractions();
        this.EditorOption.EditAction = 'remove-station'
        this.AddEditMapInteraction();
      }
      if (name == '4') {
        this.RemoveForbidRegionOperationInteractions();
        this.EditorOption.EditAction = 'add-path'
        this.AddEditMapInteraction();
      }
      if (name == '5') {
        this.RemoveForbidRegionOperationInteractions();
        this.EditorOption.EditAction = 'edit-path'
        this.AddEditMapInteraction();
      }
      if (name == '6') {
        this.RemoveForbidRegionOperationInteractions();
        this.EditorOption.EditAction = 'remove-path'
        this.AddEditMapInteraction();
      }
      if (name == '7') {
        this.EditorOption.EditAction = 'add-forbid-region'
        this.HandleAddForbidRegionClicked(this.EditorOption.AddRegionMode.Mode)
      }
      if (name == '8') {
        this.EditorOption.EditAction = 'edit-forbid-region'
        this.HandleEditForbidRegionClicked();
      }
      if (name == '9') {
        this.EditorOption.EditAction = 'remove-forbid-region'
        this.HandleDeleteForbidRegionClicked();
      }
    },
    PointSettingChangedHandle(data_dto) {
      var index = data_dto.index;
      var ptdata = data_dto.pointData;

      var SettingPoints = function (source, _index, _ptdata, change_coordination = false) {
        //reset ptinformation
        var feature = source.getFeatures().find(ft => ft.get('index') == _index);
        feature.set('data', _ptdata)
        feature.set('station_type', _ptdata.StationType)
        feature.setStyle(GetStationStyle(_ptdata.Name, _ptdata.StationType, _ptdata));

        //rename display
        var style = feature.getStyle()
        var newStyle = style.clone()
        var text = newStyle.getText();
        text.setText(_ptdata.Graph.Display);

        var stroke = text.getStroke()
        if (stroke) {
          var newStroke = stroke.clone();
          newStroke.setColor('blue')
          text.setStroke(newStroke)
        }

        feature.setStyle(newStyle)
        if (change_coordination) {
          feature.setGeometry(new Point([_ptdata.X, _ptdata.Y]))
        }
      };

      SettingPoints(this.PointLayer.getSource(), index, ptdata, true); //slam mode
      SettingPoints(this.PointRouteLayer.getSource(), index, ptdata); //route mode
      var _is_eq_link = ptdata.StationType != 0;
      var pathes_with_start = this.PathesSegmentsForEdit.filter(pt => pt.StartPtIndex == index);
      var pathes_with_end = this.PathesSegmentsForEdit.filter(pt => pt.EndPtIndex == index);

      for (var i = 0; i < pathes_with_start.length; i++) {
        pathes_with_start[i].IsEQLink = _is_eq_link;
        pathes_with_start[i].StartCoordination = [ptdata.X, ptdata.Y];
      }

      for (var i = 0; i < pathes_with_end.length; i++) {
        pathes_with_end[i].IsEQLink = _is_eq_link;
        pathes_with_end[i].EndCoordination = [ptdata.X, ptdata.Y];
      }
      this.UpdateStationPathLayer();
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
    },
    HandleAGVUploadCorrdinationChanged(enabled) {
      MapStore.dispatch('UploadCoorFunctionSwitch', enabled)
    },
    HandleLedgendShowChanged(legendShow) {
      this.SaveSettingsToLocalStorage();
    },
    HandleDragLockSwitchChanged() {
      this.setDragPanEnabled(this.dragActionLock)
      this.SaveSettingsToLocalStorage();
    },
    HandleLDULDLabelClick(station_data, action) {
      //alert(JSON.stringify(station_data))
      //this.$emit('onTransferRequst', { station_data: station_data, action: action })
    },
    EqMaintainIconDisplay(tag, visible) {
      var features = this.EQMaintainIconLayer.getSource().getFeatures()
      var feature = features.find(ft => ft.get('tag') == tag)
      if (!feature) return;
      var _style = feature.getStyle();
      _style.getImage().setOpacity(visible ? 1 : 0);
      feature.setStyle(_style);
    },
    CreateEqMaintainingFeature(data, eqFeatureCoordination) {
      var newCoordination = eqFeatureCoordination;
      var maintainFeature = new Feature({
        geometry: new Point(newCoordination)
      });
      maintainFeature.set('tag', data.TagNumber)
      maintainFeature.setStyle(new Style({
        image: new Icon({
          src: '/maintain-64.png',
          scale: 0.8,
          anchor: [0.01, 1.6],
          size: [64, 64],
          opacity: 0,

        })
      }))
      return maintainFeature;
    },
    ChangeEQIconByStatus(tagNumber, status = 1 | 2, cargoExist = false, isEqDownOrMaintain = false, isPartsReplacing = false, isAnyOrderAssign = false) {

      var trayIconImage = new Icon({
        src: '/images/tray.png', // 设置PNG图像的路径
        scale: 0.10,
        anchor: [0.5, 0.2],
        size: [1652, 781],
        opacity: 0.8,
      })

      var emptyIconImage = new Icon({
        src: '/images/eq-icon.png', // 设置PNG图像的路径
        scale: 0.6,
        anchor: [0.5, 0.2],
        size: [64, 64],
        opacity: 1,
      })

      //get feature from stations layer by tagNumber
      try {
        var stationFeature = this.StationPointsFeatures.find(ft => ft.get('data').TagNumber == tagNumber);
        var style = stationFeature.getStyle().clone();
        var nameDisplay = stationFeature.get('data').Graph.Display;
        if (cargoExist) {
          style.setImage(trayIconImage);
        } else {
          style.setImage(emptyIconImage);
        }

        //set backgroundFill color by transfer status
        const unloadableColor = 'rgba(67, 149, 237,0.4)';
        const loadableColor = 'rgb(255, 220, 61)';
        const unloadAndloadableColor = 'rgba(10, 101, 69,.6)';
        const eqDownStatusColor = 'rgba(255, 0, 0,.8)';
        const noRequestColor = 'rgba(255,255,255,.1)';
        var textDisplayColor = MapStore.state.MapData.Options.workStationTextColor;

        var _text = style.getText();
        var textBgFillColor = noRequestColor;
        //var textFillColor = _text.getTextFillColor();
        if (isEqDownOrMaintain) {
          textBgFillColor = eqDownStatusColor;
          nameDisplay += `\n(${this.$t('Map.MapLegend.Maintaining')})`
          textDisplayColor = 'white'
        } else {
          if (status == 1) {
            textBgFillColor = loadableColor;
          }
          else if (status == 2) {
            textBgFillColor = unloadableColor;
          } else if (status == 4) {
            textBgFillColor = unloadAndloadableColor;
            textDisplayColor = 'white'
          }
        }

        _text.setBackgroundFill(new Fill({
          color: textBgFillColor
        }))

        if (isPartsReplacing) {
          var paperRollerRptDisplay = this.$t('Map.PartsReplacing');
          nameDisplay += `\r\n(${paperRollerRptDisplay})`
        }
        if (isAnyOrderAssign) {
          nameDisplay += `\r\n(Reserved)`
        }
        _text.setText(nameDisplay);
        _text.setFill(new Fill({
          color: textDisplayColor
        }));

        style.setText(_text);
        stationFeature.setStyle(style);
        stationFeature.set('oriStyle', style);
      } catch (error) {
        console.error(error)
      }


    },
    ChangeLDULDStatus(tagNumber, status, IsMaintaining) {
      try {

        var _notLDULDState = status != 1 && status != 2

        var ld_uld_state = status == 1 ? 'load' : 'unload'
        var features = this.EQLDULDStatusLayer.getSource().getFeatures();
        var _feature = features.find(ft => ft.get('data').TagNumber == tagNumber);
        if (!_feature)
          return
        var style = _feature.getStyle();
        if (!style)
          return;
        var text = style.getText()
        if (!text)
          return;

        this.EqMaintainIconDisplay(tagNumber, IsMaintaining);
        var status_text = ''
        if (status == 1 || status == 2) {
          let isTw = this.$i18n.locale.toLowerCase() == 'zh-Tw'
          var loadRequestText = isTw ? ' 入料請求' : ' Load Request';
          var unloadRequestText = isTw ? ' 出料請求' : ' Unload Request';
          status_text = status == 1 ? loadRequestText : unloadRequestText
        }
        text.setText(status_text);
        text.setBackgroundFill(new Fill({
          color: _notLDULDState ? '' : status == 1 ? 'orange' : 'blue'
        }))
        // text.setFill(new Fill({
        //   color: status == 3 ? 'black' : 'white'
        // }))
        style.setText(text)
        _feature.set('action', ld_uld_state)
        _feature.setStyle(style)
        _feature.changed();
      } catch (err) {

        console.error(err)
      }

    },
    RenderEQLDULDStatus(data) {//TODO EQ狀態渲染
      console.log('eq data changed');
      data.forEach(eq_states => {
        let _EQStatusDIDto = new EQStatusDIDto();
        Object.assign(_EQStatusDIDto, eq_states)

        const eqs = data.filter(eq => eq.Tag == eq_states.Tag);
        const isUniqueTag = eqs.length <= 1;
        if (isUniqueTag) {
          const _isOrderAssign = _EQStatusDIDto.IsReserved;
          this.ChangeEQIconByStatus(_EQStatusDIDto.Tag, _EQStatusDIDto.TransferStatus, _EQStatusDIDto.Port_Exist, _EQStatusDIDto.IsMaintaining, _EQStatusDIDto.IsPartsReplacing, _isOrderAssign)
        } else {
          const anyOrderAssign = eqs.find(eq => eq.IsReserved) != undefined;
          const anyLoadadble = eqs.find(eq => eq.TransferStatus == 1) != undefined;
          const anyUnLoadadble = eqs.find(eq => eq.TransferStatus == 2) != undefined;
          const anyPortExist = eqs.find(eq => eq.Port_Exist) != undefined;
          const anyIsMaintaining = eqs.find(eq => eq.IsMaintaining) != undefined;
          const anyIsPartsReplacing = eqs.find(eq => eq.IsPartsReplacing) != undefined;

          if (anyLoadadble && anyUnLoadadble)
            this.ChangeEQIconByStatus(_EQStatusDIDto.Tag, 4, anyPortExist, anyIsMaintaining, anyIsPartsReplacing, anyOrderAssign)
          else if (anyLoadadble)
            this.ChangeEQIconByStatus(_EQStatusDIDto.Tag, 1, anyPortExist, anyIsMaintaining, anyIsPartsReplacing, anyOrderAssign)
          else if (anyUnLoadadble)
            this.ChangeEQIconByStatus(_EQStatusDIDto.Tag, 2, anyPortExist, anyIsMaintaining, anyIsPartsReplacing, anyOrderAssign)
          else
            this.ChangeEQIconByStatus(_EQStatusDIDto.Tag, 3, anyPortExist, anyIsMaintaining, anyIsPartsReplacing, anyOrderAssign)
        }
        //this.ChangeLDULDStatus(_EQStatusDIDto.Tag, _EQStatusDIDto.TransferStatus, _EQStatusDIDto.IsMaintaining)
      });
    },
    RefreshMap(source = undefined) {
      // source:{
      //    stations:CreateMapStations(lastMapData),
      //    pathes:lastMapData.Segments
      //       } 
      this.MapGridSizeStore = MapStore.state.MapData.Options.gridSize;
      this.MapGridSizeXOffset = MapStore.state.MapData.Options.gridOffsetX;
      this.MapGridSizeYOffset = MapStore.state.MapData.Options.gridOffsetY;
      this.ModifyGridOffset();
      this._map_stations = JSON.parse(JSON.stringify(source ? source.stations : this.map_station_data));
      this.DeepClonePathSegmentData(source ? source.pathes : undefined);
      this.UpdateStationPathLayer();
      this.UpdateStationPointLayer();
      this.MapDisplayModeOptHandler(false);
      this.UpdateForbidPointLayer();
      this.ModifyMapRotation(MapStore.getters.Rotation);
      this.ResetImageExtend(this.map_img_extent);
    },
    /**移除有關禁制區編輯的地圖交互事件們 */
    RemoveForbidRegionOperationInteractions() {

      this.RemoveInteraction(this.draw_forbid_regions_interaction);
      this.RemoveInteraction(this.edit_forbid_regions_interaction);
      this.RemoveInteraction(this.delete_forbid_regions_interaction);
    },
    OpenPath_editor(feature = new Feature()) {
      var pathid = feature.get('path_id')
      if (pathid) {
        var path_data = this.PathesSegmentsForEdit.find(path => path.PathID == pathid)
        var reverse_pathid = path_data.EndPtIndex + '_' + path_data.StartPtIndex;
        var reverse_path_data = this.PathesSegmentsForEdit.find(path => path.PathID == reverse_pathid)
        this.IsPathEditing = true;
        this.SelectedPathData = path_data;
        this.HandlePathTbRowClick(path_data);
        if (reverse_path_data) {
          this.ShowPathSelectDialog = true;
          this.PathesCandicats = [path_data, reverse_path_data];
        } else {
          this.HandlePathTbRowClick(path_data);
          this.$refs['path_editor'].Show(path_data);
        }
      }
    },
    HandlePathSelected(path_data) {
      this.IsPathEditing = true;
      this.ShowPathSelectDialog = false;
      this.SelectedPathData = path_data;
      setTimeout(() => {
        this.HandlePathTbRowClick(path_data);
      }, 1000);
      this.$refs['path_editor'].Show(path_data);
    },
    HandlePathSetingDrawerClosed(edited_path_settings) {
      this.IsPathEditing = false;
      if (this.selected_path_feature) {
        this.RestoreOriginalPathStyle(this.selected_path_feature)
      }
    },
    HandleForbidRegionEditDrawerClosed() {
      document.addEventListener('keydown', this.EditModeKeybordEvents)

    },
    HandleRegionRedraw(data = new MapRegion()) {
      this.showRedrawControl = true;
      this.AddDrawForbidActionInteraction('passible', data.Name, (event) => {
        this.HandleResetRegionRedraw()
      });
      var _features = this.RegionLayer.getSource().getFeatures()
      let previousFeaturesOfRegion = _features.filter(ft => ft.get('name') == data.Name)
      this.tempHiddenFeaturesOfRegion = previousFeaturesOfRegion;
      if (previousFeaturesOfRegion) {
        previousFeaturesOfRegion.forEach(element => {
          this.RegionLayer.getSource().removeFeature(element)
        });
      }
    },
    SetPathesAsBeControledStyle() {
      var path_ids = Object.keys(this.ControledPathesBySystem)
      if (path_ids.length == 0)
        return;

      var source = this.PathLayerForCoordination.getSource();
      path_ids.forEach(path_id => {
        var pathFeature = source.getFeatures().find(p => p.get('path_id') == path_id)
        if (pathFeature) {
          var _style = pathFeature.getStyle()
          var stroke = _style[0].getStroke();
          if (stroke) {
            stroke.setColor('orange')
            _style[0].setStroke(stroke)
            pathFeature.setStyle(_style)
          }
        }
      });
      this.map.render();


    },
    /**地圖變更為選擇AGV模式 */
    ChangeToSelectAGVMode() {
      this.RestoredFillColorOfChangedFeature();
      //把設備圖層Feature變為不明顯
      this.ChangeFeaturesAsIgnoreStyle(this.StationPointsFeatures, 'rgb(222, 222, 222)');
      this.IsSelectAGVMode = true;
      this.IsSelectEQStationMode = false;
      this.AGVLocLayer.setVisible(true);

    },
    /**地圖變更為選擇設備站點模式 */
    ChangeToSelectEQStationMode() {
      var _isMoveOrder = this.TaskDispatchOptions.action_type == 'move';
      var _isOnlyLoadOrder = this.TaskDispatchOptions.action_type == 'load';
      var _isOnlyUnloadOrder = this.TaskDispatchOptions.action_type == 'unload';
      var _isChargeOrder = this.TaskDispatchOptions.action_type == 'charge';
      var _isParkOrder = this.TaskDispatchOptions.action_type == 'park';
      var _isCarryOrder = this.TaskDispatchOptions.action_type == 'carry';
      var _isChoiseDestine = this.TaskDispatchOptions.direction == 'destine';
      this.highlightingFeatures = []
      if (this.TaskDispatchOptions.direction == 'source') {
        this.RestoredFillColorOfChangedFeature();
        this.TransferTaskIconLayer.getSource().clear();
      }
      var charge_features = this.StationPointsFeatures.filter(ft => ft.get('data').IsCharge)
      var non_charge_features = this.StationPointsFeatures.filter(ft => !ft.get('data').IsCharge);
      var eq_features = this.StationPointsFeatures.filter(ft => !ft.get('data').IsCharge && ft.get('data').StationType != 0);
      var buffer_features = this.StationPointsFeatures.filter(ft => !ft.get('data').IsCharge && ft.get('data').StationType != 4);
      var normal_pt_features = this.StationPointsFeatures.filter(ft => ft.get('data').StationType == 0);
      var parkable_features = this.StationPointsFeatures.filter(ft => ft.get('data').IsParking || ft.get('data').StationType == 4 || ft.get('data'.StationType == 5))
      var normal_virtual_pt_features = normal_pt_features.filter(ft => ft.get('data').IsVirtualPoint)

      //this.AGVLocLayer.setVisible(false);

      this.RestoredFillColorOfChangedFeature();
      //把AGV圖層Feature變為不明顯
      //this.ChangeFeaturesAsIgnoreStyle(this.AGVMapFeatures);

      if (this.TaskDispatchOptions.action_type == 'charge') {
        //再把非充電站的Feature變為不明顯
        this.ChangeFeaturesAsIgnoreStyle(non_charge_features);
        console.info(charge_features);
        this.ChangeFeaturesAsCandicatingStyle(charge_features);
      }
      else {
        //把充電站的Feature變為不明顯
        this.ChangeFeaturesAsIgnoreStyle(charge_features);

        if (this.TaskDispatchOptions.stations_to_show && this.TaskDispatchOptions.stations_to_show.length != 0) {
          var tags_to_show = this.TaskDispatchOptions.stations_to_show.map((st) => st.tag);
          var _hidden_stations_features = this.StationPointsFeatures.filter(ft => ft.get('data').StationType != 0 && !tags_to_show.includes(ft.get('data').TagNumber));
          var _show_stations_features = this.StationPointsFeatures.filter(ft => tags_to_show.includes(ft.get('data').TagNumber));
          this.ChangeFeaturesAsIgnoreStyle(_hidden_stations_features);
          this.ChangeFeaturesAsCandicatingStyle(_show_stations_features);

        }
        else if (_isChoiseDestine) {
          if (_isMoveOrder) {
            this.ChangeFeaturesAsIgnoreStyle(eq_features);
            this.ChangeFeaturesAsIgnoreStyle(normal_virtual_pt_features, 'grey');
          } else if (_isOnlyUnloadOrder || _isOnlyLoadOrder) {
            this.ChangeFeaturesAsIgnoreStyle(charge_features);
            this.ChangeFeaturesAsIgnoreStyle(normal_pt_features, 'grey');
            this.ChangeFeaturesAsCandicatingStyle(eq_features);
          } else if (_isChargeOrder) {
            this.ChangeFeaturesAsIgnoreStyle(eq_features);
            this.ChangeFeaturesAsIgnoreStyle(normal_pt_features, 'grey');
          } else if (_isParkOrder) {
            this.ChangeFeaturesAsIgnoreStyle(eq_features);
            this.ChangeFeaturesAsIgnoreStyle(normal_pt_features, 'grey');
            this.ChangeFeaturesAsCandicatingStyle(parkable_features);

          } else {

            this.ChangeFeaturesAsIgnoreStyle(this.StationPointsFeatures);
          }
        }
      }
      this.IsSelectAGVMode = false;
      this.IsSelectEQStationMode = true;
      clearInterval(this.featureHighlightTimerID);

      if (!_isMoveOrder) //TODO highlight animation
        var _index = 0;
      this.featureHighlightTimerID = setInterval(() => {
        var SetTextColor = (_feature, textColor, bgColor) => {
          var newStyle = _feature.getStyle().clone();
          var text = newStyle.getText();
          var fillProp = text.getFill().clone();
          // var bgFill = text.getBackgroundFill();
          // if (bgFill) {
          //   var backgroundFill = bgFill.clone();
          //   backgroundFill.setColor(bgColor);
          //   text.setBackgroundFill(backgroundFill);
          // }
          fillProp.setColor(textColor);
          text.setFill(fillProp);
          newStyle.setText(text);
          _feature.setStyle(newStyle)
        }
        this.highlightingFeatures.forEach(_feature => {
          let _textColor = _index == 0 ? MapStore.state.MapData.Options.workStationTextColor : 'green';
          let _bgColor = _index == 0 ? 'rgba(9, 76, 176 ,0.1)' : 'rgba(2, 20, 48 ,0.4)';
          SetTextColor(_feature, _textColor, _bgColor);
        })
        _index = _index == 0 ? 1 : 0
      }, 600)
    },
    ChangeToNormalViewMode() {

      this.highlightingFeatures = [];
      clearInterval(this.featureHighlightTimerID)
      this.AGVLocLayer.setVisible(true);
      this.StationNameDisplayOptHandler();
      this.IsSelectAGVMode = this.IsSelectEQStationMode = false;
      this.TransferTaskIconLayer.getSource().clear();
      this.RestoredFillColorOfChangedFeature();
      setTimeout(() => {
        clearInterval(this.featureHighlightTimerID)
      }, 600);


    },
    RestoredFillColorOfChangedFeature() {
      this.StationPointsFeatures.forEach(feature => {
        if (feature.get('oriStyle')) {
          feature.setStyle(feature.get('oriStyle'))
        }
      })
      this.AGVLocLayer.getSource().getFeatures().forEach(feature => {
        if (feature.get('oriStyle')) {
          feature.setStyle(feature.get('oriStyle'))
        }
      })
    },
    ChangeFeaturesAsIgnoreStyle(features) {//TODO ChangeFeaturesAsIgnoreStyle
      var color = MapStore.state.MapData.Options.workStationTextColor;
      features.forEach(feature => {
        feature.set('isSelectable', false)
        var style = feature.getStyle()
        if (style) {
          feature.set('oriStyle', style)
          try {
            var newStyle = style.clone()
            var oriImage = newStyle.getImage();
            if (oriImage) {
              var newImage = oriImage.clone();
              //newImage.setOpacity(.7)
              newStyle.setImage(newImage);
            }
            var text = newStyle.getText();
            if (text) {
              var fill = text.getFill()
              if (fill) {
                var newfill = fill.clone();
                newfill.setColor(color)
                text.setFill(newfill)
                feature.setStyle(newStyle)
              }
            }
          } catch {

          }
        }
      });

    },
    ChangeFeaturesAsCandicatingStyle(features) {
      var color = MapStore.state.MapData.Options.workStationTextColor
      features.forEach(feature => {
        var style = feature.getStyle()
        if (style) {
          feature.set('oriStyle', style.clone())
          try {
            var newStyle = style.clone()
            var oriImage = newStyle.getImage();
            if (oriImage) {
              var newImage = oriImage.clone();
              //newImage.setScale(0.75)
              newStyle.setImage(newImage);
            }
            var text = newStyle.getText();
            if (text) {
              // text.setFont(`bold ${_workStationTextFontSize}px Calibri,sans-serif`)
              var fill = text.getFill()
              if (fill) {
                var newfill = fill.clone();
                newfill.setColor(color)
                text.setFill(newfill)
                feature.setStyle(newStyle)
                this.highlightingFeatures.push(feature)
              }
            }
          } catch (exception) {
            console.info(exception);
          }
        }
      });

    },
    CreateDestineMarkIcon(tagNumber) {
      if (this.editable)
        return;


      var _displayText = () => {
        const tw = this.$i18n.locale == 'zh-TW';
        var _map = {
          'move': tw ? MarkIconTranslate.move.zh : MarkIconTranslate.move.en,
          'carry': tw ? MarkIconTranslate.carry_destien.zh : MarkIconTranslate.carry_destien.en,
          'load': tw ? MarkIconTranslate.load.zh : MarkIconTranslate.load.en,
          'unload': tw ? MarkIconTranslate.unload.zh : MarkIconTranslate.unload.en,
          'charge': tw ? MarkIconTranslate.charge.zh : MarkIconTranslate.charge.en,

        }
        return _map[this.TaskDispatchOptions.action_type];
      }

      if (this.TaskDispatchOptions.action_type != 'carry') {
        this.TransferTaskIconLayer.getSource().clear();
      } else {
        var features = this.TransferTaskIconLayer.getSource().getFeatures();
        this.TransferTaskIconLayer.getSource().removeFeature(features[1])
      }
      this.AddMarkIconWithText(tagNumber, _displayText(), 'rgb(246, 166, 19)');
    },
    AddMarkIconWithTextAtAGV(agvName, text, bgFillColor = 'rgb(13, 110, 253)') {
      var agv_feature = this.AGVLocLayer.getSource().getFeatures().find(ft => ft.get('agvname') == agvName);
      if (!agv_feature)
        return;
      var coordination = agv_feature.getGeometry().getCoordinates()
      var layerSource = this.TransferTaskIconLayer.getSource();
      var _newFeature = CreateTransTaskMark(coordination, text, bgFillColor);
      layerSource.addFeature(_newFeature);
    },
    AddMarkIconWithText(tagNumber, text, bgFillColor = 'rgb(13, 110, 253)') {
      var station_feature = this.StationPointsFeatures.find(ft => ft.get('data').TagNumber == tagNumber);
      if (!station_feature)
        return;
      var coordination = station_feature.getGeometry().getCoordinates()
      var layerSource = this.TransferTaskIconLayer.getSource();
      var _newFeature = CreateTransTaskMark(coordination, text, bgFillColor);
      layerSource.addFeature(_newFeature);

    },
    ModifyGridSize(size) {

      this.RemoveGridLayer();
      this.initGrid(this.map, size, this.map_img_extent);
      MapStore.commit('setMapGridSize', size);
    },
    ModifyGridOffset() {

      this.RemoveGridLayer();
      this.initGrid(this.map, this.MapGridSize, this.map_img_extent, this.MapGridSizeXOffset, this.MapGridSizeYOffset);
      MapStore.commit('setMapGridOffsetX', this.MapGridSizeXOffset);
      MapStore.commit('setMapGridOffsetY', this.MapGridSizeYOffset);
    },
    ModifyMapRotation(rotation = undefined) {
      var _rotation = rotation ? rotation : this.MapRotation
      var view = this.map.getView();
      view.setRotation(_rotation * Math.PI / 180.0)
      this.map.setView(view)
      MapStore.commit('SetRotation', _rotation);
      this.MapRotation = _rotation
    },
    RemoveGridLayer() {
      var layers = this.map.getLayers().getArray();
      var layerRemove = layers.find(layer => layer.get('name') === 'gridLayer');
      if (layerRemove)
        this.map.removeLayer(layerRemove)
    },
    HideGridLayer() {
      this.gridLayer.setVisible(false);
    },
    ImageEditClick() {
      this.ShowImageEditorDialog = true
      setTimeout(() => {
        var _imageEditor = this.$refs['imageEditor'];
        console.info(_imageEditor)
        _imageEditor.pic = this.map_image_url;
      }, 100);
    },
    HandleImageCropedDone(result) {
      this.ShowImageEditorDialog = false;
      this.map_img_url_for_editor = result.blobURL;
      this.to_upload_image_file = result.file;
      this.ResetImage(this.map_img_url_for_editor)
    },
    HandlePathColorSelected(color) {
      MapStore.commit("setPathColor", color)
      this.SetPathColor(color);
    },
    HandleWorkStationNameColorSelected(color, changedByDarkMode = false) {
      if (!changedByDarkMode)
        MapStore.commit("setWorkStationPointTextColor", color)
      this.GetAllPointsFeatures().filter(feature => feature.get('station_type') != 0).forEach(feature => {
        this.SetPointTextFillColor(feature, color)
      })
    },

    HandleNormalPointNameColorSelected(color, changedByDarkMode = false) {
      if (!changedByDarkMode)
        MapStore.commit("setNormalPointTextColor", color)
      this.GetAllPointsFeatures().filter(feature => feature.get('station_type') == 0).forEach(feature => {
        this.SetPointTextFillColor(feature, color)
      })
    },
    HandleWorkStationTextSizeChanged(size) {
      MapStore.commit("setWorkStationPointTextFontSize", size)
      this.GetAllPointsFeatures().filter(feature => feature.get('station_type') != 0).forEach(feature => {
        this.SetPointTextFontSize(feature, size)
      })
    },
    HandleNormalStationTextSizeChanged(size) {
      MapStore.commit("setNormalPointTextFontSize", size)
      this.GetAllPointsFeatures().filter(feature => feature.get('station_type') == 0).forEach(feature => {
        this.SetPointTextFontSize(feature, size)
      })
    },
    GetAllPointsFeatures() {
      return [
        ...this.PointLayer.getSource().getFeatures(),
        ...this.PointRouteLayer.getSource().getFeatures()
      ]
    },
    SetPointTextFillColor(feature, color) {
      var oriStyle = feature.getStyle();
      var text = oriStyle.getText();
      text.getFill().setColor(color);
      oriStyle.setText(text);
      feature.setStyle(oriStyle)
    },
    SetPointTextFontSize(feature, fontSize) {
      var oriStyle = feature.getStyle();
      var text = oriStyle.getText();
      text.setFont(`bold ${fontSize}px Calibri,sans-serif`);
      oriStyle.setText(text);
      feature.setStyle(oriStyle)
    },
    SetPathColor(color) {
      var features = [...this.PathLayerForRouter.getSource().getFeatures(), ...this.PathLayerForCoordination.getSource().getFeatures()];
      features.forEach(feature => {
        var oriStyles = feature.getStyle();
        var oriStyle = oriStyles[0];
        // console.log(oriStyle)
        if (oriStyle) {

          var newStroke = oriStyle.getStroke();
          newStroke.setColor(color);
          oriStyle.setStroke(newStroke);
          oriStyles[0] = oriStyle
          feature.setStyle(oriStyles);
        }
      });
    },
    SetDisplayString(mode) {
      let getDisplayOfFeature = (feature = new Feature()) => {
        let mapPointData = feature.get('data');
        let tag = mapPointData.TagNumber + '';
        let display = mapPointData.Graph.Display;
        let index = feature.get('index') + ''
        if (mode == 'name')
          return display;
        else if (mode == 'name_tag')
          return `${display} (${tag})`;
        else if (mode == 'tag')
          return tag;
        else if (mode == 'index')
          return index;
        else
          return display;
      }

      const _fixOffsetOfText = mode == 'index' || mode == 'tag';
      this.StationPointsFeatures.forEach(_feature => {
        var _textToDisplay = getDisplayOfFeature(_feature)
        var _style = _feature.getStyle();
        var _text = _style.getText();
        if (_fixOffsetOfText) {
          _text.setOffsetX(-20);
          _text.setOffsetY(-20);
        } else {
          const mptData = _feature.get('data');
          _text.setOffsetX(mptData.Graph.textOffsetX);
          _text.setOffsetY(mptData.Graph.textOffsetY);
        }
        _text.setText(_textToDisplay);
        _style.setText(_text);
        _feature.setStyle(_style);
      });
    },
    ResetPointEnableStatus(enableMap = { 1: true }) {

      var featuresOfCoordMode = this.PointLayer.getSource().getFeatures();
      var featuresOfRouteMode = this.PointRouteLayer.getSource().getFeatures();
      let _getFeatures = (tag = 1) => {
        var featureInCoordModeLayer = featuresOfCoordMode.find(ft => ft.get('data').TagNumber == tag);
        var featureInRouteModeLayer = featuresOfRouteMode.find(ft => ft.get('data').TagNumber == tag);
        return [featureInCoordModeLayer, featureInRouteModeLayer]
      }
      let _settingEnableStyle = (feature = new Feature(), enble = true) => {
        if (!feature)
          return;
        var _normalStationTextColor = MapStore.getters.Settings.normalStationTextColor;
        var _workStationTextColor = MapStore.getters.Settings.workStationTextColor;
        var ptData = feature.get('data');
        ptData.Enable = enble;
        feature.set('data', ptData)
        var isNormalPt = ptData.StationType == 0;
        var displayText = ptData.Graph.Display;
        var _style = feature.getStyle().clone();
        var text = _style.getText();
        var fill = text.getFill().clone();
        var oriColor = isNormalPt ? _normalStationTextColor : _workStationTextColor;
        var textFillColor = !enble ? 'rgb(255, 102, 92)' : oriColor;

        fill.setColor(textFillColor);
        text.setFill(fill);
        text.setText(`${displayText}${enble ? '' : '(已禁用)'}`);
        if (isNormalPt) {
          var image = normal_station_image(ptData);
          _style.setImage(image);
        }
        _style.setText(text);
        feature.setStyle(_style);
        feature.changed();

      }
      Object.keys(enableMap).forEach(tag => {
        let enable = enableMap[tag];
        //console.info(tag, enable);
        var features = _getFeatures(tag)
        _settingEnableStyle(features[0], enable)
        _settingEnableStyle(features[1], enable)

      });
    },
    HanldeThemeChanged(val) {
      if (val == 'dark') {
        this.HandleNormalPointNameColorSelected(this.map_theme_dark.normalPtTextColor, true);
        this.HandleWorkStationNameColorSelected(this.map_theme_dark.stationPtTextColor, true);
        this.SetPathColor(this.map_theme_dark.pathColor)

      } else {
        const mapOption = MapStore.state.MapData.Options;
        this.HandleNormalPointNameColorSelected(mapOption.normalStationTextColor, true);
        this.HandleWorkStationNameColorSelected(mapOption.workStationTextColor, true);
        this.SetPathColor(mapOption.pathColor);
      }
    },
    HandleCancleRegionRedraw() {
      this.showRedrawControl = false;
      var _forbid_region_editor = this.$refs['forbid_region_editor'];
      //_forbid_region_editor.Show();
      if (this.tempHiddenFeaturesOfRegion) {
        this.RegionLayer.getSource().addFeatures(this.tempHiddenFeaturesOfRegion)
      }
      var _features = this.RegionLayer.getSource().getFeatures()
      _features.filter(ft => ft.get('redraw')).forEach(ft => {
        this.RegionLayer.getSource().removeFeature(ft);
      })
      this.HandleEditForbidRegionClicked();
      this.ShowEditingRegionSettingDrawer();
    },
    HandleResetRegionRedraw() {
      var _features = this.RegionLayer.getSource().getFeatures()
      const _name = this.redrawingRegionName;
      let previousFeaturesOfRegion = _features.filter(ft => ft.get('name') == _name)
      if (previousFeaturesOfRegion) {
        previousFeaturesOfRegion.forEach(element => {
          this.RegionLayer.getSource().removeFeature(element)
        });
      }
      this.isRedrawConfirmable = false;
    },
    HandleCompleteRegionRedraw() {
      this.showRedrawControl = false;
      this.HandleEditForbidRegionClicked();
      this.ShowEditingRegionSettingDrawer();
      this.$notify({ message: `已完成[${this.redrawingRegionName}]區域重繪`, offset: 50 })
    },
    ShowEditingRegionSettingDrawer() {
      var _forbid_region_editor = this.$refs['forbid_region_editor'];
      var _forbidRegionName = this.redrawingRegionName;
      let featuresInLayer = this.RegionLayer.getSource().getFeatures();
      var textFeature = featuresInLayer.find(ft => ft.get('name') == _forbidRegionName && ft.get('type') == 'text')
      var ploygonFeature = featuresInLayer.find(ft => ft.get('name') == _forbidRegionName && ft.get('type') == 'polygon')
      var regionData = new MapRegion(_forbidRegionName, [])
      _.merge(regionData, ploygonFeature.get('data'));
      console.log(regionData.Name);
      _forbid_region_editor.Show(regionData, textFeature, ploygonFeature);
    },
    HandleSearchTagSelected(tag) {

      if (this.clickedFeature) {
        this.clickedFeature.setStyle(this.clickedFeature.get('oriStyle'))
      }
      if (!tag)
        return;
      const layer = this.map_display_mode == 'coordination' ? this.PointLayer : this.PointRouteLayer;
      const features = layer.getSource().getFeatures();
      const featureFound = features.find(_feature => _feature.get('data').TagNumber == tag);
      if (!featureFound)
        return;
      const coordination = featureFound.getGeometry().getCoordinates()
      // alert(JSON.stringify(coordination))
      this.map.getView().setCenter(coordination);
      this.map.getView().setZoom(3);
      featureFound.set('oriStyle', featureFound.getStyle().clone());
      // let _style = featureFound.getStyle().clone();
      this.HighLightFeatureSelected([featureFound], 'rgb(13, 110, 253)', true)
      this.clickedFeature = featureFound;
    },
    AddDrawBoxInteraction() {
      const selectedStyle = new Style({
        backgroundFill: new Fill({
          color: 'rgba(255, 165, 0, 1)',
        })
      })
      // a normal select interaction to handle click
      const select = new Select({
        style: selectedStyle
      });
      this.map.addInteraction(select)
      const selectedFeatures = select.getFeatures();
      // a DragBox interaction used to select features by drawing boxes
      const dragBox = new DragBox({
        condition: platformModifierKeyOnly,

      });
      let boxendEventHandler = () => {
        let vectorSource = this.PointLayer.getSource();
        const boxExtent = dragBox.getGeometry().getExtent();
        // if the extent crosses the antimeridian process each world separately
        const worldExtent = this.map.getView().getProjection().getExtent();
        const worldWidth = getWidth(worldExtent);
        const startWorld = Math.floor((boxExtent[0] - worldExtent[0]) / worldWidth);
        const endWorld = Math.floor((boxExtent[2] - worldExtent[0]) / worldWidth);

        for (let world = startWorld; world <= endWorld; ++world) {
          const left = Math.max(boxExtent[0] - world * worldWidth, worldExtent[0]);
          const right = Math.min(boxExtent[2] - world * worldWidth, worldExtent[2]);
          const extent = [left, boxExtent[1], right, boxExtent[3]];

          const boxFeatures = vectorSource
            .getFeaturesInExtent(extent)
            .filter(
              (feature) =>
                !selectedFeatures.getArray().includes(feature) &&
                feature.getGeometry().intersectsExtent(extent),
            );

          // features that intersect the box geometry are added to the
          // collection of selected features

          // if the view is not obliquely rotated the box geometry and
          // its extent are equalivalent so intersecting features can
          // be added directly to the collection
          const rotation = this.map.getView().getRotation();
          const oblique = rotation % (Math.PI / 2) !== 0;

          // when the view is obliquely rotated the box extent will
          // exceed its geometry so both the box and the candidate
          // feature geometries are rotated around a common anchor
          // to confirm that, with the box geometry aligned with its
          // extent, the geometries intersect
          if (oblique) {
            const anchor = [0, 0];
            const geometry = dragBox.getGeometry().clone();
            geometry.translate(-world * worldWidth, 0);
            geometry.rotate(-rotation, anchor);
            const extent = geometry.getExtent();
            boxFeatures.forEach(function (feature) {
              const geometry = feature.getGeometry().clone();
              geometry.rotate(-rotation, anchor);
              if (geometry.intersectsExtent(extent)) {
                selectedFeatures.push(feature);
                feature.setStyle(feature.get('oriStyle'))
              }
            });
          } else {
            selectedFeatures.extend(boxFeatures);
          }
        }
      };
      this.map.addInteraction(dragBox);
      dragBox.on('boxend', boxendEventHandler);
      // clear selection when drawing a new box and when clicking on the map
      dragBox.on('boxstart', function () {
        selectedFeatures.clear();
      });
    },

  },
  mounted() {
    this.loading = true;
    if (this.editable) {
      this.RemoveKeyboardPressEventListener();
      document.addEventListener('keydown', this.EditModeKeybordEvents)
    }

    this.loading = true;
    var element = document.getElementById("map"); // 替换为你要禁用右键菜单的元素的ID
    if (element)
      element.addEventListener('contextmenu', function (event) {
        event.preventDefault();
      });


    setTimeout(() => {

      this.MapGridSizeStore = this.MapGridSize;
      this.MapGridSizeXOffset = MapStore.state.MapData.Options.gridOffsetX;
      this.MapGridSizeYOffset = MapStore.state.MapData.Options.gridOffsetY;

      this.MapStyles.PathColor = MapStore.state.MapData.Options.pathColor;
      this.MapStyles.NormalPointNameColor = MapStore.state.MapData.Options.normalStationTextColor;
      this.MapStyles.WorkStationPointNameColor = MapStore.state.MapData.Options.workStationTextColor;
      this.MapStyles.NormalPointTextFontSize = MapStore.state.MapData.Options.normalStationTextFontSize;
      this.MapStyles.WorkStationPointTextFontSize = MapStore.state.MapData.Options.workStationTextFontSize;


      this.DeepClonePathSegmentData();
      this.InitMap();
      this.RestoreSettingsFromLocalStorage();
      this.AddEditMapInteraction();
      watch(() => this.map_display_mode, (newVal, oldVal) => {
        if (newVal == 'coordination' && this.editable) {
          this.$message({
            message: '當前地圖模式為[Slam]，使用滑鼠拖曳變更點位位置即會變更座標設定。',
            type: 'warning',
            duration: 3000,
            placement: 'bottom',
            customClass: 'map-elplus-message-style',
            showClose: true
          })
        }

      }, { immediate: true })
      watch(
        () => this.map_station_data, (newval, oldval) => {
          if (!newval)
            return;
          this.RefreshMap();
        }, { deep: true, immediate: true }
      )

      watch(() => this.agvs_info, (newval, oldval) => {
        if (!newval)
          return
        if (JSON.stringify(newval) == JSON.stringify(oldval)) {
          return;
        }
        if (this.agvRenderDebounceTimer) {
          clearTimeout(this.agvRenderDebounceTimer);
        }
        this.agvRenderDebounceTimer = setTimeout(() => { this.UpdateAGVLayer() }, 100)

      }, { deep: true, immediate: false })

      watch(() => this.agvs_info_other_system, (newval, oldval) => {
        if (!newval)
          return
        this.UpdateAGVLocationOfOtherSystem(newval)
      }, { deep: true, immediate: true })
      watch(
        () => this.agv_upload_coordi_data, (newval = {}, oldval) => {
          if (this.agv_upload_coordination_mode) {
            this.HandleAGVUploadData(newval)
          }
        }, { deep: true, immediate: true }
      )
      //TODO bus.on 
      bus.on('/show_agv_at_center', agv_name => {
        // alert(agv_name)
        this.ResetMapCenterViaAGVLoc(agv_name)
      })

      bus.on('/rerender_agv_layer', () => {
        console.log('rerender_agv_layer');
        this.AGVLocLayer.getSource().clear();
        this.AGVFeatures = {};
      })


      bus.on('/tracking_agv', agvName => {
        clearInterval(this.trackingAGVTimer)
        if (agvName != '') {
          //start tracking
          this.trackingAGVTimer = setInterval(() => {
            this.ResetMapCenterViaAGVLoc(agvName);
          }, 500);
        }
      })
      bus.on('/cancel_tracking_agv', () => {
        clearInterval(this.trackingAGVTimer)
      })
      bus.on('change_to_select_agv_mode', () => {
        if (this.editable)
          return;
        this.ChangeToSelectAGVMode();
      })
      bus.on('change_to_select_eq_station_mode', (option) => {
        if (this.editable)
          return;
        this.TaskDispatchOptions = JSON.parse(JSON.stringify(option))
        this.ChangeToSelectEQStationMode();
      })
      bus.on('change_to_normal_view_mode', () => {
        if (this.editable)
          return;
        this.ChangeToNormalViewMode();
      })
      bus.on('mark_as_start_station', (tagNumber) => {
        if (this.editable)
          return;
        console.info(tagNumber);
        this.TransferTaskIconLayer.getSource().clear();

        var textDisplay = this.$i18n.locale == 'zh-TW' ? MarkIconTranslate.carry_source.zh : MarkIconTranslate.carry_source.en;
        if (tagNumber.isAGV) {
          textDisplay += "(AGV)";
          this.AddMarkIconWithTextAtAGV(tagNumber.agvName, textDisplay);
        } else {
          this.AddMarkIconWithText(tagNumber, textDisplay);
        }
      })
      bus.on('mark_as_destine_station', (tagNumber) => {
        this.CreateDestineMarkIcon(tagNumber);
      })
      bus.on('delete-multi-points', () => {
        this.SelectedFeatures.forEach(_feature => {
          this.RemoveStation(_feature)
        });
        this.$notify({ type: 'success', message: `Delete ${this.SelectedFeatures.length} point done` })
      })
      bus.on('restore_points_by_multi_point_changed', () => {
        this.SelectedFeatures.forEach(_feature => {
          var dto = { index: _feature.get('index'), pointData: _feature.get('data') }
          this.PointSettingChangedHandle(dto);
        });
        this.$notify({ type: 'success', message: `Delete ${this.SelectedFeatures.length} point done` })
        this.HighLightFeatureSelected(this.SelectedFeatures, 'rgb(230, 162, 60)')
      })

      bus.on('stop_render', () => {
        clearInterval(this.renderLDULD_StatusTimerId);
      })
      var mapdom = document.getElementById(this.id);
      if (mapdom)
        mapdom.addEventListener('contextmenu', (ev) => {
          ev.preventDefault()
        })
      //render first 
      if (!this.editable && this.eq_lduld_status_show) {
        this.RenderEQLDULDStatus(EqStore.state.EQ);
        bus.on('eq_data_changed', (data) => {
          this.RenderEQLDULDStatus(data);
        })
      }
      this.UpdateAGVLocLocation();
      this.loading = false;

    }, 100);

    bus.on('Map-Point-Enabled-Property-Changed', async () => {
      //await MapStore.dispatch('DownloadMapData')
      var enableStateOfPointTags = await MapStore.dispatch('GetPointEnableMap')
      this.ResetPointEnableStatus(enableStateOfPointTags);
    })
  }
}
</script>
<style lang="scss" scoped>
.map-component {
  width: 100%;
  height: 90vh;

  .select-mode {
    font-size: 17px;
  }

  .select-destine-notify {
    animation: select-destine-notifier-blink 2s infinite;
  }

  .select-source-notify {
    animation: select-source-notifier-blink 2s infinite;
  }

  @keyframes select-destine-notifier-blink {
    0%,
    100% {
      color: rgb(8, 8, 8);
      background-color: rgba(254, 244, 146, 0.8);
    }
    50% {
      color: rgb(100, 100, 100);
      background-color: rgba(255, 208, 0, 0.8);
    }
  }

  @keyframes select-source-notifier-blink {
    0%,
    100% {
      color: rgba(13, 110, 253, 0.8);
      background-color: rgba(177, 216, 255, 0.8);
    }
    50% {
      color: white;
      background-color: rgba(13, 110, 253, 0.8);
    }
  }

  .notify-text {
    .el-alert__title {
      font-size: 20px;
    }
  }

  .map-ledgend {
    background-color: rgba(241, 241, 241, 0.649);
    width: 200px;
    position: absolute;

    left: 1.1rem;
    font-size: 20px;
  }

  @keyframes mode_flick {
    0%,
    100% {
      background-color: rgb(13, 110, 253);
      color: white;
    }

    50% {
      background-color: rgb(235, 235, 235);
      color: rgb(13, 110, 253);
    }
  }

  .tab-open {
    width: 500px;
    z-index: 2;
    i {
      cursor: pointer;
      position: absolute;
      left: 479px;
    }

    i:hover {
      background-color: rgb(245, 155, 155);
      color: white;
    }
  }

  .tab-close {
    width: 30px;

    i {
      cursor: pointer;
    }

    i:hover {
      background-color: gray;
      color: white;
    }
  }

  .custom-buttons {
    // top: 133px;
    text-align: center;
    z-index: 1;
    flex-direction: column;
    margin-top: 105px;
    height: 300px;

    width: 35px;

    button {
      opacity: 0.6;
      font-size: 26px;
      width: 35px;
      border-radius: 3px;
      margin: 2px;
      margin-left: 12px;
      border: 1px solid grey;
      background-color: white;
      font-weight: bolder;
    }

    button:hover {
      cursor: pointer;
      border: 0.01rem solid black;
    }
  }
  .notify-and-coor-container {
    z-index: 1;
    margin-top: 10px;
    position: absolute;
    right: 112px;

    .cursour-coordination-show {
      width: 140px;
      text-align: right;
      font-weight: bold;
      font-size: 12px;
      letter-spacing: 2px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
        sans-serif;

      .grid-size-text {
        font-size: small;
      }
    }
  }

  .custom-buttons {
    position: absolute;
    background-color: transparent;
    display: flex;
    z-index: 2;
  }
  .multi-select-info {
    background-color: rgb(101, 163, 255);
    color: white;
    position: absolute;
    bottom: 50px;
    width: 150px;
    text-align: center;
    /* margin-left: 50px; */
    /* margin-top: 15px; */
    padding: 4px;
    z-index: 999999;
  }
  .options {
    text-align: left;
    width: 125px;
    font-size: 16px;
    z-index: 1;
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
    .router_editMode {
    }
    .coordination_editMode {
      border: 4px dashed red;
      border-radius: 8px;
      animation: dash 1s linear infinite; /* 添加動畫 */
    }
    @keyframes dash {
      0% {
        border-color: red;
        border-style: dashed;
      }
      50% {
        border-color: rgba(255, 0, 0, 0.2); /* 中間顏色變化 */
      }
      100% {
        border-color: red;
      }
    }
  }

  .action-buttons {
    button {
      width: 90px;
      height: 30px;
      margin-right: 5px;
    }
  }
  .ol-zoom {
    background-color: red !important;
  }
  .agv_map {
    width: 100%;
    height: 100%;
  }
  .designer {
    // background-color: rgb(119, 119, 119);
    height: 85vh;
    overflow-y: scroll;
    .designer-collapse-title {
      color: rgb(13, 110, 253);
      font-weight: bold;
      font-size: 20px;
      padding-left: 8px;
    }
  }
  .align-tool,
  .action-undo-tool {
    position: absolute;
    margin-left: 3.7rem;
    margin-top: 1rem;
    z-index: 3;
  }
  .build-tool {
    // background-color: orange;
    // font-size: 30px;
    position: absolute;
    top: 160px;
    left: 13px;
    z-index: 3;
  }
}
</style>