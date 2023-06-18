<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="true"
    :close-on-click-modal="false"
    :modal="false"
    draggable
    width="600"
    style="z-index:9100"
  >
    <template #header="{titleId, login_title }">
      <div class="login-header">
        <h3 :id="titleId" :class="login_title">使用者登入</h3>
        <el-divider></el-divider>
      </div>
    </template>
    <div class="login-content">
      <el-form label-position="top">
        <el-form-item label="Account" :required="true">
          <el-input
            :disabled="IsLogin"
            name="account"
            class="input"
            @click="OnInputFocus('account')"
            @change="message=''"
            @clear="keyboard_input=''"
            placeholder="Account"
            v-model="UserName"
            autocomplete="new-password"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="Password" :required="true">
          <el-input
            :disabled="IsLogin"
            name="pw"
            class="input"
            ref="pw_input"
            @click="OnInputFocus('pw')"
            @clear="keyboard_input=''"
            @change="message=''"
            clearable
            show-password
            placeholder="Password"
            v-model="Password"
            type="password"
            autocomplete="new-password"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="login-message">{{ message}}</div>
    </div>
    <KeyBoard @onChange="onChange" :input="keyboard_input"></KeyBoard>

    <b-modal
      title="LOGOUT"
      :centered="true"
      :ok-only="true"
      v-model="ShowLogoutDialog"
      @ok="dialogVisible = false;"
    >
      <p>已登出!</p>
    </b-modal>

    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="!IsLogin" :loading="logining" type="primary" @click="LoginHandle()">Login</el-button>
        <el-button v-else type="danger" :loading="logouting" @click="LogoutHandle()">Logout</el-button>
        <el-button type="info" @click="dialogVisible = false">Cancel</el-button>
      </span>
    </template>
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
        return;
      }
      if (this.Password == '') {
        this.message = '請輸入 Passowrd'
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
          if (this.current_route == '/sys_settings') {
            this.$router.push('/');
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
  .input {
    padding-right: 20px;
  }
  .login-message {
    color: red;
    text-align: left;
  }
}
</style>