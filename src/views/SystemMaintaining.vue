<template>
    <div class="system-maintain-page">
        <div class="maintenance-content">
            <!-- 公司 Logo -->
            <!-- <div class="company-logo">
                <span class="company-name">GPM</span>
            </div> -->
            <div class="icon-wrapper">
                <svg class="rotating" viewBox="0 0 24 24" width="80" height="80">
                    <path fill="currentColor"
                        d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
                </svg>
            </div>
            <h1>系統維護中</h1>
            <p class="message">派車系統正在進行系統維護與升級</p>
            <p class="sub-message">預計維護時間：{{ estimatedTime }} 分鐘</p>
            <div class="progress-bar">
                <div class="progress" :style="{ width: progress + '%' }"></div>
            </div>
            <p class="apologize">請稍後嘗試重新整理頁面。</p>
            <!-- 聯絡資訊 -->
            <div class="contact-info">
                <div class="contact-item">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                    </svg>
                    <span>jinweihuang@gpmcorp.com.tw</span>
                </div>
                <div class="contact-item">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor"
                            d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
                    </svg>
                    <span>(04)25658866 #6290</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const estimatedTime = ref(10); // 預計維護時間（分鐘）
const progress = ref(0);

onMounted(() => {
    // 模擬進度條動畫
    const interval = setInterval(() => {
        if (progress.value < 90) {
            progress.value += 0.5;
        }
    }, 1000);

    // 組件卸載時清除 interval
    onUnmounted(() => {
        clearInterval(interval);
    });
});
</script>
<style lang="scss" scoped>
.system-maintain-page {
    height: 100vh;
    width: 100vw;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.maintenance-content {
    text-align: center;
    padding: 2rem;
    max-width: 600px;

    h1 {
        letter-spacing: 14px;
    }
}

.icon-wrapper {
    margin-bottom: 2rem;

    svg {
        color: #ffffff;
    }
}

.rotating {
    animation: rotate 4s linear infinite;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
}

.message {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #e0e0e0;
}

.sub-message {
    font-size: 1rem;
    color: #cccccc;
    margin-bottom: 2rem;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 2rem;
}

.progress {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.5s ease-in-out;
}

.apologize {
    font-size: 1rem;
    color: #e0e0e0;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.company-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;

    svg {
        color: #ffffff;
        margin-right: 0.5rem;
    }

    .company-name {
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: 2px;
    }
}

.contact-info {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-item {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: #cccccc;

    svg {
        margin-right: 0.5rem;
    }

    span {
        font-size: 0.9rem;
    }

    &:last-child {
        margin-bottom: 0;
    }
}
</style>