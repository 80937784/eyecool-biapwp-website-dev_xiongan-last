<template>
  <div class="ec-finger-collect">
    <img class="ec-collect-img" :src="'data:image/jpeg;base64,' + this.imgData" :width="imgWidth" :height="imgHeight" alt="previewImg" :onerror="defaultImg" />
    <div class="ec-collect-msg">{{collectMsg}}</div>
    <el-button type="primary" class="ec-collect-btn" :disabled="disabledBtn" v-if="!isAutoCollect" size="mini" @click="handeCollect">开始采集</el-button>
  </div>
</template>
<script>
import { EcFingerWs } from "@/utils/biosdk/finger/FingerprintHelperWS";
export default {
  data() {
    return {
      // 采集提示消息
      collectMsg: null,
      // 图片Base64
      imgData: null,
      // 禁用采集按钮
      disabledBtn: false
    }
  },
  props: {
    // 图片宽度
    imgWidth: {
      type: Number,
      default: 145
    },
    // 图片高度
    imgHeight: {
      type: Number,
      default: 180
    },
    // 是否模板照
    isTemplateImg: {
      type: Boolean,
      default: true
    },
    // 模板照图片
    value: {
      type: String,
      default: null
    },
    // 是否自动采集
    isAutoCollect: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    defaultImg() {
      return (
        'this.src="' + require("@/assets/image/auth-finger.png") + '"'
      );
    },
    imgIdx() {
      return this.isTemplateImg ? 0 : 1; // 0注册图，1特征图
    }
  },
  created() {
    this.imgData = this.value
    this.initConnect();
  },
  beforeDestroy() {
    this.disConnect();
  },
  methods: {
    // 初始化指纹采集websocket服务连接
    initConnect() {
      EcFingerWs.connect(() => {
        this.collectMsg = "指纹采集服务连接成功！"
        console.log('指纹采集服务连接成功！')
        // 自动采集
        if (this.isAutoCollect) {
          this.handeCollect();
        }
      }, () => {
        this.collectMsg = "指纹采集服务连接失败，请检查是否安装插件！"
        console.log('指纹采集服务连接失败！')
      });
    },
    // 断开指纹采集websocket服务
    disConnect() {
      EcFingerWs.disconnect();
    },
    // 采集指纹
    handeCollect() {
      this.getTempletGA();
    },
    // 获取GA指纹模板
    getTempletGA() {
      this.disabledBtn = true
      this.collectMsg = "请采集指纹..."
      this.imgData = null;
      // 获取图像
      if (this.isTemplateImg == false) {
        EcFingerWs.FPIGetFeatureGA(this.succCallback, this.failCallback);
        return;
      }
      EcFingerWs.FPIGetTempletGA(this.succCallback, this.failCallback);
    },

    succCallback() {
      let format = 1;	// 0raw, 1bmp, 2wsq 只有bmp可以显示，raw和wsq均不可显示
      this.collectMsg = "指纹采集成功"
      EcFingerWs.FPIGetImageDataGA((imgBase64) => {
        this.imgData = imgBase64;
        this.disabledBtn = false
        this.$emit('input', imgBase64);
        this.$emit("collect-result", true);
      }, (code, msg) => {
        this.collectMsg = `${code}:${msg}`
        this.disabledBtn = false
        this.$emit("collect-result", false);
      }, this.imgIdx, format);
    },
    failCallback(code, msg) {
      this.collectMsg = `${code}:${msg}`
      this.disabledBtn = false
      this.$emit("collect-result", false);
    }
  }
}
</script>
<style lang="scss" scoped>
.ec-collect-img {
  background-color: rgb(60, 67, 91);
  border: 1px solid rgb(60, 67, 91);
}
</style>