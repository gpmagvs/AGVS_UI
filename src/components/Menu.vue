<template>
    <div class="menu">
        <div class="menu-top" style="cursor: pointer;"> <!-- <i @click="() => { isCollapse = !isCollapse }">tgt</i> -->
            <img v-if="!isCollapse" @click="GoToHomePage" src="/GPM_Logo.png" alt="" width="160">
            <div v-else class="gpm-text" @click="GoToHomePage">GPM</div>
        </div>
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            style="height: 100vh;"
            active-text-color="rgb(13, 110, 253)"
            :collapse="isCollapse"
            @open="handleOpen"
            @close="handleClose"
            @select="handleSelect">
            <el-menu-item index="/">
                <el-icon>
                    <home_icon />
                </el-icon>
                <template #title>主頁</template>
            </el-menu-item>
            <el-menu-item index="/alarm">
                <el-icon>
                    <Message color="red" />
                </el-icon>
                <template #title>系統警報</template>
            </el-menu-item>
            <el-menu-item index="/racks_status">
                <el-icon>
                    <cargo_icon :color="IconColor" />
                </el-icon>
                <template #title>帳籍管理</template>
            </el-menu-item>
            <el-menu-item v-if="IsAdmin" index="/map">
                <el-icon>
                    <map_icon :color="IconColor" />
                </el-icon>
                <template #title>圖資管理</template>
            </el-menu-item>
            <el-sub-menu>
                <template #title>
                    <el-icon>
                        <DataAnalysis :color="IconColor" />
                    </el-icon>
                    <span>資料查詢</span>
                </template>
                <el-menu-item index="/data/task_history">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>歷史任務查詢</template>
                </el-menu-item>
                <el-menu-item index="/data/alarm_history">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>歷史警報查詢</template>
                </el-menu-item>
                <el-menu-item index="/data/agv_locus">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>AGV軌跡查詢</template>
                </el-menu-item>
                <el-menu-item index="/data/InstrumentMeasureQuery">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <template #title>儀器量測結果查詢</template>
                </el-menu-item>
                <el-menu-item index="/data/Avalibility">
                    <el-icon>
                        <PieChart />
                    </el-icon>
                    <template #title>機台稼動</template>
                </el-menu-item>
            </el-sub-menu>
            <el-sub-menu v-if="IsAdmin" index="/sys_settings">
                <template #title>
                    <el-icon>
                        <setting :color="IconColor" />
                    </el-icon>
                    <span>系統設置</span>
                </template>
                <el-menu-item index="/sys_settings/AGV_Battery_Setting">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>AGV電量管理</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/Equipment_Setting">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>設備管理</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/User_Setting">
                    <el-icon>
                        <User />
                    </el-icon>
                    <template #title>用戶管理</template>
                </el-menu-item>
                <el-menu-item index="/sys_settings/Charge_Station_Setting">
                    <el-icon>
                        <setting />
                    </el-icon>
                    <template #title>充電站管理</template>
                </el-menu-item>
            </el-sub-menu>
        </el-menu>
    </div>
</template>
  
<script >
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
    DataAnalysis, PieChart, Message
} from '@element-plus/icons-vue'
import bus from '@/event-bus'
import { userStore } from '@/store'
export default {

    components: {
        DataAnalysis, Document, Message, Location, Setting, User, home_icon, alarm_icon, cargo_icon, map_icon,
        PieChart
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
            IconColor: 'rgb(6, 53, 125)'
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
                    this.$router.push(route_name);
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
        width: 200px;
        border: none;
        font-weight: bold;
        letter-spacing: 2px;
    }
}
</style>
  