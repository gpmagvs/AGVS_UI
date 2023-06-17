<template>
  <div class="equipment-manager border-start border-end px-3">
    <p class="text-start py-2 my-3 px-1">
      <b-button variant="primary" squared @click="SaveSettingHandler">儲存設定</b-button>
      <b-button variant="info" squared class="mx-2" @click="AddNewEqHandler">新增設備</b-button>
      <b-button squared @click="ReloadSettingsHandler">重新載入</b-button>
    </p>
    <el-table
      :header-cell-style="{color:'white',backgroundColor:'rgb(13, 110, 253)',fontSize:'16px'}"
      :data="EqDatas"
      size="small"
      border
      height="680"
      style="width:1600px"
    >
      <el-table-column label="Index" prop="index" width="80" />
      <el-table-column label="設備名稱" prop="Name" width="220">
        <template #default="scope">
          <b-form-input
            :state="ValidName(scope.row)"
            v-model="scope.row.Name"
            placeholder="設備名稱"
            :no-wheel="true"
            size="sm"
            :min="1"
          ></b-form-input>
        </template>
      </el-table-column>
      <el-table-column label="Tag ID" prop="TagID" width="120">
        <template #default="scope">
          <b-form-input
            type="number"
            :state="ValidTag(scope.row)"
            v-model.number="scope.row.TagID"
            placeholder="tag id"
            :no-wheel="true"
            size="sm"
            :min="1"
          ></b-form-input>
        </template>
      </el-table-column>
      <el-table-column label="區域" prop="Region" width="130">
        <template #default="scope">
          <RegionsSelector v-model="scope.row.Region"></RegionsSelector>
        </template>
      </el-table-column>
      <el-table-column label="連線方式" prop="ConnOptions.ConnMethod" width="140">
        <template #default="scope">
          <el-select v-model="scope.row.ConnOptions.ConnMethod" :size="cell_item_size">
            <el-option label="Modbus TCP" :value="0"></el-option>
            <el-option label="Modbus RTU" :value="1"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="連線參數" width="120">
        <el-table-column label="IP" prop="ConnOptions.IP" width="220">
          <template #default="scope">
            <el-input
              :disabled="scope.row.ConnOptions.ConnMethod==1"
              v-model="scope.row.ConnOptions.IP"
              :size="cell_item_size"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="Port" prop="ConnOptions.Port" width="120">
          <template #default="scope">
            <el-input
              :disabled="scope.row.ConnOptions.ConnMethod==1"
              v-model.number="scope.row.ConnOptions.Port"
              :size="cell_item_size"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="ComPort" prop="ConnOptions.ComPort" width="120">
          <template #default="scope">
            <el-input
              :disabled="scope.row.ConnOptions.ConnMethod==0"
              v-model="scope.row.ConnOptions.ComPort"
              :size="cell_item_size"
            ></el-input>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="操作" min-width="120">
        <template #default="scope">
          <div>
            <el-button :size="cell_item_size" type="danger" @click="RemoveHandle(scope.row)">移除</el-button>
            <el-button
              :size="cell_item_size"
              type="default"
              @click="ConnectTestHandle(scope.row)"
            >通訊測試</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { GetEQOptions, SaveEQOptions, ConnectTest } from '@/api/EquipmentAPI.js';
import RegionsSelector from '@/components/RegionsSelector.vue'

export default {
  components: {
    RegionsSelector,
  },
  data() {
    return {
      cell_item_size: '',
      EqDatas: [
        // {
        //   Name: "123",
        //   TagID: 1,
        //   ConnOptions: {
        //     ConnMethod: 0,
        //     IP: "10.0.0.1",
        //     Port: 502,
        //     ComPort: "COM1"
        //   }
        // }
      ],
      ValidTag: (row_) => {
        var tag = row_.TagID;
        var others_row = this.EqDatas.filter(d => d.Name != row_.Name)
        var same_tag_rows = others_row.filter(row => row.TagID == tag)
        return same_tag_rows.length == 0 && tag >= 1;
      },
      ValidName: (row_) => {
        var name = row_.Name;
        var same_name_row = this.EqDatas.filter(d => d.Name == row_.Name)
        return same_name_row.length == 1 && name != '';
      },

    }
  },
  methods: {

    async SaveSettingHandler() {
      var ret = await SaveEQOptions(this.EqDatas);
      if (ret.confirm) {
        this.$swal.fire({
          title: '儲存成功',
          icon: 'success',
          timer: 2000
        })
      }
      else {
        this.$swal.fire({
          title: '參數設定有誤',
          text: ret.message,
          icon: 'error',
        })

      }
    },
    async DownloadEQOptions() {
      this.EqDatas = [];
      var datas = await GetEQOptions()
      for (let index = 0; index < datas.length; index++) {
        const element = datas[index];
        element.index = index;
        this.EqDatas.push(element)
      }
    },
    ReloadSettingsHandler() {
      this.DownloadEQOptions();
    },
    AddNewEqHandler() {
      this.EqDatas.push(
        {
          index: this.EqDatas.length,
          Name: `New_EQ_${this.EqDatas.length}`,
          TagID: 1,
          ConnOptions: {
            ConnMethod: 0,
            IP: "127.0.0.1",
            Port: 502,
            ComPort: "COM1"
          }
        })
    },
    RemoveHandle(row) {
      var remains = this.EqDatas.filter(eq => eq.Name != row.Name)
      this.EqDatas = remains;
    },
    async ConnectTestHandle(row) {
      var ret = await ConnectTest(row.ConnOptions)
      var display_text = ''
      if (row.ConnOptions.ConnMethod == 0) {
        display_text = `Modbus TCP - ${row.ConnOptions.IP}:${row.ConnOptions.Port}`
      } else {
        display_text = `Modbus RTU - ${row.ConnOptions.ComPort}`
      }

      if (ret.Connected) {
        this.$swal.fire({
          title: 'OK',
          text: display_text,
          icon: 'success'

        })
      } else {
        this.$swal.fire({
          title: 'Fail',
          text: display_text,
          icon: 'error'

        })
      }
    },
    beforeRouteLeave(to, from, next) {
      alert('leave!')
    }
  },
  mounted() {
  
    this.DownloadEQOptions();
  },
}
</script>

<style lang="scss" scoped>
.equipment-manager {
}
</style>