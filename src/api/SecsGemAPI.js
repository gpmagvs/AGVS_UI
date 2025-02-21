import axios from 'axios'
import param from '@/gpm_param'

var axios_entity = axios.create({
    baseURL: param.backend_host,
})

/**GetConfigurations*/
export async function GetConfigurations() {
    try {
        var ret = await axios_entity.get(`/api/SecsGemConfiguration/`)
        return ret.data;
    } catch (error) {
        throw error;
    }
}
export async function SaveReturnCodeSetting(requestData = { TaskConfiguration: {} }) {
    var ret = await axios_entity.post(`/api/SecsGemConfiguration/SaveReturnCodeSetting`, requestData);
    return ret.data;
}

export async function SaveResultCodeSetting(requestData = { transferCompletedResultCodes: {} }) {
    var ret = await axios_entity.post(`/api/SecsGemConfiguration/SaveResultCodeSetting`, requestData);
    return ret.data;
}

export async function SaveSECSConfig(requestData = { SECSConfig: {} }) {
    var ret = await axios_entity.post(`/api/SecsGemConfiguration/saveSECSGemSetting`, requestData);
    return ret.data;
}
