<template>
  <div class="eq-group-editor">
    EQ Group
    <div class="groups-container">
      <GroupComponent
        class="group"
        v-for="config in GroupsConfigures"
        :key="config.EqGroupName"
        :Configuration="config"
      ></GroupComponent>
      <!-- 一個新增的按鈕 -->
      <GroupComponent class="group" @onAddClick="HandleAddRequest" :isUseForAdd="true"></GroupComponent>
    </div>
  </div>
</template>

<script>
import GroupComponent from '../Equipments/EqGroupComponent.vue'
import { EQGroupConfiguration } from '@/ViewModels/EndDeviceOption';

import { DownloadEQGroupConfiguration } from '@/api/EquipmentAPI';
export default {
  components: {
    GroupComponent,
  },
  data() {
    return {
      GroupsConfigures: [new EQGroupConfiguration("ahah", [1, 2], [3, 4])]
    }
  },
  methods: {
    HandleAddRequest() {
      var newGroupDefaultName = `EQ Group-${this.GroupsConfigures.length + 1}`;
      this.GroupsConfigures.push(new EQGroupConfiguration(newGroupDefaultName))
    }
  },
  mounted() {
    DownloadEQGroupConfiguration().then(confi => this.GroupsConfigures = confi);
  },
}
</script>

<style lang="scss"  scoped>
.eq-group-editor {
  background-color: pink;
  .groups-container {
    background-color: grey;
    width: 100%;
    height: fit-content;

    .group {
      float: left;
    }
  }
}
</style>