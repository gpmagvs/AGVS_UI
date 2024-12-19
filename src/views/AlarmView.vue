<template>
  <div class="alarm-view">
    <div class="d-flex flex-row mb-2">
      <h3 class="flex-fill">{{ $t('App.Header.systemalarm') }}</h3>
      <b-button v-if="is_user_login" variant="danger" @click="ResetSystemAlarm()">
        {{ $t('App.Header.alarmreset')
        }}
      </b-button>
    </div>
    <el-table :data="sys_alarms" border :row-class-name="row_state_class_name">
      <el-table-column :label="$t('AlarmTable.Time')" prop="Time" width="160">
        <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
      </el-table-column>
      <el-table-column
        :label="$t('AlarmTable.EQ_Name')"
        prop="Equipment_Name"
        width="120"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('AlarmTable.Alarm_code')" prop="AlarmCode" width="120"></el-table-column>
      <el-table-column
        :label="$t('AlarmTable.Alarm_description')"
        prop="Description_En"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AlarmTable.Alarm_Type')" prop="Level" width="120">
        <template #default="scope">
          <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('AlarmTable.TaskName')"
        prop="Task_Name"
        width="160"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('AlarmTable.Occur_Tag')"
        prop="OccurLocation"
        width="120"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('AlarmTable.Duration')" prop="Duration" width="120"></el-table-column>
      <el-table-column :label="$t('AlarmTable.Clear_OP')" prop="ResetAalrmMemberName" width="120"></el-table-column>
    </el-table>
    <el-divider></el-divider>
    <h3>{{ $t('App.Header.eqalarm') }}</h3>
    <el-table :data="eq_alarms" border :row-class-name="row_state_class_name">
      <el-table-column :label="$t('AlarmTable.Time')" prop="Time" width="160">
        <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
      </el-table-column>
      <el-table-column
        :label="$t('AlarmTable.EQ_Name')"
        prop="Equipment_Name"
        width="150"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('AlarmTable.Alarm_code')" prop="AlarmCode" width="120"></el-table-column>
      <el-table-column
        :label="$t('AlarmTable.Alarm_description')"
        prop="Description_En"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AlarmTable.Alarm_Type')" prop="Level" width="120">
        <template #default="scope">
          <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('AlarmTable.TaskName')"
        prop="Task_Name"
        width="160"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        :label="$t('AlarmTable.Occur_Tag')"
        prop="OccurLocation"
        width="120"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column :label="$t('AlarmTable.Duration')" prop="Duration" width="120"></el-table-column>
      <el-table-column :label="$t('AlarmTable.Clear_OP')" prop="ResetAalrmMemberName" width="120"></el-table-column>
    </el-table>
  </div>
</template>
<script>
import { ResetSystemAlarm } from '@/api/AlarmAPI.js'
import moment from 'moment'
import { userStore, AlarmStore } from '@/store'
export default {
  data() {
    return {
    }
  },
  computed: {
    is_user_login() {
      return userStore.getters.IsLogin;
    },
    sys_alarms() {
      return this.alarms.filter(alarm => alarm.Source == 0)
    },
    eq_alarms() {
      return this.alarms.filter(alarm => alarm.Source == 1)
    },
    alarms() {
      return AlarmStore.getters.alarms;
    }
  },
  mounted() {
  },
  methods: {
    ResetSystemAlarm() {
      ResetSystemAlarm();
    },
    formatTime(time) {
      return moment(time).format('yyyy/MM/DD HH:mm:ss')
    },
    row_state_class_name({ row, rowIndex }) {
      return row.Level == 1 ? 'ALARM' : 'WARNING';
    }
  },
}
</script>
<style lang="scss">
.alarm-view {
  text-align: left;
  padding: 8px;

  .el-table {
    .WARNING {
      background: rgb(255, 210, 6);
      color: black;
    }

    .ALARM {
      background: rgb(232, 96, 96);
      color: white;
    }
  }
}
</style>