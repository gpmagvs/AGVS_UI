
<template>
    <div class="agv_show_on_map_design h-100">
        <el-container class="h-100">
            <el-header class="text-start p-2 border" height="50px">
                <el-button type="primary">儲存設定</el-button>
                <el-button type="danger">取消</el-button>
            </el-header>
            <el-main class="bg-light p-2">
                <AGVDrawSetting agv_name="AGV_001"></AGVDrawSetting>
                <AGVDrawSetting agv_name="AGV_002"></AGVDrawSetting>
            </el-main>
        </el-container>
    </div>
</template>

<script>
import AGVDrawSetting from './AGVDrawSetting.vue';
export default {
    components: {
        AGVDrawSetting,
    },
}
</script>

<style></style>