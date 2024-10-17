<template>
    <div class="agv-battery-setting d-flex h-100">
        <el-table class="w-50 mx-1" :header-cell-style="tableHeaderStyle" size="large" border :data="datas">
            <el-table-column v-for="column in columnMap" :key="column.prop" :label="column.label" :prop="column.prop">
                <template #default="scope">
                    <div v-if="column.type == 'string'" v-text="scope.row[column.prop]" class=""></div>
                    <el-input-number v-if="column.type == 'number'" v-model="scope.row[column.prop]"
                        @change="modify(scope.row, scope.row.agvName)"></el-input-number>
                </template>
            </el-table-column>
        </el-table>
        <div class="descript mx-2 py-5 border flex-fill bg-light text-start" style="font-weight: bold;">
            <el-timeline class="bat-timeline" style="max-width: 600px">
                <el-timeline-item timestamp="100%" placement="top">
                    <el-card class="bg-success text-light">
                        <h5>-{{ $t('AGVBatterySetting.HighBatteryLevel') }}</h5>
                        <div>- {{ $t('AGVBatterySetting.CanExecuteAllTask') }}</div>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item timestamp="高電量" placement="top">
                    <el-card class="bg-success text-light">
                        <h5>-{{ $t('AGVBatterySetting.MediumBatteryLevel') }}</h5>
                        <div>-{{ $t('AGVBatterySetting.CanExecuteAllTask') }}</div>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item timestamp="中電量" placement="top">
                    <el-card class="text-light" style="background-color: orange;">
                        <h5>-{{ $t('AGVBatterySetting.MediumLowBattertLevel') }}</h5>
                        <div>-{{ $t('AGVBatterySetting.When AGV is not Charging,all task orders can be executed') }}
                        </div>
                        <div>-{{ $t('AGVBatterySetting.AGVcharging onlyAGVdocharging tasks') }}</div>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item timestamp="低電量-強制充電" placement="top">
                    <el-card class="bg-danger text-light">
                        <h5>-{{ $t('AGVBatterySetting.LowBattertLevel') }}</h5>
                        <div>-{{ $t('AGVBatterySetting.AGVlowbattery onlyAGVdocharging') }}</div>
                        <div>-{{ $t('AGVBatterySetting.In operation mode, the system will force the AGV to charge') }}
                        </div>
                    </el-card>
                </el-timeline-item>
                <el-timeline-item timestamp="0%" placement="top">
                </el-timeline-item>
            </el-timeline>
            <!-- <el-image lazy src="https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg"></el-image> -->
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { ElNotification } from 'element-plus'
import { VehicleBatteryAPI } from '@/api/VMSAPI';
class AgvChargeData {
    agvName: string;
    lowLevel: number;
    middleLevel: number;
    highLevel: number;
    constructor(agvName: string, lowLv: number, middleLv: number, highLv: number) {
        this.agvName = agvName
        this.lowLevel = lowLv;
        this.middleLevel = middleLv;
        this.highLevel = highLv;
    }
}
class BatteryColumn {

    label: string;
    prop: string;
    type: string;
    constructor(label: string, prop: string, type: string) {
        this.label = label;
        this.prop = prop;
        this.type = type
    }
}


export default defineComponent({
    inject: ['tableHeaderStyle'],
    data() {
        return {
            datas: [] as AgvChargeData[],
            columnMap: [
                new BatteryColumn('車輛名稱', 'agvName', 'string'),
                new BatteryColumn('低電量-強制充電(%)', 'lowLevel', 'number'),
                new BatteryColumn('中電量(%)', 'middleLevel', 'number'),
                new BatteryColumn('高電量(%)', 'highLevel', 'number'),
            ],
            throttleState: {
                isOperating: false,
                tout: setTimeout(() => {
                }, 1),
                postModifiedValToBackend(val: AgvChargeData) {
                    clearTimeout(this.tout)
                    this.tout = setTimeout(async () => {
                        console.log(val);
                        try {

                            var result = await VehicleBatteryAPI.ModifySetting(val.agvName, val)
                            console.info(result)
                            ElNotification.success({
                                message: `已完成 ${val.agvName} 電量管理參數修改`,
                                position: 'top-right',
                                duration: 2000
                            })
                        } catch (error) {
                            ElNotification.error({
                                message: `${val.agvName} 電量管理參數修改失敗-${error}`,
                                position: 'top-right',
                                duration: 2000
                            })
                        }

                    }, 500);
                },
                cancelLastOperate() {

                }
            }
        }
    },
    methods: {
        fetchSettings() {
            setTimeout(async () => {
                try {

                    var data = await VehicleBatteryAPI.GetSettings();
                    Object.assign(this.datas, data);
                } catch (error) {
                    ElNotification.error({
                        message: `電量管理參數下載失敗-${error}`,
                        position: 'top-right',
                        duration: -1
                    })
                }
            }, 100);
        },
        modify(val: AgvChargeData, agvName: string) {
            this.throttleState.postModifiedValToBackend(val)

            // var thot = Throttle(function (agvName: string, obj: object) {
            //     console.log(agvName, obj)
            // }, 1000)
            // thot(agvName, val);
        }
    },
    mounted() {
        this.fetchSettings();
    },
});
</script>
<style lang="scss" scoped>
.descript {
    border-radius: 8px;

    .bat-timeline {
        h5 {
            letter-spacing: 3px;
        }
    }
}
</style>