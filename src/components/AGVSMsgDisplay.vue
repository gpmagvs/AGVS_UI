<template>
  <div class="d-flex flex-row my-1">
    <span class="mx-1 py-1">Only Task Message</span>
    <el-switch v-model="only_task_msg"></el-switch>
    <span class="flex-fill"></span>
    <b-button class size="sm" variant="danger" @click="ClearHandler">Clear</b-button>
  </div>
  <el-table height="580" :data="MsgDataList" border>
    <el-table-column label="時間" prop="TimeFormated"></el-table-column>
    <el-table-column label="方向" prop="Direction_str">
      <template #default="scope">
        <el-tag
          effect="dark"
          :type="GetTagType(scope.row.Direction_str)"
          disable-transitions
        >{{scope.row.Direction_str}}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Message" prop="Msg_Display"></el-table-column>
  </el-table>
</template>

<script>
import moment from 'moment'
export default {
  data() {
    return {
      MsgDataList: [],
      only_task_msg: true
    }
  },
  methods: {
    ClearHandler() {
      this.MsgDataList = [];
    },
    AddNewMsgData(data) {
      var ary = []
      if (this.only_task_msg) {
        if (!data.Message.includes('0301') && !data.Message.includes('0305')) {
          return;
        }
        var task_msg = JSON.parse(data.Message.replaceAll("*\r", ""))

      }
      if (this.MsgDataList.length >= 20) {
        this.MsgDataList.pop();
      }
      data.TimeFormated = moment(data.Time).format('yyyy-MM-DD HH:mm:ss')
      data.Direction_str = data.Direction == 0 ? 'AGVS->AGV' : 'AGV->AGVS'
      // data.Msg_Display = data.Message.substring(0, 150) + '...';
      data.Msg_Display = data.Message;
      this.MsgDataList.unshift(data);
    }
    ,
    GetTagType(Direction_str) {
      return Direction_str == "AGVS->AGV" ? 'danger' : 'primary';
    }
  },
}
</script>

<style>
</style>