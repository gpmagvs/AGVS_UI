<template>
  <div class="px-1 d-flex flex-row border justify-content-center">
    <div class="mt-2">
      <jw-pagination
        @page_changed="(ev) => { pagecurrent = ev - 1 }"
        :pageSize="16"
        :totalCount="table_data.length"></jw-pagination>
    </div>
    <div class="border mt-1 flex-fill">
      <el-table
        size="small"
        :data="page_table_data"
        :row-class-name="tb_row_class"
        header
        border
        height="570"
        row-key="Address"
        :highlight-current-row="false"
        @row-dblclick="cellDoubleClickHandle"
        @cell-mouse-enter="cellMouseEnterHandler"
        @cell-mouse-leave="cellMouseLeaveHandler"
        style="width:99%">
        <el-table-column label="Address" prop="Address" width="70"></el-table-column>
        <el-table-column label="Name" prop="Name"></el-table-column>
        <el-table-column label="Value" prop="State" width="60" :formatter="StateFormatter"></el-table-column>
        <!-- <el-table-column width="40" v-if="!readonly && enabled" label>
          <template #default="scope">
            <el-checkbox
              :ref="scope.name"
              v-model="scope.State"
              @click="DO_State_ClickHandler(scope.$index, scope.row)"
            ></el-checkbox>
          </template>
        </el-table-column>-->
        <el-table-column v-if="isOutput" width="80">
          <template #default="scope">
            <el-button :disabled="!IsUserLogin" @click="ToggleDO(scope.row)" size="small">Toggle</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <b-modal
      v-model="DIOChangeComfirmDialogShow"
      :centered="true"
      title="DIO Change Confirm"
      @ok="WriteDIOHandle">
      <p>
        <b>[{{ toChangeAddress }}]</b> will changed from <b>{{ toChangeState ? 0 : 1 }}</b> to <b>{{ toChangeState ? 1 : 0 }}</b>.
      </p>
      <p>Are you sure?</p>
    </b-modal>
  </div>
</template>

<script>
import { clsRegister } from '@/ViewModels/clsDIOTable';
import { DIO } from '@/api/VMSAPI.js'
import { UserStore } from '@/store'
import jwPagination from '../UIComponents/jw-pagination.vue';
import { valueEquals } from 'element-plus';
export default {
  components: {
    jwPagination,
  },
  props: {
    enabled: {
      type: Boolean,
      default: false
    },
    digital_type: {
      type: String,
      default: 'input'
    },
    readonly: {
      type: Boolean,
      default: true
    },
    table_data: {
      type: Array,
      default() {
        return [
          new clsRegister("X0000", "1"),
          new clsRegister("X0001", ""),
          new clsRegister("X0002", ""),
          new clsRegister("X0003", ""),
          new clsRegister("X0004", ""),
          new clsRegister("X0005", ""),
          new clsRegister("X0006", ""),
          new clsRegister("X0007", ""),
          new clsRegister("X0008", ""),
          new clsRegister("X0009", ""),
          new clsRegister("X000A", ""),
          new clsRegister("X000B", ""),
          new clsRegister("X000C", ""),
          new clsRegister("X000D", ""),
          new clsRegister("X000E", ""),
          new clsRegister("X000F", ""),

        ]
      }
    },
    isOutput: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      Registers: [
      ],
      pagecurrent: 0,
      DIOChangeComfirmDialogShow: false,
      toChangeAddress: '',
      toChangeState: false,
      hover_row: {}
    }
  },
  computed: {

    page_table_data() {
      return this.table_data.slice(this.pagecurrent * 16, 16 * (this.pagecurrent + 1))
    },
    IsUserLogin() {
      return UserStore.getters.CurrentUserRole != 0;
    },
    IsGodUse() {
      return UserStore.getters.IsGodUser;
    }

  },
  methods: {
    tb_row_class(row, rowIndex) {
      if (row.rowIndex < 0) {
        return '';
      }
      if (this.hover_row) {
        if (this.hover_row.Address == row.row.Address) {
          return 'bg-dark'
        }
      }
      var value = this.page_table_data[row.rowIndex].State;
      try {
        if (value)
          return 'on-row';
        return 'off-row';

      } catch (error) {
        return 'off-row';
      }
    },
    StateFormatter(row, column, cellValue, index) {
      return cellValue == true ? 1 : 0;
    },
    PageChangeHandler(number) {
      this.pagecurrent = number - 1;
    },
    cellMouseEnterHandler(row, column, cell, event) {
      this.hover_row = row
    },
    cellMouseLeaveHandler(row, column, cell, event) {
      this.hover_row = undefined
    },
    async cellDoubleClickHandle(row, column, event) {
      if (!this.IsUserLogin)
        return;

      if (!this.isOutput) {
        await DIO.DI_State_Change(row.Address, !row.State)
      } else {

        this.toChangeAddress = row.Address;
        this.toChangeState = !row.State;
        if (this.IsGodUse) {
          this.WriteDIOHandle();
          return;
        }
        this.DIOChangeComfirmDialogShow = true;

      }
    },
    async ToggleDO(row) {
      if (this.IsGodUse) {
        await DIO.DO_State_Change(row.Address, !row.State)
        return;
      }

      this.toChangeAddress = row.Address;
      this.toChangeState = !row.State;
      this.DIOChangeComfirmDialogShow = true;

    },
    async WriteDIOHandle() {
      await DIO.DO_State_Change(this.toChangeAddress, this.toChangeState)
    }

  }
}
</script>

<style  lang="scss">
.el-table .on-row {
  background-color: rgb(13, 110, 253);
  color: white;
  font-weight: bold;
  /* --el-table-tr-bg-color: var(--el-color-success-light-9); */
}

.el-table .off-row {
  background-color: black;
  color: white;
}
</style>