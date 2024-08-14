<template>
  <div class="login-view">
    <el-form class="login-form border p-5 rounded" label-position="top">
      <img class="border-bottom py-2" src="/GPM_Logo.png" alt />
      <p class="login-title-text">USER LOGIN</p>
      <el-form-item label="User Name" :required="true">
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
          placeholder="Please Enter Your User Name"
          required
        ></b-form-input>
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
          placeholder="Please Enter Your Password"
          required
        ></b-form-input>
      </el-form-item>
      <el-form-item v-if="IsLogin">
        <b-button @click="LogoutHandle()" :loading="logouting" class="w-100" variant="danger">Logout</b-button>
      </el-form-item>
      <el-form-item v-if="!IsLogin">
        <b-button
          @click="LoginHandle()"
          :disabled="logining"
          :loading="logining"
          class="w-100"
          variant="primary"
        >Login</b-button>
      </el-form-item>
      <div class="login-message">{{ message }}</div>
      <!-- <el-form-item>
        <b-button @click="dialogVisible = false" class="w-100">Cancel</b-button>
      </el-form-item>-->
    </el-form>
  </div>
  <!-- <KeyBoard @onChange="onChange" :input="keyboard_input"></KeyBoard> -->
</template>
<script>
import { userStore } from '@/store'
export default {
  components: {
  },
  data() {
    return {
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
    },
    async LoginHandle() {

      if (this.UserName == '') {
        this.message = 'Please Enter User Name'
        this.FocusAccountInput();
        return;
      }
      if (this.Password == '') {
        this.message = 'Please Enter Passowrd'
        this.FocusPasswordInput();
        return;
      }
      this.message = ''
      this.logining = true;
      setTimeout(async () => {

        const user = {
          Username: this.UserName,
          Password: this.Password
        };

        var response = await userStore.dispatch('login', user)
        if (response != undefined) {
          if (response.confirm) {

            this.$swal.fire(
              {
                title: '登入成功',
                icon: 'success',
                showCancelButton: false,
                showConfirmButton: false,
                confirmButtonText: 'OK',
                customClass: 'my-sweetalert',
                timer: 1000
              }).then(() => {
                const isloginAfterLogout = this.$route.query.action && this.$route.query.action == 'switch';
                if (!isloginAfterLogout && this.$route.query.pre) {
                  location.href = this.$route.query.pre
                }
                else
                  location.href = '/'

              })


          } else {

            this.message = response.message;
          }
        }
        this.logining = false;
      }, 300);

    },
    LogoutHandle() {
      this.logouting = true;
      setTimeout(() => {
        userStore.dispatch('logout')
        this.UserName = this.Password = '';
        this.$swal.fire({ title: '登出成功!', icon: 'success', timer: 300 })
          .then(() => {
            location.reload();
          })
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
  mounted() {
    if (this.IsLogin) {
      this.UserName = userStore.state.user.UserName;
      this.Password = '*************************';
    }
  }
}
</script>
<style lang="scss" scoped>
.login-header {
  h3 {
    text-align: left;
    color: black;
  }
}

.login-view {
  background: rgba(255, 255, 255, 0.96);
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    box-shadow: 0px 10px 3rem 0.2rem;
  }

  .login-title-text {
    font-size: 30px;
    padding-top: 30px;
    font-weight: bold;
    letter-spacing: 5px;
  }

  .login-message {
    color: red;
    text-align: left;
  }

  .btn,
  input {
    margin-right: 21px;
  }

  button {
    height: 60px;
    font-size: 30px;
  }
}
</style>