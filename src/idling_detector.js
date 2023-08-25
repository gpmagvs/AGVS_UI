import bus from './event-bus'
var idleTime = 0
var interval = setInterval(() => {
    idleTime += 1;
    if (idleTime >= 60) {
        resetTimer()
        location.reload()
    }
}, 1000);

document.addEventListener('touchstart', resetTimer);
document.addEventListener('touchmove', resetTimer);
document.addEventListener('touchend', resetTimer);
document.addEventListener('mousemove', resetTimer);
document.addEventListener('mousedown', resetTimer)
document.addEventListener('keydown', resetTimer);

function resetTimer() {
    idleTime = 0;
}