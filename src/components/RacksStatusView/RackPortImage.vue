<template>
    <div @click="PortClick" class="rack-port-container"
        v-bind:class="colBeSelected ? 'rack-col-selected' : ''"
        v-bind:style="{ position: 'relative', top: `${12 * row}px`, left: `${-15 * col}px` }">
        <div v-if="isBottom" class="rack-port rack-bottom-port" style="width:170px">
            <img class="port-img" src="~@/assets/images/rack-bottom-port.png" width="170" />
            <img v-if="hasRack" class="rack-tray-img" src="~@/assets/images/rack.png" width="170" />
            <img v-if="hasTray" class="rack-tray-img" src="~@/assets/images/tray.png" width="170" />
        </div>
        <div v-else class="rack-port " style="width:170px">
            <img class="port-img" src="~@/assets/images/rack-normal-port.png" width="170" />
            <img v-if="hasRack" class="rack-tray-img" src="~@/assets/images/rack.png" width="170" />
            <img v-if="hasTray" class="rack-tray-img" src="~@/assets/images/tray.png" width="170" />
        </div>
        <el-tag v-show="CarrierID && CarrierID != ''" effect="dark">{{ CarrierID }}</el-tag>
        <div v-if="row == 0" class="qr-code d-flex flex-column">
            <i class="bi bi-qr-code"> </i>
            <label for="">0</label>
        </div>
        <div class="selected-border" style="width: 84%;height: 156px;position: absolute;top: 12px;left: 12px;"></div>
    </div>
</template>
<script>
export default {
    props: {
        isBottom: {
            type: Boolean,
            default: false
        },
        col: {
            type: Number,
            default: 0
        },
        row: {
            type: Number,
            default: 0
        },
        colBeSelected: {
            type: Boolean,
            dafault: true
        },
        hasRack: {
            type: Boolean,
            dafault: false
        },
        hasTray: {
            type: Boolean,
            dafault: false
        },
        CarrierID: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
        }
    },
    methods: {
        PortClick() {
            this.$emit('on-port-click',
                {
                    row: this.row,
                    col: this.col,
                    hasCargo: this.hasRack || this.hasTray,
                    carrierID: this.CarrierID,
                }
            );
        }
    }

}
</script>
<style lang="scss" scoped>
.rack-col-shift-position {
    position: relative;
    left: -10px;
}

.rack-col-selected {
    border: 5px solid red;
    z-index: 230
}

.rack-port-container {
    cursor: pointer;
    z-index: 0;

    .el-tag {
        position: absolute;
        top: 112px;
        left: 20px;
        width: 130px;
        font-size: large;
        // background-color: red;
        // color: white;
    }

    .qr-code {
        font-size: 30px;
        position: relative;
        bottom: 35px;

        label,
        input {
            position: inherit;
            bottom: 15px;
            color: green;
        }
    }
}

.selected-border:hover {
    border: 7px solid orange;
    z-index: 1232;
}

.rack-port {
    .rack-tray-img {
        position: absolute;
        top: 0px;
        left: 0px;
        transform: scale(0.73);
    }
}
</style>