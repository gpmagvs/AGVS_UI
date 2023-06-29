<template>
  <div class="data-view text-start p-2">
    <h3>今日稼動狀態</h3>
    <div class="bg-light py-3 mx-1 border">
      <AvailabilityTimelineChart ref="rt-availbility-chart"></AvailabilityTimelineChart>
      <!-- <AvailabilityPieChart :ava_datas="data"></AvailabilityPieChart> -->
    </div>
  </div>
</template>

<script>
import { GetTodayAvailability } from '@/api/AvailabilitysAPI'
import AvailabilityPieChart from '@/components/Availabilitys/AvailabilityPieChart.vue';
import AvailabilityTimelineChart from '@/components/Availabilitys/AvailabilityTimelineChart.vue';
import { useRoute } from 'vue-router';
import { watch } from 'vue';
import moment from 'moment';
export default {
  components: {
    AvailabilityPieChart, AvailabilityTimelineChart
  },
  data() {
    return {
      data: [2, 33, 1, 2, 3],
      todayData: {},
      pause: true
    }
  },
  mounted() {
    //this.FetchTodayDataAndRender();
    setInterval(() => {
<<<<<<< HEAD
      //this.FetchTodayDataAndRender();
=======
      if (!this.pause)
        this.FetchTodayDataAndRender();
>>>>>>> e5676bf22b84a9d84458541b6a8b3200a41a59c5
    }, 10000);
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        this.pause = newValue != "/data";
      }
    )
  },
  methods: {
    async FetchTodayDataAndRender() {
      console.info(moment(Date.now()).format("HH:mm:ss"));
      this.todayData = await GetTodayAvailability();
      console.info(moment(Date.now()).format("HH:mm:ss"));
      this.$refs['rt-availbility-chart'].RenderChart(this.todayData);
      console.info(moment(Date.now()).format("HH:mm:ss"));
    },
    updateChart() {
      var test = 12;
      setInterval(() => {
        this.data[0] = test
        test += 1;
      }, 1000);

    }
  },
}
</script>

<style lang="scss" scoped>
</style>