<template>
    <div class="border px-2  text-start">
        <el-radio-group v-model="ParkingAcqQueryOptions.QueryBy" class="d-flex flex-column text-start">
            <el-radio style="margin-right: auto;" label="taskName" size="large">Task Name </el-radio>
            <el-input class="px-4" :disabled="ParkingAcqQueryOptions.QueryBy == 'time'" v-model="ParkingAcqQueryOptions.TaskNameInput">
            </el-input>
            <el-radio style="margin-right: auto;" label="time" size="large"> <span>時間區間</span>
            </el-radio>
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
        <div class="border my-2 d-flex flex-row">
            <el-table :data="stasData" border class="m-2 h-100" style="width:300px">
                <el-table-column label="方向" prop="Name"></el-table-column>
                <el-table-column label="最大振幅" prop="Max"></el-table-column>
                <el-table-column label="平均振幅值" prop="Avg"></el-table-column>
            </el-table>
            <apexchart class="flex-fill border m-2" ref="park_acq_chart" type="area" height="400" :options="chart_datas.chartOptions" :series="chart_datas.series"></apexchart>
        </div>
    </div>
</template>

<script>
import { LogAPI } from '@/api/VMSAPI.js'
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
                },
                {
                    name: "Y",
                    data: []
                }, {
                    name: "Z",
                    data: []
                }],
                chartOptions: {
                    chart: {
                        height: 360,
                        type: 'area',
                        zoom: {
                            enabled: true
                        },
                        animations: {
                            enabled: false,
                        }
                    },
                    theme: {
                        mode: 'light',
                        palette: 'palette1',
                        monochrome: {
                            enabled: false,
                            color: '#255aee',
                            shadeTo: 'light',
                            shadeIntensity: 0.65
                        },
                    }
                    ,
                    dataLabels: {
                        enabled: false,
                        formatter: function (val, opts) {
                            return val
                        },
                    },
                    stroke: {
                        curve: 'straight'
                    },
                    title: {
                        text: '',
                        align: 'left'
                    },
                    grid: {
                        row: {
                            colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        },
                    },
                    xaxis: {
                        type: 'datetime',
                        tickAmount: 10,
                        title: {
                            text: "Time"
                        },
                        min: new Date('01 Mar 2012').getTime(),
                    },
                    yaxis: {
                        title: {
                            text: "Vibration(m/s^2)"
                        },
                        labels: {
                            formatter: function (val) {
                                // 四捨五入到最近的整數
                                return val.toFixed(2)
                            }
                        }
                    },
                    tooltip: {
                        enabled: false
                    },

                },
            },
            stasData: [
                {
                    Name: 'X',
                    Max: 0,
                    Avg: 0,
                },
                {
                    Name: 'Y',
                    Max: 0,
                    Avg: 0,
                },
                {
                    Name: 'Z',
                    Max: 0,
                    Avg: 0,
                }
            ]

        }
    },
    methods: {
        async HandleQueryBtnClick() {
            var history = []
            var data = []
            if (this.ParkingAcqQueryOptions.QueryBy == 'taskName') {
                history = await LogAPI.QueryVibrationRecordsByTaskName(this.ParkingAcqQueryOptions.TaskNameInput);
            } else
                history = await LogAPI.QueryVibrationRecordsByTime(this.ParkingAcqQueryOptions.StartTimeStr, this.ParkingAcqQueryOptions.EndTimeStr);

            data = history.data;
            var _filter = data.filter(v => v.Time_str != '0001/01/01 00:00:00.0000');
            if (_filter.length == 0) {
                this.chart_datas.series[0].data = [];
                return;
            }
            var series_data_x = data.map(dat => [moment(dat.Time_str).add(8, 'hour').valueOf(), dat.AccelermetorValue.x]);
            var series_data_y = data.map(dat => [moment(dat.Time_str).add(8, 'hour').valueOf(), dat.AccelermetorValue.y]);
            var series_data_z = data.map(dat => [moment(dat.Time_str).add(8, 'hour').valueOf(), dat.AccelermetorValue.z]);

            this.stasData[0].Max = history.max_x
            this.stasData[1].Max = history.max_y
            this.stasData[2].Max = history.max_z

            this.stasData[0].Avg = history.avg_x
            this.stasData[1].Avg = history.avg_y
            this.stasData[2].Avg = history.avg_z

            this.chart_datas.series[0].data = series_data_x;
            this.chart_datas.series[1].data = series_data_y;
            this.chart_datas.series[2].data = series_data_z;

            var startTime = new Date(series_data_x[0][0]);
            console.log(startTime)
            this.chart_datas.chartOptions.xaxis.min = startTime.getTime();
            this.$refs['park_acq_chart'].updateOptions(this.chart_datas.chartOptions);


        }
    },
    mounted() {
        this.ParkingAcqQueryOptions.EndTimeStr = moment(Date.now()).format('YYYY/MM/DD HH:mm:ss');
    },
}
</script>

<style></style>