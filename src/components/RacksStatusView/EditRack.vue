<template>
    <el-drawer v-model="drawerVisible" @close="closeDrawer" size="50%">
        <!-- Drawer content goes here -->
        <div class="w-100">
            <Rack :rackName="wipName"></Rack>
        </div>
    </el-drawer>
</template>
<script>
import Rack from './Rack.vue';
export default {
    components: {
        Rack,
    },
    props: {
        wipName: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            drawerVisible: false
        };
    },
    methods: {
        openDrawer() {
            this.drawerVisible = true;
        },
        closeDrawer() {
            this.drawerVisible = false;
        }
    }
};
</script>
<style></style>
