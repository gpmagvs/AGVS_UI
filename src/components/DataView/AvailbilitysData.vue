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
      pause: true,
      timer: undefined
    }
  },
  mounted() {
    debugger
    this.FetchTodayDataAndRender();


    const route = useRoute()
    watch(
      () => route.path,
      (newValue, oldValue) => {
        this.pause = newValue != "/data";
        if (this.pause) {
          this.StopTimer()
        } else {
          this.StartTimer()
        }
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
        debugger
        this.todayTimelineChart.RenderChart(this.todayData);
      }
    },
    StartTimer() {
      this.FetchTodayDataAndRender();
      // this.timer = setInterval(() => {
      //   this.FetchTodayDataAndRender();
      // }, 10000);
    },
    StopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
</style>