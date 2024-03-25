<template>
    <div class="add-vehicle w-100">
        <el-form label-width="100px" label-position="left">
            <el-form-item label="車輛ID">
                <el-input class="add-vehicle-input" v-model="payload.AGV_Name"></el-input>
            </el-form-item>
            <el-form-item label="車輛顯示名稱">
                <el-input class="add-vehicle-input"></el-input>
            </el-form-item>
            <el-form-item label="車輛類型">
                <!--  FORK = 0,YUNTECH_FORK_AGV = 1,INSPECTION_AGV = 2,SUBMERGED_SHIELD = 3,SUBMERGED_SHIELD_Parts = 4, -->
                <el-select class="add-vehicle-input" v-model="payload.Model">
                    <el-option label="叉車 AGV" :value="1"></el-option>
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
        </el-form>
        <div class="border-top py-2 text-start">
            <b-button @click="AddVehicle" variant="primary" style="width: 120px;">新增</b-button>
        </div>
    </div>
</template>
<script>
import { VehicleManagerAPI } from '@/api/VMSAPI'
export default {
    data() {
        return {
            payload: {
                AGV_Name: 'AGV_',
                Model: 3,
                Protocol: 0,
                IP: '127.0.0.1',
                Port: 7025,
            }
        }
    },
    methods: {
        async AddVehicle() {
            var result = await VehicleManagerAPI.AddVehicle(this.payload);
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