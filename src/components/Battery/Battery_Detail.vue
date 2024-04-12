<template>
  <div>
    <b-tabs>
      <b-tab title="電池狀態">
        <div class="border p-3">
          <div class="text-start border-bottom my-2">
            <span class="mx-2">充電迴路</span>
            <el-switch
              size="large"
              inline-prompt
              active-text="開啟"
              inactive-text="關閉"
              inactive-color="red"
              v-model="charge_circuit_state"
              @change="HandleChargeCircuitSwitch"></el-switch>
          </div>
          <div class="d-flex flex-row">
            <div v-for="(bat, id) in batteries" :key="id">
              <div class="border p-3" style="width: 200px;">
                <div class="border-bottom text-start">
                  <h3>電池-{{ id }}</h3>
                </div>
                <el-form label-position="left" label-width="80px">
                  <el-form-item label="ID">{{ bat.batteryID }}</el-form-item>
                  <el-form-item label="狀態">{{ bat.state }}</el-form-item>
                  <el-form-item label="異常碼">{{ bat.errorCode }}</el-form-item>
                  <el-form-item label="電量">{{ bat.batteryLevel }} %</el-form-item>
                  <el-form-item label="電壓">{{ bat.Voltage / 1000.0 }}V</el-form-item>
                  <el-form-item label="放電電流">{{ bat.dischargeCurrent / 1000.0 }}A</el-form-item>
                  <el-form-item label="充電電流">{{ bat.chargeCurrent / 1000.0 }}A</el-form-item>
                  <el-form-item label="最高溫度">{{ bat.maxCellTemperature }}</el-form-item>
                  <el-form-item label="最低溫度">{{ bat.minCellTemperature }}</el-form-item>
                  <el-form-item label="循環次數">{{ bat.cycle }}</el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </b-tab>
      <b-tab title="歷史查詢">
        <div class="border p-3">
          <el-form label-position="left" label-width="80px">
            <el-form-item label="選擇電池">
              <el-select v-model="query_options.id">
                <el-option v-for="i in batteryIDList" :key="i" :label="`電池-${i + 1}`" :value="i"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="查詢項目">
              <el-select @change="HandleQueryItemChanged" v-model="query_options.item">
                <el-option label="電量" value="Level"></el-option>
                <el-option label="電壓" value="Voltage"></el-option>
                <el-option label="充電電流" value="Charge_current"></el-option>
                <el-option label="放電電流" value="Discharge_current"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="時間區間">
              <el-date-picker
                v-model="query_options.time_range"
                type="datetimerange"
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"></el-date-picker>
            </el-form-item>
          </el-form>
          <div class="text-start">
            <b-button @click="HandleQueryButtonClick" style="width:120px" variant="primary">查詢</b-button>
          </div>
          <div class="m-1 border-top" id="chart">
            <apexchart
              type="bar"
              :height="chartHeight"
              ref="bat_chart"
              :options="chart_datas.chartOptions"
              :series="chart_datas.series"></apexchart>
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import { ROS_STORE } from '@/store/ros_store';
import { BatteryAPI } from '@/api/VMSAPI.js'
import { AGVStatusStore } from '@/store'
import moment from 'moment'
export default {
  data() {
    return {
      charge_circuit_state: false,
      batteries: {},
      query_options: {
        id: 0,
        item: 'Level',
        time_range: ['', '']
      },
      chart_datas: {
        series: [{
          name: "Desktops",
          data: [10, 41]
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
          dataLabels: {
            enabled: false
          },
          legend: {
            show: false // 不顯示圖例
          },
          title: {
            text: '電量',
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5
            },
          },
          xaxis: {
            type: 'datetime',
            labels: {
              datetimeUTC: false,
              // 根據需要設置間隔
              tickAmount: 10,
            },
            min: new Date('01 Mar 2012').getTime(),
            title: {
              text: '時間'
            }
          },
          yaxis: {
            max: 100
          },
          tooltip: {
            enabled: false
          },
          plotOptions: {
            bar: {
              columnWidth: '95%',
              distributed: true
            }
          },
        },
      }
    }
  },
  computed: {
    battery_info() {
      return ROS_STORE.getters.BatteryInfo;
    },
    batteryIDList() {
      var id_list = [];
      for (let index = 0; index < this.batteryCount; index++) {
        id_list.push(index)
      }
      return id_list
    },
    batteryCount() {
      return AGVStatusStore.getters.BatteryCount
    },
    chartHeight() {
      return `${window.innerHeight / 1.7}px`
    }
  },
  methods: {
    HandleQueryItemChanged(item) {
      try {
        this.chart_datas.chartOptions.title.text = item
        this.$refs['bat_chart'].updateOptions(this.chart_datas.chartOptions)
      } catch (error) {
        console.error(error)
      }
    },
    async HandleChargeCircuitSwitch(enabled) {
      await BatteryAPI.ChargeCicuitSwitch(enabled)
    },
    async HandleQueryButtonClick() {
      this.chart_datas.series[0].data = [];
      var start_dt = moment(this.query_options.time_range[0]).format('yyyy/MM/DD')
      var end_dt = moment(this.query_options.time_range[1]).format('yyyy/MM/DD')
      this.query_options.time_range[0] = start_dt;
      this.query_options.time_range[1] = end_dt;
      var result = await BatteryAPI.Query(this.query_options)
      this.chart_datas.series[0].name = this.query_options.item;
      this.chart_datas.series[0].data = Object.keys(result).map(time => {
        return {
          x: moment(time).valueOf(),
          y: result[time].value,
          fillColor: this.GetBarColorWithAGVStatus(result[time].status)
        }
      })
      //this.$refs['bat_chart'].updateSeries(this.chart_datas.series, false)
      var times = Object.keys(result).map(dt => moment(dt).valueOf())
      var startTime = new Date(times[0]);
      this.chart_datas.chartOptions.xaxis.min = startTime.getTime();
      debugger
      if (this.query_options.item == 'Level') {

        this.chart_datas.chartOptions.yaxis = {
          max: 100,
          title: {
            text: "電量(%)"
          },
        };
      }
      else {

        this.chart_datas.chartOptions.yaxis = {
          title: {
            text: this.query_options.item
          }
        };
      }
      this.$refs['bat_chart'].updateOptions(this.chart_datas.chartOptions)
    },
    GetBarColorWithAGVStatus(status) {
      if (status == 1) {//IDLE
        return '#ffc600';
      } else if (status == 2) {//RUN
        return '#0d6efd';
      } else if (status == 3) {//DOWN
        return '#ff4a4a';
      } else if (status == 4) {//CHARGING
        return '#1fff74';
      }
      else //unknown
        return '#5e6a75'
    },
    async UpdateChargeCircuitState() {
      this.charge_circuit_state = await BatteryAPI.GetChargeCicuitState()
    }
  },
  mounted() {
    var timeNow = Date.now();
    var timeStart = moment(timeNow).add(-1, "day")
    this.query_options.time_range = [timeStart, timeNow];
    setInterval(() => {
      var battery = this.battery_info
      try {
        this.batteries[battery.batteryID] = battery
      } catch (error) {

      }
    }, 1000);
  },
}
</script>

<style lang="scss" scoped></style>