<template>
  <div class="eq-group-editor">
    EQ Group
    <div class="groups-container">
      <GroupComponent class="group"></GroupComponent>
      <GroupComponent class="group"></GroupComponent>
      <GroupComponent class="group"></GroupComponent>
      <GroupComponent class="group"></GroupComponent>
      <GroupComponent class="group"></GroupComponent>
      <GroupComponent class="group"></GroupComponent>
      <GroupComponent class="group"></GroupComponent>
      <!-- 一個新增的按鈕 -->
      <GroupComponent class="group" @onAddClick="HandleAddRequest" :isUseForAdd="true"></GroupComponent>
    </div>
  </div>
</template>

<script>
import GroupComponent from '../Equipments/EqGroupComponent.vue'
export default {
  components: {
    GroupComponent,
  },

  methods: {
    HandleAddRequest() {
      alert('Add a group.')
    }
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