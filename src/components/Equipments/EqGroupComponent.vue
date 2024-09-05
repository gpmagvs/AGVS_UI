<template>
  <div class="eq-group-component" v-bind:class="isUseForAdd?'addable-layout':''">
    <div v-if="isUseForAdd" class="add-mode" @click="HandleAddRegionClicked">
      <el-tooltip content="新增一個設備群組" placement="top">
        <i class="bi bi-plus-circle"></i>
      </el-tooltip>
    </div>
    <div v-else>Content</div>
  </div>
</template>

<script>
export default {
  props: {
    isUseForAdd: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    HandleAddRegionClicked() {
      this.$emit('onAddClick', '');
    }
  },
}
</script>

<style lang="scss" scoped>
.eq-group-component {
  background-color: rgb(186, 255, 186);
  border: 2px solid black;
  border-radius: 5px;
  margin: 3px;
  padding: 3px;
  width: 400px;
  height: 200px;
  div {
    height: 100%;
    // background-color: aqua;
  }

  .add-mode {
    // background-color: rgb(13, 110, 253);
    color: grey;
    padding-top: 23px;
    i {
      font-size: 90px;
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
    font-size: 100px;
    color: white;
  }
}
</style>