import bus from './event-bus'
import { GetFrontendOptions } from './api/SystemAPI';
import { userStore } from './store';
var idleTime = 0
var idleDetectTimer = undefined;
function resetTimer() {
    idleTime = 0;
}
setTimeout(() => {

    GetFrontendOptions().then(options => {
        const _timeTHres = options.WebUserLogoutExipreTime;
        // const _timeTHres = 10;
        idleDetectTimer = setInterval(() => {
            idleTime += 1;
            if (idleTime >= _timeTHres) {
                bus.emit('auto_logout_notify_invoke', "");
                resetTimer();
                clearInterval(idleDetectTimer);
            }
        }, 1000);

    })
}, 5000)
document.addEventListener('touchstart', resetTimer);
document.addEventListener('touchmove', resetTimer);
document.addEventListener('touchend', resetTimer);
document.addEventListener('mousemove', resetTimer);
document.addEventListener('mousedown', resetTimer)
document.addEventListener('keydown', resetTimer);
