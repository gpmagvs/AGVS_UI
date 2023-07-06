<template>
  <div class="data-view">
    <b-tabs size>
      <b-tab title="機台稼動">
        <AvailbilitysData></AvailbilitysData>
      </b-tab>
      <b-tab title="警報查詢">
        <AlarmQuery></AlarmQuery>
      </b-tab>
      <b-tab title="???"></b-tab>
    </b-tabs>
  </div>
</template>

<script>
import AvailbilitysData from '@/components/DataView/AvailbilitysData.vue';
import AlarmQuery from '@/components/DataView/AlarmQuery.vue';
export default {
  components: {
    AvailbilitysData,AlarmQuery
  },
}
</script>

<style lang="scss" >
.data-view {
  position: absolute;
  width:100%;
  top: 55px;
  .nav-item {
    button {
      font-size: 20px;
      font-weight: bold;
    }
  }
}
</style>