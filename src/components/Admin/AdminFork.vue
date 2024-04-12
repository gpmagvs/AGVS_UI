<template>
  <div @mouseup="(e)=>{isForkClickDown=false}" class="admin w-100 h-100">
    <div @mousemove="MouseMove" class="agv-fork-img">
      <img src="/images/agv_lift.png" width="300" alt />
      <div @mousedown="ForkClick" v-bind:style="ForkStyle" class="fork">
        <span>{{ ForkHeight }} mm</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isForkClickDown: false,
      mouse_down_cursor_position: [0, 0],
      current_cursor_position: [0, 0],
      bottom: 0,
      bottom_offset: 70,
      forkHeight: 0,
      scale: 0.05
    }
  },
  computed: {
    deltaX() {
      return this.current_cursor_position[1] - this.mouse_down_cursor_position[1]
    },
    ForkStyle() {
      return {
        bottom: `${this.bottom + this.bottom_offset}px`
      }
    },
    ForkHeight() {
      return this.bottom / this.scale
    }
  },
  methods: {
    ForkClick(e) {
      this.isForkClickDown = true;
      this.current_cursor_position = [e.x, e.y];
      console.log(e);
    },
    MouseMove(e) {
      if (this.isForkClickDown) {
        var _cursor_position = [e.x, e.y]
        var delta = _cursor_position[1] - this.current_cursor_position[1];
        if (this.bottom >= 0 && this.bottom <= 643) {
          this.bottom -= delta;
        } else {
          if (this.bottom > 500)
            this.bottom = 643;
          else
            this.bottom = 0;
        }
        this.current_cursor_position = _cursor_position;
      }
    }
  },
}
</script>

<style lang="scss">
.agv-fork-img {
  position: absolute;
  bottom: 0;
  margin: auto 93px;
  /* background-color: red; */
  .fork {
    position: absolute;
    height: 30px;
    width: 380px;
    left: 100px;
    background-color: orange;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    cursor: pointer;
    span {
      font-size: 30px;
      position: relative;
      bottom: 50px;
      left: -105px;
      color: grey;
    }
  }
}
</style>