<template>
  <div class="switch-container">
    <input type="checkbox" id="switch" class="switch" v-model="isChecked" @change="toggleSwitch" />
    <label for="switch" class="switch-label" v-bind:style="[custom_style, active_style]">
      <div class="switch-inner"></div>
    </label>
    <span @click="toggleSwitch" class="switch-text" v-show="!isChecked">{{ inactive_text }}</span>
    <span
      @click="toggleSwitch"
      class="switch-text switch-text-on"
      v-bind:style="active_style"
      v-show="isChecked">{{ active_text }}</span>
  </div>
</template>
  
<script>
export default {
  props: {
    default: {
      type: Boolean,
      default: false
    },
    active_text: {
      type: String,
      default: 'ON'
    },
    active_color: {
      type: String,
      default: 'rgb(40, 167, 69)'
    },
    inactive_text: {
      type: String,
      default: 'OFF'
    },
    inactive_color: {
      type: String,
      default: 'rgb(108, 117, 125)'
    },
    width: {
      type: String,
      default: '68px'

    }
  },
  computed: {
    active_style() {
      return {
        backgroundColor: this.isChecked ? this.active_color : this.inactive_color
      }
    },
    custom_style() {
      return {
        width: this.width
      }
    }
  },
  data() {
    return {
      isChecked: this.value
    }
  },
  methods: {
    toggleSwitch() {
      this.isChecked = !this.isChecked;
      this.$emit('switch', this.isChecked);
    }
  },
  mounted() {
    this.isChecked = this.default;
  },
}
</script>
  
<style scoped>
.switch-container {
  display: inline-block;
  position: relative;
}

.switch {
  display: none;
}

.switch-label {
  display: inline-block;
  width: 60px;
  height: 37px;
  background-color: #ccc;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.switch-inner {
  display: block;
  width: 10px;
  height: 32px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
  z-index: 10;
}

.switch-switch {
  display: block;
  width: 24px;
  height: 24px;
  background-color: #333;
  border-radius: 13px;
  position: absolute;
  top: 4px;
  left: 4px;
  transition: left 0.2s;
}

.switch:checked+.switch-label {
  background-color: rgb(40, 167, 69);
}

.switch:checked+.switch-label .switch-inner {
  transform: translateX(46px);
}

.switch:checked+.switch-label .switch-switch {
  left: 30px;
}

.switch-text {
  font-size: 15px;
  color: #ffffff;
  position: absolute;
  top: 43%;
  transform: translateY(-50%);
  left: 10px;
  transition: opacity 0.2s;
  opacity: 1;
  cursor: pointer;
  font-weight: bold;
  width: 45px;
}

.switch:checked+.switch-label .switch-text {
  opacity: 0;
}

.switch-text-on {
  left: 2px;
  opacity: 1;
}

.switch:checked+.switch-label .switch-text-on {
  opacity: 1;
}
</style>