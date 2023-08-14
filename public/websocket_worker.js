
let socket;
let _ws_url = 'ws://127.0.0.1:5216/ws/VMSStatus'
function initWebsocket(ws_url) {
    _ws_url = ws_url;
    socket = new WebSocket(ws_url)
    socket.onopen = () => {
        console.log('websocket connected');
    }
    socket.onmessage = (ev) => {
        self.postMessage(JSON.parse(ev.data))
    }
    socket.onclose = (ev) => {
        TryReConnect();
    }
    socket.onerror = (ev) => {
        TryReConnect();
    }
}

function handleMessage(message) {
}
function TryReConnect() {
    console.info(`${_ws_url} websocket diconnect , retry to restore connection...`)
    initWebsocket(_ws_url)
}
self.onmessage = function (event) {
    console.log('worker ', event)
    const data = event.data;
    if (data.command == 'connect') {
        initWebsocket(data.ws_url)
    }
}