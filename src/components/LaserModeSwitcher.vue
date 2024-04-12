<template>
    <div class="laser-mode-switcher w-100  border rounded">
        <div class="w-100 text-start">
            <b-button :disabled="!enabled" squared class="border" @click="ButtonClicked(number)" v-for="number in [0, 1, 2, 3, 4, 5, 6, 7]" :key="number" :variant="IsModeBeSetting(number) ? 'primary' : 'light'">{{ number }}</b-button>
        </div>
        <div class="w-100 text-start">
            <b-button :disabled="!enabled" squared class="border" @click="ButtonClicked(number)" v-for="number in [8, 9, 10, 11, 12, 13, 14, 15]" :key="number" :variant="IsModeBeSetting(number) ? 'primary' : 'light'">{{ number }}</b-button>
        </div>
    </div>
</template>
<script>
import { AGVStatusStore, UserStore } from '@/store';
import { LaserMode } from '@/api/VMSAPI.js'

export default {
    data() {
        return {
            LserMap: {
                0: '0-Bypass',
                1: '1-Normal',
                2: '2-二次定位',
                3: '3-Normal(Short)',
                4: '4',
                5: '5-Turning',
                6: '6',
                7: '7-Loading',
                8: '8',
                9: '9',
                10: '10-Special',
                11: '11',
                12: '12-Narrow',
                13: '13-Narrow(Long)',
                14: '14',
                15: '15',
                16: '16-Bypass',
            },
            LserMap_AMC: {
                0: '0-Bypass',
                1: '1-Normal',
                2: '2-Normal',
                3: '3-Unknown',
                4: '4-Bay',
                5: '5-Turning',
                6: '6-Turning',
                7: '7-Unknown',
                8: '8-Unknown',
                9: '9-Bay',
                10: '10-Unknown',
                11: '11-Charge',
                12: '12-Left Move',
                13: '13-Right Move',
                14: '14-Obstacle Go Back',
                15: '15-Bypass',
                16: '16-Bypass',
            }
        }
    },
    computed: {
        CurrentLaserMode() {
            var match = AGVStatusStore.getters.CurrentLaserMode.match(/\((\d+)\)/);
            if (match) {
                var extractedNumber = match[1];
                return extractedNumber
            } else {
                return 0;
            }
        },
        IsUserLogin() {
            return UserStore.getters.CurrentUserRole != 0;
        },
        IsGodUser() {
            return UserStore.getters.IsGodUser;
        },
        IsAuto() {
            return AGVStatusStore.getters.IsAuto;
        },
        IsOnline() {
            return AGVStatusStore.getters.IsOnline;
        },
        enabled() {
            return UserStore.getters.Operationable
        }
    },
    methods: {
        ButtonClicked(number) {
            var laserMap = AGVStatusStore.getters.IsInspectionAGV ? this.LserMap_AMC : this.LserMap
            this.$swal.fire(
                {
                    text: '',
                    title: `Change Laser Mode to : ${laserMap[number]}?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                }).then(res => {
                    if (res.isConfirmed) {
                        this.ModifyLaserMode(number);
                    }
                })
        },
        IsModeBeSetting(num) {
            return this.CurrentLaserMode == num;
        },
        async ModifyLaserMode(laser_mode) {
            await LaserMode(laser_mode);
        },
    },
}
</script>
<style lang="scss" scoped>
.laser-mode-switcher {
    margin-left: 30px;

    button {
        width: 10%;
        margin: 3px;
    }
}
</style>