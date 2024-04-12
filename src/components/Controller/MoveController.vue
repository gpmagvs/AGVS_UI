<template>
  <div class="move-controller bg-dark py-3">
    <div class="d-flex flex-row">
      <div class="bg-img">
        <div class="directions rounded">
          <div class="d-flex justify-content-center">
            <div class="up mx-5">
              <img @click="MOVE_UP" src="/images/up-arrow.png" :width="icon_size" alt />
            </div>
          </div>
          <div class="justify-content-center rotate-png-row d-flex">
            <div>
              <img @click="MOVE_LEFT" src="/images/rotate-left.png" :width="icon_size" alt />
            </div>
            <div>
              <!-- <img src="/images/rotate-right.png" :width="icon_size" alt /> -->
              <b-button @click="MOVE_STOP" variant="danger">STOP</b-button>
            </div>
            <div>
              <img @click="MOVE_RIGHT" src="/images/rotate-right.png" :width="icon_size" alt />
            </div>
          </div>
          <div class="down">
            <img @click="MOVE_DOWN" src="/images/down-arrow.png" :width="icon_size" alt />
          </div>
        </div>
      </div>

      <div class="tag-reader-info mx-3 border p-3 rounded">
        <TagReaderRadar></TagReaderRadar>
      </div>
      <div v-if="false" class="options d-flex flex-column justify-content-center p-3">
        <div class="speed-item-container d-flex flex-row">
          <div>Linear Speed</div>
          <el-input-number size="large" v-model="linear_speed" :step="0.1" :max="1" :min="0.01"></el-input-number>
        </div>
        <div class="speed-item-container d-flex flex-row">
          <div>Rotation Speed</div>
          <el-input-number
            size="large"
            v-model="rotation_speed"
            :step="0.01"
            :max="0.3"
            :min="0.01"
          ></el-input-number>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MOVEControl } from '@/api/VMSAPI';
import TagReaderRadar from './TagReaderRadar.vue';
export default {
  components: {
    TagReaderRadar,
  },
  data() {
    return {
      icon_size: 130,
      linear_speed: 0.2,
      rotation_speed: 0.2,
      speed_modifyable: false
    }
  },
  methods: {
    async MOVE_UP() {
      await MOVEControl.AGVMove_UP(this.linear_speed);
    },
    async MOVE_DOWN() {
      await MOVEControl.AGVMove_DOWN(this.linear_speed);
    },
    async MOVE_LEFT() {
      await MOVEControl.AGVMove_LEFT(this.rotation_speed);
    },
    async MOVE_RIGHT() {
      await MOVEControl.AGVMove_RIGHT(this.rotation_speed);
    },
    async MOVE_STOP() {
      await MOVEControl.AGVMove_STOP();
    }
  },
}
</script>

<style lang="scss" scoped>
.move-controller {
  width: 100%;
  height: 100%;

  .bg-img {
    width: 100%;
    height: 100%;
    background: url("../../assets/images/fork_sketch_topview.png");
    background-size: 200px;
    background-repeat: no-repeat;
    background-position: center;
    background-color: rgb(41, 41, 41);
  }
  .directions {
    margin-inline: 17%;
    img:hover {
      background-color: rgb(13, 110, 253);
      cursor: pointer;
    }
    img:active {
      padding: 3px;
    }
    .rotate-png-row {
      height: 180px;
      padding-top: 20px;
      button {
        font-size: 50px;
        margin-top: 15px;
      }
    }
    // padding-top: 100px;
  }
  .options {
    .speed-item-container {
      div {
        width: 122px;
        text-align: left;
      }
    }
  }
}
</style>