<template>
  <el-dialog v-model="dialogVisible" :show-close="false" width="600">
    <template #header="{titleId, login_title }">
      <div class="login-header border-bottom my-2">
        <h3 :id="titleId" :class="login_title">Login</h3>
      </div>
    </template>
    <div class="login-content py-2" style="z-index:99999">
      <el-form label-position="top">
        <el-form-item label="Account" :required="true">
          <el-input
            name="account"
            class="input"
            @click="OnInputFocus('account')"
            @change="message=''"
            @clear="keyboard_input=''"
            placeholder="Account"
            v-model="UserName"
            autocomplete="new-password"
            clearable
            :disabled="IsLogin"
          ></el-input>
        </el-form-item>
        <el-form-item label="Password" :required="true">
          <el-input
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
            :disabled="IsLogin"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="login-message">{{ message}}</div>
      <div class="button-group py-1 my-1">
        <el-button
          :loading="logining"
          :type="IsLogin?'danger':'primary'"
          @click="LoginHandle()"
        >{{ IsLogin?'Logout':'Login' }}</el-button>
        <el-button type="info" @click="dialogVisible = false">Cancel</el-button>
      </div>
      <div class="keyboard">
        <KeyBoard @onChange="onChange" @onKeyPress="HandleKeyboardPress" :input="keyboard_input"></KeyBoard>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import KeyBoard from '@/components/Tools/SimpleKeyboard.vue'
import { UserStore } from '@/store';
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
      logining: false

    }
  },
  computed: {
    IsLogin() {
      return UserStore.getters.CurrentUserRole != 0;
    }
  },
  methods: {
    Show() {
      if (!this.IsLogin) {
        this.message = this.UserName = this.Password = '';
      } else {
        this.message = '';
        this.Password = '********'
        this.UserName = UserStore.getters.CurrentUserName;
      }
      this.dialogVisible = true;

    },
    async LoginHandle() {

      if (this.IsLogin) {
        UserStore.dispatch('Logout')
        return;
      }

      if (this.UserName == '') {
        this.message = '請輸入 Account'
        return;
      }
      if (this.Password == '') {
        this.message = '請輸入 Passowrd'
        return;
      }

      this.logining = true;
      var response_data = await UserStore.dispatch('Login', {
        UserName: this.UserName,
        Password: this.Password
      })
      if (response_data.Success) {
        this.dialogVisible = false;
      }
      else {
        this.message = response_data.Message;
      }
      this.logining = false;
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
    },
    HandleKeyboardPress(button) {
      if (button == '{enter}') {
        if (this.focus_input == 'account') {
          this.keyboard_input = ''
          this.focus_input = 'pw'
        } else {
          this.LoginHandle()
        }
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.login-header {
  h3 {
    text-align: left;
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
.keyboard {
  position: fixed;
  width: 100%;
  bottom: 0;
  left: 0;
}
.button-group {
  position: absolute;
  button {
    font-size: 40px;
    padding: 8px;
    height: 70px;
    width: 260px;
  }
}
.el-input {
  height: 50px;
  input {
    font-size: 40px;
  }
}
</style>