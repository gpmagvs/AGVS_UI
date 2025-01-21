<template>
  <div v-show="show" class="window-top-notify  fixed-top 
  align-items-center">
    <span class="close-button" @click="HandleCloseBtnClick"> X </span>
    <div class="message-container w-100 h-100" v-bind:class="type">
      <div class="time"> {{ time }}</div>
      <span> {{ message }}</span>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  props: {
  },
  data() {
    return {
      show: false,
      type: 'danger',
      message: '123',
      time: ''
    }
  },
  methods: {
    ShowMessage(message, type) {
      this.message = message;
      this.type = type;
      this.show = true;
      this.time = moment(Date.now()).format('yyyy/MM/DD HH:mm:ss');
    },
    HandleCloseBtnClick() {
      this.show = false;
    }
  },
}
</script>

<style lang="scss" scoped>
.window-top-notify {
  width: 100vw;
  height: 80px;
  align-items: center;
  z-index: 23000;

  .close-button {
    position: absolute;
    right: 20px;
    top: 6px;
    font-weight: bold;
    color: white;
    font-size: 25px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
    cursor: pointer;
  }
  .message-container {
    align-content: center;
    font-size: 30px;
    border: 2px solid grey;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    .time {
      position: absolute;
      text-align: left;
      font-size: 13px;
      left: 20px;
      top: 6px;
    }
    span {
      color: white;
    }
  }
  .warning {
    background-color: rgba(255, 196, 0, 0.938);
  }

  .danger {
    background-color: rgba(233, 16, 16, 0.877);
  }
}
</style>
  