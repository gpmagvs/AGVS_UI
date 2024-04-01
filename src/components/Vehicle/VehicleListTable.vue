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
            <el-table-column label="車長(cm)" prop="VehicleLength"></el-table-column>
            <el-table-column label="車寬(cm)" prop="VehicleWidth"></el-table-column>
            <el-table-column fixed="right" label="Operations" width="160">
                <template #default="scope">
                    <el-button
                        type="success"
                        size="small"
                        @click.prevent="edit_row(scope.row)"> 編輯 </el-button>
                    <el-button
                        type="danger"
                        size="small"
                        @click.prevent="edit_row(scope.row)"> 刪除 </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-drawer z-index="1" v-model="ShowEditAGVPropertyDrawer">
            <template #header="{ }">
                <h3 class="text-start">{{ drawerText }}</h3>
            </template>
            <div class="">
                <AddVehicle ref="AgvPropertyEditor" mode="edit"></AddVehicle>
            </div>
        </el-drawer>
    </div>
</template>
<script>
import { agv_states_store } from '@/store';
import AddVehicle from './AddVehicle.vue';
import { ProtocolDisplay, MainStatusDisplay, VehicleModelDisplay } from '@/ViewModels/EnumMaps.js'
export default {
    components: {
        AddVehicle,
    },
    data() {
        return {
            table: [],
            selectAGVProertyToEdit: {},
            ShowEditAGVPropertyDrawer: false
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
        },
        drawerText() {
            return this.selectAGVProertyToEdit.AGV_Name
        }
    },
    methods: {
        edit_row(agv_row) {
            this.selectAGVProertyToEdit = agv_row;
            this.ShowEditAGVPropertyDrawer = true;
            setTimeout(() => {
                this.$refs['AgvPropertyEditor'].UpdatePayload(agv_row);
            }, 1);
        }
    },
}
</script>
<style></style>