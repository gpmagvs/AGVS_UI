<template>
    <div class="agv_show_on_map_design h-100">
        <el-container class="h-100">
            <!-- <el-header class="text-start p-2 border" height="50px">
                <el-button type="primary" @click="SaveSetting">儲存設定</el-button>
                <el-button type="danger">取消</el-button>
            </el-header> -->
            <el-main class="bg-light p-2">
                <AGVDrawSetting v-for="name in agvNameList" :key="name" :agv_name="name"></AGVDrawSetting>
            </el-main>
        </el-container>
    </div>
</template>
<script>
import AGVDrawSetting from './AGVDrawSetting.vue';
import { agv_states_store } from '@/store';
export default {
    components: {
        AGVDrawSetting,
    },
    methods: {
        SaveSetting() {

        }
    },
    computed: {
        agvNameList() {
            return agv_states_store.getters.AGVNameList
        }
    },
}
</script>
<style></style>