<template>
    <!-- <Rack3DVue></Rack3DVue> -->
    <el-divider>RACK</el-divider>
    <div class="d-flex">
        <RackVue class="mx-3" rackName="WIP-1"></RackVue>
        <ColumnRowSelector></ColumnRowSelector>
    </div>
    <el-divider>Low Battery Notify</el-divider>
    <div class="">
        <LowBatteryNotifier></LowBatteryNotifier>
    </div>
</template>
<script>
import Rack3DVue from '@/components/RacksStatusView/Rack3D.vue';
import RackVue from '@/components/RacksStatusView/Rack.vue';
import ColumnRowSelector from '@/components/RacksStatusView/ColumnRowSelector.vue';
import LowBatteryNotifier from '@/components/Vehicle/LowBatteryNotifier.vue';
export default {
    components: {
        Rack3DVue, RackVue, ColumnRowSelector, LowBatteryNotifier
    },
}
</script>
<style></style>