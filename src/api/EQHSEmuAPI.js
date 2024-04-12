import axios from 'axios'
import param from '@/gpm_param'
var _axios = axios.create({
    baseURL: param.backend_host,
})

/** */
export async function EQAbnormalWhenEQBusyEmu() {
    var ret = await _axios.get('api/EQHandshakeEmu/EQAlarmWhenEQBusySimulation');
    return ret.data;
}
/** */
export async function EQInitialze() {
    var ret = await _axios.get('api/EQHandshakeEmu/EQInitialze');
    return ret.data;
}
