<template>
    <el-popover
        placement="left-start"
        :visible="action_menu_visible"
        :width="200"
        content="">
        <template #reference>
            <div class="task-dispatch-btn-container">
                <el-popover :popper-style="order_info_style" :visible="order_info_visible" placement="left-start" :width="475">
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
                            <el-col class="item-value" :span="8">{{ selected_action_display }}</el-col>
                            <el-col class="item-actions" :span="11">
                                <b-button size="sm" variant="link" @click="() => {
                                    HandleCancelBtnClick();
                                    action_menu_visible = true;
                                }">重新選取</b-button></el-col>
                        </el-row>
                        <el-row class="order-row" v-bind:style="agv_select_row_class" @click="HandleSelectAGVFromMapBtnClick">
                            <el-col :span="5">
                                <div class="item-name">車輛</div>
                            </el-col>
                            <el-col class="item-value" :span="8">{{ IsAutoSelectAGV ? '自動選車' : selected_agv }}</el-col>
                            <el-col class="item-actions" :span="11">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectAGVFromMapBtnClick">從地圖選取</b-button> -->
                                <b-button size="sm" variant="link" @click="() => { current_progress = 'select-agv'; is_reselecting_flag = true }">列表選取</b-button>
                            </el-col>
                        </el-row>
                        <el-row v-if="selected_action == 'carry'" class="order-row" v-bind:style="source_select_row_class" @click="HandleSelectSoureStationFromMapBtnClick">
                            <el-col :span="5">
                                <div class="item-name">來源</div>
                            </el-col>
                            <el-col class="item-value" :span="8">{{ selected_source ? selected_source.Graph.Display : '' }}</el-col>
                            <el-col class="item-actions" :span="11">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectSoureStationFromMapBtnClick">從地圖選取</b-button> -->
                                <b-button size="sm" variant="link" @click="() => { current_progress = 'select-source'; is_reselecting_flag = false }">列表選取</b-button>
                            </el-col>
                        </el-row>
                        <el-row class="order-row" v-bind:style="destine_select_row_class" @click="HandleSelectDestineStationFromMapBtnClick">
                            <el-col :span="5">
                                <div class="item-name">目的地</div>
                            </el-col>
                            <el-col class="item-value" :span="8">{{ selected_destine ? selected_destine.Graph.Display : '' }}</el-col>
                            <el-col class="item-actions" :span="11">
                                <!-- <b-button size="sm" variant="link" @click="HandleSelectDestineStationFromMapBtnClick">從地圖選取</b-button> -->
                                <b-button size="sm" variant="link" @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">列表選取</b-button>
                            </el-col>
                        </el-row>
                        <div class="w-100 py-1 d-flex border-top" style="height: 50px;">
                            <b-button @click="HandleConfirmBtnClicked" :disabled="!task_dispatch_btn_pushable" class="w-50 mx-1" variant="primary">確認派送</b-button>
                            <b-button class="w-50 mx-1" variant="danger" @click="HandleCancelBtnClick">取消</b-button>
                        </div>
                    </div>
                </el-popover>
                <b-button squared variant="primary" @click="() => {
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
            <b-button class="w-100 my-1" variant="light" v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('unload')"> 取貨 </b-button>
            <b-button class="w-100 my-1" variant="light" v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('load')"> 放貨 </b-button>
            <b-button class="w-100 my-1" variant="primary" @click="SelectActionHandle('carry')"> 搬運 </b-button>
            <b-button class="w-100 my-1" variant="warning" @click="SelectActionHandle('charge')"> 充電 </b-button>
            <b-button class="w-100 my-1" variant="danger" @click="() => { action_menu_visible = false }"> 取消 </b-button>
        </div>
    </el-popover>
</template>

<script>
import bus from '@/event-bus.js'
import Notifier from '@/api/NotifyHelper';
import { TaskAllocation, clsMoveTaskData, clsMeasureTaskData, clsLoadTaskData, clsUnloadTaskData, clsCarryTaskData, clsExangeBatteryTaskData, clsChargeTaskData, clsParkTaskData } from '@/api/TaskAllocation'
import { userStore, agv_states_store, agvs_settings_store } from '@/store';
export default {
    computed: {
        IsRunMode() {
            return agvs_settings_store.getters.IsRunMode;
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
        },
        IsAutoSelectAGV() {
            return (this.selected_action == 'carry' || this.selected_action == 'unload') && this.selected_agv == '';
        },
        task_dispatch_btn_pushable() {
            if (this.selected_action == 'carry')
                return (this.selected_agv != '' || this.IsAutoSelectAGV) && this.selected_source != undefined && this.selected_destine != undefined;
            else
                return (this.selected_agv != '' || this.IsAutoSelectAGV) && this.selected_destine != undefined;
        }
    },
    data() {
        return {
            action_menu_visible: false,
            order_info_visible: false,
            selected_action: '',
            selected_agv: '',
            selected_source: undefined,
            selected_destine: undefined,
            Cst_ID_Input: '',
            order_info_style: {
                backgroundColor: 'rgba(255, 255, 255,.8)'
            },
            source_select_row_class: '',
            destine_select_row_class: '',
            agv_select_row_class: '',
            map_events_bus: {
                agv_selected: '/map/agv_selected',
                station_selected: '/map/station_selected'
            },
            bypass_eq_status_check: false
        }
    },
    methods: {
        SelectActionHandle(action) {
            this.$emit('onTaskDispatch')
            this.selected_action = action;
            this.HandleActionSelected(action);
            this.action_menu_visible = false;
            this.order_info_visible = true;
            if (action == 'carry' || action == 'unload') {

                this.selected_agv = '';
                if (action == 'carry') {
                    this.HandleSelectSoureStationFromMapBtnClick();
                } else {
                    this.HandleSelectDestineStationFromMapBtnClick();
                }
            }
            else {
                this.HandleSelectAGVFromMapBtnClick();
            }
        },
        HandleActionSelected(action) {
            this.source_select_row_class =
                this.destine_select_row_class =
                this.agv_select_row_class = '';
            var selectedStyle = {
                backgroundColor: 'pink'
            }
            if (action == 'select-agv')
                this.agv_select_row_class = selectedStyle;

            if (action == 'select-source')
                this.source_select_row_class = selectedStyle;

            if (action == 'select-destine')
                this.destine_select_row_class = selectedStyle;
        },
        HandleSelectAGVFromMapBtnClick() {
            this.HandleActionSelected("select-agv");
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)
            bus.emit('change_to_select_agv_mode');
            this.current_progress = 'select-agv';
            this.is_reselecting_flag = true;
            bus.on(this.map_events_bus.agv_selected, (agv_name) => {
                this.selected_agv = agv_name;
                if (this.selected_action == 'carry') {
                    this.HandleSelectSoureStationFromMapBtnClick();
                    this.HandleActionSelected('select-source')
                } else {
                    this.HandleSelectDestineStationFromMapBtnClick();
                    this.HandleActionSelected('select-destine')
                }

            })

        },
        HandleSelectSoureStationFromMapBtnClick() {
            this.HandleActionSelected("select-source");
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)
            bus.emit('change_to_select_eq_station_mode', { action_type: this.selected_action, direction: 'source' });

            this.current_progress = 'select-source';
            this.is_reselecting_flag = false;

            bus.on(this.map_events_bus.station_selected, (_station_data) => {
                console.info(_station_data);
                if (_station_data.IsEquipment) {

                    if (_station_data == this.selected_destine)
                        return;

                    this.selected_source = _station_data;
                    this.HandleSelectDestineStationFromMapBtnClick();
                    this.HandleActionSelected('select-destine')
                }
            })
        },
        HandleSelectDestineStationFromMapBtnClick() {
            this.HandleActionSelected("select-destine");
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)
            bus.emit('change_to_select_eq_station_mode', { action_type: this.selected_action, direction: 'destine' });
            this.current_progress = 'select-destine';
            this.is_reselecting_flag = true;
            bus.on(this.map_events_bus.station_selected, (_station_data) => {
                console.info(_station_data);
                if (this.selected_action == 'charge' && !_station_data.IsCharge)
                    return;
                if ((this.selected_action == 'load' || this.selected_action == 'unload' || this.selected_action == 'carry') && !_station_data.IsEquipment)
                    return;
                if (this.selected_action == 'carry' && _station_data == this.selected_source)
                    return;
                this.selected_destine = _station_data;
            })
        },
        HandleCancelBtnClick() {
            bus.off(this.map_events_bus.agv_selected)
            bus.off(this.map_events_bus.station_selected)
            this.order_info_visible = false;
            this.selected_source = this.selected_destine = undefined;
            this.source_select_row_class = this.destine_select_row_class = this.agv_select_row_class = '';
            bus.emit('change_to_normal_view_mode');

        },
        HandleConfirmBtnClicked() {
            this.$swal.fire(
                {
                    title: '確定要派送此任務?',
                    text: `${this.selected_agv} 執行 ${this.selected_action_display} 任務,終點:${this.selected_destine.Graph.Display}`,//TODO 完整的名稱
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
            var _selected_agv = this.selected_agv;
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
                response = await TaskAllocation.CarryTask(new clsCarryTaskData(_selected_agv, _sourceTag, 1, _destinTag, 1, this.Cst_ID_Input, 50, this.bypass_eq_status_check));
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
    }
}
</script>

<style lang="scss" scoped>
.task-dispatch-btn-container {
    position: fixed;
    bottom: 40px;
    right: 15px;
    z-index: 10;

    button {
        font-size: 40px;
    }

    box-shadow: -3px 0px 24px 3px rgb(61, 61, 61);

}

.order-row {
    height: 40px;
    margin: 2px auto;
    //background-color: whitesmoke;
    font-size: 20px;
    padding-left: 12px;
    padding-top: 7px;
    font-weight: bold;
    border-radius: 8px;

    .item-name {
        font-size: 16px
    }

    .item-value {
        color: rgb(13, 110, 253);
    }

    .item-actions {
        text-align: right;

        button {
            margin: auto 2px;
        }
    }
}

.selected-div {
    background-color: 'pink'
}
</style>