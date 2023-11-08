<template>
  <div class="alarm-view">
    <div class="d-flex flex-row mb-2">
      <h3 class="flex-fill">系統警報</h3>
      <b-button v-if="is_user_login" variant="danger" @click="ResetSystemAlarm()">警報復歸</b-button>
    </div>
    <el-table :data="sys_alarms" border :row-class-name="row_state_class_name">
      <el-table-column label="時間" prop="Time" width="160">
        <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
      </el-table-column>
      <el-table-column label="設備名稱" prop="Equipment_Name" width="120"></el-table-column>
      <el-table-column label="警報碼" prop="AlarmCode" width="120"></el-table-column>
      <el-table-column label="警報描述" prop="Description_En">
        <template #default="scope">
          <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
        </template>
      </el-table-column>
      <el-table-column label="警報類型" prop="Level" width="120">
        <template #default="scope">
          <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="任務名稱" prop="Task_Name" width="160"></el-table-column>
      <el-table-column label="發生地點" prop="OccurLocation" width="120"></el-table-column>
      <el-table-column label="持續時間" prop="Duration" width="120"></el-table-column>
      <el-table-column label="清除警報人員" prop="ResetAalrmMemberName" width="120"></el-table-column>
    </el-table>
    <el-divider></el-divider>
    <h3>設備警報</h3>
    <el-table :data="eq_alarms" border :row-class-name="row_state_class_name">
      <el-table-column label="時間" prop="Time" width="160">
        <template #default="scope">{{ formatTime(scope.row.Time) }}</template>
      </el-table-column>
      <el-table-column label="AGV名稱" prop="Equipment_Name" width="120"></el-table-column>
      <el-table-column label="警報碼" prop="AlarmCode" width="120"></el-table-column>
      <el-table-column label="警報描述" prop="Description_En">
        <template #default="scope">
          <div>{{ scope.row.Description_En }}({{ scope.row.Description_Zh }})</div>
        </template>
      </el-table-column>
      <el-table-column label="警報類型" prop="Level" width="120">
        <template #default="scope">
          <div>{{ scope.row.Level == 1 ? 'ALARM' : 'WARNING' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="任務名稱" prop="Task_Name" width="160"></el-table-column>
      <el-table-column label="發生地點" prop="OccurLocation" width="120"></el-table-column>
      <el-table-column label="持續時間" prop="Duration" width="120"></el-table-column>
      <el-table-column label="清除警報人員" prop="ResetAalrmMemberName" width="120"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { AlarmHelper, ResetSystemAlarm } from '@/api/AlarmAPI.js'
import moment from 'moment'
import { userStore } from '@/store'
export default {
  data() {
    return {
      alarms: [
        {
          Time: '2021/04/17 13:13:44',
          Level: 'ALARM',
          Source: 'System',
          AlarmCode: 2,
          Description_Zh: '車載管理系統斷線',
          Description_En: 'VMS Disconnect',
          OccurLocation: 32,
          Equipment_Name: 'System',
          Task_Name: '',
          Duration: 0,
          Checked: '',
          ResetAalrmMemberName: '',
        },
        {
          Time: '2021/04/18 12:23:23',
          Level: 'WARNING',
          Source: 'System',
          AlarmCode: 2,
          Description_Zh: '車載管理系統斷線',
          Description_En: 'VMS Disconnect',
          OccurLocation: 32,
          Equipment_Name: 'System',
          Task_Name: '',
          Duration: 0,
          Checked: '',
          ResetAalrmMemberName: '',
        }
      ],

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
    }
  },
  mounted() {
    var alarmHelper = new AlarmHelper(this.onmessage);
  },
  methods: {
    ResetSystemAlarm() {
      ResetSystemAlarm();
    },
    formatTime(time) {
      return moment(time).format('yyyy/MM/DD HH:mm:ss')
    },
    onmessage(ev) {
      this.alarms = JSON.parse(ev.data)
    },
    row_state_class_name({ row, rowIndex }) {
      return row.Level == 1 ? 'ALARM' : 'WARNING';
    }
  },
}
</script>

<style lang="scss" >
.alarm-view {
  text-align: left;
  padding: 8px;

  .el-table {
    .WARNING {
      background: rgb(255, 210, 6);
      color: black;
    }

    .ALARM {
      background: rgb(250, 72, 72);
      color: white;
    }
  }
}
</style>