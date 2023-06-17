<template>
  <div class="rack-status rounded m-3 p-1">
    <h3>{{ rack_info.Name }}</h3>
    <div class="my-1 d-flex flex-row">
      <div class="p-1">
        <b>水位</b>
      </div>
      <div class="flex-fill p-2">
        <el-progress stroke-width="18" :percentage="Level" text-inside>
          <span>{{this.HasCstPortNum }}/{{this.TotalPorts }}</span>
        </el-progress>
      </div>
    </div>
    <div class="d-flex flex-row" v-for="row in rack_info.Rows" :key="'row-'+row">
      <div class="d-flex flex-column" v-for="col in rack_info.Columns" :key="'col-'+col">
        <RackPort :rack_name="rack_info.Name" :port_info="rack_info.Ports[row-1][col-1]"></RackPort>
      </div>
    </div>
  </div>
</template>

<script>
import RackPort from './RackPort.vue';
export default {
  components: {
    RackPort,
  },
  props: {
    rack_info: {
      type: Object,
      default() {
        return {
          Name: "Rack-1",
          Rows: 3,
          Columns: 3,
          Ports: [
            [{ Name: '7', CstExist: true }, { Name: '8', CstExist: true }, { Name: '9', CstExist: true }],
            [{ Name: '4', CstExist: true }, { Name: '5', CstExist: true }, { Name: '6', CstExist: true }],
            [{ Name: '1', CstExist: true }, { Name: '2', CstExist: true }, { Name: '3', CstExist: true }],
          ]
        }
      }
    },
  },
  computed: {
    TotalPorts() {
      return this.rack_info.Rows * this.rack_info.Columns;
    },
    HasCstPortNum() {
      //統計有貨物的Port數量
      let count = 0;
      for (let i = 0; i < this.rack_info.Ports.length; i++) {
        for (let j = 0; j < this.rack_info.Ports[i].length; j++) {
          if (this.rack_info.Ports[i][j].CstExist === true) {
            count++;
          }
        }
      }
      return count;
    },
    Level() {

      return this.HasCstPortNum / this.TotalPorts * 100;
    }
  },
}
</script>

<style lang="scss" scoped>
.rack-status {
  border: 2px solid black;
  box-shadow: 4px -1px 12px 1px grey;
}
</style>