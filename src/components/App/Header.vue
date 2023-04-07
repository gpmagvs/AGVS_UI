<template>
  <div class="app-header bg-primary text-light fixed-top d-flex flex-row">
    <h2 @click="LogoClickHandler">GPM AGVS</h2>
    <p class="px-2">V100</p>
    <div class="page-name-display flex-fill">{{current_route_info.route_display_name}}</div>
    <div class="user-account" @click="LoginClickHandler">
      <span>{{ RoleDisplay }}</span>
      <i class="bi bi-person-circle"></i>
    </div>
    <Login ref="login" :IsLogin="IsLogin" @RoleChanged="(role)=>{current_user_role=role}"></Login>
  </div>
</template>
  

<script>
import Login from '@/views/Login.vue';
import bus from '@/event-bus.js'
import { IsLoginLastTime } from '@/api/AuthHelper';
export default {
  components: {
    Login
  },
  data() {
    return {
      current_route_info: {
        route_display_name: 'AGVS',
        route_name: '/'
      },
      current_user_role: 0
    }
  },
  computed: {
    IsLogin() {
      return this.current_user_role != 0;
    },
    RoleDisplay() {
      if (this.current_user_role == 0)
        return 'VISITOR'

      else if (this.current_user_role == 1)
        return 'ENG'

      else if (this.current_user_role == 2)
        return 'DEVELOPER'
      else
        return 'VISITOR'
    }
  },
  mounted() {
    bus.on('/router-change', (new_rotue) => {
      // {route_display_name:display_name,route_name:route_name}
      this.current_route_info = new_rotue
    });

    var login_state = IsLoginLastTime();
    if (login_state.isLogin) {
      this.current_user_role = login_state.login_info.Role;
    }

  },
  methods: {
    LogoClickHandler() {
      this.$router.push('/');
      this.current_route_info = {
        route_display_name: 'AGVS',
        route_name: '/'
      }
    },
    LoginClickHandler() {
      this.$refs['login'].Show(this.current_route_info.route_name);
    }
  },
}
</script>

<style scoped lang="scss">
.app-header {
  z-index: 2;
  h2 {
    margin-left: 40px;
  }
  h2:hover {
    cursor: pointer;
  }

  .page-name-display {
    font-size: 25px;
    font-weight: bold;
  }
  .user-account {
    padding-right: 8px;
    :hover {
      cursor: pointer;
    }
    span {
      font-size: 20px;
      margin-right: 10px;
    }
    i {
      font-size: 28px;
      // background-color: green;
    }
  }
}
</style>