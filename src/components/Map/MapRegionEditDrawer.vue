<template>
    <div class="forbid-region-edit-drawer">
        <el-drawer v-model="show" size="35%"
            :close-on-press-escape="true"
            :close-on-click-modal="true"
            @closed="$emit('closed', PathDataEdit)"
            :show-close="false"
            :modal="true"
            modal-class="modal-style">
            <template #header>
                <div class="header border-bottom">
                    <h3>區域設置:{{ region_name }}</h3>
                </div>
            </template>
            <div class="draw-content">
                <el-form label-width="140" label-position="left">
                    <el-form-item label="名稱">
                        <el-input v-model="RegionData.Name"></el-input>
                    </el-form-item>
                    <el-form-item label="類型">
                        <el-select v-model="RegionData.RegionType">
                            <el-option :value="0" label="禁制區"></el-option>
                            <el-option :value="1" label="通行區"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { MapStore } from '@/components/Map/store'
import { MapRegion } from './mapjs'
export default {
    data() {
        return {
            show: false,
            region_name: '',
            /** { "StartPtIndex": 5, "EndPtIndex": 0, "StartCoordination": [ 2.653, 6.213 ], "EndCoordination": [ 0.531, 6.217 ], "PathID": "5_0", "IsEQLink": false, "IsSingleCar": false, "IsPassable": false, "IsExtinguishingPath": false, "Speed": 1, "LsrMode": 0, "DodgeMode": 0, "SpinMode": 0 }*/
            RegionData: new MapRegion('', [])
        }
    },
    props: {
        SettingsChangedHandler: {
            type: Function,
            default() {
                return () => {
                }
            }
        }
    },
    methods: {
        Show(region_name) {
            this.region_name = region_name
            setTimeout(async () => {
                this.RegionData = JSON.parse(JSON.stringify(await MapStore.dispatch('GetRegionByName', region_name)))
                this.show = true
            }, 10)
        }
    },
}
</script>

<style lang="scss">
.draw-content {
    top: 67px;
    position: absolute;
    height: 100%;

    .settings {
        height: 800px;
        overflow-y: scroll;
    }

    button {
        width: 120px;
        margin-right: 3px;
    }
}
</style>