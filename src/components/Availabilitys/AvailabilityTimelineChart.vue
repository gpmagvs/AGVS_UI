<template>
  <div class="w-100 rounded" id="my-timeline-chart" v-loading="loading">
    <div class="my-legend px-5 my-3 d-flex flex-row justify-content-between">
      <div class="d-flex flex-row mx-1" v-for="(value, key) in colors" :key="key">
        <div
          class="mt-1 mx-1 rounded"
          v-bind:style="{backgroundColor:value,height:'10px',width:'40px'}"
        ></div>
        <span style="font-size:9px">{{ key.toUpperCase()}}</span>
      </div>
    </div>
    <apexchart
      ref="apex-chart"
      width="100%"
      height="400"
      type="rangeBar"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>
<script>
import { watch } from 'vue'
export default {
  data() {
    return {
      loading: false,
      colors: {
        run: 'rgb(98, 243, 166)',
        idle: 'rgb(255, 226, 6)',
        down: 'rgb(219, 7, 0)',
        charge: 'rgb(51, 207, 255)',
        unknown: 'rgb(186, 186, 186)'
      },
      series: [
        // {
        //   name: 'Bob',
        //   data: [
        //     {
        //       x: 'Design',
        //       y: [
        //         new Date('2019-03-05').getTime(),
        //         new Date('2019-03-08').getTime()
        //       ],
        //       fillColor: '#00E396',
        //     },
        //     {
        //       x: 'Design',
        //       y: [
        //         new Date('2019-03-09').getTime(),
        //         new Date('2019-03-12').getTime()
        //       ]
        //     },
        //     {
        //       x: 'Design',
        //       y: [
        //         new Date('2019-03-12').getTime(),
        //         new Date('2019-03-13').getTime()
        //       ]
        //     },
        //   ]
        // },

      ],
      chartOptions: {
        chart: {
          height: 550,
          type: 'rangeBar',
          animations: {
            enabled: false,
            dynamicAnimation: {
              enabled: false,
              speed: 350
            }
          }
        },
        dynamicUpdate: false,
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '80%'
          }
        },
        xaxis: {
          type: 'datetime',

        },
        stroke: {
          width: 0
        },
        fill: {
          type: 'solid',
          opacity: 1
        },
        legend: {
          show: false,
          // position: 'top',
          // horizontalAlign: 'left'
        }
      },
      data: {},
      datetime: 1
    }
  },
  computed: {
    chart() {
      return this.$refs['apex-chart'];
    }
  },
  methods: {

    async RenderChart(data) {
      this.data = data;
      var _series = [];
      this.chart.updateSeries(_series);
      console.log('1', Date.now());
      Object.keys(data).forEach(agv_name => {
        _series.push(this.BuildDataSeries(agv_name, data[agv_name]));
      })
      this.chart.updateSeries(_series, false);
      console.log('2', Date.now());
      setTimeout(() => {
        this.loading = false;
      }, 600);
    },
    BuildDataSeries(agv_name, data) {
      var _series = {
        name: agv_name,
        data: []
      }
      data.idle.forEach(d => {
        _series.data.push({
          x: agv_name,
          y: [new Date(d.from).getTime(), new Date(d.to).getTime()],
          fillColor: this.colors.idle,
        })
      })
      data.run.forEach(d => {
        _series.data.push({
          x: agv_name,
          y: [new Date(d.from).getTime(), new Date(d.to).getTime()],
          fillColor: this.colors.run,
        })
      })
      data.down.forEach(d => {

        _series.data.push({
          x: agv_name,
          y: [new Date(d.from).getTime(), new Date(d.to).getTime()],
          fillColor: this.colors.down,
        })
      })
      data.charge.forEach(d => {
        _series.data.push({
          x: agv_name,
          y: [new Date(d.from).getTime(), new Date(d.to).getTime()],
          fillColor: this.colors.charge,
        })
      })
      data.unknown.forEach(d => {
        _series.data.push({
          x: agv_name,
          y: [new Date(d.from).getTime(), new Date(d.to).getTime()],
          fillColor: this.colors.unknown,
        })
      })
      return _series;
    }
  },
  mounted() {
    // watch(() => this.data, (new_, old_) => {

    //   Object.keys(new_).forEach((agv_name) => {
    //     var newAgvData = new_[agv_name]
    //     var oldAgvData = old_[agv_name]
    //     if (!newAgvData) {
    //       return;
    //     }
    //     if (!oldAgvData) {
    //       this.series.push(this.BuildDataSeries(agv_name, newAgvData))
    //     }
    //     else {

    //     }
    //   })
    // })
  },
}
</script>

<style lang="scss">
.my-legend {
  width: 120px;
}
</style>