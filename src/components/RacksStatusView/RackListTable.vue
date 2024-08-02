<template>
  <div class="vehicle-list-table">
    <el-table
      :data="GetRackTableData"
      size="large"
      row-key="AGV_Name"
      border
      style="width: 100%"
      :header-cell-style="tableHeaderStyle"
    >
      <el-table-column label="Rack 名稱" prop="Name" width="180"></el-table-column>
      <el-table-column label="Row (層數)" prop="Rows" width="110"></el-table-column>
      <el-table-column label="Column" prop="Columns" width="100"></el-table-column>
      <el-table-column label="通訊方式" prop="Protocol" width="120">MODBUS/TCP</el-table-column>
      <el-table-column label="IP" prop="ConnOptions.IP" width="110"></el-table-column>
      <el-table-column label="PORT" prop="ConnOptions.Port" width="80"></el-table-column>
      <el-table-column label="啟用模擬" prop="IsEmulation" width="90">
        <template #default="scope">
          <el-checkbox :disabled="true" v-model="scope.row.IsEmulation"></el-checkbox>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" min-width="180">
        <template #default="scope">
          <el-button
            type="primary"
            @click="() => {
                            selectedWIPName = scope.row.Name
                            this.$refs['rackEditor'].openDrawer(scope.row);
                        }"
          >編輯</el-button>
          <el-button type="danger" @click.prevent="delete_row(scope.row)">刪除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-drawer :z-index="1" v-model="ShowEditAGVPropertyDrawer" size="70%">
      <template #header="{}">
        <h3 class="text-start">{{ drawerText }}</h3>
      </template>
      <div class>
        <AddRack ref="AgvPropertyEditor" mode="edit"></AddRack>
      </div>
    </el-drawer>
  </div>
  <EditRackVue ref="rackEditor" :wipName="selectedWIPName"></EditRackVue>
</template>
<script>
import { agv_states_store, EqStore } from '@/store';
import AddRack from './AddRack.vue';
import { ProtocolDisplay, MainStatusDisplay, VehicleModelDisplay } from '@/ViewModels/EnumMaps.js'
import { VehicleManagerAPI } from '@/api/VMSAPI'
import EditRackVue from './EditRack.vue';
export default {
  components: {
    AddRack, EditRackVue
  },
  inject: ['tableHeaderStyle'],
  data() {
    return {
      table: [],
      selectAGVProertyToEdit: {},
      ShowEditAGVPropertyDrawer: false,
      selectedWIPName: ''
    }
  },
  computed: {
    GetRackTableData() {
      var WIPOptions = EqStore.getters.WIPOptions;
      return WIPOptions;
    },
    ProtocolText() {
      return ProtocolDisplay
    },
    AGVMainStatus() {
      return MainStatusDisplay
    },
    VehicleModels() {
      return VehicleModelDisplay
    },
    drawerText() {
      return this.selectAGVProertyToEdit.AGV_Name
    }
  },
  methods: {
    edit_row(agv_row) {
      this.selectAGVProertyToEdit = agv_row;
      this.ShowEditAGVPropertyDrawer = true;
      setTimeout(() => {
        this.$refs['AgvPropertyEditor'].UpdatePayload(agv_row);

      }, 1);
    },
    //comment this function
    async delete_row(agv_row) {
      var _DeleteVehicleAction = async () => {
        var result = await VehicleManagerAPI.DeleteVehicle(agv_row.AGV_Name);
        if (result.confirm) {
          this.$swal.fire(
            {
              text: '',
              title: '刪除車輛成功',
              icon: 'success',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
        else {
          this.$swal.fire(
            {
              text: result.message,
              title: '刪除車輛失敗',
              icon: 'error',
              showCancelButton: false,
              confirmButtonText: 'OK',
              customClass: 'my-sweetalert'
            })
        }
      }
      this.$swal.fire(
        {
          text: '',
          title: `確定要刪除車輛-${agv_row.AGV_Name}?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'OK',
          customClass: 'my-sweetalert'
        }).then(ret => {
          if (!ret.isConfirmed)
            return;
          _DeleteVehicleAction()
        })


    }
  },
}
</script>
<style></style>