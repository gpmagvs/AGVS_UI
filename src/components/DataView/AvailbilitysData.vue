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
      if (!this.pause)
        this.FetchTodayDataAndRender();
    }, 10000);
    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        this.pause = newValue != "/data";
      }
    )
  },
  computed: {
    todayTimelineChart() {
      return this.$refs['rt-availbility-chart'];
    }
  },
  methods: {
    async FetchTodayDataAndRender() {
      this.todayData = await GetTodayAvailability();
      if (this.todayTimelineChart) {
        this.todayTimelineChart.RenderChart(this.todayData);
      }
    },

  },
}
</script>

<style lang="scss" scoped>
</style>