<template>
    <div class="task-dispatch-btn-container"><b-button variant="primary" @click="() => {
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

    button {
        font-size: 40px;
    }
}
</style>