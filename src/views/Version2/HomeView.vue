<template>
  <div class="bg-dark w-100 home-view-new">
    <homview-header class="bg-dark"></homview-header>
    <div class="bg-dark text-light w-100" style="    margin-top: 52px;
    height: 600px;">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <HomeviewFooter></HomeviewFooter>
  </div>
</template>

<script>
import HomviewHeader from '../../components/Version2/HomviewHeader.vue';
import HomeviewFooter from '../../components/Version2/HomeviewFooter.vue';
export default {
  components: {
    HomviewHeader, HomeviewFooter
  },
  computed: {

  },
  methods: {
    ControllerIconClick() {
      this.$router.push('./controller')
    }
  },
}
</script>

<style lang="scss" scoped>
</style>