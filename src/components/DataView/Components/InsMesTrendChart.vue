<template>
  <div class="ins-mes-trend-chart border rounded mx-1 p-2">
    <h5>Trend Chart</h5>
    <div class="content border d-flex">
      <div class="qu-options border">
        <el-form label-position="top">
          <el-form-item label="Bay">
            <el-select @change="HandleBayNameSelected" v-model="selected_bayname" size="large">
              <el-option
                v-for="bayname in baynames"
                :value="bayname"
                :key="bayname"
                :label="bayname"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="點位(Tag)">
            <el-select v-model="selected_tag" size="large">
              <el-option v-for="tag in tagsOfBay" :value="tag" :key="tag" :label="tag"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="量測項目">
            <el-select v-model="selected_mes_item" size="large">
              <el-option v-for="(des,val) in measureItems" :value="val" :key="val" :label="des"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="From">
            <el-date-picker v-model="StartTimeStr" type="date" placeholder="選擇開始日期" />
          </el-form-item>
          <el-form-item label="To">
            <el-date-picker v-model="EndTimeStr" type="date" placeholder="選擇開始日期" />
          </el-form-item>
        </el-form>
        <b-button class="w-100" variant="primary" @click="HandleQueryButtonClick">查詢</b-button>
      </div>
      <div class="flex-fill chart-container">
        <InsMesDisplayChart ref="chart"></InsMesDisplayChart>
      </div>
    </div>
  </div>
</template>

<script>
import InsMesDisplayChart from './InsMesDisplayChart.vue'
import { GetBayNames, GetTagsOfBay, GetMeasureItems, QueryItemTrendData } from '@/api/MeasureResultAPI'
export default {
  components: {
    InsMesDisplayChart,
  },
  data() {
    return {
      measureItems: {},
      baynames: [],
      tagsOfBay: [],
      selected_mes_item: '',
      selected_bayname: '',
      selected_tag: -1,
      StartTimeStr: '',
      EndTimeStr: '',
    }
  },
  methods: {
    async GetMeasureItemsFromServer() {
      this.measureItems = await GetMeasureItems();
    },
    async GetBayNamesFromServer() {
      this.baynames = await GetBayNames();
    },
    async HandleBayNameSelected() {
      this.tagsOfBay = await GetTagsOfBay(this.selected_bayname)
    },
    async HandleQueryButtonClick() {
      var result = await QueryItemTrendData({
        bayName: this.selected_bayname,
        tag: this.selected_tag,
        item: this.selected_mes_item,
        from: this.StartTimeStr,
        to: this.EndTimeStr
      });

      var _dataToRenderChart = [{
        name: this.measureItems[this.selected_mes_item],
        data: result.map(d => {
          return {
            x: d.Time,
            y: d.Value
          }
        })
      }]

      console.log(_dataToRenderChart)
      this.$refs['chart'].RenderChartWithTimeSeriesData(_dataToRenderChart);
    }
  },
  mounted() {
    this.GetMeasureItemsFromServer();
    this.GetBayNamesFromServer();
  },
}
</script>

<style lang="scss" scoped>
.ins-mes-trend-chart {
  width: 100%;
  //   background-color: rgb(90, 90, 90);
  //   color: white;

  .content {
    div {
      padding-inline: 3px;
    }
    .qu-options {
    }
    .chart-container {
    }
  }
}
</style>