<template>
  <div class="p-2 border rounded-2">
    <!-- play control -->
    <div class="d-flex justify-content-center">
      <el-button :disabled="disabled" @click="skipStart">
        <i class="bi bi-skip-start-fill"></i>
      </el-button>
      <el-button :disabled="disabled" v-if="!isPlaying" @click="play">
        <i class="bi bi-play-fill"></i>
      </el-button>
      <el-button :disabled="disabled" v-else @click="stop">
        <i class="bi bi-stop-fill"></i>
      </el-button>
      <el-button :disabled="disabled" @click="pause">
        <i class="bi bi-pause-fill"></i>
      </el-button>
      <el-button :disabled="disabled" @click="skipEnd">
        <i class="bi bi-skip-end-fill"></i>
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isPlaying: false,
      isPause: false
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    play() {
      this.isPlaying = true;
      this.isPause = false;
      this.$emit('onplay')
    },
    stop() {
      this.isPlaying = false;
      this.isPause = false;
      this.$emit('onstop')
    },
    pause() {
      this.isPlaying = false;
      this.isPause = true;
      this.$emit('onpause')
    },
    skipStart() {
      this.$emit('onskipstart')
    },
    skipEnd() {
      this.$emit('onskipend')
    },
    demo() {
      setInterval(() => {
        this.time += 1
      }, 1000)
    },
  },
  watch: {
    time(newVal) {
      this.$emit('ontimechange', newVal)
    },
    disabled(newVal) {
      this.isDisabled = newVal;
    }
  },
}
</script>

<style>
</style>