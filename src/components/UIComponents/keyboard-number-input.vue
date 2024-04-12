<template>
  <div :key="key">
    <el-input v-model="number" :step="step" @change="InputChangedHandle" @click="InputClickHandler"></el-input>
    <el-drawer v-model="show_keyboard" direction="btt" size>
      <SimpleKeyboardVue @onKeyPress="keyboardInputHandler" keyboard_type="number"></SimpleKeyboardVue>
    </el-drawer>
  </div>
</template>

<script>
import SimpleKeyboardVue from '../Tools/SimpleKeyboard.vue';
export default {
  components: {
    SimpleKeyboardVue,
  },
  props: {
    default: {
      type: Number,
      default: 0.0
    },
    step: {
      type: Number,
      default: 0.1
    },
    key: {
      type: Object,
      default: Date.now()
    },
  },
  data() {
    return {
      number: this.value,
      show_keyboard: false,
      input_str: ''
    }
  },
  methods: {
    InputChangedHandle(value) {
      this.number = value;
    },
    InputClickHandler() {
      this.show_keyboard = true
    },
    keyboardInputHandler(val) {
      if (val == '')
        return;
      if (val == 'enter') {
        if (this.input_str[this.input_str.length - 1] == '.') {
          this.input_str = this.input_str.slice(0, -1);
        }
        this.InputChangedHandle(this.GetInputNumber);
        this.show_keyboard = false;
        return;
      }
      if (val == 'back') {
        if (this.input_str != '') {
          this.input_str = this.input_str.slice(0, -1);
        }
        this.InputChangedHandle(this.GetInputNumber);

        return;
      }
      this.input_str += val
      this.InputChangedHandle(this.GetInputNumber);
    },

  },
  computed: {
    GetInputNumber() {

      return parseFloat(this.input_str == '' ? 0 : this.input_str)
    }
  },
  mounted() {
    this.number = this.default;
  }
}
</script>

<style lang="scss" scoped>
</style>