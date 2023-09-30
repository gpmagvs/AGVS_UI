<template>
  <div
    class="connection-state d-flex flex-row justify-content-between fixed-bottom text-dark text-start">
    <div class="d-flex flex-row">
      <i class="bi bi-three-dots-vertical"></i>
      <div
        class="conn-block px-1 border-end"
        v-for="connection in Connections"
        :key="connection.name">
        <label>{{ connection.name }}</label>
        <el-tag
          effect="dark"
          :type="connection.connected ? 'success' : 'danger'">{{ connection.connected ? 'Connected' : 'Disconnect' }}</el-tag>
      </div>
    </div>
    <div @dblclick="handleTimeDoubleClick" class="sys-time">{{ sys_time }}</div>
  </div>
</template>

<script>
import WebSocketHelp from '@/api/WebSocketHepler'
import param from '@/gpm_param'
import moment from 'moment'
import { userStore } from '@/store'
export default {
  data() {
    return {
      Connections: [
        {
          name: "後端SERVER",
          connected: false,
        },
        {
          name: "VMS",
          connected: false,
        },
        // {
        //   name: "DB",
        //   connected: false,
        // },
      ],
      sys_time: ''
    }
  },
  mounted() {
    setInterval(() => {
      this.sys_time = moment(Date.now()).format('yyyy-MM-DD HH:mm:ss')
    }, 1000);



    var vms_alive_check_ws = new WebSocketHelp('/ws/VMSAliveCheck', param.vms_ws_host);
    vms_alive_check_ws.Connect();
    vms_alive_check_ws.onclose = (ev) => this.Connections[1].connected = false
    vms_alive_check_ws.onopen = (ev) => {
      console.info('vms connected');
      this.Connections[1].connected = true;

    }
    var agvs_alive_check_ws = new WebSocketHelp('/ws/VMSAliveCheck');
    agvs_alive_check_ws.Connect();
    agvs_alive_check_ws.onclose = (ev) => this.Connections[0].connected = false
    agvs_alive_check_ws.onopen = (ev) => {
      console.info('vms connected');
      this.Connections[0].connected = true;

    }
  },
  methods: {
    handleTimeDoubleClick() {
      userStore.dispatch('login', {
        UserName: 'dev',
        Password: '12345678'
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.connection-state {
  background-color: rgb(49, 49, 49);
  // border-block: 3px solid rgb(187, 187, 187);
  padding: 5px;
  padding-left: 70px;

  i,
  .sys-time {
    font-weight: bold;
    font-family: monospace;
    color: #ffffff;
  }

  .conn-block {
    margin-right: 8px;
    padding: auto 5px;

    label {
      color: rgb(255, 255, 255);
      margin: auto 5px;
    }

    label,
    .el-tag {
      font-weight: bold;
    }
  }
}
</style>