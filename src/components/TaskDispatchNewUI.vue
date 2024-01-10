<template>
    <div class="task-dispatch-new-ui">
        <div class="bg-primary text-light d-flex flex-row">
            <div class="w-100 title-text"> 任務派送</div>
            <i @click="Leave" class="close-btn mx-2 bi bi-x-circle"></i>
        </div>
        <div v-if="IsShowBackTo" class="back-to-last-step px-2" @click="HandleBackToPush">返回 [{{ lastProgressDisplay }}]</div>
        <div v-show="current_progress == 'select-action'" class="page-pnl">
            <div class="head-text">請選擇任務動作</div>
            <div class="actions-btn-conatiner">
                <div v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('move')" class="action"> <label>移動</label> </div>
                <div v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('unload')" class="action"> <label>取貨</label> </div>
                <div v-if="!IsRunMode || IsDeveloper" @click="SelectActionHandle('load')" class="action"> <label>放貨</label> </div>
                <div @click="SelectActionHandle('carry')" class="action"> <label>搬運</label> </div>
                <div @click="SelectActionHandle('charge')" class="action"> <label>充電</label> </div>
            </div>
        </div>
        <div v-show="current_progress == 'select-agv'" class="page-pnl">
            <div class="head-text">請選擇車輛</div>
            <div class="actions-btn-conatiner">
                <div v-for="agv_name in AgvNameList"
                    :key="agv_name.value" @click="SelectAgvHandle(agv_name.value)" class="action"> <label>{{ agv_name.label }}</label> </div>
                <!-- <div @click="SelectAgvHandle('AGV2')" class="action"> <label>AGV2</label> </div> -->
            </div>
        </div>
        <div v-show="current_progress == 'select-source'" class="page-pnl">
            <div class="head-text">請選擇來源設備</div>
            <div class="station-btn-conatiner">
                <div v-for=" station in eq_stations" :key="station.tag" class="action" @click="SelectSourceHandle(station)"> <label>{{ station.name_display }}</label> </div>
                <!-- <div @click="SelectSourceHandle('EQ_A')" class="action"> <label>EQ_A</label> </div> -->
            </div>
        </div>
        <div v-show="current_progress == 'select-destine'" class="page-pnl">
            <div class="head-text">請選擇目的地</div>
            <div class="station-btn-conatiner">
                <div v-for=" station in destine_stations" :key="station.tag" class="action" @click="SelectDestineHandle(station)"> <label>{{ station.name_display }}</label> </div>
                <!-- <div @click="SelectDestineHandle('EQ_B')" class="action"> <label>EQ_B</label> </div> -->
            </div>
        </div>
        <div v-show="current_progress == 'confirm-task'" class="page-pnl">
            <div class="head-text">確認派送任務</div>
            <div class="actions-btn-conatiner">
                <!-- 顯示訂單內容 -->
                <div class="order-content">
                    <div class="order-row">
                        <label class="title">動作</label>
                        <label class="value">{{ selected_action_display }}</label>
                        <b-button @click="() => { current_progress = 'select-action'; is_reselecting_flag = false }">重新選取</b-button>
                    </div>
                    <div class="order-row">
                        <label class="title">車輛</label>
                        <label class="value">{{ selected_agv == '' ? '自動選車' : selected_agv }}</label>
                        <b-button @click="() => { current_progress = 'select-agv'; is_reselecting_flag = true }">重新選取</b-button>
                    </div>
                    <div v-if="selected_action == 'carry'" class="order-row">
                        <label class="title">來源</label>
                        <label class="value">{{ selected_source.name_display }}</label>
                        <b-button @click="() => { current_progress = 'select-source'; is_reselecting_flag = false }">重新選取</b-button>
                    </div>
                    <div class="order-row">
                        <label class="title">目的地</label>
                        <label class="value">{{ selected_destine.name_display }}</label>
                        <b-button @click="() => { current_progress = 'select-destine'; is_reselecting_flag = true }">重新選取</b-button>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <div @click="HandleConfirmBtnClicked" class="action bg-primary text-light"> <label>確認派送</label> </div>
                    <div @click="SelectDestineHandle('EQ_B')" class="action bg-danger text-light"> <label>取消</label> </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import bus from '@/event-bus';
import Notifier from '@/api/NotifyHelper';
import { MapStore } from '@/components/Map/store';
import { GetEQOptions } from '@/api/EquipmentAPI'
import { TaskAllocation, clsMoveTaskData, clsMeasureTaskData, clsLoadTaskData, clsUnloadTaskData, clsCarryTaskData, clsExangeBatteryTaskData, clsChargeTaskData, clsParkTaskData } from '@/api/TaskAllocation'
import { userStore, agv_states_store, agvs_settings_store } from '@/store';

export default {
    data() {
        return {
            current_progress: 'select-action',
            selected_action: '',
            selected_agv: '',
            selected_source: '',
            selected_destine: '',
            Cst_ID_Input: '',
            downstream_stations: [],
            bypass_eq_status_check: false,
            is_reselecting_flag: false
        }
    },
    methods: {
        SelectActionHandle(action) {
            this.selected_action = action;
            this.current_progress = 'select-agv';
        },
        SelectAgvHandle(agv) {
            this.selected_agv = agv;
            if (this.is_reselecting_flag) {
                this.current_progress = 'confirm-task'
                return;
            }
            if (this.selected_action == 'carry')
                this.current_progress = 'select-source';
            else
                this.current_progress = 'select-destine';
        },
        SelectSourceHandle(source) {
            this.HandleFromSelectChanged(source.tag).then(_destines => {
                this.selected_source = source;
                this.current_progress = 'select-destine'
            })
        },
        SelectDestineHandle(destine) {
            this.selected_destine = destine;

            if (this.is_reselecting_flag && this.selected_action != 'carry') {
                this.current_progress = 'confirm-task'
                return;
            }
            this.current_progress = 'confirm-task'
        },
        HandleBackToPush() {
            this.is_reselecting_flag = false;
            if (this.current_progress == 'select-agv')
                this.current_progress = 'select-action'

            if (this.current_progress == 'select-source')
                this.current_progress = 'select-agv'

            if (this.current_progress == 'select-destine') {
                if (this.selected_action == 'carry')
                    this.current_progress = 'select-source'
                else
                    this.current_progress = 'select-agv'
            }
            if (this.current_progress == 'confirm-task') {
                this.current_progress = 'select-destine'
            }
        },
        async HandleFromSelectChanged(source_tag) {
            this.downstream_stations = [];
            var equipments_options = await GetEQOptions();
            var source_eq = equipments_options.find(eq => eq.TagID == source_tag)
            if (source_eq) {
                var downstream_eq_names = source_eq.ValidDownStreamEndPointNames
                var downstread_eq_options = equipments_options.filter(eq => downstream_eq_names.includes(eq.Name))
                console.info(downstread_eq_options)
                Object.values(downstread_eq_options).forEach(element => {
                    this.downstream_stations.push({
                        tag: element.TagID,
                        name: `${element.Name}(Tag=${element.TagID})`,
                        name_display: element.Name
                    })
                });
            }
            return this.downstream_stations;
        },
        HandleConfirmBtnClicked() {
            this.$swal.fire(
                {
                    title: '確定要派送此任務?',
                    text: `${this.selected_agv} 執行 ${this.selected_action_display} 任務,終點:${this.selected_destine.name_display}`,//TODO 完整的名稱
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
            var _destinTag = this.selected_destine.tag;
            var _sourceTag = this.selected_source.tag;
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
                        this.Leave();

                    }
                })


            }
            else {
                //{confirm:true,message:''}
                if (response.data.confirm) {
                    Notifier.Success(`任務-[${this.selected_action_display}] 已派送!`, 'bottom', 2000);
                    this.Leave();
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
        Leave() {
            this.$emit('close')
            this.is_reselecting_flag = false;
            this.current_progress = 'select-action'
        }
    },
    computed: {
        IsRunMode() {
            return agvs_settings_store.getters.IsRunMode;
        },
        IsShowBackTo() {
            return this.current_progress != 'select-action'
        },
        lastProgressDisplay() {
            var _currentProgress = this.current_progress;
            if (_currentProgress == 'select-agv')
                return '選擇動作'
            if (_currentProgress == 'select-source')
                return '選擇AGV'
            if (_currentProgress == 'select-destine') {
                if (this.selected_action == 'carry')
                    return '選擇起點'
                else
                    return '選擇AGV'
            }
            if (_currentProgress == 'confirm-task')
                return '選擇目的地'
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
        moveable_stations() {
            return MapStore.getters.AllNormalStationOptions
        },
        chargable_tags() {
            return MapStore.getters.AllChargeStation
        },
        eq_stations() {
            return MapStore.getters.AllEqStation
        },
        destine_stations() {
            if (this.selected_action == 'move') {
                return this.moveable_stations
            } else if (this.selected_action == 'charge') {
                return this.chargable_tags
            } else if (this.selected_action == 'unload' || this.selected_action == 'load') {
                return this.eq_stations
            } else if (this.selected_action == 'carry')
                return this.downstream_stations;
            else
                return []

        }

    },
}
</script>

<style lang="scss" scoped>
.task-dispatch-new-ui {
    position: fixed;
    height: 100vh;
    left: 65px;
    top: 137px;
    width: 45%;
    border: 2px solid gray;
    background: white;
    border-radius: 7px;
    opacity: 0.97;
    box-shadow: -5rem 107px 15px 6rem gray;

    .title-text {
        font-size: 40px;
        font-weight: bold;
        text-align: left;
        padding-left: 1rem;
    }

    .close-btn {
        font-size: 36px;
        cursor: pointer;
    }

    .close-btn:hover {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 43px;
    }

    .back-to-last-step {
        font-size: 26px;
        cursor: pointer;
        text-align: left;
        background: pink;
    }

    .back-to-last-step:hover {
        background: grey;
        color: white;
    }

    @keyframes slideInFromLeft {
        0% {
            transform: translateX(-100%);
        }

        100% {
            transform: translateX(0);
        }
    }

    .page-pnl {
        width: 100%;
        height: 90%;
        // background: pink;
        align-items: center;
        padding-top: 70px;
        animation: slideInFromLeft 0.2s ease-out forwards;

        .head-text {
            font-size: 45px;
            text-decoration: underline;
            margin-bottom: 30px;
        }

        .station-btn-conatiner {
            background: black;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;

            .action {
                background: rgb(248, 248, 248);
                width: 200px;
                height: 60px;
                margin: 6px auto;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;

                label {
                    font-size: 25px;
                    cursor: pointer;
                }

            }
        }

        .actions-btn-conatiner {
            display: flex;
            flex-direction: column;
            justify-content: center;

            .action {
                background: rgb(21 115 253);
                color: white;
                width: 300px;
                height: 70px;
                margin: 6px auto;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;

                label {
                    font-size: 35px;
                    cursor: pointer;
                }

            }

            .action:hover {
                background: white;
                color: black;
            }
        }

        .station-btn-conatiner,
        .actions-btn-conatiner {
            width: 100%;
            // background: black;

            .action:hover {
                background-color: rgb(21, 115, 253);
                color: white;
            }

            .action:active {
                background-color: rgb(173, 173, 173);
                color: rgb(91, 91, 91);
            }

            .order-content {
                padding: 10px;

                .order-row {
                    display: flex;
                    flex-direction: row;
                    margin: 10px -59px 15px 50px;
                    // background: blue;
                    font-size: 30px;
                    width: 87%;

                    .title {
                        font-weight: bold;
                        width: 139px;
                        text-align: center;
                        background: #025883;
                        color: white;
                        padding: 2px 15px;
                    }

                    .value {
                        width: 480px;
                        background: ghostwhite;
                    }
                }
            }
        }
    }
}
</style>