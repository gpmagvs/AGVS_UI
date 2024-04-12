<template>
  <div class="dashboard">
    <div class="dashboard-circle">
      <div class="dashboard-light"></div>
      <div class="dashboard-turn-indicator"></div>
    </div>
  </div>
</template>
  
  <script>
export default {
  name: 'Dashboard',
  props: {
    isHeadlightOn: {
      type: Boolean,
      default: false
    },
    isBrakeLightOn: {
      type: Boolean,
      default: false
    },
    isLeftTurnSignalOn: {
      type: Boolean,
      default: false
    },
    isRightTurnSignalOn: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 计算属性，根据方向灯状态来确定指示器的样式
    turnIndicatorStyle() {
      if (this.isLeftTurnSignalOn && !this.isRightTurnSignalOn) {
        return 'left'
      } else if (!this.isLeftTurnSignalOn && this.isRightTurnSignalOn) {
        return 'right'
      } else {
        return ''
      }
    }
  }
}
  </script>
  
  <style>
.dashboard {
  width: 200px;
  height: 200px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
}

.dashboard-circle {
  width: 150px;
  height: 150px;
  background-color: #ccc;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.dashboard-light {
  width: 20px;
  height: 20px;
  background-color: red;
  border-radius: 50%;
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  display: "block";
}

.dashboard-turn-indicator {
  width: 60px;
  height: 20px;
  background-color: #000;
  position: absolute;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 10px;
  border: 5px solid #fff;
  display: "block";
}

.dashboard-turn-indicator.left {
  animation: left-turn 1s infinite;
}

.dashboard-turn-indicator.right {
  animation: right-turn 1s infinite;
}

@keyframes left-turn {
  0% {
    transform: translateX(-50%) rotate(0);
  }
  50% {
    transform: translateX(-50%) rotate(-30deg);
  }
  100% {
    transform: translateX(-50%) rotate(0);
  }
}

@keyframes right-turn {
  0% {
    transform: translateX(-50%) rotate(0);
  }
  50% {
    transform: translateX(-50%) rotate(30deg);
  }
  100% {
    transform: translateX(-50%) rotate(0);
  }
}
</style>