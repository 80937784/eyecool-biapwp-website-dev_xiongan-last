<template>
    <div>
        <div class="img">
            <img v-if="imgPreview" class="allImg" :src="allImg" alt="">
            <img class="irisImg" :src="irisPreviewImg" alt="">
            <img class="faceImg" :src="previewImgData" alt="">
        </div>
        <div class="tips">{{collectMsg}}</div>
        <p style="text-align:center;font-size:14px;color:#E6A23C">提示:虹膜图像必须为非镜像图片！</p>
        <div class="button"><button @click="$router.push('login')">返回</button></div>
    </div>
</template>
<script>
import { HelperWS } from "@/utils/biosdk/faceiris/FaceIrisWS";
import axios from "axios";
export default {
    data () {
        return {
            allImg:require("../../../../assets/login/area.png"),
            previewImgData:"",
            irisPreviewImg:"",
            imgPreview:true,
            collectMsg:"正在连接多模态登录服务",
            bioLoginForm: {
                bioUsername: this.bioUsername,
                bioLoginType: "faceiris",
                bioData: ""
            }
        }
    },
    created() {
      console.log("我来了");
        this.initConnect();
    },
    beforeDestroy() {
        this.closeDev();
        this.disConnect();
    },
    props:{
        bioUsername:{
            require:true,
            type:String
        }
    }, 
    methods: {
    // 初始化人脸采集websocket服务连接
    initConnect() {
      HelperWS.connect(() => {
        this.collectMsg = "人脸虹膜采集服务连接成功！"
          this.openDev();
      }, () => {
        this.collectMsg = "人脸虹膜采集服务连接失败，请检查是否安装插件！"
      });
    },
    // 断开人脸采集websocket服务
    disConnect() {
      console.log("断开了");
      HelperWS.disconnect();
    },
    // 采集人脸
    handeCollect() {
      this.capture();
    },
    // 打开摄像头
    async openDev() {
      const res = await axios.get("config/SDKConfig.json");
      const image_rotate = res.data.image_rotate || 0;
      HelperWS.openDevice({"flip_left_right_saved":image_rotate},() => {
        this.collectMsg = "摄像头已打开, 请采集人脸虹膜..."
          this.capture();
      }, (ret) => {
        this.collectMsg = "打开设备失败:"+ret
      },(data)=> {
        const arrayData = data.split("$&");
        this.imgPreview = false;
        this.previewImgData = 'data:image/jpg;base64,' + arrayData[0];
        this.irisPreviewImg = 'data:image/jpg;base64,' + arrayData[2];
      });
    },
    // 关闭设备
    closeDev() {
      HelperWS.closeDevice(() => {
        this.collectMsg = "摄像头已关闭"
      });
    },
    // 执行采集
    capture() {
        this.collectMsg = "人脸虹膜采集中..."
        // 超时时间
        const timeout = 30
        //   特征比对类型，1为单眼，2为双眼
        const eyeFlag = 2
        HelperWS.irisFaceCapture(timeout,(data) => {
          const arrayData = data.split("$&");
          let bioData = {
            irisImgBase64: arrayData[0],
            faceImgBase64: arrayData[2],
            irisFeature:  arrayData[1],
          };
          this.bioLoginForm.bioData = JSON.stringify(bioData)
          this.collectMsg = "多模态采集成功！"
          this.bioLogin();
        this.closeDev(); 
        }, (error) => {
            this.collectMsg = "多模态登录失败,请重新登录！";
        });
    },
    // 登录
    bioLogin() {
        this.$store.dispatch("BioLogin", this.bioLoginForm)
        .then(() => {
            if (this.redirect_type === 'out') {
            location.href = this.redirect;
            return;
            }
            this.$router.push({ path: this.redirect || "/" });
        })
        .catch(() => {
            this.$router.push('/login');
        });
    }
  }
}
</script>
<style lang="scss" scoped>
.img {
    width: 100%;
    height: 280px;
    position: relative;
    img {
        width: 100%;
        height: 280px;
    }
}
.allImg {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 100;
}
.tips {
    width: 100%;
    height: 44px;
    margin-top: 14px;
    background: #FBFBFB;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 13px;
    color: #F57821;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 44px;
    overflow: hidden;
}
.irisImg {
    display: block;
    height: 110px !important;
    width: 100%;
}
.faceImg {
    display: block;
    height: 170px !important;
}
.button {
    text-align: center;
    margin-top: 24px;
    button {
        width: 100%;
        height: 46px;
        background-image: linear-gradient(113deg, #FF9000 0%, #FF6600 100%);
        border-radius: 4px;
        text-align: center;
        line-height: 40px;
        font-family: PingFangSC-Medium;
        font-size: 16px;
        color: #FFFFFF;
        border:none;
        cursor: pointer;
        outline: none;
    }
    button:hover {
        background: linear-gradient(113deg, #FF6600 0%, #FF9000 100%);
    }
}
</style>