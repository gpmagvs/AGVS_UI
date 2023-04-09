<template>
  <div
    class="connection-state d-flex flex-row fixed-bottom bg-light text-dark border rounded text-start p-2"
  >
    <i class="bi bi-three-dots-vertical"></i>
    <div
      class="conn-block px-2 border-end"
      v-for="connection in Connections"
      :key="connection.name"
    >
      <label>{{ connection.name }}</label>
      <el-tag
        effect="dark"
        :type="connection.connected?'success':'danger'"
      >{{ connection.connected?'Connected':'Disconnect' }}</el-tag>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      Connections: [
        {
          name: "HOST",
          connected: true,
        },
        {
          name: "VMS",
          connected: false,
        },
        {
          name: "DB",
          connected: true,
        },
        {
          name: "UI",
          connected: false,
        }
      ]
    }
  },
}
</script>

<style lang="scss" scoped>
.connection-state {
  .conn-block {
    margin-right: 10px;
    padding: auto 5px;
    label {
      color: grey;
      margin: auto 5px;
    }
    label,
    .el-tag {
      font-weight: bold;
    }
  }
}
</style>