<template>
  <div class="map-menu border" v-bind:style="menu_style">
    <div class="title border-bottom">{{ options.title }}</div>

    <div v-if="options.show_task_dispatch" class="menu task">
      <span>站點類型{{ options.task_options.StationType }}</span>
      <div v-if="station_type==0">
        <!-- 一般點位可指派之任務 -->
        <b-button
          variant="primary"
          @click="()=>{$emit('OnTaskBtnClick',{action:'move',station_data:station_data})}"
        >移動</b-button>
      </div>
      <div v-if="station_type==1|station_type==2" class="d-flex flex-column">
        <!-- EQ可指派之任務 -->
        <b-button
          variant="primary"
          @click="()=>{$emit('OnTaskBtnClick',{action:'unload',station_data:station_data})}"
        >取貨</b-button>
        <b-button
          variant="primary"
          @click="()=>{$emit('OnTaskBtnClick',{action:'load',station_data:station_data})}"
        >放貨</b-button>
        <b-button
          variant="primary"
          @click="()=>{$emit('OnTaskBtnClick',{action:'carry',station_data:station_data})}"
        >搬運</b-button>
      </div>
      <div v-if="station_type==3">
        <b-button
          variant="primary"
          @click="()=>{$emit('OnTaskBtnClick',{action:'charge',station_data:station_data})}"
        >充電</b-button>
      </div>
      <div v-if="station_data.IsParking">
        <b-button
          variant="primary"
          @click="()=>{$emit('OnTaskBtnClick',{action:'park',station_data:station_data})}"
        >停車</b-button>
      </div>
    </div>
    <div v-else class="menu edit">
      <b-button variant="primary" @click="()=>{$emit('OnPtSettingBtnClick','')}">設定點位</b-button>
    </div>
  </div>
</template>

<script>
import { MapContextMenuOptions, MenuUseTaskOption } from './mapjs'
export default {
  components: {
  },
  props: {
    mouse_click_position: {
      type: Array,
      default() {
        return [0, 0]
      }
    },
    options: {
      type: MapContextMenuOptions,
      default() {
        return new MapContextMenuOptions()
      }
    }
  },
  computed: {
    menu_style() {
      return {
        top: this.mouse_click_position[0] + 'px',
        left: this.mouse_click_position[1] + 'px',
        backgroundColor: this.options.backgroundColor
      }
    },
    station_type() {
      return this.options.task_options.StationType;
    },
    station_data() {
      return this.options.point_data;
    }
  },
  data() {
    return {
    }
  },
}
</script>

<style lang="scss" scoped>
.map-menu {
  position: fixed;
  z-index: 4000;
  padding: 5px;
  border-radius: 8px;
  text-align: left;

  .title {
    font-size: larger;
    font-weight: bolder;
  }

  .menu {
    display: flex;
    flex-direction: column;

    button {
      padding: 6px;
      border: 1px solid rgb(168, 168, 168);
      border-radius: 5px;
      margin: 2px auto;
      width: 130px;
    }
    button:hover {
      background-color: limegreen;
      color: white;
    }
  }
  .task {
    span {
      font-size: 10px;
      color: grey;
    }
  }
}
</style>