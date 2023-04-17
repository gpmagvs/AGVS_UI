<template>
  <div
    class="connection-state d-flex flex-row fixed-bottom bg-light text-dark border rounded text-start p-2"
  >
    <i class="bi bi-three-dots-vertical"></i>
    <div
      class="conn-block px-2 border-end"
      v-for="connection in Connections"
      :key="connection.name"
    >
      <label>{{ connection.name }}</label>
      <el-tag
        effect="dark"
        :type="connection.connected?'success':'danger'"
      >{{ connection.connected?'Connected':'Disconnect' }}</el-tag>
    </div>
  </div>
</template>

<script>
import bus from '@/event-bus.js'
import WebSocketHelp from '@/api/WebSocketHepler'
import param from '@/gpm_param'
export default {
  data() {
    return {
      Connections: [
        {
          name: "HOST",
          connected: false,
        },
        {
          name: "VMS",
          connected: false,
        },
        {
          name: "DB",
          connected: false,
        },
        // {
        //   name: "UI",
        //   connected: false,
        // }
      ]
    }
  },
  mounted() {
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
}
</script>

<style lang="scss" scoped>
.connection-state {
  .conn-block {
    margin-right: 10px;
    padding: auto 5px;
    label {
      color: grey;
      margin: auto 5px;
    }
    label,
    .el-tag {
      font-weight: bold;
    }
  }
}
</style>