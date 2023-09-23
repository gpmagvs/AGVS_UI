import axios from 'axios'
import param from '@/gpm_param'
var axios_entity = axios.create({
    baseURL: param.backend_host,
})

/**取得BAY資料 */
export async function GetBayTable() {
    var response = await axios_entity.get('/api/InstrumentMeasure/GetBaysTableData');
    return response.data;
}