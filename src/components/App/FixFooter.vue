<template>
  <div
    class="connection-state d-flex flex-row justify-content-between fixed-bottom bg-light border-top text-start"
    v-bind:style="{
      marginLeft: marginLeft
    }"
  >
    <div class="d-flex flex-row">
      <el-tooltip
        placement="top-end"
        :popper-class="DatabaseState.state? '': 'bg-danger text-light'"
      >
        <template #content>
          {{ databaseInfo }}
          <br />
          {{ DatabaseState.message }}
        </template>
        <el-badge type="warning" :value="!DatabaseState.state? '!':undefined">
          <i
            class="bi bi-database-fill-check border-end border-start px-1"
            style="font-size: 1.3rem;"
          ></i>
        </el-badge>
      </el-tooltip>
      <div class="conn-block px-3 border-end">
        <el-tooltip :content="vmsAppInfo.AppVersion" placement="top-end">
          <el-tag
            effect="dark"
            :type="VMSAlive ? 'success' : 'danger'"
            @click="HandleVMSTagClick"
          >VMS</el-tag>
        </el-tooltip>
      </div>
    </div>
    <div v-if="showVersionInfo" @click="HandleVersionClick">V{{ APPVersion }}</div>
    <div @dblclick="handleTimeDoubleClick" class="sys-time">{{ sys_time }}</div>
  </div>
</template>
<script>
import moment from 'moment'
import { userStore, UIStore } from '@/store'
import store from '@/store'
import { watch } from 'vue'
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
      sys_time: '',
      showVersionInfo: true
    }
  },
  mounted() {
    setInterval(() => {
      this.sys_time = moment(Date.now()).format('yyyy-MM-DD HH:mm:ss')
    }, 1000);

    watch(() => this.$route.path, (newVal) => {
      this.showVersionInfo = newVal !== '/data/task_history' && newVal !== '/data/alarm_history'
    })
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
    },
    HandleVMSTagClick() {
      this.$swal.fire(
        {
          text: this.vmsAppInfo.AppVersion,
          title: 'VMS',
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        })
    },
    HandleVersionClick() {
      this.$swal.fire(
        {
          title: 'VERSION INFO',
          html: `<div class="border rounded p-3"> 
                  <div class="my-3"> <label class="text-start" style="width:160px;">VMS</label>       <span class="border-bottom">${this.vmsAppInfo.AppVersion}</span>  </div>
                  <div> <label class="text-start" style="width:160px;">AGVSystem</label> <span class="border-bottom">${this.APPVersion}</span> </div>
                </div>`,
          showCancelButton: false,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
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
      return this.IsMenuExpanded ? '233px' : '69px';
    },
    VMSAlive() {
      return UIStore.getters.VMSAlive;
    },
    APPVersion() {
      return this.$store.getters.APPVersion;
    },
    databaseInfo() {
      function parseConnectionString(connectionString) {
        const result = {};
        const pairs = connectionString.split(';');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=').map(item => item.trim());
          if (key) {
            result[key] = value;
          }
        });
        return result;
      }
      //Server=127.0.0.1;Database=GPMAGVs_V3;
      var dbInfo = parseConnectionString(store.state.systemConfigs.DBConnection);
      let string = `${dbInfo.Database}(${dbInfo.Server})`;
      return string;
    },
    vmsAppInfo() {
      return store.state.vmsAppInfo;
    },
    DatabaseState() {
      return store.state.databaseState;
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
  cursor: pointer;
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