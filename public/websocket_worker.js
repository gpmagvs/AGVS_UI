
let socket;
<<<<<<< HEAD
let _ws_url = 'ws://127.0.0.1:5216/ws/VMSStatus'
=======
let _ws_url = 'ws://127.0.0.1:7025/ws/VMSStatus'
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
var auto_reconnect = true;
function initWebsocket(ws_url) {
    _ws_url = ws_url;
    socket = new WebSocket(ws_url)
<<<<<<< HEAD
    socket.onopen = () => { console.log(_ws_url + '--connected!') }
=======
    socket.onopen = () => {
        SendKeepAlive(socket);
    }
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
    socket.onmessage = (ev) => {
        var data_json = ev.data;
        self.postMessage(JSON.parse(data_json))

    }
    socket.onclose = (ev) => {
<<<<<<< HEAD
        console.log(_ws_url + '--closed!')
=======
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
        if (auto_reconnect)
            TryReConnect();
    }
    socket.onerror = (ev) => {
<<<<<<< HEAD
        console.error(_ws_url + '--error!')
=======
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
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

<<<<<<< HEAD
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
=======
function SendKeepAlive(socket) {
    var timer = setInterval(() => {

        if (socket.readyState != 1) {
            clearInterval(timer);
            return;
        }
        console.log(socket.readyState);
        socket.send('ping');

    }, 1000);

}
function TryReConnect() {
    var _socket = new WebSocket(_ws_url)

    _socket.onopen = (ev) => {
        SendKeepAlive(_socket)
        socket = _socket
        socket.onmessage = (ev) => {
            self.postMessage(JSON.parse(ev.data))
        }
    }
    _socket.onclose = (ev) => {
        self.postMessage('closed')
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
        TryReConnect()
    }
}
self.onmessage = function (event) {
<<<<<<< HEAD
=======
    console.log(event);

>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
    const data = event.data;
    if (data.command == 'connect') {
        initWebsocket(data.ws_url)
    }
    if (data.command == 'disconnect') {
        closeWebsocket(false)
    }
<<<<<<< HEAD
}
=======
    if (data.command == 'disconnect') {
        socket.send('close');
        socket.close();
        console.log('websocket closed');
    }
}
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
