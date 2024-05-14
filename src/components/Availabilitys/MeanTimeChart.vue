<template>
  <div class="w-100 rounded" v-loading="loading">
    <apexchart
      ref="bat_chart"
      :height="chartHeight"
      :options="chart_datas.chartOptions"
      :series="chart_datas.series"></apexchart>
  </div>
</template>
<script>
export default {
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
      return `${window.innerHeight * 0.8}px`
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
              enabled: false
            },
            animations: {
              enabled: false,
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
              format: 'yy-MM-dd',
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
                formatter: function (val) {
                  return (val / 60 / 60).toFixed(2);  // 簡化標籤的格式
                },
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
            },
            {
              opposite: true,
              labels: {
                formatter: function (val) {
                  return (val / 60 / 60).toFixed(2);  // 簡化標籤的格式
                },
                style: {
                  fontSize: '16px',
                }
              },
              title: {
                text: 'MTBF(小時)',
                style: {
                  fontSize: '16px',
                }
              },
              axisBorder: {
                show: true
              }
            },
          ],
          tooltip: {
            enabled: false
          }
        },
      }
    }
  },
  methods: {
    RenderChartWithTimeSeriesData(datas) {
      //[ {name:'',data:''}]
      setTimeout(() => {
        this.chart_datas.series = datas

        this.$refs['bat_chart'].updateSeries(this.chart_datas.series)

      }, 1000);
    },
  },
  mounted() {
    this.chart_datas.chartOptions.title.text = this.title;
  },
}
</script>
<style lang="scss">
.my-legend {
  width: 120px;
}
</style>