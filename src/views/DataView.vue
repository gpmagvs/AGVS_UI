<template>
  <div class="data-view">
    <b-tabs size>
      <b-tab title="機台稼動">
        <AvailbilitysData></AvailbilitysData>
      </b-tab>
      <b-tab title="警報查詢">This is the content of Tab 2</b-tab>
      <b-tab title="???"></b-tab>
    </b-tabs>
  </div>
</template>

<script>
import AvailbilitysData from '@/components/DataView/AvailbilitysData.vue';
export default {
  components: {
    AvailbilitysData,
  },
}
</script>

<style lang="scss" >
.data-view {
  .nav-item {
    button {
      font-size: 20px;
      font-weight: bold;
    }
  }
}
</style>