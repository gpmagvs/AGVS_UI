<template>
  <el-popover
    placement="right"
    :visible="action_menu_visible && !order_info_visible"
    :width="200"
    content
  >
    <template #reference>
      <div
        :key="grabStates.updateKey"
        class="task-dispatch-btn-container"
        v-bind:style="DynamicStyle"
      >
        <el-popover
          @hide="HandleDispathDialogHidden"
          :show-arrow="false"
          :popper-style="order_info_style"
          :visible="order_info_visible"
          placement="right-start"
          width="555px"
        >
          <template #reference>
            <span></span>
          </template>
          <div class="w-100 h-100 order-info-container">
            <div class="grabable-region w-100 text-end border-bottom" style="height:15px;">
              <el-popover trigger="click" :width="153">
                <template #reference>
                  <i class="bi bi-three-dots cursor-pointer"></i>
                </template>
                <template #default>
                  <div class="d-flex">
                    <div class="mx-1" style="width:80px;">固定位置</div>
                    <i
                      class="bi bi-layout-sidebar-inset p-1 cursor-pointer"
                      v-bind:class="fixLoc=='left'?'bg-primary text-light':''"
                      @click="()=>{fixLoc='left'}"
                    ></i>
                    <i
                      class="bi bi-layout-sidebar-inset-reverse p-1 mx-2 cursor-pointer"
                      v-bind:class="fixLoc=='right'?'bg-primary text-light':''"
                      @click="()=>{fixLoc='right'}"
                    ></i>
                  </div>
                </template>
              </el-popover>
            </div>
            <el-row class="order-row">
              <el-col :span="6">
                <div class="item-name">{{ $t('Action') }}</div>
              </el-col>
              <el-col class="item-value" :span="11">{{ selected_action_display }}</el-col>
              <el-col class="item-actions" :span="7">
                <b-button
                  v-if="IsDeveloper"
                  size="sm"
                  variant="link"
                  @click="() => {
                    HandleCancelBtnClick();
                    action_menu_visible = true;
                    }"
                >{{ $t('Remove') }}</b-button>
              </el-col>
            </el-row>
            <!-- 選車 -->
            <el-row class="order-row" v-bind:style="agv_select_row_class">
              <el-col :span="6">
                <div class="item-name">{{ $t('Vehicle') }}</div>
              </el-col>
              <el-col class="item-value" :span="18">
                <el-select
                  :disabled="!IsDeveloper"
                  size="large"
                  class="w-100 px-1"
                  :placeholder="$t('select-vehicle')"
                  v-model="selected_agv"
                >
                  <el-option
                    v-for="obj in AgvNameList"
                    :key="obj.value"
                    :value="obj.value"
                    :label="obj.label"
                  ></el-option>
                </el-select>
              </el-col>
            </el-row>
            <!-- 選來源 -->
            <el-row
              v-if="selected_action == 'carry'"
              class="order-row"
              v-bind:style="source_select_row_class"
              @click="HandleSelectSoureStationFromMapBtnClick"
            >
              <el-col :span="6">
                <div class="item-name">{{ $t('source') }}</div>
              </el-col>
              <el-col class="item-value" :span="11">
                <el-select
                  class="w-100 px-1"
                  size="large"
                  :placeholder="$t('Choose_Sourse_from_Map')"
                  @change="HandleFromSelectChanged"
                  @click="HandleSelectSoureStationFromMapBtnClick"
                  v-model="selected_source.TagNumber"
                  filterable
                >
                  <template #header>
                    <el-button @click="HandleSelectSoureStationFromMapBtnClick" size="large">Refresh</el-button>
                  </template>
                  <el-option
                    v-for="tag in FromStationOptions"
                    :key="tag.tag+tag.name_display"
                    :label="tag.name_display"
                    :value="tag.tag"
                  >
                    <div
                      class="custom-options"
                      v-bind:class="tag.name_display && tag.name_display.includes('AGV')?'agv-option':''"
                    >{{tag.name_display}}</div>
                  </el-option>
                </el-select>
                <!-- {{ selected_source ? selected_source.Graph.Display : '' }} -->
              </el-col>
              <el-col class="item-actions" :span="7">
                <el-select
                  class="w-100"
                  v-if="selected_source.Graph && (IsSourceStationBuffer||IsSourceStationMultiLayers)"
                  size="large"
                  :placeholder="$t('Choose_Port')"
                  v-model="selected_source_slot"
                >
                  <div v-if="IsSourceStationMultiLayers">
                    <el-option
                      v-for="layer in GetLayersOfEquipment(selected_source.TagNumber)"
                      :key="selected_source.Graph.Display + '-' + layer.value"
                      :label="layer.label"
                      :value="layer.value"
                    ></el-option>
                  </div>
                  <div v-if="IsSourceStationBuffer">
                    <el-option
                      v-for="layer in GetLayersOfBuffer(selected_source.TagNumber)"
                      :key="selected_source.Graph.Display + '-' + layer.value"
                      :label="layer.label"
                      :value="layer.value"
                    ></el-option>
                  </div>
                </el-select>
              </el-col>
            </el-row>
            <!-- 選目的地 -->
            <el-row
              class="order-row"
              v-bind:style="destine_select_row_class"
              @click="HandleSelectDestineStationFromMapBtnClick"
            >
              <el-col :span="6">
                <div class="item-name">{{ $t('TaskDispathActionButton.Destine') }}</div>
              </el-col>
              <el-col class="item-value" :span="11">
                <el-select
                  class="w-100 px-1"
                  size="large"
                  filterable
                  :placeholder="$t('Choose_Dest_from_Map')"
                  @change="HandleDestineSelectChanged"
                  @click="HandleSelectDestineStationFromMapBtnClick"
                  v-model="selected_destine.TagNumber"
                >
                  <el-option
                    v-for="tag in downstream_options"
                    :key="tag.tag+GetGrpahDisplayByTag(tag.tag)"
                    :label="tag.name_display"
                    :value="tag.tag"
                  ></el-option>
                </el-select>
                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
              </el-col>
              <el-col class="item-actions" :span="7">
                <el-select
                  class="w-100 px-1"
                  v-if="selected_destine.Graph && (IsDestineStationBuffer||IsDestineStationMultiLayers)"
                  size="large"
                  :placeholder="$t('Choose_Port')"
                  v-model="selected_destine_slot"
                >
                  <div v-if="IsDestineStationMultiLayers">
                    <el-option
                      v-for="layer in GetLayersOfEquipment(selected_destine.TagNumber)"
                      :key="layer.label"
                      :label="layer.label"
                      :value="layer.value"
                    ></el-option>
                  </div>
                  <div v-if="IsDestineStationBuffer">
                    <el-option
                      v-for="layer in GetLayersOfBuffer(selected_destine.TagNumber)"
                      :key="layer.label"
                      :label="layer.label"
                      :value="layer.value"
                    ></el-option>
                  </div>
                </el-select>
              </el-col>
            </el-row>
            <!-- 是否轉運 -->
            <el-row class="order-row" v-if="IsDeveloper && selected_action == 'carry'">
              <el-col :span="6">
                <div class="item-name">{{ $t('Transport') }}</div>
              </el-col>
              <el-col class="item-value" :span="18">
                <el-checkbox v-model="IsTransferTaskNeedChangeAGV"></el-checkbox>
                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
              </el-col>
            </el-row>
            <!-- 選擇轉運站 -->
            <el-row
              class="order-row"
              v-bind:style="transfer_station_select_row_class"
              v-if="IsDeveloper && IsTransferTaskNeedChangeAGV"
              @click="HandleSelectTransferStationFromMapBtnClick"
            >
              <el-col :span="6">
                <div class="item-name">{{ $t('Transport_Port') }}</div>
              </el-col>
              <el-col class="item-value" :span="18">
                <el-select
                  :placeholder="$t('Choose_Transport_Port_from_Map')"
                  @change="HandleTransferStationSelectChanged"
                  @click="HandleSelectTransferStationFromMapBtnClick"
                  v-model="selected_transfer_station.TagNumber"
                >
                  <el-option
                    v-for="tag in BufferStations"
                    :key="tag.tag"
                    :label="tag.name_display"
                    :value="tag.tag"
                  ></el-option>
                </el-select>
                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
              </el-col>
              <el-col class="item-actions" :span="7">
                <!-- <b-button size="sm" variant="link" @click="HandleSelectDestineStationFromMapBtnClick">從地圖選取</b-button> -->
                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">列表選取</b-button> -->
              </el-col>
            </el-row>
            <!-- 選擇轉運車輛 -->
            <el-row class="order-row" v-if="IsTransferTaskNeedChangeAGV">
              <el-col :span="5">
                <div class="item-name">{{ $t('Vehicle') }}</div>
              </el-col>
              <el-col class="item-value" :span="18">
                <el-select
                  :placeholder="$t('select-vehicle')"
                  v-model="selected_transfer_to_destine_agv"
                >
                  <el-option
                    v-for="obj in AgvNameList"
                    :key="obj.value"
                    :value="obj.value"
                    :label="obj.label"
                  ></el-option>
                </el-select>
              </el-col>
              <!-- <el-col class="item-value" :span="18">{{ IsAutoSelectAGV ? '自動選車' : selected_agv }}</el-col> -->
              <el-col class="item-actions" :span="7">
                <!-- <b-button size="sm" variant="link" @click="HandleSelectAGVFromMapBtnClick">從地圖選取</b-button> -->
                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-agv'; is_reselecting_flag = true }">列表選取</b-button> -->
              </el-col>
            </el-row>
            <!-- bypass status check of order -->
            <el-row class="order-row" v-if="IsDeveloper">
              <el-col :span="6">
                <div class="item-name">Bypass EQ Check</div>
              </el-col>
              <el-col class="item-value" :span="18">
                <el-checkbox size="large" v-model="bypass_eq_status_check"></el-checkbox>
                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
              </el-col>
              <el-col class="item-actions" :span="7">
                <!-- <b-button size="sm" variant="link" @click="HandleSelectDestineStationFromMapBtnClick">從地圖選取</b-button> -->
                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">列表選取</b-button> -->
              </el-col>
            </el-row>
            <!-- //TODO 任務指派畫面操作Action Buttons -->
            <div class="action-buttons w-100 py-1 d-flex border-top" style="height: auto;">
              <!-- 確認派送 -->
              <b-button
                @click="HandleConfirmBtnClicked"
                class="mx-1"
                v-bind:class="IsOpLogining ? 'w-100' : 'w-50'"
                variant="primary"
              >{{ $t('TaskDispathActionButton.dispatch-confirm') }}</b-button>
              <!-- 重新選取來源 -->
              <b-button
                @click="HandleSelectSoureStationFromMapBtnClick"
                class="mx-1"
                v-bind:class="IsOpLogining ? 'w-100' : 'w-50'"
              >{{ $t('TaskDispathActionButton.clear-selected') }}</b-button>
              <!-- 返回選擇動作 -->
              <b-button
                v-if="IsDeveloper"
                class="w-50 mx-1"
                variant="light"
                @click="() => {
                                order_info_visible = false;
                                action_menu_visible = true;
                                HandleCancelBtnClick();
                            }"
              >{{ $t('TaskDispathActionButton.Back To Select Action') }}</b-button>
              <!-- 取消操作 -->
              <b-button
                v-if="!IsOpLogining"
                class="w-50 mx-1"
                variant="danger"
                @click="HandleCancelBtnClick"
              >{{ $t('Cancel') }}</b-button>
            </div>
          </div>
        </el-popover>
        <b-button
          v-if="!IsOpLogining"
          squared
          variant="primary"
          @click="HandleDispatchButtonClick"
        >{{ $t('Dispatch') }}</b-button>
      </div>
    </template>
    <div class="actions-btn-conatiner">
      <b-button
        class="w-100 my-1"
        variant="light"
        v-if="!IsRunMode || IsDeveloper"
        @click="SelectActionHandle('move')"
      >{{ $t('Move') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="light"
        v-if="!IsRunMode || IsDeveloper"
        @click="SelectActionHandle('park')"
      >{{ $t('Park') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="light"
        v-if="!IsRunMode || IsDeveloper"
        @click="SelectActionHandle('unload')"
      >{{ $t('Unload') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="light"
        v-if="!IsRunMode || IsDeveloper"
        @click="SelectActionHandle('load')"
      >{{ $t('Load') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="primary"
        @click="SelectActionHandle('carry')"
      >{{ $t('Transfer') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="warning"
        @click="SelectActionHandle('charge')"
      >{{ $t('Charge') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="warning"
        @click="SelectActionHandle('exchange_battery')"
      >{{ $t('Exchange Battery') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="warning"
        @click="SelectActionHandle('measure')"
      >{{ $t('Measure') }}</b-button>
      <b-button
        class="w-100 my-1"
        variant="danger"
        @click="() => { HandleCancelBtnClick(); action_menu_visible = false }"
      >{{ $t('Cancel') }}</b-button>
    </div>

    <el-dialog v-model="showFullEmptyContentSetting"></el-dialog>
  </el-popover>
</template>
<script>
import bus from '@/event-bus.js'
import Notifier from '@/api/NotifyHelper';
import { ElNotification } from 'element-plus'
import { StationSelectOptions } from '@/components/Map/mapjs';
import { TaskAllocation, clsMoveTaskData, clsMeasureTaskData, clsLoadTaskData, clsUnloadTaskData, clsCarryTaskData, clsExangeBatteryTaskData, clsChargeTaskData, clsParkTaskData } from '@/api/TaskAllocation'
import { userStore, agv_states_store, agvs_settings_store, EqStore } from '@/store';
import { SetToFullRackStatusByEqTag, SetToEmptyRackStatusByEqTag } from '@/api/EquipmentAPI'
import { MapStore } from '@/components/Map/store'
import { watch } from 'vue';
import { useRoute } from 'vue-router'
import EQStatusDIDto from '@/ViewModels/clsEQStates'
export default {
  data() {
    return {
      action_menu_visible: false,
      order_info_visible: false,
      isSelectTransferToDestinAGV: false,
      isDispatchConfirming: false,
      selected_action: '',
      selected_agv: '',
      selected_transfer_to_destine_agv: '',
      selected_source: {
        Graph: {
          Display: ''
        },
        StationType: 0,
      },
      selected_destine: {
        Graph: {
          Display: ''
        },
        StationType: 0,
      },
      selected_transfer_station: {
        Graph: {
          Display: ''
        },
        StationType: 0,
      },
      selected_source_slot: 0,
      selected_destine_slot: 0,
      Cst_ID_Input: '',
      order_info_style: {
        backgroundColor: 'rgba(255, 255, 255,.8)'
      },
      source_select_row_class: '',
      destine_select_row_class: '',
      transfer_station_select_row_class: '',
      agv_select_row_class: '',
      map_events_bus: {
        agv_selected: '/map/agv_selected',
        station_selected: '/map/station_selected'
      },
      bypass_eq_status_check: false,
      equipments_options: [new StationSelectOptions()],
      downstream_options: [new StationSelectOptions()],
      IsTransferTaskNeedChangeAGV: false,
      tagOfMiddleStationTagOfTransferTask: -1,
      routePath: '',
      showFullEmptyContentSetting: false,
      DynamicStyle: {
        right: '28px'
      },
      fixLoc: 'right',
      grabStates: {
        grabing: false,
        oriX: 0,
        oriY: 0,
        oriRightOffset: 28,
        newRightOffset: 28,
        updateKey: 0
      },
    }
  },
  computed: {
    IsRunMode() {
      return agvs_settings_store.getters.IsRunMode;
    },
    IsDeveloper() {
      return userStore.getters.IsDeveloperLogining;
    },
    IsOpLogining() {
      return userStore.getters.IsOPLogining;
    },
    AgvNameList() {
      var namelist = [];
      if (this.IsRunMode) {
        namelist.push({ value: '', label: this.$t('auto-choise-vehicle') });
        if (this.IsDeveloper)
          createdAgvNameOptions(namelist);
      }
      else {
        createdAgvNameOptions(namelist);
      }

      function createdAgvNameOptions(namelist) {
        agv_states_store.getters.AGVNameList.forEach(element => {
          namelist.push({
            value: element,
            label: element
          });
        });
      }
      return namelist.filter(item => item.label != undefined && item.value != undefined);
    },
    IsShowBackTo() {
      return this.current_progress != 'select-action'
    },
    selected_action_display() {
      var _action = this.selected_action;
      if (_action == 'move') {
        return this.$t('Move')
      }
      if (_action == 'unload') {
        return this.$t('Unload')
      }
      if (_action == 'load') {
        return this.$t('Load')
      }
      if (_action == 'carry') {
        return this.$t('Transfer')
      }
      if (_action == 'charge') {
        return this.$t('Charge')
      }
      if (_action == 'park') {
        return this.$t('Park')
      }
    },
    IsAutoSelectAGV() {
      return (this.selected_action == 'carry' || this.selected_action == 'unload') && this.selected_agv == '';
    },
    task_dispatch_btn_pushable() {

      var _isagvSelected = this.IsAutoSelectAGV ? true : this.selected_agv != '';
      var _isSourceSelected = this.selected_source != undefined && this.selected_source.TagNumber != undefined;
      var _isDestineSelected = this.selected_destine != undefined && this.selected_destine.TagNumber != undefined;
      if (this.selected_action == 'carry')
        return _isagvSelected && _isSourceSelected && _isDestineSelected;
      else
        return _isagvSelected && _isDestineSelected;
    },
    /**包含主設備與WIP */
    EQStations() {
      return MapStore.getters.AllEqStation
    },
    BufferStations() {
      return MapStore.getters.AllBufferStationOptions;
    },
    bay_names() {

      var bay_data = MapStore.getters.BaysData;
      return Object.keys(bay_data).map(bay_name => ({
        tag: bay_name,
        name: bay_name
      }))

    },
    FromStationOptions() {
      var _agvList = agv_states_store.getters.AGVNameList;
      var _agvOptions = _agvList.length == 0 ? [] : _agvList.map(name => {
        return {
          tag: name,
          name_display: name
        }
      })

      var eqOptions = [new StationSelectOptions()];
      Object.assign(eqOptions, this.EQStations);

      if (this.IsDeveloper) {
        return [..._agvOptions, ...eqOptions]
      }

      var eqStatusDtoCollection = [new EQStatusDIDto()];
      Object.assign(eqStatusDtoCollection, EqStore.getters.EQData);
      var unloadableEqList = eqStatusDtoCollection.filter(eq => eq.Unload_Request);
      var unloadableTags = unloadableEqList.map(eq => eq.Tag);
      var unloadableOptions = eqOptions.filter(opt => unloadableTags.includes(opt.tag));

      var _stations = [..._agvOptions, ...this.BufferStations, ...unloadableOptions];
      return _stations;
    },
    IsSourceStationBuffer() {
      return this.selected_source.StationType == 4 || this.selected_source.StationType == 41 || this.selected_source.StationType == 5;
    },
    IsDestineStationBuffer() {
      return this.selected_destine.StationType == 4 || this.selected_destine.StationType == 41 || this.selected_destine.StationType == 5;
    },
    IsSourceStationMultiLayers() {
      try {

        if (!this.selected_source.TagNumber)
          return false;
        var options = this.TryGetMultiLayersOfEqTag(this.selected_source.TagNumber)
        return options.length > 1;
      } catch (error) {
        return false;
      }
    },
    IsDestineStationMultiLayers() {
      try {

        if (!this.selected_destine.TagNumber)
          return false;
        var options = this.TryGetMultiLayersOfEqTag(this.selected_destine.TagNumber)
        return options.length > 1;
      } catch (error) {
        return false;
      }
    },
    TaskDispatchFailString() {
      //return by i18n current language
      return this.$t('TaskDispatchFailString')
    }

  },
  methods: {
    HandleDispatchButtonClick() {

      if (!this.IsDeveloper) {
        this.SelectActionHandle('carry');
        return;
      }
      // $emit('on-click');
      if (this.action_menu_visible) {
        this.action_menu_visible = false;
      }
      else if (!this.order_info_visible)
        this.action_menu_visible = true
    },
    SelectActionHandle(action) {
      this.$emit('onTaskDispatch')
      bus.emit('/cancel_tracking_agv', '');
      this.selected_action = action;
      this.HandleActionSelected(action);
      this.action_menu_visible = this.IsTransferTaskNeedChangeAGV = false;
      this.order_info_visible = true;
      this.selected_source = this.selected_destine = {
        TagNumber: undefined
      };
      if (action == 'carry' || action == 'unload') {

        this.selected_agv = '';
        if (action == 'carry') {
          this.HandleSelectSoureStationFromMapBtnClick();
        } else {
          this.HandleSelectDestineStationFromMapBtnClick();
        }
      }
      else {
        this.selected_agv = this.AgvNameList[0].label
        this.HandleSelectAGVFromMapBtnClick();
        console.log(this.selected_agv)
      }
    },
    HandleDispathDialogHidden(evt) {
      if (this.isDispatchConfirming)
        return;
      setTimeout(() => {
        this.HandleCancelBtnClick();
      }, 300);
    },
    HandleActionSelected(action) {
      this.source_select_row_class =
        this.destine_select_row_class =
        this.transfer_station_select_row_class =
        this.agv_select_row_class = '';
      var selectedStyle = {
        backgroundColor: 'rgb(13, 110, 253)',
        color: 'white',
        borderRadius: '1px solid black'
      }
      if (action == 'select-agv')
        this.agv_select_row_class = selectedStyle;

      if (action == 'select-source')
        this.source_select_row_class = selectedStyle;

      if (action == 'select-destine')
        this.destine_select_row_class = selectedStyle;

      if (action == 'select-transfer-station')
        this.transfer_station_select_row_class = selectedStyle;
    },
    HandleAGVSelected(agv) {
      console.log(agv)
      if (this.isSelectTransferToDestinAGV)
        this.selected_transfer_to_destine_agv = agv
      else
        this.selected_agv = agv
    },
    HandleSelectAGVFromMapBtnClick(isTransferToDestineAGV = false) {
      this.isSelectTransferToDestinAGV = isTransferToDestineAGV;
      if (!isTransferToDestineAGV)
        this.HandleActionSelected("select-agv");
      bus.off(this.map_events_bus.agv_selected)
      bus.off(this.map_events_bus.station_selected)
      bus.emit('change_to_select_agv_mode');
      this.current_progress = 'select-agv';
      this.is_reselecting_flag = true;
      bus.on(this.map_events_bus.agv_selected, (agv_name) => {

        console.log(agv_name)
        if (isTransferToDestineAGV)
          this.selected_transfer_to_destine_agv = agv_name;
        else {

          this.selected_agv = agv_name;

          if (this.selected_action == 'carry' && (!this.selected_source.Graph || this.selected_source.Graph.Display == '')) {
            this.HandleSelectSoureStationFromMapBtnClick();
            this.HandleActionSelected('select-source')
          } else if (!this.selected_destine.Graph || this.selected_destine.Graph.Display == '') {
            this.HandleSelectDestineStationFromMapBtnClick();
            this.HandleActionSelected('select-destine')
          }
        }

      })

    },
    HandleSelectTransferStationFromMapBtnClick() {
      this.HandleActionSelected('select-transfer-station');
      bus.off(this.map_events_bus.agv_selected)
      bus.off(this.map_events_bus.station_selected)

      var _destine_options = this.GetDownStreamEQOptions(this.selected_source.TagNumber);

      console.info('_destine_options:', _destine_options);
      let map_options = {
        action_type: this.selected_action,
        direction: 'buffer',
        stations_to_show: this.BufferStations
      }
      bus.emit('change_to_select_eq_station_mode', map_options);
      this.current_progress = 'select-transfer-station';
      this.is_reselecting_flag = true;
      bus.on(this.map_events_bus.station_selected, (_station_data) => {

        console.info(_station_data);
        if (_station_data.StationType != 4)
          return;

        bus.emit('mark_as_transfer_station', _station_data.TagNumber);
        this.selected_transfer_station = _station_data;
        this.tagOfMiddleStationTagOfTransferTask = _station_data.TagNumber
      })
    },
    HandleSelectSoureStationFromMapBtnClick() {
      this.selected_agv = '';
      this.selected_source = {
        Graph: {
          Display: ''
        }
      };
      this.HandleActionSelected("select-source");
      bus.off(this.map_events_bus.agv_selected)
      bus.off(this.map_events_bus.station_selected)

      bus.emit('change_to_select_eq_station_mode', { action_type: this.selected_action, direction: 'source', stations_to_show: this.FromStationOptions });

      this.current_progress = 'select-source';
      this.is_reselecting_flag = false;

      this.selected_destine = {
        Graph: {
          Display: ''
        }
      };

      bus.on(this.map_events_bus.station_selected, (_station_data) => {
        const isAGVSelected = _station_data.isAGV;
        const isBuffer = _station_data.StationType == 4 || _station_data.StationType == 5 || _station_data.StationType == 41
        if (_station_data.IsEquipment || isBuffer || isAGVSelected) {

          if (isAGVSelected) {
            this.HandleFromSelectChanged(_station_data.agvName);

            bus.emit('mark_as_start_station', this.selected_source);
            //TODO 10/21 bug fix test
            this.HandleSelectDestineStationFromMapBtnClick();
            this.HandleActionSelected('select-destine')

            //   setTimeout(() => {
            //   bus.emit('mark_as_start_station', this.selected_source);
            //   this.HandleSelectDestineStationFromMapBtnClick();
            //   this.HandleActionSelected('select-destine')
            // }, 100);
            return;
          }
          if (_station_data == this.selected_destine)
            return;

          console.log(_station_data);

          var isSelectdNotInOptions = this.FromStationOptions.findIndex(option => option.tag == _station_data.TagNumber) == -1;

          if (isSelectdNotInOptions)
            return;

          this.selected_source = _station_data;//TODO check bug
          this.HandleFromSelectChanged(this.selected_source.TagNumber);

          //TODO 10/21 bug fix test
          bus.emit('mark_as_start_station', this.selected_source.TagNumber);
          this.HandleSelectDestineStationFromMapBtnClick();
          this.HandleActionSelected('select-destine')

          // setTimeout(() => {
          //   bus.emit('mark_as_start_station', this.selected_source.TagNumber);
          //   this.HandleSelectDestineStationFromMapBtnClick();
          //   this.HandleActionSelected('select-destine')
          // }, 200);
        }
      })
    },
    HandleSelectDestineStationFromMapBtnClick() {
      this.HandleActionSelected("select-destine");
      bus.off(this.map_events_bus.agv_selected)
      bus.off(this.map_events_bus.station_selected)
      if (this.selected_action == 'load' || this.selected_action == 'unload') {
        this.downstream_options = this.EQStations;
      }
      if (this.selected_action == 'move') {
        this.downstream_options = MapStore.getters.AllNormalStationOptions;
      }
      if (this.selected_action == 'park') {
        this.downstream_options = MapStore.getters.AllParkableStationOptions;
      }
      if (this.selected_action == 'charge') {
        this.downstream_options = MapStore.getters.AllChargeStation;
      }
      var _destine_options = this.downstream_options

      if (this.IsSourceStationBuffer) {
        _destine_options = [..._destine_options, this.BufferStations]
      }
      console.info('_destine_options:', _destine_options);
      let map_options = {
        action_type: this.selected_action,
        direction: 'destine',
        stations_to_show: _destine_options
      }
      bus.emit('change_to_select_eq_station_mode', map_options);
      this.current_progress = 'select-destine';
      this.is_reselecting_flag = true;
      bus.on(this.map_events_bus.station_selected, (_station_data) => {
        console.info(_station_data);
        if (this.selected_action == 'move' && (_station_data.StationType != 0 || _station_data.IsVirtualPoint))
          return;
        if (this.selected_action == 'charge' && !_station_data.IsCharge)
          return;
        if ((this.selected_action == 'load' || this.selected_action == 'unload' || this.selected_action == 'carry') && (!_station_data.IsEquipment && _station_data.StationType != 4))
          return;
        if (this.selected_action == 'carry') {
          if (_station_data == this.selected_source)
            return;
          if (!this.downstream_options.some(st => st.tag == _station_data.TagNumber))
            return
        }

        var isSelectdNotInOptions = this.downstream_options.findIndex(option => option.tag == _station_data.TagNumber) == -1;
        if (isSelectdNotInOptions)
          return;

        bus.emit('mark_as_destine_station', _station_data.TagNumber);
        this.selected_destine = _station_data;
      })
    },
    async HandleDestineSelectChanged(tag) {
      // alert(tag)
      this.selected_destine = await MapStore.dispatch('GetMapPointByTag', tag)
    },

    HandleCancelBtnClick() {

      if (this.IsOpLogining)
        return;

      bus.off(this.map_events_bus.agv_selected)
      bus.off(this.map_events_bus.station_selected)
      this.order_info_visible = false;
      this.selected_source = this.selected_destine = { Graph: { Display: '' } };
      this.source_select_row_class = this.destine_select_row_class = this.agv_select_row_class = this.transfer_station_select_row_class = '';
      bus.emit('change_to_normal_view_mode');
      console.info('HandleCancelBtnClick-change_to_normal_view_mode end');

    },
    HandleConfirmBtnClicked() {
      this.isDispatchConfirming = true;
      this.order_info_visible = false;

      if (this.selected_action == 'carry' && (!this.selected_source || !this.selected_source.Graph || this.selected_source.Graph.Display == '') && !this.selected_source.isAGV) {
        this.$swal.fire(
          {
            icon: 'error',
            html: '<div><div>請選擇來源</div><div>Please Select Source Equipment</div></div>',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        this.order_info_visible = true;
        return;
      }

      if (!this.selected_destine || !this.selected_destine.Graph || this.selected_destine.Graph.Display == '') {
        this.$swal.fire(
          {
            html: '<div><div>請選擇目的地</div><div>Please Select Destine</div></div>',
            icon: 'error',
            showCancelButton: false,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert'
          })
        this.order_info_visible = true;
        return;
      }


      var createOrderDescription = () => {
        var html = '<div class="swal-transfer-info border-top py-2">';
        html += `<div> <label>${this.$t('Action')}</label> <span>${this.selected_action_display}</span> </div>`
        if (this.selected_action == 'carry') {
          var sourceDisplay = ""
          if (this.selected_source.isAGV) {
            sourceDisplay = this.selected_source.agvName;
          } else {
            sourceDisplay = this.selected_source.Graph.Display;
          }
          html += `
              <div> <label>${this.$t('source')} </label> <span>${sourceDisplay}</span> </div>
              <div> <label>${this.$t('TaskDispathActionButton.Destine')}</label> <span>${this.selected_destine.Graph.Display}</span></div>`
        } else {
          html += ` <div> <label>${this.$t('TaskDispathActionButton.Destine')}</label> <span>${this.selected_destine.Graph.Display}</span></div>`;
        }
        html += `</div>`;
        return html;
      }

      this.$swal.fire(
        {
          title: this.$t('TaskDispatchNewUI.ConfirmDispatchText'),
          icon: 'question',
          html: createOrderDescription(),
          showCancelButton: true,
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),

        }).then(res => {
          if (res.isConfirmed) {
            this.TaskDeliveryHandle()
            if (this.IsOpLogining) {
              this.order_info_visible = true;
            }
          }
          else {
            this.order_info_visible = true;
          }
          this.isDispatchConfirming = false;
        })
    },
    HandleTransferStationSelectChanged(tag) {
      this.tagOfMiddleStationTagOfTransferTask = tag
      console.warn(tag)
    },
    async TaskDeliveryHandle() {
      // TaskAllocation.Task();

      // if (this.IsDeveloper) {
      //     this.bypass_eq_status_check = true;
      // } else
      //     if (userStore.getters.level == 0)
      //         this.bypass_eq_status_check = false;

      var response = { confirm: true, message: '' }
      console.info('Final', this.selected_destine);
      var _sourceTag = this.selected_source ? this.selected_source.TagNumber : -1;
      var _destinTag = this.selected_destine ? this.selected_destine.TagNumber : -1;
      //   var _selected_agv = this.selected_agv == this.$t('auto-choise-vehicle') || this.selected_agv == '' ? '' : this.selected_agv;
      var _selected_agv = this.selected_agv;

      this.selected_source_slot = !this.IsSourceStationBuffer && !this.IsSourceStationMultiLayers ? 0 : this.selected_source_slot;
      this.selected_destine_slot = !this.IsDestineStationBuffer && !this.IsDestineStationMultiLayers ? 0 : this.selected_destine_slot;

      if (this.selected_action == 'move') {
        response = await TaskAllocation.MoveTask(new clsMoveTaskData(_selected_agv, _destinTag, 50));
      }

      if (this.selected_action == 'measure') {
        response = await TaskAllocation.MeasureTask(new clsMeasureTaskData(_selected_agv, _destinTag));
      }
      if (this.selected_action == 'load') {
        response = await TaskAllocation.LoadTask(new clsLoadTaskData(_selected_agv, _destinTag, this.selected_destine_slot, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
      }

      if (this.selected_action == 'unload') {
        response = await TaskAllocation.UnloadTask(new clsUnloadTaskData(_selected_agv, _destinTag, this.selected_destine_slot, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
      }

      if (this.selected_action == 'carry') {
        response = await TaskAllocation.CarryTask(new clsCarryTaskData(_selected_agv, _sourceTag, this.selected_source_slot, _destinTag, this.selected_destine_slot, this.Cst_ID_Input, 50, this.bypass_eq_status_check, this.IsTransferTaskNeedChangeAGV, this.tagOfMiddleStationTagOfTransferTask, this.selected_transfer_to_destine_agv));
      }
      if (this.selected_action == 'exchange_battery') {
        response = await TaskAllocation.ExangeBatteryTask(new clsExangeBatteryTaskData(_selected_agv, _destinTag, 50, this.bypass_eq_status_check));
      }
      if (this.selected_action == 'charge') {
        response = await TaskAllocation.ChargeTask(new clsChargeTaskData(_selected_agv, _destinTag, 50, this.bypass_eq_status_check));
      }
      if (this.selected_action == 'park') {
        response = await TaskAllocation.ParkTask(new clsParkTaskData(_selected_agv, _destinTag, 50, this.bypass_eq_status_check));
      }
      if (response.status != 200) {

        if (!this.IsOpLogining) {
          this.HandleCancelBtnClick();
        }
        const is_Unauthorized = response.status == 401;
        setTimeout(() => {
          this.$swal.fire({
            title: is_Unauthorized ? '須重新進行登入' : this.TaskDispatchFailString,
            text: is_Unauthorized ? '' : response.mesage,
            icon: 'error',
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: 'OK',
            customClass: 'my-sweetalert',
          }).then(res => {

            this.HandleCancelBtnClick();
            if (is_Unauthorized) {
              userStore.dispatch('logout', '')
              bus.emit('/show-login-view-invoke')

            }
          })
          if (this.IsOpLogining) {

            this.HandleSelectSoureStationFromMapBtnClick();
          }
        }, 200);

      }
      else {
        //{confirm:true,message:''}
        const showEmptyOrFullContentCheck = response.data.showEmptyOrFullContentCheck;

        if (response.data.confirm) {
          this.HandleCancelBtnClick();
          ElNotification.success({
            message: `任務-[${this.selected_action_display}] 已派送!`,
            position: 'top-right',
            duration: 3000
          })
        } else {
          if (!showEmptyOrFullContentCheck)
            this.HandleCancelBtnClick();

          setTimeout(() => {
            if (showEmptyOrFullContentCheck) {
              this.$swal.fire(
                {
                  text: response.data.message,
                  title: this.TaskDispatchFailString,
                  icon: 'error',
                  showCancelButton: true,
                  confirmButtonText: '設定空/實框',
                  cancelButtonText: 'OK',
                  customClass: 'my-sweetalert'
                }).then(async (res) => {
                  if (res.isConfirmed) {
                    var eqTag = this.selected_action == 'carry' ? _sourceTag : _destinTag;
                    var mapPoint = Object.values(MapStore.state.MapData.Points).find(pt => pt.TagNumber == eqTag);
                    const inputOptions = new Promise((resolve) => {
                      setTimeout(() => {
                        resolve({
                          "empty": "空框",
                          "full": "實框",
                        });
                      }, 100);
                    });

                    var choised = false;
                    const { value: contentStatus } = await this.$swal.fire(
                      {
                        text: '',
                        title: `${mapPoint.Graph.Display}(Tag=${eqTag}) - 空框/實框設定`,
                        icon: 'question',
                        input: "radio",
                        inputOptions,
                        inputValidator: (value) => {
                          if (!value) {
                            return "請選擇空框或實框";
                          }
                        },
                        confirmButtonText: '重新派送任務',
                        customClass: 'my-sweetalert'
                      })
                    if (contentStatus) {
                      if (contentStatus == 'full') {
                        await SetToFullRackStatusByEqTag(eqTag, true);
                        await SetToEmptyRackStatusByEqTag(eqTag, false);
                      }
                      else {
                        await SetToFullRackStatusByEqTag(eqTag, false);
                        await SetToEmptyRackStatusByEqTag(eqTag, true);
                      }
                      setTimeout(() => {
                        this.TaskDeliveryHandle();
                      }, 500);
                    }

                  }
                })
            } else {

              this.$swal.fire(
                {
                  title: this.TaskDispatchFailString,
                  html: `<div class="text-danger"> <div>${response.data.message}</div><div class="my-2">${response.data.message_en}</div></div>`,
                  icon: 'error',
                  showCancelButton: false,
                  focusConfirmButton: false,
                  confirmButtonText: 'OK',
                  customClass: 'my-sweetalert'
                })
            }
          }, 200);


        }
        if (this.IsOpLogining && !showEmptyOrFullContentCheck) {

          this.HandleSelectSoureStationFromMapBtnClick();
        }
      }

    },
    async HandleFromSelectChanged(source_tag) {
      console.log('HandleFromSelectChanged selected tag:', source_tag)
      this.selected_destine = { TagNumber: undefined }
      var isSourceAGV = false;

      try {
        isSourceAGV = source_tag.includes('AGV');
      } catch (error) {

      }
      if (isSourceAGV) {
        //若是選擇 AGV 比如AGV_001 ..
        var agvName = source_tag;
        this.selected_source = {
          isAGV: true,
          agvName: agvName,
          TagNumber: agvName
        }
        this.selected_agv = agvName;
        this.downstream_options = this.GetDownStreamEQOptions(this.selected_source);

      } else {
        this.selected_source = await MapStore.dispatch('GetMapPointByTag', source_tag)//TODO Maybe bugs from there
        this.downstream_options = this.GetDownStreamEQOptions(source_tag);
        console.log('validable downstream of ', source_tag, this.downstream_options)
      }
    },
    GetDownStreamEQOptions(sourceTag) {

      var _results = [];
      var isSourceIsAGV = sourceTag.isAGV;
      var isBufferSource = this.BufferStations.find(bf => bf.tag == sourceTag);
      var _eq_options = EqStore.getters.EqOptions;
      var source_eq = _eq_options.find(eq => eq.TagID == sourceTag)
      if (source_eq || isBufferSource || isSourceIsAGV) {
        if (isBufferSource || isSourceIsAGV) {

          //TODO BUFFER Select Downstream
          var eqStatusDtoCollection = [new EQStatusDIDto()];
          Object.assign(eqStatusDtoCollection, EqStore.getters.EQData);
          var loadableEqList = eqStatusDtoCollection.filter(eq => eq.Load_Request);
          var loadableTags = loadableEqList.map(eq => eq.Tag);
          console.log(loadableTags);
          Object.values(_eq_options).filter(element => loadableTags.includes(element.TagID))
            .forEach(element => {
              _results.push({
                tag: element.TagID,
                name: `${element.Name}(Tag=${element.TagID})`,
                name_display: element.Name
              })
            });

        } else {

          var downstream_eq_names = source_eq.ValidDownStreamEndPointNames
          var isAllEqIsSelectable = downstream_eq_names.includes('ALL')
          var downstread_eq_options = isAllEqIsSelectable ? _eq_options : _eq_options.filter(eq => downstream_eq_names.includes(eq.Name))

          Object.values(downstread_eq_options).forEach(element => {
            _results.push({
              tag: element.TagID,
              name: `${element.Name}(Tag=${element.TagID})`,
              name_display: element.Name
            })
          });
          //加入WIP為下游設備
        }
        _results = [..._results, ...this.BufferStations]
      }
      return _results;

    },
    GetLayersOfBuffer(tag) {
      const rows = EqStore.getters.GetRowsByStationTag(tag);
      const options = [];
      for (let index = 0; index < rows; index++) {
        options.push({
          label: `第${index + 1}層`,
          value: index
        })
      }
      return options;

    },
    GetLayersOfEquipment(tag) {
      var optionsGet = this.TryGetMultiLayersOfEqTag(tag);
      console.warn(optionsGet)
      var options = [];
      optionsGet.forEach(opt => {
        var heightIndex = opt.Height;
        options.push({
          label: `第${heightIndex + 1}層(${opt.Name})`,
          value: heightIndex
        })
      });

      return options;
    },
    DetermineDestinOptions() {
      if (this.selected_action == 'measure')
        return this.bay_names;
      else if (this.selected_action == 'move')
        return MapStore.getters.AllNormalStationOptions;
      else if (this.selected_action == 'park')
        return MapStore.getters.AllParkingStationOptions;
      else if (this.IsSourceStationBuffer || this.selected_action == 'load' || this.selected_action == 'unload')
        return [...this.BufferStations, ...this.EQStations];
      else if (this.selected_action == 'charge')
        return MapStore.getters.AllChargeStation;
      else if (this.selected_action == 'carry') {

        if (this.IsDeveloper) {
          return this.downstream_options;
        }
        var eqStatusDtoCollection = [new EQStatusDIDto()];
        Object.assign(eqStatusDtoCollection, EqStore.getters.EQData);
        var loadableEqList = eqStatusDtoCollection.filter(eq => eq.Load_Request);
        var loadableTags = loadableEqList.map(eq => eq.Tag);

        //把WIP Tags 加入
        var wipTags = this.BufferStations.map(opt => opt.tag);
        loadableTags = [...loadableTags, ...wipTags]


        var loadableOptions = this.downstream_options.filter(opt => loadableTags.includes(opt.tag));
        return loadableOptions;
      }
      else if (this.selected_action == 'exchange_battery')
        return MapStore.getters.AllExangeBatteryStation;
      else
        return [];

    },
    TryGetMultiLayersOfEqTag(tagNumber) {

      try {

        let eqOptions = EqStore.state.EqOptions;
        var optionsSelected = eqOptions.filter(opt => opt.TagID == tagNumber);
        var secondLayerEqOpt = optionsSelected.find(opt => opt.Height == 1);
        console.log(optionsSelected)
        if (!secondLayerEqOpt) {
          return optionsSelected[0]
        } else {
          return optionsSelected;
        }
      } catch (error) {
        return [];
      }
    },
    GetGrpahDisplayByTag(tagNumber) {
      try {
        var mapPoint = Object.values(MapStore.state.MapData.Points).find(mpt => mpt.TagNumber == tagNumber);
        if (mapPoint)
          return mapPoint.Graph.Display;
        else {
          return tagNumber + '';
        }
      } catch (error) {
        return '';
      }
    },
    ShowAtRight() {
      this.fixLoc = 'right'
    },
    ShowAtLeft() {
      this.fixLoc = 'left'
    },
    HandleMouseMoveWhenGrabing(event = MouseEvent) {
      console.log(event)
      if (this.grabStates.grabing) {
        var offsetToOriX = event.screenX - this.grabStates.oriX;
        var offsetToOriY = event.screenY - this.grabStates.oriY;
        console.log(offsetToOriX)
        this.grabStates.newRightOffset = this.grabStates.oriRightOffset - offsetToOriX;
        this.DynamicStyle = {
          right: this.grabStates.newRightOffset + 'px'
        }
      }
    }
  },
  mounted() {
    this.routePath = this.$route.path;
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        if (newValue != this.routePath) {
          this.HandleCancelBtnClick();
          this.order_info_visible = false;
        } else {
          //location.reload();
          //this.order_info_visible = true;
          this.grabStates.updateKey = Date.now();
          if (this.IsOpLogining)
            this.order_info_visible = true;
          // this.SelectActionHandle('carry');
        }
      }
    )
    setTimeout(() => {
      if (this.IsOpLogining) {
        this.HandleDispatchButtonClick();
        setTimeout(() => {
          this.HandleSelectSoureStationFromMapBtnClick();
        }, 1000);
      }
    }, 3000);

  },
  watch: {
    fixLoc(loc) {
      if (loc == 'left') {
        this.DynamicStyle = {
        }
        this.grabStates.updateKey++;
      } else if (loc == 'right') {
        this.DynamicStyle = {
          right: '28px'
        }
        this.grabStates.oriRightOffset = this.grabStates.newRightOffset = 28;
        this.grabStates.updateKey++;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.el-select .el-input__inner) {
  font-size: 21px !important;
  color: "rgb(13, 110, 253)";
}
.action-buttons {
  margin-top: 1.3rem;
  button {
    font-size: 22px;
    height: 60px;
    font-weight: bold;
    letter-spacing: 2px;
  }
}
.task-dispatch-btn-container {
  position: fixed;
  bottom: 40px;
  z-index: 10;

  button {
    font-size: 30px;
  }

  box-shadow: 4px -1px 14px 1px rgb(61, 61, 61);

  .grabable-region {
  }
  .grabable-region:active {
    cursor: grabbing;
  }
}
.custom-options,
.agv-option {
  width: 100%;
  font-size: 23px;
  font-weight: bold;
}
.agv-option {
  color: rgb(13, 110, 253);
}
.order-row {
  height: 53px;
  margin: 2px auto;
  //background-color: whitesmoke;
  font-size: 15px;
  padding-left: 12px;
  padding-top: 7px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;

  .item-name {
    font-size: 22px;
  }

  .item-value {
    color: rgb(13, 110, 253);
    font-size: 20px;

    input {
      color: rgb(13, 110, 253);
    }
  }

  .item-actions {
    text-align: right;

    button {
      margin: auto 2px;
    }
  }
}

.order-row:hover {
  background-color: rgb(235, 235, 235);
}

.selected-div {
  background-color: "pink";
}

.order-info-container {
  .el-row {
    margin-top: 10px;
  }
}
</style>