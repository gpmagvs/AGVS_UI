<template>
  <div class>
    <b-tabs>
      <b-tab
        v-for="route in routes"
        :key="route.name"
        :title="route.meta.Display"
        @click="RouteSwitchHandle(route.name)"
      ></b-tab>
    </b-tabs>
    <div class="route-view">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script>
import { tsmc_routes } from '@/router'
export default {
  computed: {
    routes() {
      return tsmc_routes[0].children
    }
  },
  methods: {
    RouteSwitchHandle(route_name) {
      this.$router.push(route_name)
    }
  },
}
</script>

<style lang="scss" scoped>
</style>