<template>
  <div style="height:600px;width: 600px; display: flex;flex-direction:column;">
    <vue3-chart-js
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
  },
  data() {
    return {
      myChart: {
        id: 'pie',
        type: 'pie',
        data: {
          labels: ['RUN', 'IDLE', 'DOWN', 'CHARGE', 'UNKNOWN'],
          datasets: [
            {
              backgroundColor: [
                'rgb(98, 243, 166)',
                'rgb(255, 226, 6)',
                'rgb(219, 7, 0)',
                'rgb(51, 207, 255)',
                'rgb(186, 186, 186)'
              ],
              data: [1, 2, 3, 4, 5]
            }
          ],
        },
        options: {

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
      this.myChart.data.datasets[0].data = data
      this.$refs.chartRef.update();
    }
  },
  mounted() {
    watch(() => this.ava_datas, (neaData, o) => {
      this.updateChart(neaData);
    }, { deep: true })
  },

}
  </script>