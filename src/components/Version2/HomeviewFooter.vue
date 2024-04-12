<template>
  <div class="home-view-footer border-top fixed-bottom d-flex justify-content-center">
    <span
      @click="VersionTextClickHandle()"
      class="sys-time-display rounded px-1 text-light"
      v-text="SystemTime"></span>
    <div class="system-controls">
      <div class="switchs py-2 text-start px-1 d-flex">
        <div class @click="HandleModeSwitchRequest('online')">
          <span class="mx-1" style="font-size: 15px; border-left: 6px solid rgb(13, 110, 253); "></span>
          <span class="mx-1" style="font-size: 15px;">ONLINE-MODE</span>
          <el-switch
            v-model="CurrentIsOnlineMode"
            active-color="rgb(95, 171, 80)"
            inactive-color="red"
            active-text="ONLINE"
            inactive-text="OFFLINE"
            inline-prompt
            size="large"
            width="80px"
            :loading="OnlineModeSwitching"></el-switch>
          <!-- :before-change="mode.beforeChangeHandler"
          :loading="mode.loading"-->
          <!-- <jw-switch inactive_text="OFFLINE" active_text="ONLINE"></jw-switch> -->
        </div>
        <div class="mx-2" @click="HandleModeSwitchRequest('auto')">
          <span class="mx-1" style="font-size: 15px; border-left: 6px solid rgb(13, 110, 253); "></span>
          <span class="mx-1" style="font-size: 15px; ">AUTO-MODE</span>
          <el-switch
            v-model="CurrentIsAutoMode"
            active-color="rgb(95, 171, 80)"
            inactive-color="red"
            active-text="AUTO"
            inactive-text="MANUAL"
            inline-prompt
            size="large"
            width="85px"
            :loading="AutoModeSwitching"></el-switch>
        </div>
      </div>
      <div class="status d-flex">
        <b-button squared v-bind:class="initBtnClass" @click="InitializeClick">初始化</b-button>
        <b-button squared :variant="resetAlarmBtnVariant" @click="ResetAlarmlick">異常復歸</b-button>
        <b-button squared variant="light" @click="BuzzerOffClick">關閉蜂鳴器</b-button>
        <b-button squared variant="light" @click="RemoveCstClick">移除卡匣</b-button>
      </div>
    </div>
    <div class="icons d-flex justify-content-end flex-fill">
      <div class="w-100">
        <div class="icon-containers d-flex">
          <div class="py-1" @click="HomeIconClick">
            <img src="/images/home.png" width="50" alt />
          </div>
          <div @click="AlarmIconClick">
            <img src="/images/alarm2.png" width="55" alt />
          </div>
          <div @click="IOTableIconClick">
            <img src="/images/io_table.png" width="60" alt />
          </div>
        </div>
        <div class="icon-containers d-flex">
          <div @click="ControllerIconClick">
            <img src="/images/controller.png" width="60" alt />
          </div>
          <div @click="ShowLogin">
            <img src="/images/signin.png" width="60" alt />
          </div>
          <div v-if="IsLogin" @click="ShowRDTEstPage">
            <span style="font-size:30px;font-weight: bold; color:red">TEST</span>
          </div>
        </div>
      </div>
      <div @click="EmoClick">
        <img src="@/assets/emo.png" width="100" alt />
      </div>
    </div>
    <login ref="loginShow"></login>
  </div>
</template>

<script>
import { Initialize, CancelInitProcess, ResetAlarm, BuzzerOff, RemoveCassette, MODESwitcher, EMO } from '@/api/VMSAPI'
import { AGVStatusStore, UserStore, UIStore } from '@/store'
import login from '@/components/Login.vue'
import moment from 'moment'
import jwSwitch from '../UIComponents/jw-switch.vue'

export default {
  components: {
    login, jwSwitch
  },
  data() {
    return {
      SystemTime: '1997-04-18 12:00:00',
      trigger_admin_dialog_count: 5,
      version_text_click_count: 0,
      OnlineMode: false,
      AutoMode: false,
      OnlineModeSwitching: false,
      AutoModeSwitching: false,

    }
  },
  methods: {
    ControllerIconClick() {
      this.$router.push(`/v2/controller/${UIStore.getters.PreviousControllRoute}`)
    },
    HomeIconClick() {
      this.$router.push('/v2')
    },
    IOTableIconClick() {
      this.$router.push('/v2/IOTable')
    },
    AlarmIconClick() {
      this.$router.push('/v2/Alarm')
    },
    ShowRDTEstPage() {
      this.$router.push('/v2/rd_test')

    },
    async InitializeClick() {
      this.$swal.fire({
        title: 'AGV Initialize',
        // text: `${this.$t(this.Is_Fork_AGV ? 'start_init_action_notify' : 'start_init_action_notify_submarin_agv')}`,
        text: `${this.$t('start_init_action_notify_submarin_agv')}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert'
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.isInitializing = true;
          var result = await Initialize();
          if (!result.confirm) {
            this.$swal.fire({
              title: 'AGV Initialize Fail',
              text: result.message,
              icon: 'error',
              showCancelButton: false,
              customClass: 'my-sweetalert'
            })
          }
        }
      })

    },
    async ResetAlarmlick() {
      await ResetAlarm();
    },
    async BuzzerOffClick() {
      await BuzzerOff();
    },
    async RemoveCstClick() {
    },
    async EmoClick() {
      EMO();
    },
    ShowLogin() {
      if (this.IsLogin) {
        this.$swal.fire({
          title: `Logout Confirm`,
          text: this.$t('logout-confirm'),
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then((result) => {
          if (result.isConfirmed) {
            UserStore.dispatch('Logout')
          }
        })
      }
      else {
        this.$refs.loginShow.Show();
      }
    },

    async HandleModeSwitchRequest(request) {
      var _text = request == 'online' ? `確定要將AGV${this.CurrentIsOnlineMode ? '下線' : '上線'}?` : `確定要將AGV更改為${this.CurrentIsAutoMode ? '手動模式' : '自動模式'}?`;
      var _title = request == 'online' ? 'AGV ONLINE-MODE CHANGE' : 'AGV AUTO-MODE CHANGE';
      this.$swal.fire(
        {
          text: _text,
          title: _title,
          icon: 'question'
        }).then(async (res) => {
          if (!res.isConfirmed)
            return;

          var result = { Success: false, Message: '未知的錯誤' }
          if (request == 'auto') {
            this.AutoModeSwitching = true;
            result = await MODESwitcher.AutoModeSwitch(this.CurrentIsAutoMode ? 0 : 1)

          } else {
            this.OnlineModeSwitching = true;
            result = await MODESwitcher.OnlineModeSwitch(this.CurrentIsOnlineMode ? 0 : 1)
          }
          this.OnlineModeSwitching = this.AutoModeSwitching = false;

          if (!result.Success) {
            this.$swal.fire(
              {
                text: result.Message,
                title: '',
                icon: 'error',
                showCancelButton: false,
                confirmButtonText: 'OK',
                customClass: 'my-sweetalert'
              })
          }

        })
      return false;
    },
    VersionTextClickHandle() {
      this.version_text_click_count += 1;
      if (this.version_text_click_count > this.trigger_admin_dialog_count) {
        this.ConfirmGODTriggering();
      }
    },
    ConfirmGODTriggering() {
      this.$swal.fire({
        title: 'Warning',
        text: `Do you known what are you doing now?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        allowOutsideClick: false
      }).then((result) => {
        this.AdminSwitchDialogResultHandle(result.isConfirmed);
      })

    },
    AdminSwitchDialogResultHandle(checked = false) {
      this.version_text_click_count = 0;
      if (checked) {
        UserStore.commit('setUser', {
          UserName: 'GOD',
          Role: 3
        });
      }
    }
  },
  computed: {
    initBtnClass() {
      return AGVStatusStore.getters.AGVStatus.SubState.toLowerCase();
    },
    resetAlarmBtnVariant() {
      return (AGVStatusStore.getters.AGVStatus.AlarmCodes.length > 0) ? 'danger' : 'light'
    },
    IsLogin() {
      return UserStore.getters.CurrentUserRole != 0;
    },
    CurrentIsAutoMode() {
      return AGVStatusStore.getters.AGVStatus.AutoMode == 1;
    },
    CurrentIsOnlineMode() {
      return AGVStatusStore.getters.AGVStatus.OnlineMode == 1;
    }
  },
  mounted() {
    setInterval(() => {
      this.SystemTime = moment(Date.now()).format('yyyy-MM-DD HH:mm:ss')
    }, 1000);;
  },
}
</script>

<style lang="scss" scoped>
.home-view-footer {
  height: 120px;
  background-color: #ebe7e7;

  .sys-time-display {
    background-color: rgb(67 67 67);
    position: absolute;
    font-weight: bold;
    bottom: 123px;
    letter-spacing: 2px;
    right: 1px;
  }

  .system-controls {
    button {
      font-size: 25px;
      width: 160px;
      height: 70px;
      margin-inline: 2px;
      font-weight: bold;
      border: 1px solid rgb(167, 167, 167);
      box-shadow: 3px -1px 13px -1px #959595;
    }
  }

  .switchs {
    width: 100%;
    background-color: black;
    color: white;
    font-weight: 900;
  }

  .icons {
    padding-right: 25px;

    .icon-containers {
      div {
        width: 70px;
        height: 60px;
      }
    }

    div {
      margin-inline: 2px;
    }

    img:hover {
      cursor: pointer;
      background-color: rgb(13, 110, 253);
      border: 1px solid black;
    }
  }
}</style>