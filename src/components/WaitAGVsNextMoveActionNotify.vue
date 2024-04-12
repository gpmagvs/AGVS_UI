<template>
    <transition name="el-zoom-in-center">
        <div class="wait-next-task-move-notify bg-primary text-light " v-bind:style="minimize ? miniSizeStyle : {}" v-show="IsSegmentTaskAndIDLE">
            <div class="w-100">
                <i class="bi bi-stoplights"></i>
                <span class="">交管停等中</span>
                <span class="mx-1">{{ dot_animation_str }}</span>
                <div class="sub-title mx-1">{{ WaitinInfo }}</div>
            </div>
            <b-button @click="() => { minimize = !minimize }" variant="light" id="close-btn" class="my-2">{{ minimize ? '▲' : '-' }}</b-button>
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
                width: '330px',
                height: '120px',
                fontSize: '30px',
                position: 'absolute',
                left: 'auto',
                top: 'auto',
                right: '3px',
                bottom: '3px',

            }
        }
    },
    computed: {
        IsSegmentTaskAndIDLE() {
            return AGVStatusStore.getters.AGVStatus.NavInfo.IsSegmentTaskExecuting;
        },
        WaitinInfo() {
            return `等待前往目的地-${AGVStatusStore.getters.AGVStatus.NavInfo.Destination}`
        },
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
.show-wait-notify {
    visibility: visible;
    z-index: 3;
}

.hidden-wait-notify {
    visibility: hidden;
    z-index: -1;
}

.minimize-mode {
    visibility: visible;
    width: 200px;
    bottom: 0;
    right: 3px;
}

.wait-next-task-move-notify {
    width: 98%;
    height: 193px;
    border-radius: 8px;
    // color: white;
    position: absolute;
    top: 40%;
    left: 10px;
    border: 4px solid #ebd516;
    opacity: .9;
    font-size: 50px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    letter-spacing: 7px;
    z-index: 4000;

    .sub-title {
        font-size: smaller;
        color: #ffffff;
        letter-spacing: normal;
        background: #f1c447;
        height: 87px;
        padding: 15px;
        border-radius: 8px;
    }

    #close-btn {
        position: absolute;
        top: 6px;
        right: 6px;
    }
}
</style>