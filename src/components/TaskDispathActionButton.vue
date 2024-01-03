<template>
    <div class="task-dispatch-btn-container"><b-button squared variant="primary" @click="() => {
        $emit('on-click')
    }">任務派送</b-button></div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
.task-dispatch-btn-container {
    position: fixed;
    bottom: 40px;
    right: 15px;
    z-index: 10;

    button {
        font-size: 40px;
    }

    box-shadow: -3px 0px 24px 3px rgb(61, 61, 61);
}
</style>