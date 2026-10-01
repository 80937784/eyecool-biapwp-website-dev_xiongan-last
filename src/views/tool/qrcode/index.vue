<template>
  <div class="ec-qrcode-gen">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-input type="textarea" :rows="13" placeholder="请输入需要生成二维码的字符串" v-model="content"></el-input>
      </el-col>
      <el-col :span="12">
        <el-image v-if="qrCodeImgBase64" :src="'data:image/jpeg;base64,' + qrCodeImgBase64" style="width: 300px; height: 300px"></el-image>
      </el-col>
    </el-row>
    <div class="ec-qrcode-btn">
      <el-button type="primary" @click="genQrCode" size="medium">生成二维码</el-button>
      <el-button type="success" @click="download" size="medium" v-if="qrCodeImgBase64">下载二维码</el-button>
      <el-button type="info" @click="resetData" size="medium">重置数据</el-button>
    </div>
  </div>
</template>
<script>
import { genQrCode } from "@/api/tool/qrcode";
export default {
  data() {
    return {
      // 二维码内容
      content: null,
      // 二维码图片base64
      qrCodeImgBase64: null
    }
  },
  methods: {
    // 生成二维码
    genQrCode() {
      if (!this.content || !this.content.length) {
        this.$message.error('请输入内容');
        return;
      }
      genQrCode({ content: this.content }).then(res => {
        this.qrCodeImgBase64 = res.data.qrcodeImgBase64
      })
    },
    // 下载二维码图片
    download() {
      if (!this.qrCodeImgBase64) {
        this.$message.error('请先生成二维码');
        return;
      }
      let imgData = "data:image/jpg;base64," + this.qrCodeImgBase64;
      this.downloadFile('qrcode.png', imgData);
    },
    // 重置数据
    resetData() {
      this.content = null;
      this.qrCodeImgBase64 = null;
    },

    //下载
    downloadFile(fileName, content) {
      let aLink = document.createElement('a');
      let blob = this.base64ToBlob(content); //new Blob([content]);

      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);

      // aLink.dispatchEvent(evt);
      aLink.click()
    },

    //base64转blob
    base64ToBlob(code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;

      let uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    }
  }
}
</script>
<style lang="scss">
.ec-qrcode-gen {
  margin: 20px;
  padding: 30px;
  border-radius: 5px;
  border: 1px solid #ccc;
  .ec-qrcode-btn {
    margin-top: 20px;
    text-align: center;
  }
}
</style>