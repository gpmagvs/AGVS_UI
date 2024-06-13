import axios from 'axios'
import param from '@/gpm_param'

var axios_entity = axios.create({
    baseURL: param.backend_host,
})

/**修改Port位帳籍ID */
export async function ModifyCargoID(WIPID, PortID, NewCargoID) {
    var ret = await axios_entity.post(`/api/WIP/ModifyCargoID?WIPID=${WIPID}&PortID=${PortID}&NewCargoID=${NewCargoID}`)
    return ret.data;
}

// create a Delete CargoID fucntion
export async function RemoveCargoID(WIPID, PortID) {
    var ret = await axios_entity.post(`/api/WIP/RemoveCargoID?WIPID=${WIPID}&PortID=${PortID}`)
    return ret.data;
}