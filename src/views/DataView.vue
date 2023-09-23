<template>
  <div class="data-view custom-tabs-head-large">
    <b-tabs size>
      <b-tab title="歷史任務查詢">
        <div class="w-100">
          <TaskQuery></TaskQuery>
        </div>
      </b-tab>
      <b-tab title="歷史警報查詢">
        <div class="w-100">
          <AlarmQuery></AlarmQuery>
        </div>
      </b-tab>
      <b-tab title="AGV軌跡查詢">
        <div class="w-100">
          <AGVLocusDisplay></AGVLocusDisplay>
        </div>
      </b-tab>
      <b-tab title="儀器量測結果查詢">
        <div class="w-100">
          <InstrumentMeasureQuery></InstrumentMeasureQuery>
        </div>
      </b-tab>
      <b-tab v-if="false" title="機台稼動">
        <AvailbilitysData></AvailbilitysData>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import AvailbilitysData from '@/components/DataView/AvailbilitysData.vue';
import AlarmQuery from '@/components/DataView/AlarmQuery.vue';
import TaskQuery from '@/components/DataView/TaskQuery.vue';
import AGVLocusDisplay from '@/components/DataView/AGVLocus.vue';
import InstrumentMeasureQuery from '@/components/DataView/InstrumentMeasureQuery.vue';
export default {
  components: {
    AvailbilitysData, AlarmQuery, AGVLocusDisplay, TaskQuery, InstrumentMeasureQuery
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