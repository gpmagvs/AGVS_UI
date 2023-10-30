
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