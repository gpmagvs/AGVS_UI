<template>
    <div class="w-100">
        <div class="border-bottom my-2 py-1 text-start">
            <el-button @click="getSettings()">重新整理</el-button>
        </div>
        <el-table
            v-loading="loading"
            :data="tableData"
            header-cell-class-name="my-el-table-cell-class"
            row-key="agv_name"
            border
            :header-cell-style="tableHeaderStyle"
            size="large">
            <el-table-column label="AGV ID" prop="agv_name"></el-table-column>
            <el-table-column label="走行馬達">
                <el-table-column label="目前累計里程" prop="currentHorizonMotorVal">
                    <template #default="scope">
                        <div class="w-100 d-flex value-display">
                            <div class="flex-fill text-center">{{ scope.row.currentHorizonMotorVal.toFixed(2) }} km</div>
                            <el-button @click="ResetCurrentValue(scope.row.agv_name, 100)">重設</el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="保養里程" prop="horizonMotorMaintainVal">
                    <template #default="scope">
                        <div class="w-100 d-flex value-display">
                            <div class="flex-fill text-center">{{ scope.row.horizonMotorMaintainVal }}</div>
                            <el-button @click="ShowSettingDialog(scope.row.agv_name, 100, scope.row.horizonMotorMaintainVal)">設定</el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="前次保養時間"></el-table-column>
                <el-table-column label="前次保養人員"></el-table-column>
            </el-table-column>
            <el-table-column label="牙叉皮帶">
                <el-table-column label="目前累計里程" prop="currentForkBeltVal">
                    <template #default="scope">
                        <div class="w-100 d-flex value-display">
                            <div class="flex-fill text-center">{{ scope.row.currentForkBeltVal }}</div>
                            <el-button @click="ResetCurrentValue(scope.row.agv_name, 101)">重設</el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="保養里程" prop="forkBeltMaintainVal">
                    <template #default="scope">
                        <div class="w-100 d-flex value-display">
                            <div class="flex-fill text-center">{{ scope.row.forkBeltMaintainVal }}</div>
                            <el-button @click="ShowSettingDialog(scope.row.agv_name, 101, scope.row.forkBeltMaintainVal)">設定</el-button>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="前次保養時間"></el-table-column>
                <el-table-column label="前次保養人員"></el-table-column>
                <el-table-column label="">
                    <template>
                        <el-button>確認</el-button>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <el-dialog :title="dialog.title" v-model="settingValueDialogShow" draggable :modal="false" width="400">
            <div class="d-flex w-100">
                <el-input-number class="mx-2" size="large" v-model="dialog.oriValue"></el-input-number>
                <el-button size="large" type="primary" @click="SettingValue()">修改</el-button>
                <el-button size="large" type="" @click="() => { settingValueDialogShow = false }">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import VehicleMaintainAPI from '@/api/VehicleMaintainAPI'
import bus from '@/event-bus';
import { ElNotification } from 'element-plus';
export default {
    inject: ['tableHeaderStyle'],
    computed: {
        tableData() {

            var agvNames = Object.keys(this.maintainStates);
            var map = agvNames.map(name => ({
                agv_name: name,
                currentHorizonMotorVal: this.maintainStates[name][0].currentValue,
                horizonMotorMaintainVal: this.maintainStates[name][0].maintainValue,
                currentForkBeltVal: this.maintainStates[name][1].currentValue,
                forkBeltMaintainVal: this.maintainStates[name][1].maintainValue,
                forkBeltMaintainVal: this.maintainStates[name][1].maintainValue,
            }))
            return map
        }
    },
    data() {
        return {

            loading: false,
            settingValueDialogShow: false,
            dialog: {
                title: '',
                agvName: '',
                item: 100,
                oriValue: 0,
            },
            itemDescriptionsOfReset: {
                100: "走行馬達當前里程",
                101: "Fork皮帶當前里程"
            },
            itemDescriptionsOfSetting: {
                100: "走行馬達保養里程",
                101: "Fork皮帶保養里程"
            },
            maintainStates: {
                "AGV_001": [
                    {
                        VehicleMaintainId: "AGV_001-HORIZON_MOTOR",
                        AGV_Name: "AGV_001",
                        MaintainItem: 100,
                        MaintainItemName: "走行馬達保養",
                        currentValue: 1,
                        maintainValue: 10,
                        VehicleState: null

                    },
                    {
                        VehicleMaintainId: "AGV_001-HORIZON_MOTOR",
                        AGV_Name: "AGV_001",
                        MaintainItem: 100,
                        MaintainItemName: "走行馬達保養",
                        currentValue: 2,
                        maintainValue: 20,
                        VehicleState: null

                    }
                ],
                "AGV_002": [
                    {
                        VehicleMaintainId: "AGV_001-HORIZON_MOTOR",
                        AGV_Name: "AGV_001",
                        MaintainItem: 100,
                        MaintainItemName: "走行馬達保養",
                        currentValue: 0,
                        maintainValue: 0,
                        VehicleState: null

                    },
                    {
                        VehicleMaintainId: "AGV_001-HORIZON_MOTOR",
                        AGV_Name: "AGV_001",
                        MaintainItem: 100,
                        MaintainItemName: "走行馬達保養",
                        currentValue: 0,
                        maintainValue: 0,
                        VehicleState: null

                    }
                ]
            }
        }
    },
    methods: {
        async ResetCurrentValue(agvName, item) {
            const description = this.itemDescriptionsOfReset[item];
            this.$swal.fire(
                {
                    title: '重置 ' + description,
                    text: `確定要重置 ${agvName} ${description}?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                }).then(async (res) => {
                    if (res.isConfirmed) {

                        var response = await VehicleMaintainAPI.ResetCurrentValue(agvName, item);
                        this.getSettings();

                        if (response) {
                            ElNotification.success({
                                message: `${agvName} ${description} 重置成功。`,
                                duration: 2000
                            })
                        }

                    }
                })
        },
        ShowSettingDialog(agvName, item, currentValue) {
            this.dialog.agvName = agvName;
            this.dialog.item = item;
            this.dialog.oriValue = currentValue;
            this.dialog.title = `${agvName}-${this.itemDescriptionsOfSetting[item]}設定`;
            this.settingValueDialogShow = true;

        },
        async SettingValue() {
            var response = await VehicleMaintainAPI.SettingMaintainValue(this.dialog.agvName, this.dialog.item, this.dialog.oriValue);
            this.getSettings();
            this.settingValueDialogShow = false;
            if (response) {
                this.$swal.fire(
                    {
                        text: '',
                        title: this.dialog.title + '成功',
                        icon: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'my-sweetalert'
                    }).then(res => {

                        this.settingValueDialogShow = true;
                    })
            } else {
                this.$swal.fire(
                    {
                        text: '',
                        title: this.dialog.title + '失敗',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'my-sweetalert'
                    }).then(res => {

                        this.settingValueDialogShow = true;
                    })
            }
        },
        getSettings(showLoading = true) {
            this.loading = showLoading;
            setTimeout(async () => {
                this.maintainStates = await VehicleMaintainAPI.GetSettings();
                this.loading = false;
            }, 200);
        }
    },
    mounted() {
        this.getSettings();
        bus.on('Update-Maintain-State', () => {
            this.getSettings(false);
        });
    },
}
</script>
<style>
.value-display {
    font-size: 20px;
    font-weight: bold;
}
</style>