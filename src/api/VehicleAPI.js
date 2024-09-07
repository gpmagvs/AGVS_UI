import axios from "axios";
export async function EMO(agvHost) {
    await SendTo(agvHost, '/api/VMS/EMO')
}

export async function Initialize(agvHost) {
    await SendTo(agvHost, '/api/VMS/Initialize')
}
export async function RemoveCargoID(agvHost) {
    await SendTo(agvHost, '/api/VMS/RemoveCassette')
}

async function SendTo(agvHost = 'http://127.0.0.1:8888', url = '') {
    var _axios = axios.create({
        baseURL: agvHost
    })
    await _axios.post(url)
}