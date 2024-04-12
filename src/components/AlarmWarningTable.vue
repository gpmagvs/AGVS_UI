<template>
  <div class="alarm-warn-table px-1">
    <div class="d-flex flex-row">
      <div class="flex-fill text-start">
        <i class="bi bi-sliders" @click="() => { drawer_show = !drawer_show }"></i>
        <label class="text-danger"><b><i class="bi bi-three-dots-vertical"></i>{{ $t('alarm-type') }}</b></label>
        <el-select class="mx-2" title="異常等級" v-model="DisplaySelected" @change="HandleAlarmTypeChanged">
          <el-option label="ALL" value="All"></el-option>
          <el-option label="Alarm" value="Alarm"></el-option>
          <el-option label="Warning" value="Warning"></el-option>
        </el-select>
        <b-button size="sm" @click="AlarmDownload">{{ $t('refresh') }}</b-button>
        <b-button
          v-if="clear_alarm_btn_visible"
          variant="danger"
          @click="ClearAlarmAlert()"
          size="sm">{{ $t('clear_alarm_records') }}</b-button>
      </div>
      <div v-if="false">
        <span class="m-2">Search :</span>
        <el-input size="small" style="width:168px"></el-input>
      </div>
    </div>
    <div class="mt-2">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalAlarmNum"
        :page-size="page_size"
        v-model="page"
        :current-page="page"
        @current-change="PageChangeHandler" />
    </div>
    <div class="border mt-1">
      <el-table
        :data="alarms"
        row-key="Time"
        :row-class-name="tb_row_class"
        header
        border
        height="550"
        size="small">
        <el-table-column label="Time" prop="Time" width="160" :formatter="TimeFormmter"></el-table-column>
        <el-table-column label="Code" prop="Code" width="90" header-align="center">
          <template #default="{ row }">
            <div class="text-center">{{ row.Code }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Description" :prop="lang == 'zh-TW' ? 'CN' : 'Description'"></el-table-column>
        <el-table-column label="Level" prop="Level" width="100" header-align="center">
          <template #default="{ row }">
            <div class="text-center">
              <b>{{ row.Level }}</b>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <b-modal
      v-model="clear_alarms_dialog_show"
      centered
      title="Alarm Records Clear"
      @ok="ClearAlarmRecords">
      <p>確定要清除異常紀錄?</p>
    </b-modal>
    <el-drawer v-model="drawer_show" direction="rtl" size="50%" title="異常紀錄" modal-class="alarm-tb-option-modal">
      <el-form label-position="left" label-width="150">
        <el-form-item label="顯示警報類型">
          <el-select class="mx-2" title="異常等級" v-model="DisplaySelected" @change="HandleAlarmTypeChanged">
            <el-option label="ALL" value="All"></el-option>
            <el-option label="Alarm" value="Alarm"></el-option>
            <el-option label="Warning" value="Warning"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="時間區間設定">
          <div>
            <el-radio-group class="d-flex flex-column" v-model="TimeRangeOpt" @change="(val) => { AlarmDownload() }">
              <el-radio style="margin-right:auto" label="no-limit" size="large">不限時間</el-radio>
              <el-radio style="margin-right:auto" label="limit" size="large">指定時間</el-radio>
              <el-date-picker
                style="width:350px"
                v-model="TimeRange_Picker"
                type="datetimerange"
                :shortcuts="shortcuts"
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                value-format="YYYY/MM/DD HH:mm:ss"
                :disabled="TimeRangeOpt != 'limit'"
                @change="() => { AlarmDownload() }" />
            </el-radio-group>
          </div>
        </el-form-item>
        <el-form-item label="異常碼">
          <el-select class="mx-2" title="異常等級" v-model="AlarmClassSelected" @change="HandleAlarmTypeChanged">
            <el-option v-for="al in alarm_options" :key="al.Code" :label="`${al.CN}_${al.Description}(${al.Code})`" :value="al.Code"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<script>
import { AlarmTableAPI } from '@/api/VMSAPI';
import moment from 'moment';
import bus from '@/event-bus.js'
import Notifier from '@/api/NotifyHelper';
import { UserStore } from '@/store'
export default {
  data() {
    return {
      alarms: [],
      totalAlarmNum: 0,
      page: 1,
      page_size: 15,
      lang: 'zh-TW',
      clear_alarms_dialog_show: false,
      DisplaySelected: 'All',
      drawer_show: false,
      TimeRangeOpt: 'no-limit',
      TimeRange: ['1997/1/1 00:00:00', '2100/12/31 00:00:00'],
      TimeRange_Picker: ['1997/1/1 00:00:00', '2100/12/31 00:00:00'],
      shortcuts: [
        {
          text: '前一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          },
        },
        {
          text: '前一個月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          },
        },
        {
          text: '前三個月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          },
        },
      ],
      alarmClasifies: [],
      AlarmClassSelected: 0
    }
  },
  methods: {
    tb_row_class(row, rowIndex) {
      if (row.rowIndex < 0) {
        return '';
      }
      var level = this.alarms[row.rowIndex].Level;
      try {

        if (level == 'Warning') {
          return 'warning-row';
        } else if (level === 'Alarm') {
          return 'alarm-row';
        } else {
          return 'success-row';
        }
      } catch (error) {
        return 'success-row';
      }

    },
    TimeFormmter(row, column, cellValue, index) {
      return moment(cellValue).format('yyyy/MM/DD HH:mm:ss');
    },
    async PageChangeHandler(page) {
      this.page = page;
      this.AlarmDownload();
    },
    async AlarmDownload() {
      var timeRange = this.TimeRangeOpt == 'no-limit' ? ['1997/1/1 00:00:00', '2100/12/31 00:00:00'] : this.TimeRange_Picker;
      this.totalAlarmNum = await AlarmTableAPI.TotalAlarmCount(timeRange[0], timeRange[1], this.DisplaySelected, this.AlarmClassSelected)
      this.alarms = await AlarmTableAPI.QueryByPage(timeRange[0], timeRange[1], this.page, this.page_size, this.DisplaySelected, this.AlarmClassSelected);
      this.alarmClasifies = await AlarmTableAPI.GetAlarmClassifies()
    },
    ClearAlarmAlert() {
      this.$swal.fire({
        title: 'Alert Clear',
        text: `${this.$t('clear-alarm-data-confirm-text')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ClearAlarmRecords();
        }
      })

    },
    async ClearAlarmRecords() {
      await AlarmTableAPI.ClearAlarms();
      Notifier.Success("Alarm Clear", "bottom", 1000);
      await this.AlarmDownload();
    },
    async HandleAlarmTypeChanged() {
      this.page = 1;
      this.AlarmDownload();
    },
  },
  computed: {
    clear_alarm_btn_visible() {
      return UserStore.getters.CurrentUserRole != 0
    },
    alarm_options() {
      var options = [{ Code: 0, Description: '全部' }]
      this.alarmClasifies.forEach(al => {
        options.push(al)
      })
      return options;
    }
  },
  async mounted() {
    this.AlarmDownload();
    bus.on('/alarmtable_tab_click', async () => {
      this.AlarmDownload();
    });
    bus.on('/lang_changed', (locale) => {
      this.lang = locale
    })
  }
}
</script>

<style  lang="scss">
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.el-table .warning-row {
  background-color: rgb(255, 237, 186);
  /* --el-table-tr-bg-color: var(--el-color-warning-light-9); */
}

.el-table .alarm-row {
  background-color: rgb(245, 198, 206);
}

.alarm-tb-option-modal {}
</style>