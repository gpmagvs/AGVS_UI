<template>
  <div class="mission-card">
    <div class="mission-card-header">
      <h5># {{ mission.TaskName }}</h5>
      <label>Local</label>
    </div>
    <b-button>取消/中止</b-button>
  </div>
</template>
<script>
import clsTaskState from '@/ViewModels/TaskState'
export default {
  props: {
    mission: {
      type: clsTaskState,
      default() {
        return new clsTaskState({})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mission-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  border-radius: 4px;
  .mission-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    h5 {
      text-align: left;
    }
  }
}
</style>
