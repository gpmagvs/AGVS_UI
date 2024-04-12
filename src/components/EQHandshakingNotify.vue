<template>
    <transition name="el-zoom-in-center">
        <div v-show="EQHSStatus.IsHandshaking" class="handshaking-notify bg-primary text-light " v-bind:style="minimize ? miniSizeStyle : {}">
            <div class="w-100">
                <span v-bind:class="IsHandshakeFail ? 'text-danger' : ''" class="">{{ MessageTitle }}</span>
                <span v-if="!IsHandshakeFail" class="mx-1">{{ dot_animation_str }}</span>
                <div class="sub-title mx-1" v-bind:class="IsHandshakeFail ? 'bg-danger' : ''">{{ EQHSStatus.HandshakingInfoText }}</div>
            </div>
            <b-button size="sm" @click="() => { minimize = !minimize }" variant="light" id="close-btn" class="my-2">{{ minimize ? '▲' : '-' }}</b-button>
        </div>
    </transition>
</template>
<script>
import { AGVStatusStore } from '@/store'

export default {
    data() {
        return {
            dot_animation_str: '.',
            sub_title_text: 'sub',
            minimize: false,
            miniSizeStyle: {
                width: '450px',
                height: '120px',
                fontSize: '28px',
                position: 'absolute',
                left: 'auto',
                top: 'auto',
                right: '3px',
                bottom: '3px',

            }
        }
    },
    computed: {
        MessageTitle() {
            if (this.IsHandshakeFail) {
                return this.IsExchangeBatteryTask ? '電池交換作業失敗' : '取放貨作業失敗';
            } else {
                return this.IsExchangeBatteryTask ? '電池交換作業中' : '取放貨作業中';
            }

        },
        EQHSStatus() {
            return AGVStatusStore.getters.AGVStatus.HandshakeStatus
        },
        IsHandshakeFail() {
            return this.EQHSStatus.HandshakingInfoText && this.EQHSStatus.HandshakingInfoText.includes('Handshake_Fail');
        },
        IsExchangeBatteryTask() {
            return AGVStatusStore.getters.AGVStatus.OrderInfo.ActionName == 14;
        }

    },
    methods: {
        animation() {
            var dotNum = 0;
            setInterval(() => {
                this.dot_animation_str += '.'
                dotNum += 1;
                if (dotNum > 2) {
                    dotNum = 0;
                    this.dot_animation_str = '.'
                }
            }, 1000)
        }
    },
    mounted() {
        this.animation();
    }
}
</script>
<style lang="scss" scoped>
.minimize-mode {
    visibility: visible;
    width: 200px;
    bottom: 0;
    right: 3px;
}

.handshaking-notify {
    width: 98%;
    height: 160px;
    border-radius: 8px;
    // color: white;
    position: absolute;
    top: 40%;
    left: 10px;
    border: 2px solid #3a3a3a;
    opacity: .8;
    font-size: 50px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    letter-spacing: 4px;
    z-index: 4000;

    .sub-title {
        font-size: smaller;
        color: #ffffff;
        letter-spacing: normal;
        background: #000000;
    }

    #close-btn {
        position: absolute;
        top: 6px;
        right: 6px;
    }
}
</style>