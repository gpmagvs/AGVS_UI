<template>
    <div class="add-rack d-flex w-100">
        <div>
            <el-form label-width="100px" label-position="left" style="width:400px">
                <el-divider>Basic</el-divider>
                <el-form-item label="RACK名稱">
                    <el-input class="add-rack-input" v-model="payload.AGV_Name"></el-input>
                </el-form-item>
                <el-form-item label="IP">
                    <el-input class="add-rack-input" v-model="payload.IP"></el-input>
                </el-form-item>
                <el-form-item label="Port">
                    <el-input class="add-rack-input" v-model="payload.Port"></el-input>
                </el-form-item>
                <el-divider>Layout</el-divider>
                <el-form-item label="Row">
                    <el-input-number :min="1" class="add-rack-input" v-model="payload.row"></el-input-number>
                </el-form-item>
                <el-form-item label="Col">
                    <div class="d-flex flex-column">
                        <el-input-number :min="1" class="add-rack-input" v-model="payload.col"></el-input-number>
                        <el-popover placement="bottom-end" v-model="colRowSelectorShow" width="400" trigger="click">
                            <template #reference>
                                <div style="width:26px"><i class="bi bi-grid-3x3" style="font-size: 26px;"></i></div>
                            </template>
                            <ColumnRowSelector :maxRowNum="3" @on-selected="(payload) => {
                                this.colRowSelectorShow = fasle;
                                this.payload.col = payload.col;
                                this.payload.row = payload.row;
                            }"></ColumnRowSelector>
                        </el-popover>
                    </div>
                </el-form-item>
                <el-divider>Developer</el-divider>
                <el-form-item label="模擬">
                    <el-switch class="add-rack-input" v-model="payload.Simulation"></el-switch>
                </el-form-item>
            </el-form>
            <div class="border-top py-2 text-start">
                <b-button @click="IsEditMode ? EditVehicle() : AddVehicle()" variant="primary" :loading="adding" style="width: 120px;">{{ btnText }}</b-button>
            </div>
        </div>
        <div class="border-start bg-light rack-edit-preview">Preview <Rack rackName="WIP-1" :isEdit="true" :editProps="payload"></Rack>
        </div>
    </div>
</template>
<script>
import { VehicleManagerAPI } from '@/api/VMSAPI'
import ColumnRowSelector from './ColumnRowSelector.vue'
import Rack from './Rack.vue'
export default {
    components: {
        Rack, ColumnRowSelector
    },
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
                AGV_Name: 'WIP-',
                Model: 3,
                Protocol: 0,
                IP: '127.0.0.1',
                Port: 7025,
                row: 3,
                col: 3,
                Simulation: false
            },
            oriAGVID: '',
            adding: false,
            colRowSelectorShow: false,
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
.add-rack {
    .add-rack-input {
        width: 220px;
    }

    .rack-edit-preview {
        overflow-x: scroll;
        padding: 2px;
        margin: 20px;
    }
}
</style>