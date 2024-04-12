<template>
  <div class="h-100 w-100 d-flex">
    <SideMenu></SideMenu>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script>
import SideMenu from '@/components/Admin/SideMenu.vue'
export default {
  components: {
    SideMenu,
  },
}
</script>

<style lang="scss">
.admin {
  width: 100%;
  height: 100%;
  padding-left: 60px;
  padding-bottom: 10px;
}
</style>