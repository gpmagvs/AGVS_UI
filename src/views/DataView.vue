<template>
  <div class="data-view custom-tabs-head-large">
    <b-tabs size>
      <b-tab title="機台稼動">
        <AvailbilitysData></AvailbilitysData>
      </b-tab>
      <b-tab title="警報查詢">
        <div class="w-100">
          <AlarmQuery></AlarmQuery>
        </div>
      </b-tab>
      <b-tab title="???">
        <div class="w-100">
          ???
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import AvailbilitysData from '@/components/DataView/AvailbilitysData.vue';
import AlarmQuery from '@/components/DataView/AlarmQuery.vue';
export default {
  components: {
    AvailbilitysData, AlarmQuery
  },
}
</script>

<style lang="scss" >
.data-view {
  position: absolute;
  width: 100%;
  top: 55px;
  .nav-item {
    button {
      font-size: 20px;
      font-weight: bold;
    }
  }
}
</style>