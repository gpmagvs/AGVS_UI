<template>
  <div class="connection-states w-100 px-1">
    <table class="w-100">
      <tbody>
        <tr>
          <td>
            <div>
              <i v-bind:class="vms_state" class="bi bi-circle-fill"></i> {{ $t('ConnectionStates.AGVS') }}
            </div>
          </td>
          <td>
            <div>
              <i v-bind:class="rosbridge_state" class="bi bi-circle-fill"></i> {{ $t('ConnectionStates.AGVControlSys') }}
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>
              <i v-bind:class="wago_state" class="bi bi-circle-fill"></i>{{ $t('ConnectionStates.IOModule') }}
            </div>
          </td>
        </tr>
        <!-- <tr>
          <td>
            <div :class="rosbridge_state">
              <i :class="'bi bi-circle-fill'"></i> ROSSSS
            </div>
          </td>
          <td>
            <div :class="agvc_state">
              <i class="bi bi-circle-fill"></i> AGVSSS
            </div>
          </td>
        </tr>-->
      </tbody>
    </table>
  </div>
</template>
<script>
import param from '@/gpm_param'
import { UIStore } from '@/store'
export default {
  data() {
    return {
    }
  },
  computed: {
    connections() {
      return UIStore.getters.ConnectionState;
    },
    rosbridge_state() {
      if (this.connections.RosbridgeServer != undefined)
        return this.connections.RosbridgeServer.toLocaleLowerCase()
      else
        return 'disconnect'
    },
    agvc_state() {
      if (this.connections.AGVC != undefined)
        return this.connections.AGVC.toLocaleLowerCase()
      else
        return 'disconnect'
    },
    vms_state() {
      if (this.connections.VMS != undefined)
        return this.connections.VMS.toLocaleLowerCase()
      else
        return 'disconnect'
    },
    wago_state() {
      if (this.connections.WAGO != undefined)
        return this.connections.WAGO.toLocaleLowerCase()
      else
        return 'disconnect'
    }
  },
  methods: {
  },
  mounted() {
  },
}
</script>
<style lang="scss">
.connection-states {
  .disconnect {
    color: red;
  }

  .connected {
    color: limegreen;
  }

  .connecting {
    color: yellow;
  }

  td div {
    text-align: left;
    font-weight: bold;
  }
}
</style>