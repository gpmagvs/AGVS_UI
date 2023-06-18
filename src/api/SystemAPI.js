import axios from 'axios'
import param from '@/gpm_param'
var _axios = axios.create({
  baseURL: param.backend_host,
})

/**運轉模式切換。
 * 0:Maintain
 * 1:Run
 */
export async function RunMode(mode =0|1){
   var ret= await _axios.post(`api/system/runmode?mode=${mode}`);
   return ret.data;
}

/**Host Online/Offline模式切換。
 * 0:Offline
 * 1:Online
 */
export async function HostConnMode(mode =0|1){
    var ret= await _axios.post(`api/system/hostconn?mode=${mode}`);
    return ret.data;
 }
 
/**HOST Local/Remote模式切換。
 * 0:Local
 * 1:Remote
 */
export async function HostOperationMode(mode =0|1){
    var ret= await _axios.post(`api/system/hostoperation?mode=${mode}`);
    return ret.data;
 }

