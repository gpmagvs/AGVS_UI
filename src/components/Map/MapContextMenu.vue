<template>
  <div class="map-menu border" v-bind:style="menu_style">
    <div
      class="title border-bottom"
      v-bind:class="station_data.Enable ? 'text-primary' : 'text-danger'">{{ options.title + (station_data.Enable ? '' : '(已禁用)') }}</div>
    <div v-if="options.show_task_dispatch" class="menu task">
      <span>站點類型 : {{ station_data.IsVirtualPoint ? '虛擬點' : options.task_options.StationType }}</span>
      <div v-if="station_type == 0 && !station_data.IsVirtualPoint">
        <!-- 一般點位可指派之任務 -->
        <b-button
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'move', station_data: station_data }) }">移動</b-button>
      </div>
      <div v-if="station_type == 1 || station_type == 2 || station_type == 4 || station_type == 5" class="d-flex flex-column">
        <b-button v-if="station_type == 4 || station_type == 5"
          variant="primary"
          @click="ShowRackInfoBtnClick">RACK資訊</b-button>
        <!-- EQ可指派之任務 -->
        <b-button
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'unload', station_data: station_data }) }">取貨</b-button>
        <b-button
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'load', station_data: station_data }) }">放貨</b-button>
        <b-button
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'carry', station_data: station_data }) }">搬運</b-button>
        <b-button v-if="station_type == 5"
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'charge', station_data: station_data }) }">充電</b-button>
      </div>
      <div v-if="station_type == 3">
        <b-button
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'charge', station_data: station_data }) }">充電</b-button>
      </div>
      <!-- buffer and charge -->
      <div v-if="station_data.IsParking && !station_data.IsVirtualPoint">
        <b-button
          variant="primary"
          @click="() => { $emit('OnTaskBtnClick', { action: 'park', station_data: station_data }) }">停車</b-button>
      </div>
    </div>
    <div v-else class="menu edit">
      <b-button variant="primary" @click="() => { $emit('OnPtSettingBtnClick', '') }">設定點位</b-button>
    </div>
    <el-dialog v-bind:style="{ height: RackShowDialogHeight }" :width="RackShowDialogWidth" v-model="showRack" draggable :modal="false">
      <template #header="{}">
        <div class="my-header">{{ RackName }} </div>
      </template>
      <div class="w-100 text-center" style="padding-left: 50px;">
        <RackVue class="mx-3" :rackName="RackName"></RackVue>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { MapContextMenuOptions, MenuUseTaskOption } from './mapjs'
import { EqStore } from '@/store';
import RackVue from '@/components/RacksStatusView/Rack.vue';
export default {
  components: {
    RackVue
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
    },

  },
  data() {
    return {
      showRack: false,
      RackName: "",
      RackShowDialogWidth: '50%',
      RackShowDialogHeight: '400px'
    }
  },
  methods: {
    ShowRackInfoBtnClick() {

      //get wip name 

      var RacksData = EqStore.getters.WIPData;
      const racks = RacksData.filter(element => {
        const columnsTagMap = Object.values(element.ColumnsTagMap);
        return columnsTagMap.some(tagValues => tagValues.includes(this.station_data.TagNumber));
      });

      if (racks) {
        var rack = racks[0]
        console.log(rack)
        this.RackName = rack.WIPName
        this.RackShowDialogWidth = rack.Columns * 200 + 'pt'
        this.RackShowDialogHeight = rack.Rows * 200 + 'pt'
        this.showRack = true;
      }
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