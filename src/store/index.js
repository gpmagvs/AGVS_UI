import { createStore } from 'vuex'
import { Login, StoreToLocalStorage } from '@/api/UserAPI';
import MapAPI from '@/api/MapAPI'
import { clsMapStation } from '@/components/Map/mapjs';

export default createStore({

  state: {
    configs: {

    }
  },
  mutations: {
    setConfigs(state, configs) {
      state.configs = configs
    }
  },
  actions: {
    SetConfig({ commit }, configs) {
      commit('setConfigs', configs)
    }
  }
})


/**系統參數設定狀態管理 */
export const agvs_settings_store = createStore({
  state: {
    sys_settings: {
      operations: {
        system_run_mode: false,
        host_online_mode: false,
        host_remote_mode: false
      }
    }
  },
  mutations: {
    setOperations(state, operations) {
      state.sys_settings.operations = operations
    },
    setRunMode(state, actived) {
      state.sys_settings.operations.system_run_mode = actived
    },
    setHostOnline(state, actived) {
      state.sys_settings.operations.host_online_mode = actived
    },
    setHostRemote(state, actived) {
      state.sys_settings.operations.host_remote_mode = actived
    }
  },
  actions: {

  },
  getters: {
    IsRunMode: state => {
      return state.sys_settings.operations.system_run_mode;
    },

  },
  // modules: {
  // }
})

export const MapStore = createStore({
  state: {
    MapData: null,
    MapGeoJson: null
  },
  getters: {
    MapData: state => {
      return state.MapData;
    },
    MapName: state => {
      return state.MapData == null ? "Unkown" : state.MapData.Name
    },
    GeoMapData: state => {
      return state.MapGeoJson
    },
    MapStations: state => {

      var mapDataSource = state.MapData
      if (!mapDataSource)
        return undefined

      var points = mapDataSource.Points
      var indexes = Object.keys(points)
      var map_stations = []
      indexes.forEach(index => {

        var pt = points[index]
        var mapStationData = new clsMapStation()
        mapStationData.index = parseInt(index);
        mapStationData.name = pt.Name;
        mapStationData.station_type = pt.StationType;
        mapStationData.tag = pt.TagNumber;
        mapStationData.coordination = [pt.X, pt.Y];
        mapStationData.targets = [];
        mapStationData.graph = [pt.Graph.X / 100, pt.Graph.Y / 100];
        Object.keys(pt.Target).forEach(targetIndex => {
          mapStationData.targets.push(parseInt(targetIndex))
        })
        map_stations.push(mapStationData)
      })
      return map_stations
    }
  },
  mutations: {
    setMapData(state, mapdata) {
      state.MapData = mapdata;
      localStorage.setItem('mapData', JSON.stringify(mapdata))
    },
    setGeoMapData(state, mapdata) {
      state.MapGeoJson = mapdata;
    }
  },
  actions: {
    DownloadMapData({ commit }) {
      // var localTempData = localStorage.getItem('mapData');
      // if (localTempData) {
      //   commit('setMapData', JSON.parse(localTempData))
      // }
      console.log('[MapStore] try get map data');
      MapAPI.GetMapFromLocal().then(mapdata => {
        console.log('[MapStore] get map data', mapdata);
        commit('setMapData', mapdata)
      });

    },
    async DownloadGeoMapData({ commit }) {
      var data = await MapAPI.GetGeoMap();
      commit('setGeoMapData', data)

      return data
    }
  }
}
)

/**用戶狀態管理 */
export const userStore = createStore({
  state: {
    user: null
  },
  mutations: {
    setUser(state, user) {
      state.user = user
      if (user) {
        StoreToLocalStorage(user)
      } else {
        localStorage.removeItem('user')
      }
    }
  },
  actions: {
    async login({ commit }, user) {
      var server_reply = await Login(user);
      if (server_reply.Success) {
        commit('setUser', server_reply);
      } else {
        commit('setUser', null);
      }
      console.log(server_reply);
      return { confirm: server_reply.Success, message: server_reply.Message }
    },

    logout({ commit }) {
      commit('setUser', null)
    }
  },
  getters: {
    IsLogin: state => {
      return state.user != null;
    },
    level: state => {
      if (state.user)
        return state.user.Role
      else
        return 0
    },
    UserName: state => {
      if (state.user)
        return state.user.UserName
      else
        return ""
    },
    IsDeveloperLogining: state => {
      if (state.user == null)
        return false;
      if (state.user.Role != 2 && state.user.Role != 3)
        return false;
      return true;
    }
  },
  // modules: {
  // }
})




