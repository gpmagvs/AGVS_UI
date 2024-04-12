<template>
  <div class="d-flex flex-column" style="width:50px">
    <b-button class="m-1" size="sm" @click="prev">▲</b-button>
    <b-button
      class="m-1 border"
      size="sm"
      @click="()=>{pagecurrent=i}"
      v-for="i in  totalPages"
      :key="i"
      :variant="i==pagecurrent?'primary':'dark'"
    >{{ i }}</b-button>
    <b-button class="m-1" size="sm" @click="next">▼</b-button>
  </div>
</template>

<script>
import { watch } from 'vue'
export default {
  props: {
    default: {
      type: Number,
      default: 1
    },
    totalCount: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 16
    }
  },

  data() {
    return {
      pagecurrent: this.value
    }
  },

  computed: {
    totalPages() {
      if (this.totalCount <= this.pageSize)
        return 1
      return this.totalCount / this.pageSize
    },
  },
  mounted() {
    this.pagecurrent = this.default;
    watch(() => this.pagecurrent, (n, o) => {
      this.$emit('page_changed', n)
    })
  },
  methods: {
    prev() {
      if (this.pagecurrent > 1)
        this.pagecurrent = this.pagecurrent - 1
    },
    next() {
      if (this.pagecurrent < this.totalPages)
        this.pagecurrent = this.pagecurrent + 1
    }
  },

}
</script>

<style lang="scss" scoped>
</style>