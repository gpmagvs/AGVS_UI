<template>
  <div class="avalibity-query d-flex flex-row">
    <div class="options text-start h-100 p-3 bg-light border">
      <el-form :model="options">
        <el-form-item label="AGV名稱">
          <AGVSelector v-model="options.AGVName"></AGVSelector>
        </el-form-item>
        <el-form-item label="起始日期">
          <el-date-picker value-format="YYYY-MM-DD" v-model="options.StartDate"></el-date-picker>
        </el-form-item>
        <el-form-item label="結束日期">
          <el-date-picker value-format="YYYY-MM-DD" v-model="options.EndDate"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <b-button @click="QueryData" class="w-100" variant="primary">查詢</b-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="chart-display h-100 w-100 d-flex justify-content-center">
      <div class="w-100 m-1">
        <el-radio-group v-model="chart_type" @change="HandleChartTypeChanged">
          <el-radio-button size="large" label="pie">圓餅圖</el-radio-button>
          <el-radio-button size="large" label="bar">直條圖</el-radio-button>
          <el-radio-button size="large" label="BarchartMTTR">MTTR</el-radio-button>
          <el-radio-button size="large" label="BarchartMTBF">MTBF</el-radio-button>
          <!-- <el-radio-button size="large" label="edit-station">編輯點位[2]</el-radio-button>
          <el-radio-button size="large" label="remove-station">移除點位[3]</el-radio-button>-->
        </el-radio-group>
        <div class="m-2 p-1">
          <AvailabilityPieChart v-show="chart_type == 'pie'" class ref="piechart"></AvailabilityPieChart>
          <AvailabilityPieChart v-show="chart_type == 'bar'" class ref="barchart"></AvailabilityPieChart>
          <AvailabilityPieChart v-show="chart_type == 'bar'" class ref="BarchartMTTR"></AvailabilityPieChart>
          <AvailabilityPieChart v-show="chart_type == 'bar'" class ref="BarchartMTBF"></AvailabilityPieChart>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Query } from '@/api/AvailabilitysAPI'
import AGVSelector from '@/components/AGVSelector'
import AvailabilityPieChart from '@/components/Availabilitys/AvailabilityPieChart.vue';
import { agv_states_store } from '@/store'
import moment from 'moment'
export default {
  components: {
    AvailabilityPieChart, AGVSelector
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
      this.$refs['BarchartMTTR'].updateStackBarChartmttr(this.query_data.BarchartMTTR);
      this.$refs['BarchartMTBF'].updateStackBarChartmttr(this.query_data.BarchartMTBF);
      setTimeout(() => {
        this.loading = false;
      }, 400);
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