<template>
    <div class="transfer-log-view">
        <div class="d-flex flex-row w-100 m-2">
            <span style="font-size:15px">開始時間</span>
            <el-date-picker
                class="mx-2"
                v-model="QueryOptions.StartTimeStr"
                type="datetime"
                placeholder="Select date and time"
                value-format="YYYY/MM/DD HH:mm:ss" />
            <span style="font-size:15px">結束時間</span>
            <el-date-picker
                class="mx-2"
                v-model="QueryOptions.EndTimeStr"
                type="datetime"
                placeholder="Select date and time"
                value-format="YYYY/MM/DD HH:mm:ss" />
            <b-button @click="HandleRefreshClick" size="sm" variant="primary">查詢</b-button>
        </div>
        <el-table v-loading="loading" :data="transfer_data" border style="height: 600px;">
            <el-table-column label="開始時間" prop="StartTime" :formatter="TimeFormater"></el-table-column>
            <el-table-column label="結束時間" prop="EndTime" :formatter="TimeFormater"></el-table-column>
            <el-table-column label="花費時間(秒)" prop="TimeSpend"></el-table-column>
            <el-table-column label="來源機台" prop="FromName"></el-table-column>
            <el-table-column label="終點機台" prop="ToName"></el-table-column>
            <el-table-column label="起始位置" prop="StartLocName"></el-table-column>
            <el-table-column label="開始電量(%)" prop="BatLvStart"></el-table-column>
            <el-table-column label="結束電量(%)" prop="BatLvEnd"></el-table-column>
            <el-table-column label="電量損耗(%)" prop="BatLoss"></el-table-column>
            <el-table-column label="總里程(m)" prop="Odometry">
                <template #default="scope"> {{ (scope.row.Odometry * 1000).toFixed(1) }} </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { LogAPI } from '@/api/VMSAPI.js'
import moment from 'moment';
export default {
    data() {
        return {
            transfer_data: [],
            loading: false,
            QueryOptions: {
                StartTimeStr: '',
                EndTimeStr: ''

            }
        }
    },
    methods: {
        SetDefaultTimeInterval() {
            var _year = moment(Date.now()).year();
            var _month = moment(Date.now()).month();
            var _day = moment(Date.now()).date();

            this.QueryOptions.StartTimeStr = moment(new Date(_year, _month, _day, 0, 0, 0)).format('yyyy/MM/DD HH:mm:ss')
            this.QueryOptions.EndTimeStr = moment(new Date(_year, _month, _day, 23, 59, 59)).format('yyyy/MM/DD HH:mm:ss')
        },
        async FetchTodayTransferData() {
            this.loading = true;
            this.transfer_data = [];
            this.transfer_data = await LogAPI.GetTransferLog(this.QueryOptions.StartTimeStr, this.QueryOptions.EndTimeStr);
            this.loading = false
        },
        HandleRefreshClick() {
            this.FetchTodayTransferData()
        },
        TimeFormater(row, column, cellValue, index) {
            return moment(cellValue).format('yyyy/MM/DD HH:mm:ss')
        }
    },
    mounted() {
        this.SetDefaultTimeInterval();
        this.FetchTodayTransferData();
    }
}
</script>

<style></style>