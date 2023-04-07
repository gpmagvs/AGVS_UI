<template>
  <div class="border-bottom py-2 bg-default text-start">
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

<style>
</style>