<template>
  <div class="w-100 rounded" v-loading="loading">
    <apexchart
      ref="ins_chart"
      :height="chartHeight"
      :options="chart_datas.chartOptions"
      :series="chart_datas.series"
    ></apexchart>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  components: {
  },
  props: {
    id: {
      type: String,
      default: 'a'
    },
    title: {
      type: String,
      default: 'title'
    }
  },
  computed: {
    chartHeight() {
      return `${window.innerHeight * 0.3}px`
    }
  },
  data() {
    return {
      loading: false,
      myChart: undefined,
      chart_datas: {
        series: [{
          name: "Desktops",
          data: [10, 41]
        }],
        chartOptions: {
          chart: {
            type: 'line',
            zoom: {
              enabled: true
            },
            animations: {
              enabled: true,
            },
          },
          dataLabels: {
            enabled: false
          },
          legend: {
            show: true,
            position: 'top'
          },
          title: {
            text: '電量',
            align: 'center'
          },
          xaxis: {
            type: 'datetime',
            tickAmount: 3,
            labels: {
              format: 'yy-MM-dd HH:mm:ss',
              style: {
                fontSize: '16px',
              }
            },
            // min: new Date('01 Mar 2012').getTime(),
            title: {
              text: '時間',
              style: {
                fontSize: '16px',
              }
            },
            axisBorder: {
              show: true
            }
          },
          yaxis: [
            {
              labels: {
                style: {
                  fontSize: '16px',
                }
              },
              title: {
                text: 'MTTR(小時)',
                style: {
                  fontSize: '16px',
                }
              },
              axisBorder: {
                show: true
              }
            }
          ],
          tooltip: {
            enabled: true
          }
        },
      },
    }
  },
  methods: {
    /**
     * { name: 'ITEM', data: [{x:time,y:val}] },
     */
    RenderChartWithTimeSeriesData(datas) {
      let _data = JSON.parse(JSON.stringify(datas));

      this.chart_datas.chartOptions.yaxis[0].title.text = datas[0].name;

      this.$refs['ins_chart'].updateOptions(this.chart_datas.chartOptions)
      this.debounceChartUpdate(_data);

    },
    debounceChartUpdate: _.debounce(function (data) {
      this.$refs['ins_chart'].updateSeries(data)
    }, 300), // Adjust debounce time as needed
  },
  mounted() {
    this.chart_datas.chartOptions.title.text = this.title;
    setTimeout(() => {
      this.RenderChartWithTimeSeriesData([{
        name: 'demo',
        data: [
          { x: '1111/11/11', y: 23 },
          { x: '1111/11/12', y: 3 },
          { x: '1111/11/13', y: 213 }
        ]
      }])


    }, 1000);
  },
}
</script>
<style lang="scss">
.my-legend {
  width: 120px;
}
</style>