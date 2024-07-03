<template>
    <div class="">
        <div class="rack-sensor-container d-flex justify-content-between px-3">
            <div>
                <div class="sensor-name naeme-rack-1"> Rack 1</div>
                <el-input v-model="IOLocation.Box_Sensor1" size="small" style="width:50px"></el-input>
            </div>
            <div>
                <div class="sensor-name naeme-rack-2">Rack 2</div>
                <el-input v-model="IOLocation.Box_Sensor2" size="small" style="width:50px"></el-input>
            </div>
        </div>
        <div class="rack-sensor-container d-flex justify-content-between px-3">
            <div>
                <div class="sensor-name naeme-rack-1"> Rack 1</div>
                <el-input v-model="IOLocation.Tray_Sensor1" size="small" style="width:50px"></el-input>
            </div>
            <div>
                <div class="sensor-name naeme-rack-2">Rack 2</div>
                <el-input v-model="IOLocation.Tray_Sensor2" size="small" style="width:50px"></el-input>
            </div>
        </div>
        <!-- <div class="tray-sensor py-1 d-flex flex-column justify-content-between" style="height: 110px;">
            <div class=" px-3 text-end">
                <div class="sensor-name">Tray 1 </div>
                <el-input v-model="IOLocation.Tray_Sensor1" size="small" style="width:50px"></el-input>
            </div>
            <div class=" px-3 text-start">
                <div class="sensor-name">Tray 2</div>
                <el-input type="text" :formatter="(val) => (val)" v-model="IOLocation.Tray_Sensor2" size="small" style="width:50px"></el-input>
            </div>
        </div> -->
    </div>
</template>
<script>
export default {
    components: {
    },
    props: {
        displayBase: {
            type: String,
            default() {
                return 'dec'
            }
        },
        ioLocations: {
            type: Object,
            default() {
                return {
                    Tray_Sensor1: 2,
                    Tray_Sensor2: 3,
                    Box_Sensor1: 4,
                    Box_Sensor2: 5,
                }
            }
        }
    },
    data() {
        return {
            IOLocation: {
                Tray_Sensor1: 0,
                Tray_Sensor2: 1,
                Box_Sensor1: 2,
                Box_Sensor2: 3,
            }
        }
    },
    watch: {
        ioLocations: {
            handler: function (newValue, oldValue) {
                // console.info('ioLocations changed', newValue);
                //且換成16進位
                this.IOLocation.Tray_Sensor1 = newValue.Tray_Sensor1.toString(16).toUpperCase();
                this.IOLocation.Tray_Sensor2 = newValue.Tray_Sensor2.toString(16).toUpperCase();
                this.IOLocation.Box_Sensor1 = newValue.Box_Sensor1.toString(16).toUpperCase();
                this.IOLocation.Box_Sensor2 = newValue.Box_Sensor2.toString(16).toUpperCase();


            },
            immediate: true,
        }
    },
}
</script>
<style lang="scss" scoped>
.sensor-name {
    color: white;
    font-weight: bold;
    font-size: 12px;
    padding: 1px;
}

.naeme-rack-1 {
    /* background: red; */
    position: relative;
    left: -6px;
}

.naeme-rack-2 {
    /* background: red; */
    position: relative;
    right: -6px;
}
</style>