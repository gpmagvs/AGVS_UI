import { createStore } from 'vuex'
import { Login ,StoreToLocalStorage} from '@/api/UserAPI';

export default  createStore({
   
   state:{
    configs:{

    }
   },
   mutations:{
    setConfigs(state,configs){
      state.configs=configs
    }
   },
   actions:{
    SetConfig({commit},configs){
      commit('setConfigs',configs)   
    }
   }
})

/**用戶狀態管理 */
export const userStore= createStore({
  state: {
    user:null
  },
  mutations: {
    setUser(state,user){
      state.user = user
      if(user){
        StoreToLocalStorage(user)
      }
    }
  },
  actions: {
    async login({commit},user){
      var server_reply = await Login(user);
      if(server_reply.Success){
        commit('setUser',server_reply);
      }else{
        commit('setUser',null);
      }
      console.log(server_reply);
      return {confirm:server_reply.Success,message:server_reply.Message}
    },

    logout({commit}){
      commit('setUser',null)
    }
  },
  getters: {
    IsLogin:state=>{
      return state.user!=null;
    },
    level : state=>{
      if(state.user)
        return state.user.Role
      else
        return 0
    },
    UserName:state=>{
      if(state.user)
        return state.user.UserName
      else
        return ""
    },
    IsDeveloperLogining:state=>{
      if(state.user==null)
        return false;
      if(state.user.Role != 2&&state.user.Role != 3)
        return false;
      return true;
    }
  },
  // modules: {
  // }
})

