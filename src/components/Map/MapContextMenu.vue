<template>
  <div class="map-menu border" v-bind:style="menu_style">
    <div class="title border-bottom">{{ options.title }}</div>
    <div class="menu edit">
      <button @click="()=>{point_setting_visible=true}">設定點位</button>
    </div>

    <el-dialog
      :title="options.point_data.Name+`(Tag${options.point_data.TagNumber})`"
      v-model="point_setting_visible"
    ></el-dialog>
  </div>
</template>

<script>
import { MapContextMenuOptions } from './mapjs'
export default {
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
    }
  },
  data() {
    return {
      point_setting_visible: false
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
      background-color: white;
      width: 130px;
    }
    button:hover {
      background-color: limegreen;
      color: white;
    }
  }
}
</style>