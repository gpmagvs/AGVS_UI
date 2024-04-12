<template>
    <div class="border d-flex justify-content-center px-5 py-2">
        <div class="item-block mx-1 border rounded p-4">
            <h2 class="text-start">儀器</h2>
            <el-form size="large" label-width="40" label-position="left" class="">
                <el-form-item v-for="item in equipmentsMap" :key="item.id" :label="item.name">
                    <el-switch width="70" inline-prompt active-text="啟用" inactive-text="關閉" inactive-color="rgb(220, 53, 69)" :before-change="() => { return false }" size="large" :disabled="setting_eq_id != ''" :loading="setting_eq_id == item.id" @click="ControlEquipmentState(item.id)"
                        v-model="item.state"></el-switch>
                </el-form-item>
            </el-form>
        </div>
        <div class="item-block mx-5 border rounded p-4">
            <h2 class="text-start">感測器</h2>
            <el-form size="large" label-width="80" label-position="left">
                <el-form-item v-for="item in sensorsMap" :key="item.id" :label="item.name">
                    <el-switch width="70" inline-prompt active-text="啟用" inactive-text="關閉" inactive-color="rgb(220, 53, 69)" size="large" :disabled="setting_sensor_id != ''" :loading="setting_sensor_id == item.id" @click="ControlSensorState(item.id)" v-model="item.state"></el-switch>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import { AGVStatusStore } from '@/store';
import { InspectionAGVAPI } from '@/api/VMSAPI'
export default {
    data() {
        return {
            setting_eq_id: '',
            setting_sensor_id: '',

        }
    },
    methods: {
        ControlEquipmentState(id) {
            this.setting_eq_id = id;
            setTimeout(async () => {

                var controlState = !this.AMCAGVSensorState[id];
                var success = await InspectionAGVAPI.EquipmentStateControl(id, controlState)
                if (!success)
                    this.ShowSettingFailMessage(id)
                this.setting_eq_id = '';
            }, 200);
        },
        ControlSensorState(id) {
            this.setting_sensor_id = id;
            setTimeout(async () => {
                var controlState = !this.AMCAGVSensorState[id];
                var success = await InspectionAGVAPI.SensorStateControl(id, controlState)
                if (!success)
                    this.ShowSettingFailMessage(id)
                this.setting_sensor_id = '';
            }, 200);
        },
        ShowSettingFailMessage(id) {
            this.$swal.fire(
                {
                    title: '修改失敗',
                    text: id,
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                })
        }
    },
    computed: {
        AMCAGVSensorState() {
            var _states = AGVStatusStore.getters.AMCAGVSensorState;
            if (_states)
                return _states;
            else {
                return {
                    Ultrasonic: true,
                    GroundHoleCamera: true,
                    temperature: true,
                    humidity: true,
                    decibel: true,
                    PID: true,
                    illuminance: true,
                    instrument: true,
                }
            }
        },
        sensorsMap() {
            return [
                {
                    name: '超音波',
                    id: 'Ultrasonic',
                    state: this.AMCAGVSensorState['Ultrasonic']
                },
                {
                    name: '地洞CCD',
                    id: 'GroundHoleCamera',
                    state: this.AMCAGVSensorState['GroundHoleCamera']
                },
            ]
        },
        equipmentsMap() {
            return [
                {
                    name: '儀器',
                    id: 'instrument',
                    state: this.AMCAGVSensorState['instrument']
                },
                {
                    name: '溫度',
                    id: 'temperature',
                    state: this.AMCAGVSensorState['temperature']
                },
                {
                    name: '濕度',
                    id: 'humidity',
                    state: this.AMCAGVSensorState['humidity']
                },
                {
                    name: '分貝',
                    id: 'decibel',
                    state: this.AMCAGVSensorState['decibel']
                },
                {
                    name: 'PID',
                    id: 'PID',
                    state: this.AMCAGVSensorState['PID']
                },
                {
                    name: '照度',
                    id: 'illuminance',
                    state: this.AMCAGVSensorState['illuminance']
                }
            ]
        },
    },

}
</script>
<style lang="scss" scoped>
.item-block {
    width: 50%;

    h2 {
        font-weight: bold;
        border-bottom: 1px solid rgb(185, 183, 183);
    }
}
</style>