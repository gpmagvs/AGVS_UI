<template>
    <div class="vehicle-list-table">
        <el-table header-cell-class-name="my-el-table-cell-class" header-row-class-name="my-el-table-row-class" row-key="AGV_Name" border :data="GetAGVStatesData" style="width: 100%">
            <el-table-column label="AGV ID" prop="AGV_Name"></el-table-column>
            <el-table-column label="類型" prop="Model">
                <template #default="scope"><el-tag effect="dark"> {{ VehicleModels[scope.row.Model].labelCN }}</el-tag> </template>
            </el-table-column>
            <el-table-column label="當前狀態" prop="MainStatus">
                <template #default="scope"><el-tag effect="dark" :color="AGVMainStatus[scope.row.MainStatus].color"> {{ AGVMainStatus[scope.row.MainStatus].label }}</el-tag> </template>
            </el-table-column>
            <el-table-column label="當前位置" prop="CurrentLocation"></el-table-column>
            <el-table-column label="通訊方式" prop="Protocol">
                <template #default="scope"> <el-tag> {{ ProtocolText[scope.row.Protocol] }} </el-tag></template>
            </el-table-column>
            <el-table-column label="IP" prop="IP"></el-table-column>
            <el-table-column label="PORT" prop="Port"></el-table-column>
        </el-table>
    </div>
</template>
<script>
import { agv_states_store } from '@/store';
import { ProtocolDisplay, MainStatusDisplay, VehicleModelDisplay } from '@/ViewModels/EnumMaps.js'
export default {
    data() {
        return {
            table: []
        }
    },
    computed: {
        GetAGVStatesData() {
            return agv_states_store.getters.AGVStatesData;
        },
        ProtocolText() {
            return ProtocolDisplay
        },
        AGVMainStatus() {
            return MainStatusDisplay
        },
        VehicleModels() {
            return VehicleModelDisplay
        }
    },
}
</script>
<style></style>