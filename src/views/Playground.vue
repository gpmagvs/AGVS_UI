<template>
    <h1>Play ground</h1>
    <el-divider>IOSetting</el-divider>
    <div class="d-flex">
        <IOSetting regionName="X" />
    </div>
</template>
<script>
import IOSetting from '@/components/IOSetting.vue';
export default {
    components: {
        IOSetting,
    },
}
</script>
<style></style>