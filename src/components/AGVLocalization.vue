<template>
    <div class="localization">
        <el-dialog v-model="ShowDialog" draggable title="定位">
            <div class="w-100 border-top py-2" style="position:relative;top:-22px">
                <div class="block">
                    <div class="title">當前位置ID</div>
                    <div class="control">
                        <el-input-number v-model="localization.currentID"></el-input-number>
                    </div>
                </div>
                <div class="block">
                    <div class="title">X座標</div>
                    <div class="control">
                        <el-input-number step="0.01" precision="2" v-model="localization.x"></el-input-number>
                    </div>
                </div>
                <div class="block">
                    <div class="title">Y座標</div>
                    <div class="control">
                        <el-input-number step="0.01" precision="2" v-model="localization.y"></el-input-number>
                    </div>
                </div>
                <div class="block">
                    <div class="title">角度</div>
                    <div class="control">
                        <el-input-number step="0.1" precision="1" v-model="localization.theata"></el-input-number>
                    </div>
                </div>
                <div class="block py-3">
                    <b-button class="mx-3 w-100" variant="primary" @click="HandleLocClick">確認定位</b-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { InspectionAGVAPI } from '@/api/VMSAPI.js'
import { AGVStatusStore } from '@/store';
import clsLocalization from '@/ViewModels/InspectionAGV/clsLocalization';

export default {
    data() {
        return {
            ShowDialog: false,
            localization: new clsLocalization(10, 0, 0, 0)
        }
    },
    methods: {
        Show() {
            this.localization.currentID = AGVStatusStore.getters.AGVStatus.Last_Visited_Tag
            this.ShowDialog = true;
        },
        async HandleLocClick() {
            var result = await InspectionAGVAPI.Localization(this.localization)
            this.$swal.fire(
                {
                    text: result.Success ? '' : result.Message,
                    title: result.Success ? '定位完成' : '定位失敗',
                    icon: result.Success ? 'success' : 'error',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                })
        }
    },
}
</script>
<style lang="scss" scoped>
.localization {
    .block {
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;

        .title {
            font-size: 20px;
            width: 165px;
            font-weight: bold;
        }
    }
}
</style>