<template>
    <div class="agv-alarm-messages">
        <!-- Examples 
            <AGVAlarmItem :isDisconnection="true" agv_name="AGV_001" alarm_type="alarm" text="連線中斷"></AGVAlarmItem>
            <AGVAlarmItem :isDisconnection="true" agv_name="AGV_002" alarm_type="alarm" text="連線中斷"></AGVAlarmItem>
            <AGVAlarmItem :isBatteryLowLevel="true" alarm_type="alarm" text="電池低電量警報"></AGVAlarmItem>
            <AGVAlarmItem :isBatteryTemperatureHigh="true" alarm_type="warning" text="電池過溫警報"></AGVAlarmItem>
            <AGVAlarmItem alarm_type="alarm" text="alarm!!"></AGVAlarmItem>
        -->
    </div>
</template>

<script>
import AGVAlarmItem from './AGVAlarmItem.vue'

export default {
    components: {
        AGVAlarmItem,
    },
}
</script>

<style lang="scss" scoped>
.agv-alarm-messages {
    position: absolute;
    top: 140px;
    right: 15px;
    z-index: 2;
    // width: 310px;
    // background: rgb(175, 175, 175);
    border-radius: 4px;
    padding: 10px;
}
</style>