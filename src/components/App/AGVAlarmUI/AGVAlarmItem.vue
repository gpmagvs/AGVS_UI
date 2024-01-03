<template>
    <div class="agv-alarm-item my-2 d-flex rounded" v-bind:class="alarm_type">
        <div class="icon px-2 text-light" v-bind:class="alarm_type == 'alarm' ? 'bg-danger' : 'bg-warning'">
            <i v-if="isBatteryTemperatureHigh" class="bi bi-thermometer-high"></i>
            <i v-else-if="isBatteryLowLevel" class="bi bi-battery"></i>
            <i v-else-if="isDisconnection" class="bi bi-reception-1"></i>
            <i v-else class="bi bi-exclamation-diamond"></i>
        </div>
        <div class="agv-name">{{ agv_name }}|</div>
        <div class="text">{{ text }}</div>
    </div>
</template>

<script>
export default {
    props: {
        alarm_type: {
            type: String,
            default: 'warning'
        },
        agv_name: {
            type: String,
            default: 'AGV_001'
        },
        text: {
            type: String,
            default: ''
        },
        isBatteryTemperatureHigh: {
            type: Boolean,
            default: false
        },
        isBatteryLowLevel: {
            type: Boolean,
            default: false
        },
        isDisconnection: {
            type: Boolean,
            default: false
        }
    },
}
</script>

<style lang="scss" scoped>
.agv-alarm-item {
    font-size: 28px;
    padding: auto 10px;
    cursor: pointer;

    .agv-name {
        font-size: smaller;
        padding: 5px;
        // background: rgb(11, 94, 215);
        // color: rgb(11, 94, 215);
        font-weight: bold;
    }

    .text {
        width: auto;
        letter-spacing: 4px;
    }
}

.agv-alarm-item:hover {
    color: white;
    background: rgb(11, 94, 215);
}

.warning {
    background: rgb(255, 189, 66);
    color: white;
}

.alarm {
    background: rgb(250, 32, 69);
    color: white;
}
</style>