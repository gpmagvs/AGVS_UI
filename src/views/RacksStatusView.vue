<template>
  <div class="rack-status-view custom-tabs-head p-1">
    <b-tabs>
      <b-tab v-for="Rack in RacksData" :key="Rack.Name" :title="Rack.Name">
        <div class="rack-container d-flex flex-row justify-content-center">
          <RackStatus :rack_info="Rack"></RackStatus>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import RackStatus from '@/components/RacksStatusView/RackStatus.vue'
export default {
  components: {
    RackStatus,
  },
  data() {
    return {
      RacksData: [
        {
          Name: "Rack-1",
          Columns: 3,
          Rows: 3,
          Ports: [
            [{ Name: '7', Index: 7, CstID: "TA4F231111", CstExist: true }, { Name: '8', Index: 8, CstID: "TA4F231111", CstExist: true }, { Name: '9', Index: 9, CstID: "TA4F231111", CstExist: false }],
            [{ Name: '4', Index: 4, CstID: "TA4F231111", CstExist: true }, { Name: '5', Index: 5, CstID: "TA4F231111", CstExist: true }, { Name: '6', Index: 6, CstID: "TA4F231111", CstExist: false }],
            [{ Name: '1', Index: 1, CstID: "TA4F231111", CstExist: true }, { Name: '2', Index: 2, CstID: "TA4F231111", CstExist: true }, { Name: '3', Index: 3, CstID: "TA4F231111", CstExist: false }],
          ]
        },
        {
          Name: "Rack-2",
          Columns: 4,
          Rows: 3,
          Ports: [
            [{ Name: '7', Index: 9, CstID: "TA4F231111", CstExist: true }, { Name: '8', Index: 10, CstID: "TA4F231111", CstExist: false }, { Name: '9', Index: 11, CstExist: false }, { Name: '9', Index: 12, CstID: "TA4F231111", CstExist: false }],
            [{ Name: '4', Index: 5, CstID: "TA4F231111", CstExist: true }, { Name: '5', Index: 6, CstID: "TA4F231111", CstExist: false }, { Name: '6', Index: 7, CstExist: false }, { Name: '6', Index: 8, CstID: "TA4F231111", CstExist: false }],
            [{ Name: '1', Index: 1, CstID: "TA4F231111", CstExist: true }, { Name: '2', Index: 2, CstID: "TA4F231111", CstExist: false }, { Name: '3', Index: 3, CstExist: false }, { Name: '3', Index: 4, CstID: "TA4F231111", CstExist: false }],
          ]
        },
        {
          Name: "Rack-3",
          Columns: 2,
          Rows: 3,
          Ports: [
            [{ Name: '7', Index: 5, CstID: "TA4F231111", CstExist: false }, { Name: '8', CstID: "TA4F231111", Index: 6, CstExist: true }],
            [{ Name: '4', Index: 3, CstID: "TA4F231111", CstExist: false }, { Name: '5', CstID: "TA4F231111", Index: 4, CstExist: true }],
            [{ Name: '1', Index: 1, CstID: "TA4F231111", CstExist: false }, { Name: '2', CstID: "TA4F231111", Index: 2, CstExist: true }],
          ]
        }
      ]
    }
  },
}
</script>

<style lang="scss" >
.rack-status-view {
}
</style>