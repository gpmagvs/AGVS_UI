<template>
    <el-popover
        placement="right"
        :visible="action_menu_visible && !order_info_visible"
        :width="200"
        effect="dark"
        content="">
        <template #reference>
            <div class="task-dispatch-btn-container">
                <el-popover :show-arrow="false" :popper-style="order_info_style" :visible="order_info_visible" placement="right-start" :width="435">
                    <template #reference>
                        <span></span>
                    </template>
                    <div class="w-100 h-100">
                        <div class="w-100 bg-info d-flex">
                        </div>
                        <el-row class="order-row">
                            <el-col :span="5">
                                <div class="item-name">動作</div>
                            </el-col>
                            <el-col class="item-value" :span="12">{{ selected_action_display }}</el-col>
                            <el-col class="item-actions" :span="7">
                                <b-button size="sm" variant="link" @click="() => {
                                    HandleCancelBtnClick();
                                    action_menu_visible = true;
                                }">重新選取</b-button></el-col>
                        </el-row>
                        <el-row class="order-row" v-bind:style="agv_select_row_class">
                            <el-col :span="5">
                                <div class="item-name">車輛</div>
                            </el-col>
                            <el-col class="item-value" :span="12">
                                <el-select placeholder="選擇車輛" size="large" v-model="selected_agv">
                                    <el-option v-for="obj in AgvNameList" :key="obj.value" :value="obj.value" :label="obj.label"></el-option>
                                </el-select>
                            </el-col>
                            <!-- <el-col class="item-value" :span="12">{{ IsAutoSelectAGV ? '自動選車' : selected_agv }}</el-col> -->
                            <el-col class="item-actions" :span="7">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectAGVFromMapBtnClick">從地圖選取</b-button> -->
                                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-agv'; is_reselecting_flag = true }">列表選取</b-button> -->
                            </el-col>
                        </el-row>
                        <el-row v-if="selected_action == 'carry'" class="order-row" v-bind:style="source_select_row_class" @click="HandleSelectSoureStationFromMapBtnClick">
                            <el-col :span="5">
                                <div class="item-name">來源</div>
                            </el-col>
                            <el-col class="item-value" :span="12">
                                <el-select placeholder="從地圖或選單選擇來源" @change="HandleFromSelectChanged" @click="HandleSelectSoureStationFromMapBtnClick" size="large" v-model="selected_source.TagNumber">
                                    <el-option v-for="tag in FromStationOptions" :key="tag.tag" :label="tag.name_display" :value="tag.tag"></el-option>
                                </el-select>
                                <!-- {{ selected_source ? selected_source.Graph.Display : '' }} -->
                            </el-col>
                            <el-col class="item-actions" :span="7">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectSoureStationFromMapBtnClick">從地圖選取</b-button> -->
                                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-source'; is_reselecting_flag = false }">列表選取</b-button> -->
                            </el-col>
                        </el-row>
                        <el-row class="order-row" v-bind:style="destine_select_row_class" @click="HandleSelectDestineStationFromMapBtnClick">
                            <el-col :span="5">
                                <div class="item-name">目的地</div>
                            </el-col>
                            <el-col class="item-value" :span="12">
                                <el-select placeholder="從地圖或選單選擇目的地" @change="HandleDestineSelectChanged" @click="HandleSelectDestineStationFromMapBtnClick" size="large" v-model="selected_destine.TagNumber">
                                    <el-option v-for="tag in DetermineDestinOptions()" :key="tag.tag" :label="tag.name_display" :value="tag.tag"></el-option>
                                </el-select>
                                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
                            </el-col>
                            <el-col class="item-actions" :span="7">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectDestineStationFromMapBtnClick">從地圖選取</b-button> -->
                                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">列表選取</b-button> -->
                            </el-col>
                        </el-row>
                        <el-row class="order-row" v-if="IsDeveloper && selected_action == 'carry'">
                            <el-col :span="5">
                                <div class="item-name">轉運</div>
                            </el-col>
                            <el-col class="item-value" :span="12">
                                <el-checkbox v-model="IsTransferTaskNeedChangeAGV"></el-checkbox>
                                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
                            </el-col>
                            <el-col class="item-actions" :span="7">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectDestineStationFromMapBtnClick">從地圖選取</b-button> -->
                                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">列表選取</b-button> -->
                            </el-col>
                        </el-row>
                        <el-row class="order-row" v-bind:style="transfer_station_select_row_class" v-if="IsDeveloper && IsTransferTaskNeedChangeAGV" @click="HandleSelectTransferStationFromMapBtnClick">
                            <el-col :span="5">
                                <div class="item-name">轉運站</div>
                            </el-col>
                            <el-col class="item-value" :span="12">
                                <el-select placeholder="從地圖或選單選擇轉運站" @change="HandleTransferStationSelectChanged" @click="HandleSelectTransferStationFromMapBtnClick" size="large" v-model="selected_transfer_station.TagNumber">
                                    <el-option v-for="tag in BufferStations" :key="tag.tag" :label="tag.name_display" :value="tag.tag"></el-option>
                                </el-select>
                                <!-- {{ selected_destine ? selected_destine.Graph.Display : '' }} -->
                            </el-col>
                            <el-col class="item-actions" :span="7">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectDestineStationFromMapBtnClick">從地圖選取</b-button> -->
                                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">列表選取</b-button> -->
                            </el-col>
                        </el-row>
                        <el-row class="order-row" v-if="IsTransferTaskNeedChangeAGV">
                            <el-col :span="5">
                                <div class="item-name">車輛</div>
                            </el-col>
                            <el-col class="item-value" :span="12">
                                <el-select placeholder="選擇車輛" size="large" v-model="selected_transfer_to_destine_agv">
                                    <el-option v-for="obj in AgvNameList" :key="obj.value" :value="obj.value" :label="obj.label"></el-option>
                                </el-select>
                            </el-col>
                            <!-- <el-col class="item-value" :span="12">{{ IsAutoSelectAGV ? '自動選車' : selected_agv }}</el-col> -->
                            <el-col class="item-actions" :span="7">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectAGVFromMapBtnClick">從地圖選取</b-button> -->
                                <!-- <b-button size="sm" variant="link" @click="() => { current_progress = 'select-agv'; is_reselecting_flag = true }">列表選取</b-button> -->
                            </el-col>
                        </el-row>
                        <div class="w-100 py-1 d-flex border-top" style="height: 50px;">
                            <b-button @click="HandleConfirmBtnClicked" class="w-50 mx-1" variant="primary">確認派送</b-button>
                            <b-button class="w-50 mx-1" variant="light" @click="() => {
                                order_info_visible = false;
                                action_menu_visible = true;
                                HandleCancelBtnClick();
                            }">返回選擇動作</b-button>
                            <b-button class="w-50 mx-1" variant="danger" @click="HandleCancelBtnClick">取消</b-button>
                        </div>
                    </div>
                </el-popover>
                <b-button v-show="!order_info_visible" squared variant="primary" @click="() => {
                    // $emit('on-click');
                    if (action_menu_visible) {
                        action_menu_visible = false;
                    }
                    else if (!order_info_visible)
                        action_menu_visible = true
                }">任務派送</b-button>
            </div>
        </template>
        <div class="actions-btn-conatiner">
            <b-button class="w-100 my-1" variant="light" v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('move')"> 移動</b-button>
            <b-button class="w-100 my-1" variant="light" v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('park')"> 停車</b-button>
            <b-button class="w-100 my-1" variant="light" v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('unload')"> 取貨 </b-button>
            <b-button class="w-100 my-1" variant="light" v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('load')"> 放貨 </b-button>
            <b-button class="w-100 my-1" variant="primary" @click="SelectActionHandle('carry')"> 搬運 </b-button>
            <b-button class="w-100 my-1" variant="warning" @click="SelectActionHandle('charge')"> 充電 </b-button>
            <b-button class="w-100 my-1" variant="warning" @click="SelectActionHandle('exchange_battery')"> 交換電池 </b-button>
            <b-button class="w-100 my-1" variant="warning" @click="SelectActionHandle('measure')"> 巡檢量測 </b-button>
            <b-button class="w-100 my-1" variant="danger" @click="() => { HandleCancelBtnClick(); action_menu_visible = false }"> 取消 </b-button>
        </div>
    </el-popover>
</template>
<script>
import bus from '@/event-bus.js'
import Notifier from '@/api/NotifyHelper';
import { TaskAllocation, clsMoveTaskData, clsMeasureTaskData, clsLoadTaskData, clsUnloadTaskData, clsCarryTaskData, clsExangeBatteryTaskData, clsChargeTaskData, clsParkTaskData } from '@/api/TaskAllocation'
import { userStore, agv_states_store, agvs_settings_store, EqStore } from '@/store';
import { MapStore } from '@/components/Map/store'

export default {
    data() {
        return {
            action_menu_visible: false,
            order_info_visible: false,
            isSelectTransferToDestinAGV: false,
            selected_action: '',
            selected_agv: '',
            selected_transfer_to_destine_agv: '',
            selected_source: {
                Graph: {
                    Display: ''
                }
            },
            selected_destine: {
                Graph: {
                    Display: ''
                }
            },
            selected_transfer_station: {
                Graph: {
                    Display: ''
                }
            },
            Cst_ID_Input: '',
            order_info_style: {
                // backgroundColor: 'rgba(255, 255, 255,.8)'
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
            equipments_options: [],
            downstream_options: [],
            IsTransferTaskNeedChangeAGV: false,
            tagOfMiddleStationTagOfTransferTask: -1
        }
    },
    computed: {
        IsRunMode() {
            return agvs_settings_store.getters.IsRunMode;
        },
        IsDeveloper() {
            return userStore.getters.IsDeveloperLogining;
        },
        AgvNameList() {
            var namelist = [];
            if (this.IsRunMode) {
                namelist.push({ value: '', label: '自動選車' });
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
            return namelist;
        },
        IsShowBackTo() {
            return this.current_progress != 'select-action'
        },
        selected_action_display() {
            var _action = this.selected_action;
            if (_action == 'move') {
                return '移動'
            }
            if (_action == 'unload') {
                return '取貨'
            }
            if (_action == 'load') {
                return '放貨'
            }
            if (_action == 'carry') {
                return '搬運'
            }
            if (_action == 'charge') {
                return '充電'
            }
            if (_action == 'park') {
                return '停車'
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
            var _stations = [...this.EQStations, ..._agvOptions];
            return _stations;
        }
    },
    methods: {
        SelectActionHandle(action) {
            this.$emit('onTaskDispatch')
            this.selected_action = action;
            this.HandleActionSelected(action);
            this.action_menu_visible = this.IsTransferTaskNeedChangeAGV = false;
            this.order_info_visible = true;
            this.selected_source = this.selected_destine = {
                TagNumber: undefined
            };
            if (action == 'carry' || action == 'unload') {

                this.selected_agv = '自動選車';
                if (action == 'carry') {
                    this.HandleSelectSoureStationFromMapBtnClick();
                } else {
                    this.HandleSelectDestineStationFromMapBtnClick();
                }
            }
            else {
                this.selected_agv = this.AgvNameList[0].label
                console.log(this.selected_agv)
                this.HandleSelectAGVFromMapBtnClick();
            }
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

            this.selected_source = {
                Graph: {
                    Display: ''
                }
            };
            this.HandleActionSelected("select-source");
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)

            bus.emit('change_to_select_eq_station_mode', { action_type: this.selected_action, direction: 'source' });

            this.current_progress = 'select-source';
            this.is_reselecting_flag = false;

            this.selected_destine = {
                Graph: {
                    Display: ''
                }
            };

            bus.on(this.map_events_bus.station_selected, (_station_data) => {
                console.info(_station_data);
                if (_station_data.IsEquipment || _station_data.StationType == 4) {

                    if (_station_data == this.selected_destine)
                        return;

                    this.selected_source = _station_data;
                    this.HandleFromSelectChanged(this.selected_source.TagNumber);
                    bus.emit('mark_as_start_station', this.selected_source.TagNumber);
                    this.HandleSelectDestineStationFromMapBtnClick();
                    this.HandleActionSelected('select-destine')
                }
            })
        },
        HandleSelectDestineStationFromMapBtnClick() {
            this.HandleActionSelected("select-destine");
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)

            var _destine_options = this.GetDownStreamEQOptions(this.selected_source.TagNumber);
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
                console.log(this.downstream_options)
                bus.emit('mark_as_destine_station', _station_data.TagNumber);
                this.selected_destine = _station_data;
            })
        },
        async HandleDestineSelectChanged(tag) {
            // alert(tag)
            this.selected_destine = await MapStore.dispatch('GetMapPointByTag', tag)
        },

        HandleCancelBtnClick() {
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)
            this.order_info_visible = false;
            this.selected_source = this.selected_destine = { Graph: { Display: '' } };
            this.source_select_row_class = this.destine_select_row_class = this.agv_select_row_class = this.transfer_station_select_row_class = '';
            bus.emit('change_to_normal_view_mode');

        },
        HandleConfirmBtnClicked() {
            this.$swal.fire(
                {
                    title: '確定要派送此任務?',
                    text: `${this.selected_agv} 執行 ${this.selected_action_display} 任務,終點:${this.selected_destine.Graph.Display}`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: '確定',
                    cancelButtonText: '取消',
                    customClass: 'my-sweetalert'
                }).then(res => {
                    if (res.isConfirmed) {
                        this.TaskDeliveryHandle()
                    }
                })
        },
        HandleTransferStationSelectChanged(tag) {
            this.tagOfMiddleStationTagOfTransferTask = tag
            console.warn(tag)
        },
        async TaskDeliveryHandle() {
            // TaskAllocation.Task();

            if (this.IsDeveloper) {
                this.bypass_eq_status_check = true;
            } else
                if (userStore.getters.level == 0)
                    this.bypass_eq_status_check = false;

            var response = { confirm: true, message: '' }
            var _destinTag = this.selected_destine ? this.selected_destine.TagNumber : -1;
            var _sourceTag = this.selected_source ? this.selected_source.TagNumber : -1;
            var _selected_agv = this.selected_agv == '自動選車' || this.selected_agv == '' ? '' : this.selected_agv;
            if (this.selected_action == 'move') {
                response = await TaskAllocation.MoveTask(new clsMoveTaskData(_selected_agv, _destinTag, 50));
            }

            if (this.selected_action == 'measure') {
                response = await TaskAllocation.MeasureTask(new clsMeasureTaskData(_selected_agv, _destinTag));
            }
            if (this.selected_action == 'load') {
                response = await TaskAllocation.LoadTask(new clsLoadTaskData(_selected_agv, _destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
            }

            if (this.selected_action == 'unload') {
                response = await TaskAllocation.UnloadTask(new clsUnloadTaskData(_selected_agv, _destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
            }

            if (this.selected_action == 'carry') {
                response = await TaskAllocation.CarryTask(new clsCarryTaskData(_selected_agv, _sourceTag, 1, _destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check, this.IsTransferTaskNeedChangeAGV, this.tagOfMiddleStationTagOfTransferTask, this.selected_transfer_to_destine_agv));
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
                const is_Unauthorized = response.status == 401;
                this.$swal.fire({
                    title: is_Unauthorized ? '須重新進行登入' : '任務派送失敗!',
                    text: is_Unauthorized ? '' : response.mesage,
                    icon: 'error',
                    showCancelButton: false,
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert',
                }).then(res => {
                    if (is_Unauthorized) {
                        userStore.dispatch('logout', '')
                        bus.emit('/show-login-view-invoke')

                    }
                })
            }
            else {
                //{confirm:true,message:''}
                if (response.data.confirm) {
                    this.HandleCancelBtnClick();
                    Notifier.Success(`任務-[${this.selected_action_display}] 已派送!`, 'bottom', 2000);
                } else {
                    this.$swal.fire(
                        {
                            text: response.data.message,
                            title: '任務派送失敗!',
                            icon: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'OK',
                            customClass: 'my-sweetalert'
                        })
                }
            }

        },
        async HandleFromSelectChanged(source_tag) {

            this.selected_source = await MapStore.dispatch('GetMapPointByTag', source_tag)
            this.selected_destine = { TagNumber: undefined }
            //console.log(source_tag)
            this.downstream_options = this.GetDownStreamEQOptions(source_tag);
        },
        GetDownStreamEQOptions(sourceTag) {
            var _results = [];
            var _eq_options = EqStore.getters.EqOptions;
            var source_eq = _eq_options.find(eq => eq.TagID == sourceTag)
            if (source_eq) {

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
            }
            return _results;
        },
        DetermineDestinOptions() {
            if (this.selected_action == 'measure')
                return this.bay_names;
            else if (this.selected_action == 'move')
                return MapStore.getters.AllNormalStationOptions;
            else if (this.selected_action == 'park')
                return MapStore.getters.AllParkingStationOptions;
            else if (this.selected_action == 'load' || this.selected_action == 'unload')
                return MapStore.getters.AllEqStation;
            else if (this.selected_action == 'charge')
                return MapStore.getters.AllChargeStation;
            else if (this.selected_action == 'carry')
                return this.downstream_options;
            else if (this.selected_action == 'exchange_battery')
                return MapStore.getters.AllExangeBatteryStation;
            else
                return [];

        },
    }
}
</script>
<style lang="scss" scoped>
.task-dispatch-btn-container {
    position: fixed;
    bottom: 40px;
    right: 28px;
    z-index: 10;

    button {
        font-size: 30px;
    }

    box-shadow: 4px -1px 14px 1px rgb(61, 61, 61);

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
        font-size: 17px
    }

    .item-value {
        color: rgb(13, 110, 253);

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
    background-color: 'pink'
}
</style>