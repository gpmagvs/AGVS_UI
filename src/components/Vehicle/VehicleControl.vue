<template>
    <div class="vehicle-controls  bg-light w-100 text-start py-3">
        <el-button type="danger" size="large" @click="HandleShutdownAllVehicleClick">Shutdown Vehicles</el-button>
    </div>
</template>
<script>
/**車輛系統控制 */
import { VehicleManagerAPI } from '@/api/VMSAPI'
export default {
    methods: {
        HandleShutdownAllVehicleClick() {
            this.$swal.fire(
                {
                    text: '',
                    title: '確定要將所有車輛關機?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'OK',
                    customClass: 'my-sweetalert'
                }).then(res => {
                    if (!res.isConfirmed)
                        return;
                    this.ShutDownVehicles();
                })
        },
        async ShutDownVehicles() {
            await VehicleManagerAPI.ShutDownAllVehicles();
        }
    },
}
</script>
<style lang="scss" scoped>
.vehicle-controls {}
</style>