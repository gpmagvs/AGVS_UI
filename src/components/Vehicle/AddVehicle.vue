<template>
    <div class="add-vehicle w-100">
        <el-form label-width="100px" label-position="left">
            <el-divider>Basic</el-divider>
            <el-form-item label="車輛ID">
                <el-input class="add-vehicle-input" v-model="payload.AGV_Name"></el-input>
            </el-form-item>
            <el-form-item label="車輛顯示名稱">
                <el-input class="add-vehicle-input"></el-input>
            </el-form-item>
            <el-form-item label="車輛類型">
                <!--  FORK = 0,YUNTECH_FORK_AGV = 1,INSPECTION_AGV = 2,SUBMERGED_SHIELD = 3,SUBMERGED_SHIELD_Parts = 4, -->
                <el-select class="add-vehicle-input" v-model="payload.Model">
                    <el-option label="叉車 AGV" :value="0"></el-option>
                    <el-option label="巡檢 AGV" :value="2"></el-option>
                    <el-option label="潛盾 AGV" :value="3"></el-option>
                    <el-option label="Parts AGV" :value="4"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="通訊方式">
                <!--TCP=0,RESTFulAPI=1 -->
                <el-select class="add-vehicle-input" v-model="payload.Protocol">
                    <el-option label="TCP/Socket" :value="0"></el-option>
                    <el-option label="RESTFul API" :value="1"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="IP">
                <el-input class="add-vehicle-input" v-model="payload.IP"></el-input>
            </el-form-item>
            <el-form-item label="Port">
                <el-input class="add-vehicle-input" v-model="payload.Port"></el-input>
            </el-form-item>
            <el-divider>Layout</el-divider>
            <el-form-item label="車輛長度(cm)">
                <el-input class="add-vehicle-input" v-model="payload.VehicleLength"></el-input>
            </el-form-item>
            <el-form-item label="車輛寬度(cm)">
                <el-input class="add-vehicle-input" v-model="payload.VehicleWidth"></el-input>
            </el-form-item>
            <el-divider>Developer</el-divider>
            <el-form-item label="模擬">
                <el-switch class="add-vehicle-input" v-model="payload.Simulation"></el-switch>
            </el-form-item>
        </el-form>
        <div class="border-top py-2 text-start">
            <b-button
                @click="IsEditMode ? EditVehicle() : AddVehicle()"
                variant="primary"
                :loading="adding"
                style="width: 120px;">{{ btnText }}</b-button>
        </div>
    </div>
</template>
<script>
import { VehicleManagerAPI } from '@/api/VMSAPI'
export default {
    props: {
        mode: {
            type: String,
            default: 'add'//'add|edit'
        },
    },
    computed: {
        IsEditMode() {
            return this.mode == 'edit'
        },
        btnText() {
            return this.IsEditMode ? "修改" : "新增"
        }
    },
    data() {
        return {
            payload: {
                AGV_Name: 'AGV_',
                Model: 3,
                Protocol: 0,
                IP: '127.0.0.1',
                Port: 7025,
                VehicleLength: 145,
                VehicleWidth: 70,
                Simulation: false
            },
            oriAGVID: '',
            adding: false
        }
    },
    methods: {
        async AddVehicle() {

            this.adding = true;
            var result = await VehicleManagerAPI.AddVehicle(this.payload);
            this.adding = false;

            if (result.confirm) {
                this.$swal.fire(
                    {
                        text: '',
                        title: '新增成功',
                        icon: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'top-most-sweetalert'
                    })
            }
            else {
                this.$swal.fire(
                    {
                        text: result.message,
                        title: '新增失敗',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'top-most-sweetalert'
                    })
            }
        },
        async EditVehicle() {
            var result = await VehicleManagerAPI.EditVehicle(this.payload, this.oriAGVID);
            if (result.confirm) {
                this.$swal.fire(
                    {
                        text: '',
                        title: '修改成功',
                        icon: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'my-sweetalert'
                    })
            }
            else {
                this.$swal.fire(
                    {
                        text: result.message,
                        title: '修改失敗',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'my-sweetalert'
                    })
            }
        },
        UpdatePayload(_payload) {
            this.payload = _payload
            this.oriAGVID = _payload.AGV_Name
        }
    },
}
</script>
<style lang="scss" scoped>
.add-vehicle {
    .add-vehicle-input {
        width: 220px;
    }
}
</style>