<template>
    <el-tabs v-model="activeTabName" type="border-card" tabPosition="left">
        <el-tab-pane name="MainEQ" label="User"></el-tab-pane>
        <el-tab-pane name="ChargeStation" label="Config"></el-tab-pane>
        <el-tab-pane label="Role"></el-tab-pane>
        <el-tab-pane label="Task"></el-tab-pane>
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </el-tabs>
</template>
  

<script>
export default {
    data() {
        return {
            activeTabName: '', // 綁定當前激活的標籤頁名稱
        };
    },
    computed: {
        // 計算屬性來獲取子路由
        childRoutes() {
            // 獲取與父路由匹配的路由記錄
            const parentRoute = this.$router.options.routes.find(
                route => route.path === this.$route.matched[0].path
            );
            // 返回子路由
            return parentRoute && parentRoute.children ? parentRoute.children : [];
        }
    },
    watch: {
        // 監聽激活的標籤頁的變化，改變路由
        activeTabName(newValue) {
            if (newValue) {
                this.$router.push({ name: newValue });
            }
        },
        // 當路由變化時，更新激活的標籤頁
        '$route'(to) {
            this.activeTabName = to.name;
        }
    },
    methods: {
    },
    mounted() {
        // 確保初始標籤頁與當前路由同步
        this.activeTabName = this.$route.name;
    }
}
</script>

<style></style>