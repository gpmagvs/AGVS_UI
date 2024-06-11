<template>
    <div class="menu">
        <div class="menu-top border-bottom p-2" style="cursor: pointer;"> <!-- <i @click="() => { isCollapse = !isCollapse }">tgt</i> -->
            <img v-if="!isCollapse" @click="GoToHomePage" src="/GPM_Logo.png" alt="" width="160">
            <div v-else class="gpm-text" @click="GoToHomePage">GPM</div>
        </div>
        <el-menu
            :default-active="ActiveSubItem"
            class="el-menu-vertical-demo"
            style="height: 100vh;"
            active-text-color="rgb(13, 110, 253)"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            :default-openeds="['/map']"
            @open="handleOpen"
            @close="handleClose"
            @select="handleSelect">
            <el-menu-item index="/">
                <el-icon>
                    <home_icon />
                </el-icon>
                <template #title>{{ $t('Menu.Home') }}</template>
            </el-menu-item>
            <el-menu-item index="/alarm">
                <el-icon>
                    <Message color="red" />
                </el-icon>
                <template #title>{{ $t('Menu.System Alarm') }}</template>
            </el-menu-item>
            <el-menu-item index="/racks_status">
                <el-icon>
                    <cargo_icon :color="IconColor" />
                </el-icon>
                <template #title>{{ $t('Menu.wip_manager') }}</template>
            </el-menu-item>
            <el-menu-item index="/vehicle">
                <el-icon>
                    <Van :color="IconColor" />
                </el-icon>
                <template #title>{{ $t('Menu.vehicle manager') }}</template>
            </el-menu-item>
            <el-sub-menu v-if="IsAdmin" index="/map">
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
            <el-sub-menu index="/data">
                <template #title>
                    <el-icon>
                        <DataAnalysis :color="IconColor" />
                    </el-icon>
                    <span>{{ $t('Menu.Querys') }}</span>
                </template>
                <el-menu-item index="/data/task_history">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>{{ $t('Menu.Task History') }}</template>
                </el-menu-item>
                <el-menu-item index="/data/alarm_history">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>{{ $t('Menu.Alarm History') }}</template>
                </el-menu-item>
                <el-menu-item index="/data/agv_locus">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>{{ $t('Menu.Trajectory') }}</template>
                </el-menu-item>
                <el-menu-item index="/data/InstrumentMeasureQuery">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>{{ $t('Menu.Instruments Measure Result') }}</template>
                </el-menu-item>
                <el-menu-item index="/data/Avalibility">
                    <el-icon>
                        <PieChart />
                    </el-icon>
                    <template #title>{{ $t('Menu.utilization rate') }}</template>
                </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-if="IsAdmin" index="/hotrun">
                <el-icon>
                    <Management color="red" />
                </el-icon>
                <template #title>Hot Run</template>
            </el-menu-item>
            <el-sub-menu v-if="IsAdmin" index="/sys_settings">
                <template #title>
                    <el-icon>
                        <setting :color="IconColor" />
                    </el-icon>
                    <span>{{ $t('Menu.system settings') }}</span>
                </template>
                <el-menu-item index="/sys_settings/AGV_Battery_Setting">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>{{ $t('Menu.vehicle battery managnment') }}</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/Equipment_Setting">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>{{ $t('Menu.equipment management') }}</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/RacksManagement">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>{{ $t('Menu.racks management') }}</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/User_Setting">
                    <el-icon>
                        <User />
                    </el-icon>
                    <template #title>{{ $t('Menu.user management') }}</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/Charge_Station_Setting">
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
            ActiveSubItem: 4
        }
    },
    computed: {
        IsAdmin() {
            return userStore.getters.IsLogin
        }
    },
    methods: {
        handleOpen() {

        },
        handleClose() {

        },
        handleSelect(key, keypath) {
            this.PageSwitch(key)
        },
        GoToHomePage() {
            this.PageSwitch('/')
        },
        PageSwitch(route_name, display_name = '') {
            var current_route = this.$router.currentRoute.value.path;
            if (route_name != current_route) {
                setTimeout(() => {
                    //this.$router.push(route_name);
                    bus.emit('/router-change', { route_display_name: display_name, route_name: route_name });
                }, 100);
            }
        },
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
            color: rgb(24, 22, 119)
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