<template>
    <div class="image-upload-button">
        <!-- 上传图片按钮 -->
        <el-button size="small" type="button" @click="triggerFileInput">{{ buttonText }}</el-button>
        <el-button v-if="imageFile != null" size="small" type="button" @click="uploadToServer">確認上傳</el-button>
        <!-- 隐藏的文件输入，用于触发文件选择 -->
        <input
            type="file"
            ref="fileInput"
            @change="handleFileChange"
            accept="image/*"
            style="display: none;" />
        <!-- 图片预览 -->
        <div v-if="imageUrl && showPreview" class="image-preview">
            <img :src="imageUrl" alt="Image preview" />
            <p>图片路径: {{ imageUrl }}</p>
        </div>
    </div>
</template>
<script>

export default {
    props: {
        showPreview: {
            type: Boolean,
            default: false
        },
        buttonText: {
            type: String,
            default: "選擇圖片"
        },
        backendUrl: {
            type: String,
            default: "BACKEND_URL"
        }
    },
    data() {
        return {
            imageFile: null, // 存储选定的图像文件
            imageUrl: null, // 存储图像的URL以供预览
        };
    },
    methods: {
        triggerFileInput() {
            this.imageFile = null;
            this.imageUrl = null;
            this.$refs.fileInput.click();
        },
        handleFileChange(event) {
            // 处理文件改变事件，获取文件并显示预览
            this.imageFile = event.target.files[0];
            if (this.imageFile) {
                this.imageUrl = URL.createObjectURL(this.imageFile);
                this.$emit('OnFileUploaded', {
                    imageFile: this.imageFile,
                    imageUrl: this.imageUrl
                })
            }
        },
        async uploadToServer() {
            if (!this.imageFile) {
                this.$swal.fire(
                    {
                        text: '',
                        title: '請先選擇圖檔',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'my-sweetalert'
                    })
                return;
            }
            const formData = new FormData();
            formData.append('image', this.imageFile);
            try {
                // 使用fetch API上传文件，这里需要替换为你的API端点
                const response = await fetch(this.backendUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    this.$swal.fire(
                        {
                            text: '',
                            title: '上傳成功',
                            icon: 'info',
                            showCancelButton: false,
                            confirmButtonText: 'OK',
                            customClass: 'my-sweetalert'
                        })
                } else {
                    console.log(response)
                    this.$swal.fire(
                        {
                            text: `${response.url} : ${response.status}-${response.statusText}`,
                            title: '上傳失敗',
                            icon: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'OK',
                            customClass: 'my-sweetalert'
                        })
                }
            } catch (error) {
                console.error('上传错误:', error);
                this.$swal.fire(
                    {
                        text: '',
                        title: '上傳過程中發生錯誤',
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        customClass: 'my-sweetalert'
                    })
            }
        },
    },
};
</script>
<style lang="scss" scope>
.image-upload-button {
    .image-preview img {
        width: 100%;
        /* 或根据需要调整 */
        height: auto;
    }
}
</style>