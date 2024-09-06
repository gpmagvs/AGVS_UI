<template>
  <div>
    <el-form label-position="left" label-width="120">
      <el-form-item label="可入料的設備">
        <el-select multiple v-model="_regular_unload_settings.LoadRequestAlwaysOnEqNames">
          <el-option
            v-for="item in EQPortOptions"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item></el-form-item>
    </el-form>
    <el-table :data="tableModel" height="900" border>
      <el-table-column label="EQ名稱" prop="name"></el-table-column>
      <el-table-column label="Tag" prop="tag"></el-table-column>
      <el-table-column label="收/入料">
        <template #default="scope">
          <el-select v-model="scope.row.lduld" @change="HandleUdUldChanged(scope.row)">
            <el-option label="出料" value="unload"></el-option>
            <el-option label="入料" value="load"></el-option>
            <el-option label="IDLE/BUSY" value="busy"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="延遲出料請求(秒)(腳本啟動後)">
        <template #default="scope">
          <el-input
            :disabled="scope.row.lduld!='unload'"
            type="number"
            v-model="scope.row.DelayTimeWhenScriptStart"
            @change="HandleDelayTimeOnScriptStartChanged(scope.row)"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column label="出料節拍(秒)">
        <template #default="scope">
          <el-input
            :disabled="scope.row.lduld!='unload'"
            type="number"
            v-model="scope.row.UnloadRequestInterval"
            @change="HandleUnloadIntervalChanged(scope.row)"
          ></el-input>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { RegularUnloadSettings, UnloadRequestOpts } from './Models.js'
import { EqStore } from '@/store';

export default {
  props: {
    regular_unload_settings: {
      type: Object,
      default() {
        return new RegularUnloadSettings();
      }
    },
  },
  data() {
    return {
      _regular_unload_settings: new RegularUnloadSettings(),
      tableModel: [

      ]
    }
  },
  methods: {
    HandleUdUldChanged(row = { name: opt.Name, tag: opt.TagID, lduld: 'busy', DelayTimeWhenScriptStart: 1, UnloadRequestInterval: 10 }) {
      var index = this._regular_unload_settings.LoadRequestAlwaysOnEqNames.indexOf(row.name);
      if (index != -1) {
        this._regular_unload_settings.LoadRequestAlwaysOnEqNames.splice(index, 1);
      }

      index = this._regular_unload_settings.UnloadRequestsSettings.findIndex(unloader => unloader.EqName == row.name);
      if (index != -1) {
        this._regular_unload_settings.UnloadRequestsSettings.splice(index, 1);
      }
      if (row.lduld == 'load') {
        this._regular_unload_settings.LoadRequestAlwaysOnEqNames.push(row.name);
      }
      if (row.lduld == 'unload') {
        var unloadOpt = new UnloadRequestOpts(row.name, row.UnloadRequestInterval, row.DelayTimeWhenScriptStart);
        this._regular_unload_settings.UnloadRequestsSettings.push(unloadOpt);
      }
    },
    HandleDelayTimeOnScriptStartChanged(row = { name: opt.Name, tag: opt.TagID, lduld: 'busy', DelayTimeWhenScriptStart: 1, UnloadRequestInterval: 10 }) {
      var setting = this._regular_unload_settings.UnloadRequestsSettings.find(unloader => unloader.EqName == row.name);
      if (setting) {
        setting.DelayTimeWhenScriptStart = row.DelayTimeWhenScriptStart;
      }
    },
    HandleUnloadIntervalChanged(row = { name: opt.Name, tag: opt.TagID, lduld: 'busy', DelayTimeWhenScriptStart: 1, UnloadRequestInterval: 10 }) {
      var setting = this._regular_unload_settings.UnloadRequestsSettings.find(unloader => unloader.EqName == row.name);
      if (setting) {
        setting.UnloadRequestInterval = row.UnloadRequestInterval;
      }
    },
    update(_regular_unload_settings) {
      this._regular_unload_settings = _regular_unload_settings;
      var _tableBuild = EqStore.state.EqOptions.map(opt => { return { name: opt.Name, tag: opt.TagID, lduld: 'busy', DelayTimeWhenScriptStart: 1, UnloadRequestInterval: 10 } });
      this._regular_unload_settings.LoadRequestAlwaysOnEqNames.forEach(eqName => {
        var eqFound = _tableBuild.find(opt => opt.name == eqName)
        if (eqFound) {
          eqFound.lduld = 'load';
        }
      })

      this._regular_unload_settings.UnloadRequestsSettings.forEach(unloader => {

        var eqFound = _tableBuild.find(opt => opt.name == unloader.EqName)
        if (eqFound) {
          eqFound.lduld = 'unload';
          eqFound.UnloadRequestInterval = unloader.UnloadRequestInterval;
          eqFound.DelayTimeWhenScriptStart = unloader.DelayTimeWhenScriptStart;
        }
      })

      this.tableModel = _tableBuild;
    }
  },
  computed: {
    EQPortOptions() {
      return EqStore.state.EqOptions.map(opt => { return { name: opt.Name, value: opt.TagID } })
    },
  },
}
</script>

<style>
</style>