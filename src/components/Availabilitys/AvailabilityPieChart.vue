<template>
  <div class="border rounded" style="height:600px;width: 95%; display: flex;flex-direction:column;">
    <vue3-chart-js
      :key="myChart.type"
      ref="chartRef"
      :id="myChart.id"
      :type="myChart.type"
      :data="myChart.data"
      :options="myChart.options"
      @before-render="beforeRenderLogic"
    ></vue3-chart-js>
  </div>
</template>
  
  <script>
import Vue3ChartJs from '@j-t-mcc/vue3-chartjs'
import { watch } from 'vue'
export default {
  components: {
    Vue3ChartJs,
  },
  props: {
    ava_datas: {
      type: Array,
      default() {
        return [1, 1, 1, 1, 1]
      }
    },
    colorSet: {
      type: Array,
      default() {
        return [
          'rgb(2, 176, 8)',
          'rgb(255, 226, 6)',
          'rgb(255, 92, 92)',
          'rgb(51, 207, 255)',
          'rgb(186, 186, 186)'
        ]
      }
    }
  },
  data() {
    return {
      myChart: {
        id: 'pie',
        type: 'pie',
        data: {
          labels: ['RUN', 'IDLE', 'DOWN', 'CHARGE', 'UNKNOWN', 'UNKNOWN'],
          datasets: [
            {
              backgroundColor: this.colorSet,
              data: [0, 0, 0, 0, 0]
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animations: {
            tension: {
              duration: 1000,
              easing: 'linear',
              from: 1,
              to: 0,
              loop: true
            }
          },
          scales: {

          },
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: '稼動率',
            }
          },
        }
      }
    }
  },
  methods: {
    beforeRenderLogic(event) {
      //...
      //if(a === b) {
      //  event.preventDefault()
      //}
    },
    updateChart(data) {
      this.myChart.type = 'pie'
      this.myChart.options.scales = undefined
      this.myChart.data.datasets[0].data = data
      this.$refs.chartRef.update();
    },
    updateStackBarChart(days = {
      dates: [],
      idle: [],
      run: [],
      down: [],
      charge: [],
    }) {
      this.myChart.type = 'bar'
      this.myChart.data.labels = days.dates;
      this.myChart.data.datasets = [
        {
          label: 'IDLE',
          data: days.idle,
          backgroundColor: this.colorSet[1],
          stack: 'Stack 1' // 堆疊群組的名稱
        },
        {
          label: 'RUN',
          data: days.run,
          backgroundColor: this.colorSet[0],
          stack: 'Stack 1'
        },
        {
          label: 'DOWN',
          data: days.down,
          backgroundColor: this.colorSet[2],
          stack: 'Stack 1' // 堆疊群組的名稱
        },

        {
          label: 'CHARGE',
          data: days.charge,
          backgroundColor: this.colorSet[3],
          stack: 'Stack 1' // 堆疊群組的名稱
        }
      ]
      try {
        this.$refs.chartRef.update();
      } catch (error) {
      }

    }
  },
  mounted() {
    watch(() => this.ava_datas, (neaData, o) => {
      this.updateChart(neaData);
    }, { deep: true })
  },

}
  </script>