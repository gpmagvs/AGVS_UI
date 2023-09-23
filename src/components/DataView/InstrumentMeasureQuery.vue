<!--  -->
<template>
    <div class=''>
        <CommonOptions @OnQueryBtnClick="HandleQueryBtnClick"></CommonOptions>
        <div class="w-100 my-1 border rounded p-2">
            <b-pagination :per-page="QueryResult.DataNumPerPage" :total-rows="QueryResult.TotalDataNum" aria-controls="measure_result_table"
                class="pagination justify-content-start" v-model="QueryResult.Page" @click="PageChnageHandle"></b-pagination>
            <el-table border :data="QueryResult.dataList" style="width:1800px" id="measure_result_table">
                <el-table-column prop="TaskName" label="任務名稱" fixed="left" width="210"></el-table-column>
                <el-table-column prop="AGVName" label="AGV名稱" fixed="left" width="90"></el-table-column>
                <el-table-column prop="BayName" label="Bay名稱" fixed="left" width="90"></el-table-column>
                <el-table-column prop="location" label="量測點位" fixed="left"></el-table-column>
                <el-table-column :formatter="TimeFormatter" prop="StartTime" label="開始量測時間" fixed="left" width="180"></el-table-column>
                <el-table-column :formatter="ResultFormatter" prop="result" label="量測結果" fixed="left"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="illuminance" label="照度(lux)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="decibel" label="分貝(dB)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="temperature" label="溫度 (℃)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="humudity" label="濕度 (%)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="IPA" label="IPA (異丙醇)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="Acetone" label="Acetone (丙酮)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="TVOC" label="TVOC (Non-Target)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="PID" label="PID"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="partical_03um" label="微塵粒子(0.3μm)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="partical_05um" label="微塵粒子(0.5μm)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="partical_10um" label="微塵粒子(1.0μm)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="partical_30um" label="微塵粒子(3.0μm)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="partical_50um" label="微塵粒子(5.0μm)"></el-table-column>
                <el-table-column :formatter="ValFormatter" prop="partical_100um" label="微塵粒子(10.0μm)" fixed="right"></el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script>
import CommonOptions from './CommonOptions'
import { Query } from '@/api/MeasureResultAPI'
import moment from 'moment'
export default {
    components: { CommonOptions },
    data() {
        return {
            QueryResult: {

            },
            Options: {}
        };
    },
    computed: {},
    watch: {},
    methods: {
        async HandleQueryBtnClick(options) {
            this.Options = options;
            this.QueryResult = await Query(options)
        },
        ResultFormatter(row, column, cellValue, index) {
            return cellValue == 'done' ? '成功' : '失敗'
        },
        TimeFormatter(row, column, cellValue, index) {
            return moment(cellValue).format('yyyy-MM-DD \r\n HH:mm:ss')
        },
        ValFormatter(row, column, cellValue, index) {
            return cellValue == '-1' || cellValue == '-1.0' ? 'NA' : cellValue;
        },
        PageChnageHandle() {
            this.Options.Page = this.QueryResult.Page;
            this.HandleQueryBtnClick(this.Options);
        }
    },
    mounted() {

    },
}
</script>
<style lang='scss' scoped></style>