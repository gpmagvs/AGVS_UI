<template>
  <div class="home-view h-100" v-loading="loading">
    <div
      v-bind:style="{
      visibility: isEasyMode ? 'hidden' : 'visible'
    }"
      class="d-flex flex-row"
    >
      <div v-show="MenuExpanded" class="left-col border-right left-panel">
        <!-- <Header v-if="IsOpUsing"></Header> -->
        <b-card no-body class="p-1 bg-light h-100">
          <b-tabs pills v-model="selectTab">
            <b-tab title="Vehicles">
              <template #title>
                <el-badge
                  v-if="IsAnyVehicleLowBattery||IsAnyVehicleStatusDown"
                  value="!"
                  :max-value="99"
                  class="item"
                  :offset="[10,0]"
                >
                  <span>{{ $t('HomeView.Vehicles') }}</span>
                </el-badge>
                <span v-else>{{ $t('HomeView.Vehicles') }}</span>
              </template>
              <AGVStatusVue
                DisplayMode="cards"
                @taskIDClicked="(taskid)=>handleTaskIDClicked(taskid)"
              ></AGVStatusVue>
            </b-tab>
            <b-tab title="Missions">
              <template #title>
                <el-badge
                  v-if="InCompletedTaskNumber>0"
                  :value="InCompletedTaskNumber"
                  :max-value="99"
                  class="item"
                  :offset="[10,0]"
                >
                  <span>{{ $t('HomeView.Missions') }}</span>
                </el-badge>
                <span v-else>{{ $t('HomeView.Missions') }}</span>
              </template>
              <TaskStatusVue height="80vh" :show_card_title="false" :taskIDSelected="selectTaskID"></TaskStatusVue>
            </b-tab>
            <b-tab :title="$t('HomeView.EQ_Status')">
              <EQStatus></EQStatus>
            </b-tab>
          </b-tabs>
        </b-card>
      </div>
      <div
        v-bind:style=" IsOpUsing? {
        width: '0px',
        visibility: 'hidden'  
        }: {
        width: '25px',
      }"
        class="resizer text-primary d-flex flex-column"
      >
        <div class="menu-icon">
          <el-icon v-if="!MenuExpanded">
            <MenuExpandIcon @click="() => { MenuExpanded = true; RestoreSizeOfRightSide() }" />
          </el-icon>
          <el-icon v-else>
            <MenuFoldIcon
              @click="() => { MenuExpanded = false; AdjustSizeOfRightSideFullPage(); }"
            />
          </el-icon>
        </div>
        <div class="flex-fill d-flex flex-column justify-content-center">
          <i class="bi bi-three-dots-vertical"></i>
        </div>
      </div>
      <div class="right-panel flex-fill">
        <HomeMap style="width:100%;height:100%"></HomeMap>
        <!-- <el-tabs
          lazy
          v-model="right_side_tabSelected"
          tab-position="top"
          style="height: 100%"
          type="border-card"
        >
          <el-tab-pane name="map" :label="$t('HomeView.Map')">
            <HomeMap style="width:100%"></HomeMap>
          </el-tab-pane>
          <el-tab-pane name="eqStatus" :label="$t('HomeView.EQ_Status')">
            <EQStatus></EQStatus>
          </el-tab-pane>
        </el-tabs>-->
      </div>
      <TaskAllocationVue></TaskAllocationVue>
    </div>
    <div
      v-bind:style="{
      visibility: isEasyMode ? 'visible' : 'hidden',
      position: 'absolute',
      top: '70px',
      width: '100%',
      height: '82vh'
    }"
      class="easy_mode d-flex"
    >
      <div>
        <AGVStatusVue :IsEasyMode="true"></AGVStatusVue>
      </div>
      <div style="width:100%;" class="border">
        <HomeMap id="homemap-easymode"></HomeMap>
      </div>
    </div>
    <TaskDispatchNewUI
      class="new-dispatch-pnl"
      v-bind:class="show_new_dispatch_panel ? 'dispatch-show' : 'hide'"
      @close="() => { show_new_dispatch_panel = false }"
      v-show="show_new_dispatch_panel"
    ></TaskDispatchNewUI>
    <TaskDispathActionButton
      ref="task-dispatch-action-btn"
      class="fixed-bottom"
      @onTaskDispatch="() => {
      right_side_tabSelected = 'map';
    }"
      v-if="IsLogin"
      @on-click="() => { show_new_dispatch_panel = true }"
    ></TaskDispathActionButton>
    <el-tour v-model="openTour">
      <el-tour-step target="#dispatch-btn" title="按一下開始任務派送" description="Put you files here." />
      <el-tour-step :target="el" title="Save" description="Save your changes" />
      <el-tour-step :target="btnRef?.$el" title="Other Actions" description="Click to see other" />
    </el-tour>
  </div>
</template>
<script>
import AGVStatusVue from '@/components/HomeView/AGVStatus/AGVStatus.vue'
import HomeMap from '@/components/HomeView/HomeMap.vue';
import TaskDispathActionButton from '@/components/TaskDispathActionButton.vue'
import TaskDispatchNewUI from '@/components/TaskDispatchNewUI.vue'
import EQStatus from '@/components/HomeView/EQStatus.vue'
import TaskStatusVue from '@/components/HomeView/TaskStatus.vue';
import TaskAllocationVue from '@/components/HomeView/TaskAllocation.vue';
import bus from '@/event-bus.js'
import { userStore, agvs_settings_store, TaskStore, agv_states_store } from '@/store';
import { DArrowRight as MenuExpandIcon, DArrowLeft as MenuFoldIcon } from '@element-plus/icons-vue'

import Header from '@/components/App/Header.vue'
import { StopBuzzer } from '@/api/AlarmAPI';
export default {
  components: {
    AGVStatusVue, TaskStatusVue, HomeMap, TaskAllocationVue, EQStatus, TaskDispathActionButton, TaskDispatchNewUI,
    MenuExpandIcon, MenuFoldIcon, Header
  },
  methods: {
    AdjustSizeOfRightSideFullPage() {
      const rightPanel = this.$el.querySelector('.right-panel');
      var container_width = rightPanel.parentElement.offsetWidth;
      this.previousLeftSideWidth = container_width - rightPanel.offsetWidth
      rightPanel.style.width = `${container_width}px`;
    },
    RestoreSizeOfRightSide() {
      const rightPanel = this.$el.querySelector('.right-panel');
      const leftPanel = this.$el.querySelector('.left-panel');
      leftPanel.style.width = `${this.previousLeftSideWidth}px`;
    },
    SavePanlWitdthToLocalStorage(_right, _left) {
      localStorage.setItem('home-resizer', JSON.stringify({ right: _right, left: _left }));
    },
    GetPanlWidthFromLocalStorage() {
      let jsonStr = localStorage.getItem('home-resizer');
      if (jsonStr) {
        return JSON.parse(jsonStr);
      } else {
        return null
      }
    },
    async HandleStopBuzzerClicked() {
      await StopBuzzer();
    },
    handleTaskIDClicked(taskID) {
      this.selectTaskID = taskID;
      this.selectTab = 1;
      setTimeout(() => {
        this.selectTaskID = '';
      }, 1000);
    }
  },
  computed: {
    IsRunMode() { return agvs_settings_store.getters.IsRunMode; },
    IsLogin() { return userStore.getters.IsLogin; },
    IsOpUsing() {
      return userStore.getters.IsOPLogining;
    },
    IsDevelopLogin() {
      return userStore.state.user.Role == 2 || userStore.state.user.Role == 3;
    },
    InCompletedTaskNumber() {
      return TaskStore.state.IncompletedTaskListData.length;
    },
    IsAnyVehicleLowBattery() {
      return agv_states_store.state.agv_states.some(state => state.BatteryLevel_1 < 30);
    },
    IsAnyVehicleStatusDown() {
      return agv_states_store.state.agv_states.some(state => state.MainStatus == 3);
    },
    IsHostRemoteModeNow() {
      return agvs_settings_store.state.sys_settings.operations.host_remote_mode;
    }
  },
  data() {
    return {
      isEasyMode: false,
      loading: false,
      show_new_dispatch_panel: false,
      right_side_tabSelected: 'map',
      MenuExpanded: true,
      previousLeftSideWidthStyle: '',
      selectTab: 0,
      selectTaskID: '',
      openTour: false
    }
  },
  watch: {
    right_side_tabSelected(panlName) {
      // alert(panlName)
      const taskDispatchBtn = this.$refs['task-dispatch-action-btn'];
      if (taskDispatchBtn) {
        if (panlName == 'map')
          taskDispatchBtn.ShowAtRight();
        else {
          taskDispatchBtn.ShowAtLeft();
        }
      }
    }
  },
  mounted() {
    bus.on('view_mode_changed', (isEasyMode) => {
      this.loading = true
      this.isEasyMode = isEasyMode;
      setTimeout(() => {
        this.loading = false
      }, 300)

    });
    bus.on('viewEqStatus', () => {
      this.right_side_tabSelected = 'eqStatus'
    })
    const resizer = this.$el.querySelector('.resizer');
    const leftPanel = this.$el.querySelector('.left-panel');
    const rightPanel = this.$el.querySelector('.right-panel');
    let isDragging = false;
    var window_width = leftPanel.parentElement.offsetWidth;
    leftPanel.style.width = `50vw`;
    rightPanel.style.width = `50vw`;
    var _this = this;

    setTimeout(() => {
      if (this.IsOpUsing) {
        //{"right":"854px","left":"842px"}
        leftPanel.style.width = '800px';
        rightPanel.style.width = '854px';
        return;
      }
      var resizer_pnls_width_cache = this.GetPanlWidthFromLocalStorage();
      if (resizer_pnls_width_cache) {

        leftPanel.style.width = resizer_pnls_width_cache.left;
        rightPanel.style.width = resizer_pnls_width_cache.right;
      }
    }, 200);

    resizer.addEventListener('mousedown', e => {
      isDragging = true;
      let startX = e.pageX;

      const onMove = (e) => {
        if (!isDragging || !_this.MenuExpanded) return;
        const dx = e.pageX - startX;
        const newLeftWidth = leftPanel.offsetWidth + dx;
        var newRightWidth = window_width - newLeftWidth;
        let _newLftWidth = `${newLeftWidth}px`;
        let _newRightWidth = `${newRightWidth}px`;
        leftPanel.style.width = _newLftWidth;
        rightPanel.style.width = _newRightWidth;
        _this.previousLeftSideWidth = newLeftWidth
        startX = e.pageX;

      };

      const onUp = () => {
        if (isDragging) {
          setTimeout(() => {
            this.SavePanlWitdthToLocalStorage(leftPanel.style.width, rightPanel.style.width)
          }, 299);
        }
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        isDragging = false;

      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });
  },
}
</script>
<style lang="scss">
.home-view {
  .nav-item {
    button {
      font-size: 16px;
      font-weight: bold;
    }

    .nav-link {
      color: rgb(90, 90, 90);
    }

    .nav-link.active {
      color: white;
      background-color: rgb(57, 62, 73);
    }
  }
  .dispatch-show {
    animation: slideInFromLeft 0.2s ease-out forwards;

    z-index: 233;
  }

  @keyframes slideInFromLeft {
    0% {
      transform: translateX(-100%);
    }

    100% {
      transform: translateX(0);
    }
  }

  .resizer {
    height: 99vh;
    width: 25px;
    text-align: center;
    cursor: ew-resize;

    .menu-icon {
      cursor: pointer;
      font-weight: bold;
      font-size: 20px;
    }
  }

  .resizer:hover {
    background-color: rgb(223, 223, 223);
  }

  .resizer:active {
    background-color: rgb(223, 237, 247);
  }
  #buzzer-stop {
    position: fixed;
    top: 3px;
    right: 24px;
    z-index: 2000;
  }
}
</style>