<template>
  <div class="log-query-container">
    <b-tabs>
      <b-tab title="LOG">
        <div class="time-selector d-flex border">
          <span class>開始時間</span>
          <el-date-picker
            v-model="QueryOptions.FromTimeStr"
            type="datetime"
            placeholder="Select date and time"
            value-format="YYYY/MM/DD HH:mm:ss" />
          <span class>結束時間</span>
          <el-date-picker
            v-model="QueryOptions.ToTimeStr"
            type="datetime"
            placeholder="Select date and time"
            value-format="YYYY/MM/DD HH:mm:ss" />
          <el-button @click="HandleQueryBtnClick" type="primary">查詢</el-button>
        </div>
        <div class="table border">
          <el-table size="small" :data="Results.Messages" border style="width:800px">
            <el-table-column class prop="Time" label="Time" width="190"></el-table-column>
            <el-table-column class prop="Level" label="Level" width="120">
              <template #default="scope">
                <el-tag
                  effect="dark"
                  :type="GetTagType(scope.row.Level)"
                  style="width:90px">{{ scope.row.Level }}</el-tag>
              </template>
            </el-table-column>
            <!-- <el-table-column class prop="Class" label="Class" width="190"></el-table-column> -->
            <el-table-column class prop="Message" label="訊息" min-width="520"></el-table-column>
          </el-table>
        </div>
        <div>
          <el-pagination
            background
            layout="prev, pager, next"
            :page-size="QueryOptions.NumberPerPage"
            :total="Results.TotalCount"
            @current-change="PageChangeHandler" />
        </div>
      </b-tab>
      <b-tab title="停車精度">
        <div class="parking-acq border text-start p-2">
          <div class="border-bottom py-1 mb-1">
            <div class="d-flex flex-row">
              <div class="options">
                <div class="title">開始時間</div>
                <el-date-picker
                  v-model="ParkingAcqQueryOptions.StartTimeStr"
                  type="datetime"
                  placeholder="Select date and time"
                  value-format="YYYY/MM/DD HH:mm:ss" />
              </div>
              <div class="options">
                <div class="title">結束時間</div>
                <el-date-picker
                  v-model="ParkingAcqQueryOptions.EndTimeStr"
                  type="datetime"
                  placeholder="Select date and time"
                  value-format="YYYY/MM/DD HH:mm:ss" />
              </div>
            </div>
            <div class="options">
              <el-radio-group v-model="ParkingAcqQueryOptions.QueryBy" class="ml-4">
                <el-radio label="Location" size="large"> <span>Tag</span>
                  <span> <el-select :disabled="ParkingAcqQueryOptions.QueryBy != 'Location'" @click="HandleParkLocSelectorClcik" v-model="ParkingAcqQueryOptions.TagSelect">
                      <el-option v-for="loc in ParkedLocList" :key="loc.tag" :value="loc.tag" :label="`[${loc.tag}] ${loc.name}`"></el-option>
                    </el-select></span></el-radio>
                <el-radio label="Task_Name" size="large">Task Name <el-input :disabled="ParkingAcqQueryOptions.QueryBy == 'Location'" v-model="ParkingAcqQueryOptions.TaskNameInput">
                  </el-input></el-radio>
              </el-radio-group>
            </div>
            <div>
              <el-button class="mx-1" @click="HandleParkingACQQueryBtnClick" type="primary">查詢</el-button>
              <el-button v-if="this.ParkingAqcQuResults.length > 0" type="primary" @click="HandleDownloadCSVBtnClick">Download CSV</el-button>
            </div>
          </div>
          <b-tabs pills v-loading="Loading">
            <b-tab title="散佈圖">
              <div class="px-5" id="park_acq_chart" style="width: 100%;">
                <apexchart ref="park_acq_chart" type="scatter" height="350" :options="chart_datas.chartOptions" :series="chart_datas.series"></apexchart>
              </div>
            </b-tab>
            <b-tab title="表格">
              <div>
                <el-table row-key="Time" size="small" :data="ParkingAqcQuResultsForPage" border style="width:850px;height: 362px;">
                  <el-table-column class prop="Time" label="Time" width="190">
                    <template #default="scope"> {{ TimeFormat(scope.row.Time) }} </template>
                  </el-table-column>
                  <el-table-column prop="TaskName" label="任務名稱" width="200">
                  </el-table-column>
                  <el-table-column class prop="ParkingTag" label="Tag" width="50"> </el-table-column>
                  <el-table-column class prop="ParkingLocation" label="Location" width="110"> </el-table-column>
                  <el-table-column class prop="X" label="X" width="50"></el-table-column>
                  <el-table-column class prop="Y" label="Y" width="50"></el-table-column>
                  <el-table-column class prop="DistanceToTagCenter" label="Distance" width="80"></el-table-column>
                </el-table>
                <el-pagination
                  background
                  layout="prev, pager, next"
                  :current-page="ParkingAcqQueryOptions.Page"
                  :page-size="ParkingAcqQueryOptions.NumberPerPage"
                  :total="ParkingAqcQuResults.length"
                  @current-change="HandleParkingAcqTbPaginationChanged" />
              </div>
            </b-tab>
          </b-tabs>
        </div>
      </b-tab>
      <!-- <b-tab title="電池狀態">
        <div>
          <ChargeStatusQuery></ChargeStatusQuery>
        </div>
      </b-tab> -->
      <b-tab title="搬運紀錄">
        <div>
          <TranferLogView></TranferLogView>
        </div>
      </b-tab>
      <b-tab title="稼動率">
        <div>
          <Utilization></Utilization>
        </div>
      </b-tab>
      <b-tab title="振動紀錄">
        <div>
          <VibrationHistoryQuery></VibrationHistoryQuery>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import { LogAPI } from '@/api/VMSAPI.js'
import moment from 'moment'
import ChargeStatusQuery from './ChargeStatusQuery'
import VibrationHistoryQuery from './VibrationHistoryQuery'
import Utilization from './Utilization'
import TranferLogView from './TranferLogView'
import { CopyText } from '@/Tools.js'
export default {
  components: {
    ChargeStatusQuery, TranferLogView, VibrationHistoryQuery, Utilization
  },
  data() {
    return {
      Loading: false,
      QueryOptions: {
        FromTimeStr: "2023/09/08 10:00:00",
        ToTimeStr: "2023/09/08 11:00:00",
        Page: 1,
        NumberPerPage: 12,
        SpeficStrings: []
      },
      ParkingAcqQueryOptions: {
        StartTimeStr: "2023/09/08 10:00:00",
        EndTimeStr: "2023/09/08 11:00:00",
        Tag: 7,
        TagSelect: 7,
        TaskName: '',
        TaskNameInput: '',
        Page: 1,
        NumberPerPage: 10,
        QueryBy: 'Location'
      },

      ParkedLocList: [],
      Results: {
        TotalCount: 0,
        Messages: [
        ]
      },
      ParkingAqcQuResults: [],
      chart_datas: {
        series: [{
          name: "Location",
          data: []
        }],
        chartOptions: {
          chart: {
            height: 360,
            type: 'scatter',
            zoom: {
              enabled: false
            },
            animations: {
              enabled: false,
            }
          },
          theme: {
            mode: 'light',
            palette: 'palette1',
            monochrome: {
              enabled: false,
              color: '#255aee',
              shadeTo: 'light',
              shadeIntensity: 0.65
            },
          }
          ,
          dataLabels: {
            enabled: false,
            formatter: function (val, opts) {
              return val
            },
          },
          stroke: {
            curve: 'straight'
          },
          title: {
            text: '停車精度',
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5
            },
          },
          xaxis: {
            tickAmount: 10,
            min: -90,
            max: 90,
            title: {
              text: "X誤差(mm)"
            }
          },
          yaxis: {
            min: -90,
            max: 90,
            title: {
              text: "Y誤差(mm)"
            }
            // range: 200
          },
          tooltip: {
            enabled: false
          }
        },
      }
    }
  },
  computed: {
    ParkingAqcQuResultsForPage() {
      var startIndex = (this.ParkingAcqQueryOptions.Page - 1) * this.ParkingAcqQueryOptions.NumberPerPage
      var endIndex = startIndex + this.ParkingAcqQueryOptions.NumberPerPage;
      return this.ParkingAqcQuResults.slice(startIndex, endIndex)

    }
  },
  methods: {
    async HandleQueryBtnClick() {
      this.SaveTimeToLocalStorage();
      this.QueryOptions.Page = 1;
      var response = await LogAPI.Query(this.QueryOptions);
      this.Results.TotalCount = response.TotalCount
      this.Results.Messages = response.LogMessageList

    },
    async HandleParkingACQQueryBtnClick() {
      this.Loading = true;
      setTimeout(async () => {

        if (this.ParkingAcqQueryOptions.QueryBy == 'Location') {
          this.ParkingAcqQueryOptions.TaskName = ''
          this.ParkingAcqQueryOptions.Tag = this.ParkingAcqQueryOptions.TagSelect
          this.chart_datas.chartOptions.title.text = `停車精度- Tag ${this.ParkingAcqQueryOptions.Tag}`
        } else {
          this.ParkingAcqQueryOptions.TaskName = this.ParkingAcqQueryOptions.TaskNameInput
          this.ParkingAcqQueryOptions.Tag = -1
          this.chart_datas.chartOptions.title.text = `停車精度-任務 ${this.ParkingAcqQueryOptions.TaskName}`;
        }
        this.ParkingAqcQuResults = await LogAPI.QueryParkingAcq(this.ParkingAcqQueryOptions);
        this.chart_datas.series[0].data = []
        this.ParkingAqcQuResults.forEach(element => {
          this.chart_datas.series[0].data.push([element.X, element.Y])
        });

        this.ParkingAcqQueryOptions.Page = 1;
        this.Loading = false;
        this.$refs['park_acq_chart'].updateOptions(this.chart_datas.chartOptions);
      }, 500);

    },
    async HandleParkLocSelectorClcik() {
      var ParkedLocList = await LogAPI.GetParkedLocs();
      ParkedLocList.sort();
      this.ParkedLocList = []
      ParkedLocList.forEach(loc_str => {
        //tag:name
        var splited = loc_str.split(':');
        var _tag = parseInt(splited[0])
        var _name = splited[1]
        this.ParkedLocList.push({
          tag: _tag,
          name: _name
        })
      });
    },
    async PageChangeHandler(page) {
      this.QueryOptions.Page = page;
      var response = await LogAPI.Query(this.QueryOptions);
      this.Results.TotalCount = response.TotalCount
      this.Results.Messages = response.LogMessageList
    },
    GetTagType(level) {
      if (level == 'Information')
        return 'primary'
      if (level == 'Warning')
        return 'warning'
      if (level == 'Critical' | level == 'Error')
        return 'danger'
    },
    SaveTimeToLocalStorage() {
      localStorage.setItem('log_query', JSON.stringify({
        from: this.QueryOptions.FromTimeStr,
        to: this.QueryOptions.ToTimeStr
      }))
    },
    RestoreTimeFromLocalStorage() {
      var jsonStr = localStorage.getItem('log_query')
      if (jsonStr) {
        var obj = JSON.parse(jsonStr)
        this.QueryOptions.FromTimeStr = obj.from;
        this.QueryOptions.ToTimeStr = obj.to;
      }
    },
    HandleParkingAcqTbPaginationChanged(page) {
      this.ParkingAcqQueryOptions.Page = page;
    },
    HandleDownloadCSVBtnClick() {
      this.buildData(this.ParkingAqcQuResults).then(data => {
        this.downloadCSV(data);
      })
    },
    buildData(data) {
      return new Promise((resolve, reject) => {
        // 最後所有的資料會存在這
        let arrayData = [];
        // 取 data 的第一個 Object 的 key 當表頭
        let arrayTitle = Object.keys(data[0]);
        arrayData.push(arrayTitle);
        // 取出每一個 Object 裡的 value，push 進新的 Array 裡
        Array.prototype.forEach.call(data, d => {
          let items = [];
          Array.prototype.forEach.call(arrayTitle, title => {
            let item = d[title];
            items.push(item);
          });
          arrayData.push(items)
        })

        resolve(arrayData);
      })

    },
    downloadCSV(data) {
      let csvContent = '';
      Array.prototype.forEach.call(data, d => {
        let dataString = d.join(',') + '\n';
        csvContent += dataString;
      })

      // 下載的檔案名稱
      let fileName = 'Parking_Accuracy' + (new Date()).getTime() + '.csv';

      // 建立一個 a，並點擊它
      let link = document.createElement('a');
      link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvContent));
      link.setAttribute('download', fileName);
      link.click();
    },
    TimeFormat(date_time) {
      return moment(date_time).format("yyyy/MM/DD HH:mm:ss")
    },
    HandleCopyText(text) {
      CopyText(text);
    }

  },
  mounted() {
    this.ParkingAcqQueryOptions.EndTimeStr = moment(Date.now()).format('yyyy-MM-DD HH:mm:ss')
    this.RestoreTimeFromLocalStorage();
    this.HandleParkLocSelectorClcik();
  },
}
</script>

<style lang="scss" scoped>
.log-query-container {
  width: 100%;

  .time-selector {
    span {
      margin: 5px;
    }
  }

  .parking-acq {
    .options {
      display: flex;
      margin: 2px;

      .title {
        font-weight: bold;
        width: 80px;
      }
    }

  }
}
</style>