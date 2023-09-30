<template>
    <el-dialog v-model="show_dialog" draggable title="搬運任務">
        <h3>{{ action == 'unload' ? '下游設備列表' : '來源設備列表' }}</h3>
        <div class="justify-content-center px-5">
            <el-table size="small" border :data="CandicateEQOptions">
                <el-table-column v-if="action == 'unload'" label="起點">
                    <template #default="scope">
                        <b style="color:blue"> {{ source_station.Name }} </b>
                    </template>
                </el-table-column>
                <el-table-column :label="action == 'unload' ? '下游設備' : '上游設備'" prop="Name">
                    <template #default="scope">
                        <b> {{ scope.row.Name }} </b>
                    </template>
                </el-table-column>
                <el-table-column v-if="action == 'load'" label="終點">
                    <template #default="scope">
                        <b style="color:seagreen"> {{ source_station.Name }} </b>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="TAG" prop="TagID"></el-table-column>
                <el-table-column align="center" label="動作">
                    <template #default="scope">
                        <b-button style="width:90px" size="sm" variant="primary" :disabled="!Transferable(scope.row.TagID)">搬運</b-button>
                    </template>
                </el-table-column>
                <el-table-column width="300" label="說明">
                    <template #default="scope">
                        <div class="text-danger">{{ NoTransferActionReason(scope.row.TagID) }}</div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-dialog>
</template>

<script>
import { GetEQOptions, SaveEQOptions, ConnectTest } from '@/api/EquipmentAPI.js';
import { EqStore } from '@/store'
export default {
    data() {
        return {
            show_dialog: false,
            source_station: {},
            EQOptions: [],
            CandicateEQOptions: [],
            action: ''
        }
    },
    methods: {
        ShowDialog(source_station, action = 'load') {
            this.action = action;
            this.CandicateEQOptions = [];
            var source_tag = source_station.TagNumber
            GetEQOptions().then(options => {
                var source = options.find(opt => opt.TagID == source_tag)
                var downstreamEqNames = source.ValidDownStreamEndPointNames
                this.EQOptions = options
                if (action == 'unload')
                    this.CandicateEQOptions = options.filter(eq => downstreamEqNames.includes(eq.Name))
                else {
                    //找到上游設備>
                    this.CandicateEQOptions = options.filter(eq => eq.ValidDownStreamEndPointNames.includes(source_station.Name))
                }

                this.source_station = source_station;
                this.show_dialog = true
            })
        },
        Transferable(TagID) {
            if (TagID == undefined)
                return true;

            var EQ = this.eq_status_data.find(eq => eq.Tag == TagID);
            if (this.action == 'load') {
                //來源機台必須 U_REQ ON and 下點位 and Status down 
                return EQ.Unload_Request && EQ.Up_Pose && EQ.IsConnected && EQ.Eqp_Status_Down
            } else {
                return EQ.Load_Request && EQ.Down_Pose && EQ.IsConnected && EQ.Eqp_Status_Down

            }
        },
        NoTransferActionReason(TagID) {
            if (TagID == undefined)
                return "";
            var EQ = this.eq_status_data.find(eq => eq.Tag == TagID);
            var action = this.action == 'load' ? 'unload' : 'load';
            if (!EQ.IsConnected)
                return `${EQ.EQName} 機台尚未連線`
            if (!EQ.Eqp_Status_Down)
                return `${EQ.EQName} 機台狀態異常(Eqp_Status_Down)`

            if (action == 'load') {
                if (!EQ.Load_Request)
                    return `${EQ.EQName} 機台未發起載入請求(Load_Request)`
                if (!EQ.Down_Pose)
                    return `${EQ.EQName} 設備機構位置錯誤(Down_Pose)`
            }
            if (action == 'unload') {
                if (!EQ.Unload_Request)
                    return `${EQ.EQName} 機台未發起移出請求(Unload_Request)`
                if (!EQ.Up_Pose)
                    return `${EQ.EQName} 設備機構位置錯誤(Up_Pose)`
            }
            return ""
        }
    },
    computed: {
        eq_status_data() {
            return EqStore.getters.EQData
        },
    },
}
</script>

<style lang="scss" scoped></style>