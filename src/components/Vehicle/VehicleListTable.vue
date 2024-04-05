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
            <el-table-column label="啟用模擬" prop="Simulation">
                <template #default="scope">
                    <el-checkbox :disabled="true" v-model="scope.row.Simulation">
                    </el-checkbox>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" width="160">
                <template #default="scope">
                    <el-button
                        type="success"
                        size="small"
                        @click.prevent="edit_row(scope.row)"> 編輯 </el-button>
                    <el-button
                        type="danger"
                        size="small"
                        @click.prevent="delete_row(scope.row)"> 刪除 </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-drawer z-index="1" v-model="ShowEditAGVPropertyDrawer">
            <template #header="{}">
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
import { VehicleManagerAPI } from '@/api/VMSAPI'
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
        },
        async delete_row(agv_row) {
            var _DeleteVehicleAction = async () => {
                var result = await VehicleManagerAPI.DeleteVehicle(agv_row.AGV_Name);
                if (result.confirm) {
                    this.$swal.fire(
                        {
                            text: '',
                            title: '刪除車輛成功',
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
                            title: '刪除車輛失敗',
                            icon: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'OK',
                            customClass: 'my-sweetalert'
                        })
                }
            }
            this.$swal.fire(
                {
                    text: '',
                    title: `確定要刪除車輛-${agv_row.AGV_Name}?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                }).then(ret => {
                    if (!ret.isConfirmed)
                        return;
                    _DeleteVehicleAction()
                })


        }
    },
}
</script>
<style></style>