import axios from 'axios'
import param from '@/gpm_param'

var axios_entity = axios.create({
    baseURL: param.backend_host,
})

/**修改Port位帳籍ID */
export async function ModifyCargoID(WIPID, PortID, NewCargoID) {
    let response = { confirm: false, message: 'no-response' }
    try {
        var ret = await axios_entity.post(`/api/WIP/ModifyCargoID?WIPID=${WIPID}&PortID=${PortID}&NewCargoID=${NewCargoID}`)
        _.merge(response, ret.data)
    } catch (error) {
        response.message = error.message
    }
    return response;
}

// create a Delete CargoID fucntion
/**return : { confirm = confirm, message = message } */
export async function RemoveCargoID(WIPID, PortID) {
    let response = { confirm: false, message: 'no-response' }
    try {
        var ret = await axios_entity.post(`/api/WIP/RemoveCargoID?WIPID=${WIPID}&PortID=${PortID}`)
        _.merge(response, ret.data)
    } catch (error) {
        response.message = error.message
    }
    return response;
}
export async function PortUsableSwitch(wipName, portID, usable) {
    var ret = await axios_entity.post(`/api/WIP/PortUsableSwitch?WIPID=${wipName}&PortID=${portID}&Usable=${usable}`)
    return ret.data;
}
/**return : { confirm = confirm, message = message } */
export async function GetAllSlotsOptions() {
    var ret = await axios_entity.get(`/api/WIP/GetAllSlotsOptions`)
    return ret.data;
}

export async function GetRackStatusData() {
    var ret = await axios_entity.get(`/api/WIP/GetRackStatusData`)
    return ret.data;
}


