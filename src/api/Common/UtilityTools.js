
import Clipboard from 'clipboard'
import { ElNotification } from 'element-plus'

export function CopyText(text) {
    const clipboard = new Clipboard('.copy-button', {
        text: () => text
    });
    clipboard.on('success', () => {
        ElNotification({
            title: text,
            message: "已複製到剪貼簿",
            duration: 1500
        })
        clipboard.destroy();
    });

    clipboard.on('error', () => {
        clipboard.destroy();
    });
}


/**節流確保一個函數在一定時間內只執行一次，不管它被呼叫了多少次。這適用於例如滾動事件的處理，可以限制事件處理的頻率。 */
export function Throttle(func, limit) {
    let inThrottle;
    return function () {
        const context = this, args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
