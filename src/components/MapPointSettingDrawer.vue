<template>
  <div class="map-point-setting-drawer">
    <el-drawer
      v-model="show"
      size="35%"
      :close-on-press-escape="true"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <template #header>
        <div class="header border-bottom">
          <h3>點位設定-{{ index }}</h3>
        </div>
      </template>
      <div class="draw-content w-100 px-2">
        <div class="text-start py-2">
          <b-button variant="danger" @click="CancelBtnClickHandle">離開</b-button>
          <b-button variant="primary" @click="SaveBtnClickHandle">儲存</b-button>
        </div>
        <div class="settings px-2">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="基本設定" name="1">
              <el-form label-width="120px" label-position="left">
                <el-form-item label="Point Index">
                  <el-input v-model="index" disabled></el-input>
                </el-form-item>
                <el-form-item label="顯示名稱">
                  <el-input v-model="pointData_editing.Name"></el-input>
                </el-form-item>
                <el-form-item label="Tag">
                  <div class="tag">
                    <div>
                      <span>ID</span>
                      <el-input v-model.number="pointData_editing.TagNumber"></el-input>
                    </div>
                    <div>
                      <span>X</span>
                      <el-input v-model="pointData_editing.X"></el-input>
                    </div>
                    <div>
                      <span>Y</span>
                      <el-input v-model="pointData_editing.Y"></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="站點類型">
                  <el-select v-model="pointData_editing.StationType">
                    <el-option
                      v-for="pt_type in pointTypes"
                      :key="pt_type.value"
                      :label="pt_type.label"
                      :value="pt_type.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="角度">
                  <el-input v-model="pointData_editing.Direction"></el-input>
                </el-form-item>
                <el-form-item label="雷射模式">
                  <el-input v-model="pointData_editing.LsrMode"></el-input>
                </el-form-item>
                <el-form-item label="速度">
                  <el-input v-model="pointData_editing.Speed"></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="功能設定" name="2">
              <div class="d-flex flex-column">
                <el-checkbox v-model="pointData_editing.Enable" label="啟用"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsStandbyPoint" label="停駐點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsSegment" label="二次定位點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsParking" label="可停車點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsAvoid" label="避車點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsVirtualPoint" label="虛擬點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsAutoDoor" label="自動門"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsExtinguishing" label="消防設備"></el-checkbox>
              </div>
            </el-collapse-item>
            <el-collapse-item title="Consistency" name="3">
              <el-form>
                <el-form-item label="Point Index">
                  <el-input v-model="index" disabled></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      index: -1,
      pointData: {},
      pointData_editing: {},
      activeNames: ['1'],
      pointTypes: [
        {
          label: 'Normal',
          value: 0
        },
        {
          label: 'EQ',
          value: 1
        },
        {
          label: 'STK',
          value: 2
        },
        {
          label: 'Charge',
          value: 3
        },
        {
          label: 'Buffer',
          value: 4
        },
        {
          label: 'Charge & Buffer',
          value: 5
        },
        {
          label: ' Charge & STK',
          value: 6
        },
        {
          label: 'Escape',
          value: 8
        },
        {
          label: 'EQ_LD',
          value: 11
        },
        {
          label: 'STK_LD',
          value: 12
        },
        {
          label: 'EQ_ULD',
          value: 21
        },
        {
          label: 'STK_ULD',
          value: 22
        },
        {
          label: 'Fire Door',
          value: 31
        },
        {
          label: 'Fire EQ',
          value: 32
        },
        {
          label: 'Auto Door',
          value: 33
        },
        {
          label: 'Elevator',
          value: 100
        },
        {
          label: 'Repair',
          value: 110
        },
      ]
    }
  },
  computed: {
    hasAnyChange() {
      var ori_ = JSON.stringify(this.pointData)
      var current_ = JSON.stringify(this.pointData_editing)
      return ori_ != current_;
    }
  },
  methods: {
    Show(ptObj) {
      this.index = ptObj.index
      this.pointData = ptObj.point
      this.pointData_editing = JSON.parse(JSON.stringify(ptObj.point))
      this.show = true;
    },
    SaveBtnClickHandle() {
      this.pointData = this.pointData_editing;
      this.$emit('OnPointSettingChanged', { index: this.index, pointData: this.pointData })

      this.$swal.fire({
        title: 'SAVE!',
        text: '站點設定已暫存，請記得儲存圖資。',
        icon: 'success',
        showCancelButton: false,
        showConfirmButton: false,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert',
        timer: 1000,
      })
    },
    CancelBtnClickHandle() {
      if (this.hasAnyChange) {

        this.$swal.fire({
          title: '尚未儲存',
          text: '設定值變更但尚未儲存，確定要關閉?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '確定',
          customClass: 'my-sweetalert'
        }).then((result) => {
          if (result.isConfirmed) {
            this.show = false;
          }
        })

      } else
        this.show = false;
    },

  },
}
</script>

<style lang="scss" scoped >
.map-point-setting-drawer {
  z-index: 2;
  .draw-content {
    top: 67px;
    position: absolute;
    height: 100%;
    .settings {
      height: 800px;
      overflow-y: scroll;
    }
    button {
      width: 120px;
      margin-right: 3px;
    }
  }
  .tag {
    display: flex;
    flex-direction: row;
    div {
      display: flex;
      flex-direction: row;
      margin: 3px;
    }
  }
}
</style>