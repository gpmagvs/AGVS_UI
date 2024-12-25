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


export async function SaveReturnCodeSetting(requestData = { transferCompletedResultCodes: {} }) {
    var ret = await axios_entity.post(`/api/SecsGemConfiguration/saveReturnCodeSetting`, requestData);
    return ret.data;
}
