<template>
  <div :class="keyboardClass"></div>
</template>
  
<script>
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

export default {
  name: "SimpleKeyboard",
  props: {
    keyboardClass: {
      default: "simple-keyboard",
      type: String
    },
    input: {
      type: String
    },
    keyboard_type: {
      type: String,
      default() {
        return ""
      }
    }
  },
  data: () => ({
    keyboard: null,
    lastinput: undefined
  }),
  mounted() {

    if (this.keyboard_type == 'number') {

      this.keyboard = new Keyboard(this.keyboardClass, {
        onChange: this.onChange,
        onKeyPress: this.onKeyPress,
        layout: {
          default: ["  back", "1 2 3", "4 5 6", "7 8 9", ". 0 enter"],
        },
        theme: "hg-theme-default hg-layout-numeric numeric-theme"

      });
    } else {

      this.keyboard = new Keyboard(this.keyboardClass, {
        onChange: this.onChange,
        onKeyPress: this.onKeyPress,

      });
    }
  },
  methods: {
    onChange(input) {
      this.$emit("onChange", input);
    },
    onKeyPress(button) {
      this.$emit("onKeyPress", button);
      if (button === "{shift}" || button === "{lock}")
        this.handleShift();
      this.lastinput = button
    },
    handleShift() {
      let currentLayout = this.keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";

      this.keyboard.setOptions({
        layoutName: shiftToggle
      });
    }
  },
  watch: {
    input(input) {
      this.keyboard.setInput(input);
    }
  }
};
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
.simple-keyboard {
  font-size: 30px;
}
</style>
  