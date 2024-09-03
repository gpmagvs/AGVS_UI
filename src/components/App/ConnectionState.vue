<template>
  <div
    class="connection-state d-flex flex-row justify-content-between fixed-bottom bg-light border-top text-start"
    v-bind:style="{
      marginLeft: marginLeft
    }"
  >
    <div class="d-flex flex-row">
      <el-tooltip :content="databaseInfo" placement="top-end">
        <i
          class="bi bi-database-fill-check border-end border-start px-1"
          style="font-size: 1.3rem;"
        ></i>
      </el-tooltip>
      <div class="conn-block px-1 border-end">
        <el-tooltip :content="vmsAppInfo.AppVersion" placement="top-end">
          <el-tag
            effect="dark"
            :type="VMSAlive ? 'success' : 'danger'"
            @click="HandleVMSTagClick"
          >VMS</el-tag>
        </el-tooltip>
      </div>
    </div>
    <div @click="HandleVersionClick">V{{ APPVersion }}</div>
    <div @dblclick="handleTimeDoubleClick" class="sys-time">{{ sys_time }}</div>
  </div>
</template>
<script>
import moment from 'moment'
import { userStore, UIStore } from '@/store'
import store from '@/store'
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
      return `${dbInfo.Database}(${dbInfo.Server})`;
    },
    vmsAppInfo() {
      return store.state.vmsAppInfo;
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