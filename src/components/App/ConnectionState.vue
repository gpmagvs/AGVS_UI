<template>
  <div
    class="connection-state d-flex flex-row justify-content-between fixed-bottom bg-light border-top text-start"
    v-bind:style="{
      marginLeft: marginLeft
    }"
  >
    <div class="d-flex flex-row">
      <i class="bi bi-three-dots-vertical"></i>
      <div class="conn-block px-1 border-end">
        <label>VMS</label>
        <el-tag
          effect="dark"
          :type="VMSAlive ? 'success' : 'danger'"
        >{{ VMSAlive ? $t('HomeView.EQStatus.EQStatus.Connected') : $t('HomeView.EQStatus.EQStatus.DisConnect') }}</el-tag>
      </div>
    </div>
    <div>V{{ APPVersion }}</div>
    <div @dblclick="handleTimeDoubleClick" class="sys-time">{{ sys_time }}</div>
  </div>
</template>
<script>
import moment from 'moment'
import { userStore, UIStore } from '@/store'
export default {
  data() {
    return {
      Connections: [
        {
          name: "SERVER",
          connected: true,
        },
        {
          name: "VMS",
          connected: () => {
            return UIStore.getters.VMSAlive
          },
        },
      ],
      sys_time: ''
    }
  },
  mounted() {
    setInterval(() => {
      this.sys_time = moment(Date.now()).format('yyyy-MM-DD HH:mm:ss')
    }, 1000);

  },
  methods: {

    async handleTimeDoubleClick() {
      var result = await userStore.dispatch('login', {
        UserName: 'dev',
        Password: '12345678'
      })
      if (result.confirm) {
        location.reload();
      }
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
      return this.IsMenuExpanded ? '233px' : '69px';
    },
    VMSAlive() {
      return UIStore.getters.VMSAlive;
    },
    APPVersion() {
      return this.$store.getters.APPVersion;
    }
  },
}
</script>
<style lang="scss" scoped>
.connection-state {
  padding: 5px 25px 5px 1px;
  opacity: 0.9;
  border-top-right-radius: 22px;
  z-index: 2;

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