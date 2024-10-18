<template>
  <div class="avalibity-query d-flex flex-row">
    <div class="options text-start h-100 p-3 bg-light border">
      <el-form :model="options">
        <el-form-item :label="$t('AvalibilityQuery.AGVName')">
          <AGVSelector v-model="options.AGVName"></AGVSelector>
        </el-form-item>
        <el-form-item :label="$t('AvalibilityQuery.StartDate')">
          <el-date-picker value-format="YYYY-MM-DD" v-model="options.StartDate"></el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('AvalibilityQuery.EndDate')">
          <el-date-picker value-format="YYYY-MM-DD" v-model="options.EndDate"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <b-button @click="QueryData" class="w-100" variant="primary">{{ $t('AvalibilityQuery.Query') }}</b-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="chart-display h-100 w-100 d-flex justify-content-center" v-loading="loading">
      <div class="w-100 m-1">
        <el-tabs type="border-card" tab-position="top" lazy class="demo-tabs">
          <el-tab-pane :label="$t('AvalibilityQuery.PieChart')">
            <AvailabilityPieChart class ref="piechart"></AvailabilityPieChart>
          </el-tab-pane>
          <el-tab-pane :label="$t('AvalibilityQuery.StraightChart')">
            <AvailabilityPieChart ref="barchart"></AvailabilityPieChart>
          </el-tab-pane>
          <el-tab-pane :label="$t('AvalibilityQuery.MTBF/MTTR')">
            <MeanTimeChart ref="MTChart" id="mtbf-chart" title=""></MeanTimeChart>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { Query } from '@/api/AvailabilitysAPI'
import AGVSelector from '@/components/AGVSelector'
import AvailabilityPieChart from '@/components/Availabilitys/AvailabilityPieChart.vue';
import MeanTimeChart from '@/components/Availabilitys/MeanTimeChart.vue';
import { agv_states_store } from '@/store'
import moment from 'moment'
export default {
  components: {
    AvailabilityPieChart, MeanTimeChart, AGVSelector
  },
  data() {
    return {
      loading: false,
      chart_type: 'pie',
      options: {
        AGVName: 'AGV_001',
        StartDate: '',
        EndDate: '',
      },
      query_data: {
        total: [],
        days: {
          dates: [],
          idle: [],
          run: [],
          down: [],
          charge: [],
        },
        BarchartMTTR: {
          dates: [],
          time: []
        },
        BarchartMTBF: {
          dates: [],
          time: []
        },
        BarchartMissTag: {
          dates: [],
          count: []
        }
      }
    }
  },
  computed: {
    agvNameList() {
      return agv_states_store.getters.AGVNameList;
    },
  },
  mounted() {
    this.options.StartDate = moment(Date.now()).add(-7, 'days').format('YYYY-MM-DD')
    this.options.EndDate = moment(Date.now()).format('YYYY-MM-DD')
  },
  methods: {
    async QueryData() {
      this.loading = true;
      this.query_data = await Query(this.options.AGVName, this.options.StartDate, this.options.EndDate);
      this.$refs['barchart'].updateStackBarChart(this.query_data.days);
      this.$refs['piechart'].updateChart(this.query_data.total);
      this.$refs.MTChart.RenderChartWithTimeSeriesData(this.CreateMTData(this.query_data));

      //this.$refs.BarchartMTBF.RenderChartWithTimeSeriesData([this.query_data.BarchartMTBF]);
      //this.$refs['BarchartMissTag'].updateStackBarChartmttr(this.query_data.BarchartMissTag);
      setTimeout(() => {
        this.loading = false;
      }, 400);
    },
    CreateMTData(dataFromBackend) {
      var mttr = dataFromBackend.BarchartMTTR
      var mttrData = Object.keys(mttr).map(time => ({
        x: time,
        y: mttr[time]
      }))
      var mtbf = dataFromBackend.BarchartMTBF
      var mtbfData = Object.keys(mtbf).map(time => ({
        x: time,
        y: mtbf[time]
      }))
      return [
        { name: 'MTTR', data: mttrData },
        { name: 'MTBF', data: mtbfData },
      ]
    },
    HandleChartTypeChanged() {

    }
  },
}
</script>
<style lang="scss" scoped>
.avalibity-query {
  height: 100vh;

  .options {
    width: 20%;
  }
}
</style>