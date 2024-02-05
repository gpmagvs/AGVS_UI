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