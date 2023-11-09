<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal="true"
    draggable
    width="400"
    style="z-index:9900">
    <template #header="{ titleId, login_title }">
      <div class="login-header">
        <h3 :id="titleId" :class="login_title">使用者登入</h3>
        <el-divider></el-divider>
      </div>
    </template>
    <div class="login-content">
      <el-form label-position="top">
        <el-form-item label="Username" :required="true">
          <b-form-input
            autofocus
            autocomplete="new-password"
            :disabled="IsLogin"
            ref="account"
            @keyup.enter="FocusPasswordInput"
            @keyup.down="FocusPasswordInput"
            @keyup.esc="UserName = ''"
            v-model="UserName"
            :state="UserName != ''"
            placeholder="請輸入帳號"
            required></b-form-input>
        </el-form-item>
        <el-form-item label="Password" :required="true">
          <b-form-input
            autocomplete="new-password"
            type="password"
            :disabled="IsLogin"
            ref="pw_input"
            @keyup.enter="PasswordEnterClickHandler"
            @keyup.up="FocusAccountInput"
            @keyup.esc="Password = ''"
            v-model="Password"
            :state="Password != ''"
            placeholder="請輸入密碼"
            required></b-form-input>
        </el-form-item>
        <el-form-item v-if="IsLogin">
          <b-button
            @click="LogoutHandle()"
            :loading="logouting"
            class="w-100"
            variant="danger">Logout</b-button>
        </el-form-item>
        <el-form-item v-if="!IsLogin">
          <b-button @click="LoginHandle()" :loading="logining" class="w-100" variant="primary">Login</b-button>
        </el-form-item>
        <el-form-item>
          <b-button @click="dialogVisible = false" class="w-100">Cancel</b-button>
        </el-form-item>
      </el-form>
      <div class="login-message">{{ message }}</div>
    </div>
    <!-- <KeyBoard @onChange="onChange" :input="keyboard_input"></KeyBoard> -->
  </el-dialog>
</template>

<script>
import { userStore } from '@/store'
import KeyBoard from '@/components/Tools/SimpleKeyboard.vue'
import bus from '@/event-bus.js';
import { ClearLoginCookie, IsLoginLastTime } from '@/api/AuthHelper.js'
// import { OkModal, OkCancelModal } from '@/components/ModalHelper.js'
export default {
  components: {
    KeyBoard,
  },
  data() {
    return {
      dialogVisible: false,
      UserName: '',
      Password: '',
      focus_input: 'account',
      keyboard_input: '',
      message: '',
      logining: false,
      logouting: false,
      ShowLogoutDialog: false,
      // OkModal: new OkModal()

    }
  },
  computed: {
    IsLogin() {
      return userStore.getters.IsLogin;
    }
  },
  methods: {
    FocusPasswordInput() {
      this.$refs['pw_input'].focus();
    },
    FocusAccountInput() {
      this.$refs['account'].focus();
    },

    PasswordEnterClickHandler() {
      this.LoginHandle();
    },
    Show(current_route = '/') {
      this.current_route = current_route;

      if (!this.IsLogin) {
        this.message = this.UserName = this.Password = '';
      }
      else {
        this.UserName = userStore.getters.UserName;
        this.Password = '********************';
      }
      this.dialogVisible = true;
    },
    async LoginHandle() {

      if (this.UserName == '') {
        this.message = '請輸入 Account'
        this.FocusAccountInput();
        return;
      }
      if (this.Password == '') {
        this.message = '請輸入 Passowrd'
        this.FocusPasswordInput();
        return;
      }

      this.logining = true;
      setTimeout(async () => {

        const user = {
          Username: this.UserName,
          Password: this.Password
        };

        var response = await userStore.dispatch('login', user)
        if (response != undefined) {
          if (response.confirm) {
            this.dialogVisible = false;
            this.$swal.fire({ title: '登入成功!', icon: 'success', timer: 3000 })
          } else {
            this.message = response.message;
          }
        }
        this.logining = false;
      }, 10);

    },
    LogoutHandle() {

      this.logouting = true;

      setTimeout(() => {
        ClearLoginCookie();
        userStore.commit('setUser', null)
        bus.emit('/logout', undefined);
        this.$emit('RoleChanged', 0);
        this.UserName = this.Password = '';
        this.$swal.fire({ title: '登出成功!', icon: 'success', timer: 3000 })
        setTimeout(() => {
          //this.dialogVisible = this.isLogin = false;
          if (this.$route.meta.isAdminUse) {
            this.$router.push('/')
          }
        }, 1000);

        this.logouting = false;
      }, 100);


    },
    OnInputFocus(name) {
      this.focus_input = name;

      if (this.focus_input == 'account') {
        this.keyboard_input = this.UserName + '';
      } else {
        this.keyboard_input = this.Password + '';
      }
    },
    onChange(input) {
      this.message = '';
      console.log(input);
      this.keyboard_input = input;
      if (this.focus_input == "account") {
        this.UserName = input;
      } else {
        this.$refs.pw_input.focus();
        this.Password = input;
        this.$refs.pw_input.focus();
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.login-header {
  h3 {
    text-align: left;
    color: black;
  }
}

.login-content {
  position: relative;
  top: -50px;
  left: 10px;

  .login-message {
    color: red;
    text-align: left;
  }

  .btn,
  input {
    margin-right: 21px;
  }
}
</style>