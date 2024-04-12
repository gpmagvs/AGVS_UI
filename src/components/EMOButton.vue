<template>
  <div class="emo-button" @click="EMO()">
    <img src="@/assets/emo.png" width="80" />
  </div>
</template>

<script>
import { EMO } from '@/api/VMSAPI'
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
  },
  methods: {
    async EMO() {
      if (this.disabled) {
        return;
      }
      await EMO();
    }
  },

}

</script>

<style lang="scss">
.emo-button {
  &:active {
    /* background-color: gray; */
    padding: 2px;
  }
}

/* .emo-button:active {
} */
</style>