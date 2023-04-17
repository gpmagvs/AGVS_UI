<template></template>

<script>
export default {
  methods: {
    Show() {
      this.$vs.notify({
        color: 'danger',
        title: 'Accept Selected',
        text: 'Lorem ipsum dolor sit amet, consectetur'
      })
    }
  },
}
</script>

<style>
</style>