<template>
  <div class="eq-group-component" v-bind:class="isUseForAdd?'addable-layout':''">
    <div v-if="isUseForAdd" class="add-mode" @click="HandleAddRegionClicked">
      <el-tooltip content="新增一個設備群組" placement="top">
        <i class="bi bi-plus-circle"></i>
      </el-tooltip>
    </div>
    <div v-else class="content-info">
      <div class="eq-name py-2 border-bottom d-flex px-2">
        <span class="flex-fill text-start">{{ GroupConfigure.EqGroupName }}</span>
        <i class="bi bi-pencil-square" @click="EditEqNameClick"></i>
      </div>
      <div class="ports bg-info d-flex flex-row">
        <label>
          <i class="bi bi-box-arrow-in-right"></i> 入料 PORT
        </label>
        <el-select multiple v-model="GroupConfigure.LoadPortEqTags">
          <el-option
            v-for="item in EQPortOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="ports bg-warning d-flex flex-row">
        <label>
          <i class="bi bi-box-arrow-right"></i>出料 PORT
        </label>
        <el-select multiple v-model="GroupConfigure.UnloadPortEqTags">
          <el-option
            v-for="item in EQPortOptions"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
    </div>
  </div>
</template>

<script>
import { EQGroupConfiguration } from '@/ViewModels/EndDeviceOption';
import { EqStore } from '@/store';
export default {
  props: {
    isUseForAdd: {
      type: Boolean,
      default: false
    },
    Configuration: {
      type: Object,
      default() {
        var config = new EQGroupConfiguration();
        config.EqGroupName = "EQQQQQ";
        return config
      }
    }
  },
  data() {
    return {
      GroupConfigure: new EQGroupConfiguration("TEST", [46, 48], [2, 4])
    }
  },
  methods: {
    HandleAddRegionClicked() {
      this.$emit('onAddClick', '');
    },
    EditEqNameClick() {
    }
  },
  computed: {
    EQPortOptions() {
      return EqStore.state.EqOptions.map(opt => { return { name: opt.Name + `(Tag:${opt.TagID})`, value: opt.TagID } })
    }
  },
  mounted() {
    this.GroupConfigure = this.Configuration;

  }
}
</script>

<style lang="scss" scoped>
.eq-group-component {
  background-color: rgb(168, 195, 236);
  border: 2px solid black;
  border-radius: 5px;
  margin: 3px;
  padding: 3px;
  width: 400px;
  height: 300px;

  .content-info,
  .add-mode {
    height: 100%;
  }
  .add-mode {
    // background-color: rgb(13, 110, 253);
    color: grey;
    padding-top: 23px;
    i {
      font-size: 150px;
    }
  }
  .content-info {
    .eq-name {
      font-size: 22px;
      font-weight: bold;
    }
    .ports {
      height: 36%;
      margin: 10px 10px;
      padding-block: 16px;
      padding-inline: 6px;
      border: 1px dashed black;
      label {
        width: 170px;
        font-weight: bold;
        // text-decoration: underline;
        font-size: 18px;
        margin-right: 10px;
      }
    }
  }
}
.addable-layout {
  border: 2px dashed gray;
  background-color: white;
  cursor: pointer;
}
.addable-layout:hover {
  background-color: rgb(199, 199, 199);
  i {
    font-size: 160px;
    color: white;
  }
}
</style>