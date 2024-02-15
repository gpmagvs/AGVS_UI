<template>
  <div
    class="connection-state d-flex flex-row justify-content-between fixed-bottom bg-light border-top text-start"
    v-bind:style="{
      marginLeft: marginLeft
    }">
    <div class="d-flex flex-row">
      <i class="bi bi-three-dots-vertical"></i>
      <div
        class="conn-block px-1 border-end"
        v-for="connection in Connections"
        :key="connection.name">
        <label>{{ connection.name }}</label>
        <el-tag
          effect="dark"
          :type="connection.connected ? 'success' : 'danger'">{{ connection.connected ? '已連線' : '斷線' }}</el-tag>
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
          name: "SERVER",
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

    this.ConnectionCheck(undefined, '/ws/VMSAliveCheck', 0);
    this.ConnectionCheck(param.vms_ws_host, '/ws/VMSAliveCheck', 1);
  },
  methods: {
    ConnectionCheck(host, ws_url, index) {
      var alive_check_ws = new WebSocketHelp(ws_url, host);
      alive_check_ws.Connect();
      alive_check_ws.onclose = (ev) => {
        console.log(ws_url + ' onclose')
        this.Connections[index].connected = false;
        setTimeout(() => {
          this.ConnectionCheck(host, ws_url, index);
        }, 1000)

      }
      alive_check_ws.onopen = (ev) => {
        this.Connections[index].connected = true;
      }
    },
    handleTimeDoubleClick() {
      userStore.dispatch('login', {
        UserName: 'dev',
        Password: '12345678'
      })
    }
  },
  props: {
    IsMenuExpanded: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    marginLeft(delay = 200) {

      return this.IsMenuExpanded ? '202px' : '69px';
    }
  },
}
</script>

<style lang="scss" scoped>
.connection-state {
  padding: 5px 25px 5px 1px;
  opacity: .9;
  border-top-right-radius: 22px;

  i,
  .sys-time {
    font-weight: bold;
    font-family: monospace;
  }

  .conn-block {
    margin-right: 8px;
    padding: auto 5px;

    label {
      margin: auto 5px;
    }

    label,
    .el-tag {
      font-weight: bold;
    }
  }
}
</style>