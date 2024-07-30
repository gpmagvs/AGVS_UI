<template>
    <el-drawer v-model="drawerVisible" :before-close="closeDrawer" :show-close="false" :with-header="false" size="70%">
        <div class="drawer-content">
            <div class="d-flex justify-content-between">
                <div class="title ">編輯設定 | {{ rackOptions.Name }} </div>
                <div class="actions px-2 py-2 ">
                    <b-button class="mx-1" variant="primary" @click="HandleSaveButtonClicked">儲存</b-button>
                    <b-button class="mx-1" variant="danger" @click="closeDrawer()">離開</b-button>
                </div>
            </div>
            <el-divider></el-divider>
            <div class="container d-flex ">
                <div class="rack-basic-properties border px-3 mx-2 rounded">
                    <el-form label-width="100px" label-position="left" style="width:400px">
                        <el-divider>Basic</el-divider>
                        <el-form-item label="RACK名稱">
                            <el-input class="add-rack-input" v-model="rackOptions.Name"></el-input>
                        </el-form-item>
                        <el-form-item label="IP">
                            <el-input class="add-rack-input" v-model="rackOptions.ConnOptions.IP"></el-input>
                        </el-form-item>
                        <el-form-item label="Port">
                            <el-input class="add-rack-input" v-model="rackOptions.ConnOptions.Port"></el-input>
                        </el-form-item>
                        <el-divider>Layout</el-divider>
                        <el-form-item label="Row(層數)">
                            <el-input-number :min="1" class="add-rack-input" v-model="rackOptions.Rows" @input="HandleRowChanged"></el-input-number>
                        </el-form-item>
                        <el-form-item label="Col">
                            <div class="d-flex flex-column">
                                <el-input-number :min="1" class="add-rack-input" v-model="rackOptions.Columns" @input="HandleColChanged"></el-input-number>
                                <el-popover placement="bottom-end" v-model="colRowSelectorShow" width="400" trigger="click">
                                    <template #reference>
                                        <div style="width:26px"><i class="bi bi-grid-3x3" style="font-size: 26px;"></i></div>
                                    </template>
                                    <ColumnRowSelector :maxRowNum="3" @on-selected="(payload) => {
                                        this.colRowSelectorShow = fasle;
                                        this.rackOptions.Rows = payload.col;
                                        this.rackOptions.Columns = payload.row;
                                    }"></ColumnRowSelector>
                                </el-popover>
                            </div>
                        </el-form-item>
                        <el-divider>Developer</el-divider>
                        <el-form-item label="模擬">
                            <el-switch class="add-rack-input" v-model="rackOptions.IsEmulation"></el-switch>
                        </el-form-item>
                    </el-form>
                </div>
                <!-- Drawer content goes here -->
                <div class="w-100 bg-light rack-container border rounded px-2 text-start">
                    <el-divider>Input Address and Tags</el-divider>
                    <!-- <span>檢視模式</span> <el-select class="mx-3" placeholder="abc" title="bbbb">
                        <el-option label="圖示"></el-option>
                        <el-option label="表格"></el-option>
                    </el-select> -->
                    <Rack ref="rack_edit" :rackName="wipName" :showIOLocationEdit="true"></Rack>
                </div>
            </div>
        </div>
    </el-drawer>
</template>
<script>
import Rack from './Rack.vue';
import { EqStore } from '@/store'
import ColumnRowSelector from './ColumnRowSelector.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
export default {
    components: {
        Rack, ColumnRowSelector
    },
    props: {
        wipName: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            drawerVisible: true,
            rackData: {
                WIPName: "WIP-3",
                Columns: 3,
                Rows: 3,
                ColumnsTagMap: Object,
                Ports: Array[9],
            },
            rackOptions: {
                Name: 'WIP-',
                Rows: 1,
                Columns: 1,
                Protocol: 0,
                ConnOptions: {
                    IP: "127.0.0.1",
                    Port: 5000
                },
                IsEmulation: false
            },
            beginOptionJson: "",
            colRowSelectorShow: false,
        };
    },
    methods: {
        openDrawer(rackInfo) {
            if (rackInfo) {
                Object.assign(this.rackOptions, rackInfo);
            }
            this.beginOptionJson = JSON.stringify(this.rackOptions);
            this.drawerVisible = true;
            setTimeout(() => {
                let _rackData = EqStore.getters.WIPData.find(dat => dat.WIPName == this.wipName)
                if (_rackData) {
                    Object.assign(this.rackData, _rackData);
                }
                let rackEdit = this.$refs['rack_edit']
                rackEdit.speficRackData = this.rackData;
            }, 100);

        },
        closeDrawer() {
            var currentOptionJson = JSON.stringify(this.rackOptions);
            var anyChanged = this.beginOptionJson != currentOptionJson;
            if (!anyChanged) {
                this.drawerVisible = false;
                return;
            }

            ElMessageBox.confirm(
                '設定尚未儲存，確定要離開?',
                'Warning', {
                type: 'warning'
            }
            ).then(() => {
                this.drawerVisible = false;

            }).catch(() => { })
        },
        HandleRowChanged(row) {
            this.rackData.Rows = row;
            let rackEdit = this.$refs['rack_edit']
            rackEdit.speficRackData = this.rackData;
        },
        HandleColChanged(col) {
            this.rackData.Columns = col;
            let rackEdit = this.$refs['rack_edit']
            rackEdit.speficRackData = this.rackData;
        },
        HandleSaveButtonClicked() {
            ElMessageBox.confirm(
                '確定要變更RACK設定',
                'Warning',
                {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }
            )
                .then(() => {
                    this.beginOptionJson = JSON.stringify(this.rackOptions);
                    ElMessage({
                        type: 'success',
                        message: 'Delete completed',
                    })
                })
                .catch(() => {
                    // ElMessage({
                    //     type: 'info',
                    //     message: 'Delete canceled',
                    // })
                })
        }
    }
};
</script>
<style lang="scss" scoped>
.drawer-content {
    .title {
        font-size: 30px;
        text-align: start;
        padding-left: 20px;
    }

    .actions {
        button {
            min-width: 100px;
        }
    }

    .rack-container {}
}
</style>
