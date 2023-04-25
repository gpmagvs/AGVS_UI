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
export default {
  components: {
    AvailabilityPieChart, AvailabilityTimelineChart
  },
  data() {
    return {
      data: [2, 33, 1, 2, 3],
      todayData: {}
    }
  },
  mounted() {
    this.FetchTodayDataAndRender();
    setInterval(() => {
      this.FetchTodayDataAndRender();
    }, 10000);
  },
  methods: {
    async FetchTodayDataAndRender() {
      this.todayData = await GetTodayAvailability();
      this.$refs['rt-availbility-chart'].RenderChart(this.todayData);
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