<template>
    <div class="rack-port rack-bottom-port" style="width:170px">
        <img src="~@/assets/images/rack-bottom-port.png" width="170" />
    </div>
</template>
<script>
import RackPortImage from './RackPortImage.vue'
export default {
    extends: RackPortImage
}
</script>
<style lang="scss">
.rack-bottom-port {
    img {
        position: relative;
        left: -5px;
    }
}
</style>