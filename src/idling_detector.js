import bus from './event-bus'
import { GetFrontendOptions } from './api/SystemAPI';
import { userStore } from './store';
var idleTime = 0

function resetTimer() {
    idleTime = 0;
}
setTimeout(() => {

    GetFrontendOptions().then(options => {
        var interval = setInterval(() => {
            idleTime += 1;
            if (idleTime >= options.WebUserLogoutExipreTime) {
                if (userStore.getters.IsLogin) {
                    userStore.dispatch('logout', null)
                    bus.emit('auto_logout_notify_invoke', "");
                }

                resetTimer();
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
