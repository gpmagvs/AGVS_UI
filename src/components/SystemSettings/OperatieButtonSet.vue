<template>
  <div class="save-default-buttons-group border-bottom bg-default text-start">
    <el-button @click="HandleSaveBtnClick" type="primary" size="large">儲存</el-button>
    <el-button @click="HandleRestoreBtnClick" type="danger" size="large">預設值</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    HandleRestoreBtnClick() {
      this.$emit('restore', "");
    },
    HandleSaveBtnClick() {
      this.$emit('save', "");
    }
  },
}
</script>

<style lang="scss" scoped>
.save-default-buttons-group {
  margin-bottom: 5px;
  padding-bottom: 5px;
  width: 100%;

  button {
    width: 100px;
    font-weight: bold;
    font-size: 20px;
  }
}
</style>
