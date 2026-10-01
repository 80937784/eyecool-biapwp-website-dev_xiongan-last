<template>
  <div class="component-upload-image">
    <el-upload :action="uploadImgUrl" list-type="picture-card" :on-success="handleUploadSuccess" :before-upload="handleBeforeUpload" :on-error="handleUploadError" name="file" :show-file-list="false" :headers="commonRequestHeaders" style="display: inline-block; vertical-align: top">
      <img v-if="value" :src="value" class="avatar" />
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
  </div>
</template>

<script>
import { getToken } from "@/utils/auth";
const Base64 = require('js-base64').Base64
export default {
  components: {},
  data() {
    return {
      uploadImgUrl: process.env.VUE_APP_BASE_API + "/common/upload", // 上传的图片服务器地址
    };
  },
  computed: {
    headers() {
      return  {
        Authorization: "Bearer " + getToken(),
        ClientCredential: "Basic " + Base64.encode(this.clientCredential)
      }
    }
  },
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  methods: {
    handleUploadSuccess(res) {
      this.$emit("input", res.url);
      this.loading.close();
    },
    handleBeforeUpload() {
      this.loading = this.$loading({
        lock: true,
        text: "上传中",
        background: "rgba(0, 0, 0, 0.7)",
      });
    },
    handleUploadError() {
      this.$message({
        type: "error",
        message: "上传失败",
      });
      this.loading.close();
    },
  },
  watch: {},
};
</script>

<style scoped lang="scss">
.avatar {
  width: 100%;
  height: 100%;
}
</style>