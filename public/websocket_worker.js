
let socket;
let _ws_url = 'ws://127.0.0.1:5216/ws/VMSStatus'
var auto_reconnect = true;
function initWebsocket(ws_url) {
    _ws_url = ws_url;
    socket = new WebSocket(ws_url)
    socket.onopen = () => { }
    socket.onmessage = (ev) => {
        var data_json = ev.data;
        self.postMessage(JSON.parse(data_json))

    }
    socket.onclose = (ev) => {
        if (auto_reconnect)
            TryReConnect();
    }
    socket.onerror = (ev) => {
        if (auto_reconnect)
            TryReConnect();
    }
}
function closeWebsocket(_auto_reconnec = false) {
    auto_reconnect = _auto_reconnec;
    if (socket)
        socket.close();
}
function handleMessage(message) {
}

var previous_data_json = ''

function TryReConnect() {
    var _socket = new WebSocket(_ws_url)
    _socket.onopen = (ev) => {
        socket = _socket
        socket.onmessage = (ev) => {
            // setTimeout(() => {
            //     var data_json = ev.data;
            //     if (data_json != previous_data_json) {
            //         self.postMessage(JSON.parse(ev.data))
            //         previous_data_json = ev.data
            //     }
            // }, 100)
            self.postMessage(JSON.parse(ev.data))

        }
    }
    _socket.onclose = (ev) => {
        TryReConnect()
    }
}
self.onmessage = function (event) {
    const data = event.data;
    if (data.command == 'connect') {
        initWebsocket(data.ws_url)
    }
    if (data.command == 'disconnect') {
        closeWebsocket(false)
    }
}