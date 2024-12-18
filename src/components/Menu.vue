<template>
  <div class="menu">
    <div class="menu-top border-bottom p-2" style="cursor: pointer;">
      <!-- <i @click="() => { isCollapse = !isCollapse }">tgt</i> -->
      <img v-if="!isCollapse" @click="GoToHomePage" src="/GPM_Logo.png" alt width="160" />
      <div v-else class="gpm-text" @click="GoToHomePage">GPM</div>
    </div>
    <el-menu
      class="el-menu-vertical-demo"
      default-active="/"
      style="height: 100vh;"
      active-text-color="rgb(13, 110, 253)"
      :collapse="isCollapse"
      :collapse-transition="false"
      :router="true"
      @open="handleOpen"
      @close="handleClose"
      @click="handleClicked"
    >
      <el-menu-item index="/">
        <el-icon>
          <home_icon />
        </el-icon>
        <template #title>{{ $t('Menu.Home') }}</template>
      </el-menu-item>
      <el-menu-item index="/alarm" v-if="UserPermission.menu.SystemAlarm==1">
        <el-icon>
          <Message />
        </el-icon>
        <template #title>{{ $t('Menu.System Alarm') }}</template>
      </el-menu-item>
      <el-menu-item index="/racks_status" v-if="UserPermission.menu.WIPInfo==1">
        <el-icon>
          <cargo_icon />
        </el-icon>
        <template #title>{{ $t('Menu.wip_manager') }}</template>
      </el-menu-item>
      <el-menu-item index="/vehicle" v-if="UserPermission.menu.VehicleManagnment==1">
        <el-icon>
          <Van :color="IconColor" />
        </el-icon>
        <template #title>{{ $t('Menu.vehicle manager') }}</template>
      </el-menu-item>
      <el-sub-menu v-if="UserPermission.menu.Map==1">
        <template #title>
          <el-icon>
            <map_icon :color="IconColor" />
          </el-icon>
          <span>{{ $t('Menu.map and display') }}</span>
        </template>
        <el-menu-item index="/map/map_editor">
          <el-icon>
            <map_icon :color="IconColor" />
          </el-icon>
          <template #title>{{ $t('Menu.map edit') }}</template>
        </el-menu-item>
        <el-menu-item index="/map/agv_display">
          <el-icon>
            <map_icon :color="IconColor" />
          </el-icon>
          <template #title>{{ $t('Menu.agv display') }}</template>
        </el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="/data" v-if="UserPermission.menu.DataQuery==1">
        <template #title>
          <el-icon>
            <DataAnalysis :color="IconColor" />
          </el-icon>
          <span>{{ $t('Menu.Querys') }}</span>
        </template>
        <el-menu-item
          index="/data/task_history"
          v-if="UserPermission.dataQuerySubMenu.TaskHistory==1"
        >
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <template #title>{{ $t('Menu.Task History') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/data/alarm_history"
          v-if="UserPermission.dataQuerySubMenu.AlarmHistory==1"
        >
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <template #title>{{ $t('Menu.Alarm History') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/data/agv_locus"
          v-if="UserPermission.dataQuerySubMenu.VehicleTrajectory==1"
        >
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <template #title>{{ $t('Menu.Trajectory') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/data/InstrumentMeasureQuery"
          v-if="UserPermission.dataQuerySubMenu.InstrumentsMeasure==1"
        >
          <el-icon>
            <DataAnalysis />
          </el-icon>
          <template #title>{{ $t('Menu.Instruments Measure Result') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/data/Avalibility"
          v-if="UserPermission.dataQuerySubMenu.Utilization==1"
        >
          <el-icon>
            <PieChart />
          </el-icon>
          <template #title>{{ $t('Menu.utilization rate') }}</template>
        </el-menu-item>
        <el-menu-item index="/data/TrafficState">
          <el-icon>
            <PieChart />
          </el-icon>
          <template #title>{{ $t('Menu.Traffic State') }}</template>
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item index="/hotrun" v-if="UserPermission.menu.HotRun==1">
        <el-icon>
          <Management color="red" />
        </el-icon>
        <template #title>Hot Run</template>
      </el-menu-item>
      <el-menu-item index="/secsgem" v-if="IsAdmin">
        <el-icon>
          <DataAnalysis :color="IconColor" />
        </el-icon>
        <template #title>SECS/GEM</template>
      </el-menu-item>
      <el-sub-menu index="/sys_settings" v-if="UserPermission.menu.SystemConfiguration==1">
        <template #title>
          <el-icon>
            <setting :color="IconColor" />
          </el-icon>
          <span>{{ $t('Menu.system settings') }}</span>
        </template>
        <el-menu-item
          index="/sys_settings/AGV_Battery_Setting"
          v-if="UserPermission.systemConfigurationSubMenu.BatteryLevelManagnment==1"
        >
          <el-icon>
            <setting />
          </el-icon>
          <template #title>{{ $t('Menu.vehicle battery managnment') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/sys_settings/Equipment_Setting"
          v-if="UserPermission.systemConfigurationSubMenu.EquipmentlManagnment==1"
        >
          <el-icon>
            <setting />
          </el-icon>
          <template #title>{{ $t('Menu.equipment management') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/sys_settings/RacksManagement"
          v-if="UserPermission.systemConfigurationSubMenu.RackManagnment==1"
        >
          <el-icon>
            <setting />
          </el-icon>
          <template #title>{{ $t('Menu.racks management') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/sys_settings/User_Setting"
          v-if="UserPermission.systemConfigurationSubMenu.UserManagnment==1"
        >
          <el-icon>
            <User />
          </el-icon>
          <template #title>{{ $t('Menu.user management') }}</template>
        </el-menu-item>
        <el-menu-item
          index="/sys_settings/Charge_Station_Setting"
          v-if="UserPermission.systemConfigurationSubMenu.ChargerManagnment==1"
        >
          <el-icon>
            <setting />
          </el-icon>
          <template #title>{{ $t('Menu.charge station management') }}</template>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>
<script>
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
  User,
  HomeFilled as home_icon,
  AlarmClock as alarm_icon,
  CopyDocument as cargo_icon,
  MapLocation as map_icon,
  DataAnalysis, PieChart, Message, Management, Van
} from '@element-plus/icons-vue'
import bus from '@/event-bus'
import { userStore } from '@/store'
export default {

  components: {
    DataAnalysis, Document, Message, Location, Setting, User, home_icon, alarm_icon, cargo_icon, map_icon, Management, Van, PieChart
  }
  ,
  props: {
    isCollapse: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      IconColor: 'rgb(6, 53, 125)',
      ActiveSubItem: "4"
    }
  },
  computed: {
    IsAdmin() {
      return userStore.getters.IsEngineerLogining || userStore.getters.IsDeveloperLogining
    },
    UserPermission() {
      return userStore.state.user.Permission;
    }
  },
  methods: {
    handleOpen() {

    },
    handleClose() {

    },
    handleClicked() {

    },
    GoToHomePage() {
      location.href = '/'
    }
  }
}
</script>
<style lang="scss" scoped>
.menu {
  padding: 0;
  margin: 0;

  .menu-top {
    padding: 0;
    margin: 0;

    .gpm-text {
      font-weight: 900;
      font-size: 18px;
      color: rgb(24, 22, 119);
    }

    .gpm-text:hover {
      background-color: rgb(13, 110, 253);
      color: white;
    }
  }

  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 230px;
    border: none;
    font-weight: bold;
    letter-spacing: 2px;
  }
}
</style>