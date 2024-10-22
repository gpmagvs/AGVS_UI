import axios from 'axios'
import param from '@/gpm_param'
import { MapStore } from '@/components/Map/store'
import { MapPointModel } from '@/components/Map/mapjs'
import { Feature } from 'ol'
var axios_entity = axios.create({
    baseURL: MapStore.getters.MapServerUrl,
})

/**
 * 地圖點擊LOG儲存數據模型
 * FeatureType: 0:point, 1:path,2:agv,999:others
 */
class MapOperateLogViewModel {
    constructor(FeatureType = 999, TagNumber = 0, Display = '') {
        this.FeatureType = FeatureType;
        this.TagNumber = TagNumber;
        this.Display = Display;
    }
}

class ElementClickLogViewModel {
    constructor(name = '', source = '') {
        this.Name = name;
        this.Source = source
    }
}

/**LOG紀錄用戶點擊地圖站點 */
export async function LogMapFeatureClicked(feature = new Feature()) {
    const stationData = feature.get('data');
    const featureType = feature.get('feature_type');
    let dataModel = new MapOperateLogViewModel()
    if (stationData) {
        let pt = new MapPointModel();
        _.merge(pt, stationData);
        dataModel = new MapOperateLogViewModel(0, pt.TagNumber, pt.Graph.Display);
        console.trace(`user clicked point- Tag:${pt.TagNumber}, Display:${pt.Graph.Display}`)

    } else {
        if (featureType == 'agv') {
            dataModel.FeatureType = 2;
            dataModel.Display = feature.get('agvname');
        }
        if (featureType == 'path') {
            dataModel.FeatureType = 1;
            dataModel.Display = feature.get('path_id')
        }
        // console.trace('user clicked none point feature', feature)
    }

    try {
        console.log('post ', dataModel);
        await axios_entity.post('/api/WebUIOperate/MapOperate', dataModel);
    } catch (error) {
        console.error(error);
    }
}


export async function ElementClickLog(name = 'unknown', source = 'unknown') {
    let datModel = new ElementClickLogViewModel(name, source);
    try {
        console.log('post ', datModel);
        await axios_entity.post('/api/WebUIOperate/ElementClicked', datModel);
    } catch (error) {
        console.error(error);
    }
}