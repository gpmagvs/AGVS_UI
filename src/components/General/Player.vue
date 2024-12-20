<template>
  <div class="p-2 border rounded-2">
    <!-- play control -->
    <div class="d-flex justify-content-center">
      <el-button @click="skipStart">
        <i class="bi bi-skip-start-fill"></i>
      </el-button>
      <el-button v-if="!isPlaying" @click="play">
        <i class="bi bi-play-fill"></i>
      </el-button>
      <el-button v-else @click="stop">
        <i class="bi bi-stop-fill"></i>
      </el-button>
      <el-button @click="pause">
        <i class="bi bi-pause-fill"></i>
      </el-button>
      <el-button @click="skipEnd">
        <i class="bi bi-skip-end-fill"></i>
      </el-button>
    </div>
    <!-- time control -->
    <div v-if="false" class="d-flex justify-content-center">
      <el-slider
        v-model="time"
        :min="0"
        :max="100"
        :step="1"
        :step-strictly="true"
        :precision="0"
        :size="small"
        :controls="false"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      time: 0,
      isPlaying: false,
      isPause: false
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
  },
}
</script>

<style>
</style>