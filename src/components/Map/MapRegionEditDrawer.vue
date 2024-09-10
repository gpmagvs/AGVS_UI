<template>
  <div class="forbid-region-edit-drawer">
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
        <div class="header border-bottom">
          <h3>區域設置:{{ region_name }}</h3>
        </div>
      </template>
      <div class="draw-content">
        <el-form label-width="140" label-position="left">
          <el-form-item label="名稱">
            <el-input v-model="RegionData.Name" @input="ChangeNameDisplay"></el-input>
          </el-form-item>
          <el-form-item label="類型">
            <el-select v-model="RegionData.RegionType">
              <el-option :value="0" label="禁制區"></el-option>
              <el-option :value="1" label="通行區"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="進入/等待點">
            <el-select
              v-model="RegionData.EnteryTags"
              multiple
              placeholder="Select"
              @change="HandlePropChanged"
            >
              <el-option
                v-for="ptOption in NoramlPointsOptions"
                :key="ptOption.tag"
                :label="ptOption.tag+`(${ptOption.name_display})`"
                :value="ptOption.tag"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="可容納車輛數">
            <el-input-number
              @change="HandlePropChanged"
              :min="1"
              :max="20"
              :step="1"
              v-model="RegionData.MaxVehicleCapacity"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="閒置時停車角度限制">
            <el-input-number
              @change="HandlePropChanged"
              :min="-180"
              :max="180"
              :step="0.1"
              v-model="RegionData.ThetaLimitWhenAGVIdling"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="窄道區域">
            <el-checkbox @change="HandlePropChanged" v-model="RegionData.IsNarrowPath"></el-checkbox>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { MapStore } from '@/components/Map/store'
import { MapRegion, StationSelectOptions } from './mapjs'
import Feature from 'ol/Feature.js';
import { Fill, Stroke, Style, Text } from 'ol/style';
export default {
  data() {
    return {
      show: false,
      region_name: '',
      textFeature: new Feature(),
      ploygonFeature: new Feature(),
      /** { "StartPtIndex": 5, "EndPtIndex": 0, "StartCoordination": [ 2.653, 6.213 ], "EndCoordination": [ 0.531, 6.217 ], "PathID": "5_0", "IsEQLink": false, "IsSingleCar": false, "IsPassable": false, "IsExtinguishingPath": false, "Speed": 1, "LsrMode": 0, "DodgeMode": 0, "SpinMode": 0 }*/
      RegionData: new MapRegion('', [])
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
    Show(region_name, textFeature = new Feature(), ploygonFeature = new Feature()) {
      this.region_name = region_name
      this.textFeature = textFeature
      this.ploygonFeature = ploygonFeature
      setTimeout(async () => {
        var regionDataRaw = await MapStore.dispatch('GetRegionByName', region_name);
        if (regionDataRaw) {
          this.RegionData = JSON.parse(JSON.stringify(regionDataRaw))
        }
        else {
          this.RegionData = new MapRegion(region_name)
        }
        this.show = true
      }, 10)
    },
    ChangeNameDisplay(newName) {
      var newStyle = this.textFeature.getStyle().clone();
      var textProp = newStyle.getText().clone();;
      textProp.setText(newName);
      newStyle.setText(textProp);
      this.textFeature.setStyle(newStyle)
      this.textFeature.set('name', newName);
      this.ploygonFeature.set('name', newName);

      let _regionData = new MapRegion("", [], -1);
      Object.assign(_regionData, this.ploygonFeature.get('data'))
      _regionData.Name = newName;
      this.ploygonFeature.set('data', _regionData)

      console.log(newName);
      console.log(_regionData);

    },
    HandlePropChanged() {
      this.ploygonFeature.set('data', this.RegionData)
    }


  },
  computed: {
    NoramlPointsOptions() {
      var options = [new StationSelectOptions()];
      Object.assign(options, MapStore.getters.AllNormalStationOptions);
      return options;
    }
  },
}
</script>
<style lang="scss">
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
</style>