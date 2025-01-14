<template>
  <div class="map-path-editor">
    <el-drawer
      v-model="show"
      size="35%"
      :close-on-press-escape="true"
      :close-on-click-modal="true"
      @closed="$emit('closed', PathDataEdit)"
      :show-close="false"
      :modal="true"
      modal-class="modal-style"
    >
      <template #header>
        <div class="header border-bottom text-start">
          <h3>路徑設定:{{ StartPointTagNumber }}->{{ EndPointTagNumber }}</h3>
        </div>
      </template>
      <div class="draw-content w-100">
        <el-form label-width="140" label-position="left">
          <el-form-item label="Path ID">
            <el-input disabled v-model="PathDataEdit.PathID"></el-input>
          </el-form-item>
          <el-form-item label="起點">
            <div class="d-flex gap-2">
              <span>Tag</span>
              <el-input disabled v-model="StartPointTagNumber"></el-input>
              <span>Index</span>
              <el-input disabled v-model="PathDataEdit.StartPtIndex "></el-input>
            </div>
          </el-form-item>
          <el-form-item label="終點">
            <div class="d-flex gap-2">
              <span>Tag</span>
              <el-input disabled v-model="EndPointTagNumber"></el-input>
              <span>Index</span>
              <el-input disabled v-model="PathDataEdit.EndPtIndex"></el-input>
            </div>
          </el-form-item>
          <el-form-item label="權重">
            <el-input-number v-model="PathDataEdit.Weight" :step="0.1" :min="0.0001" :max="100"></el-input-number>
          </el-form-item>
          <el-form-item v-if="false" label="工位路徑">
            <el-checkbox disabled v-model="PathDataEdit.IsEQLink"></el-checkbox>
          </el-form-item>
          <el-form-item label="道路開放">
            <el-checkbox @change="SettingsChangedHandler" v-model="PathDataEdit.IsPassable"></el-checkbox>
          </el-form-item>
          <el-form-item v-if="false" label="僅允許一台車通行">
            <el-checkbox v-model="PathDataEdit.IsSingleCar"></el-checkbox>
          </el-form-item>
          <el-form-item v-if="false" label="是否可旋轉">
            <el-checkbox v-model="PathDataEdit.IsRotationable"></el-checkbox>
          </el-form-item>
          <el-form-item v-if="false" label="消防通道">
            <el-checkbox v-model="PathDataEdit.IsExtinguishingPath"></el-checkbox>
          </el-form-item>
          <el-form-item v-if="false" label="雷射模式">
            <el-input-number v-model="PathDataEdit.LsrMode" :step="1"></el-input-number>
            <i class="bi bi-question-circle information" @click="HandleLaserModeInfoIconClick"></i>
          </el-form-item>
          <el-form-item v-if="false" label="限速">
            <el-input-number v-model="PathDataEdit.Speed" :step="0.1" :precision="1"></el-input-number>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { MapStore } from './store';
export default {
  data() {
    return {
      show: false,
      /** { "StartPtIndex": 5, "EndPtIndex": 0, "StartCoordination": [ 2.653, 6.213 ], "EndCoordination": [ 0.531, 6.217 ], "PathID": "5_0", "IsEQLink": false, "IsSingleCar": false, "IsPassable": false, "IsExtinguishingPath": false, "Speed": 1, "LsrMode": 0, "DodgeMode": 0, "SpinMode": 0 }*/
      PathDataEdit: {
        StartPtIndex: 5,
        EndPtIndex: 0,
        StartCoordination: [2.653, 6.213],
        EndCoordination: [0.531, 6.217],
        PathID: "5_0",
        IsEQLink: false,
        IsSingleCar: false,
        IsRotationable: false,
        IsPassable: false,
        IsExtinguishingPath: false,
        Speed: 1,
        LsrMode: 0,
        DodgeMode: 0,
        SpinMode: 0,
        Weight: 1
      }
    }
  },
  computed: {
    StartPoint() {
      return MapStore.getters.MapData.Points[this.PathDataEdit.StartPtIndex];
    },
    EndPoint() {
      return MapStore.getters.MapData.Points[this.PathDataEdit.EndPtIndex];
    },
    StartPointTagNumber() {
      return this.StartPoint.TagNumber;
    },
    EndPointTagNumber() {
      return this.EndPoint.TagNumber;
    }
  },
  props: {
    SettingsChangedHandler: {
      type: Function,
      default() {
        return () => {

        }
      }
    }
  },
  methods: {
    Show(PathData) {
      if (PathData) {
        this.PathDataEdit = PathData;
        this.show = true
      }
    }
  },
}
</script>
<style lang="scss" scoped>
.draw-content {
  top: 90px;
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
</style>