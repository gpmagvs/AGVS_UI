
let socket;
let ws_url = 'ws://127.0.0.1:5216/ws/VMSStatus'
function initWebsocket(ws_url) {
    socket = new WebSocket(ws_url)
    socket.onopen = () => {
        console.log('websocket connected');
    }
    socket.onmessage = (ev) => {
        self.postMessage(JSON.parse(ev.data))
    }
    socket.onclose = (ev) => {
        self.postMessage('closed')
    }
    socket.onerror = (ev) => {
        self.postMessage('error')
    }

}

function handleMessage(message) {

}
self.onmessage = function (event) {
    console.log('worker ', event)
    const data = event.data;
    if (data.command == 'connect') {
        initWebsocket(data.ws_url)
    }
}