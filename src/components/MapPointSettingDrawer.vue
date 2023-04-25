<template>
  <div class="map-point-setting-drawer">
    <el-drawer v-model="show" size="40%">
      <template #header>
        <h3>點位設定-{{ index }}</h3>
      </template>
      <div>
        <el-collapse v-model="activeNames" @change="handleChange">
          <el-collapse-item title="基本設定" name="1">
            <el-form label-width="120px" label-position="left">
              <el-form-item label="Point Index">
                <el-input v-model="index" disabled></el-input>
              </el-form-item>
              <el-form-item label="Tag">
                <div class="tag">
                  <div>
                    <span>ID</span>
                    <el-input v-model="pointData.TagNumber"></el-input>
                  </div>
                  <div>
                    <span>X</span>
                    <el-input v-model="pointData.X"></el-input>
                  </div>
                  <div>
                    <span>Y</span>
                    <el-input v-model="pointData.Y"></el-input>
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="站點類型">
                <el-select v-model="pointData.StationType">
                  <el-option
                    v-for="pt_type in pointTypes"
                    :key="pt_type.value"
                    :label="pt_type.label"
                    :value="pt_type.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="角度">
                <el-input v-model="pointData.Direction"></el-input>
              </el-form-item>
              <el-form-item label="雷射模式">
                <el-input v-model="pointData.LsrMode"></el-input>
              </el-form-item>
              <el-form-item label="速度">
                <el-input v-model="pointData.Speed"></el-input>
              </el-form-item>
            </el-form>
          </el-collapse-item>
          <el-collapse-item title="功能設定" name="2">
            <el-form>
              <el-form-item label="Point Index">
                <el-input v-model="index" disabled></el-input>
              </el-form-item>
            </el-form>
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
  methods: {
    Show(ptObj) {
      this.index = ptObj.index
      this.pointData = ptObj.point
      this.show = true;
    }
  },
}
</script>

<style lang="scss" scoped >
.map-point-setting-drawer {
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