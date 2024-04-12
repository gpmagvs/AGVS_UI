<template>
    <div class="border px-2  text-start">
        <el-radio-group v-model="ParkingAcqQueryOptions.QueryBy" class="d-flex flex-column text-start">
            <div class="d-flex flex-row w-100 px-4 bg-light">
                <span style="font-size:15px">開始時間</span>
                <el-date-picker
                    class="mx-2"
                    v-model="ParkingAcqQueryOptions.StartTimeStr"
                    type="datetime"
                    placeholder="Select date and time"
                    value-format="YYYY/MM/DD HH:mm:ss"
                    :disabled="ParkingAcqQueryOptions.QueryBy == 'taskName'" />
                <span style="font-size:15px">結束時間</span>
                <el-date-picker
                    class="mx-2"
                    v-model="ParkingAcqQueryOptions.EndTimeStr"
                    type="datetime"
                    placeholder="Select date and time"
                    value-format="YYYY/MM/DD HH:mm:ss"
                    :disabled="ParkingAcqQueryOptions.QueryBy == 'taskName'" />
            </div>
        </el-radio-group>
        <div class="border-top my-1 py-2">
            <el-button class="mx-1" @click="HandleQueryBtnClick" type="primary">查詢</el-button>
            <el-button v-if="this.ParkingAqcQuResults.length > 0" type="primary" @click="HandleDownloadCSVBtnClick">Download CSV</el-button>
        </div>
        <div class="m-1 border-top" id="chart">
            <apexchart
                type="bar"
                :height="chartHeight"
                ref="avalibility_chart"
                :options="chart_datas.chartOptions"
                :series="chart_datas.series"></apexchart>
        </div>
    </div>
</template>

<script>
import { DataAnalysisAPI } from '@/api/VMSAPI.js'
import moment from 'moment'
export default {
    data() {
        return {
            ParkingAcqQueryOptions: {
                StartTimeStr: "2023/09/08 10:00:00",
                EndTimeStr: "2023/09/08 11:00:00",
                Tag: 7,
                TagSelect: 7,
                TaskName: '',
                TaskNameInput: '',
                Page: 1,
                NumberPerPage: 10,
                QueryBy: 'taskName'
            },
            ParkingAqcQuResults: [],
            chart_datas: {
                series: [{
                    name: "X",
                    data: []
                }],
                chartOptions: {
                    chart: {
                        type: 'bar',
                        zoom: {
                            enabled: true
                        },
                        animations: {
                            enabled: false,
                        }
                    },
                    plotOptions: {
                        bar: {
                            columnWidth: '100%',
                            distributed: true
                        }
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    legend: {
                        show: false // 不顯示圖例
                    },
                    tooltip: {
                        enabled: false
                    },

                },
            }

        }
    },
    methods: {
        async HandleQueryBtnClick() {
            var data = await DataAnalysisAPI.QueryAvalibility(this.ParkingAcqQueryOptions.StartTimeStr, this.ParkingAcqQueryOptions.EndTimeStr)
            var status_list = data.statusTimeList;
            var dynamic_index = 0;
            var data = []

            status_list.forEach(s => {
                debugger
                for (let index = dynamic_index; index < dynamic_index + s.sec; index += 10) {
                    data.push({
                        x: index,
                        y: 1,
                        fillColor: '#1fff74'
                    })

                    dynamic_index + 10;
                }
            });
            this.chart_datas.series[0].data = data;
        }
    },
    mounted() {
        this.ParkingAcqQueryOptions.EndTimeStr = moment(Date.now()).format('YYYY/MM/DD HH:mm:ss');
    },
    computed: {
        chartHeight() {
            return `${window.innerHeight / 1.7}px`
        }
    }
}
</script>

<style></style>