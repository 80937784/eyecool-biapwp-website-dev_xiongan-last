<template>
    <div>
        <div class="img">
            <img :src="previewImgData" alt="">
        </div>
        <div class="tips">{{collectMsg}}</div>
        <p style="text-align:center;font-size:14px;color:#E6A23C">提示:虹膜图像必须为非镜像图片！</p>
        <div class="button"><button @click="$router.push('login')">返回</button></div>
    </div>
</template>
<script>
import { EcIrisWs } from "@/utils/biosdk/iris/IrisHelperWS";
import axios from "axios";
export default {
    data () {
        return {
            // 采集提示消息
            collectMsg: "正在连接虹膜登录服务",
            previewImgData:require("../../../../assets/login/ir_area.png"),
            bioLoginForm: {
                bioUsername: this.bioUsername,
                bioLoginType: "iris",
                bioData: ""
            },
        }
    },
    created () {
        this.initConnect();
        console.log(this.bioUsername);
    },
    beforeDestroy() {
        this.disConnect();
    },
    props:{
        bioUsername:{
            require:true,
            type:String
        }
    },
    methods: {
    // 初始化虹膜采集websocket服务连接
    initConnect() {
      EcIrisWs.connect(() => {
        this.collectMsg = "虹膜采集服务连接成功！"
        this.handeCollect()
      }, () => {
        this.collectMsg = "虹膜采集服务连接失败，请检查是否安装插件！"
      });
    },
    // 断开虹膜采集websocket服务 
    disConnect() {
      EcIrisWs.disconnect();
    },
    // 采集虹膜
    handeCollect() {
      this.openIrisCamera();
    },
    // 打开采集摄像头
    async openIrisCamera() {
      const res = await axios.get("config/SDKConfig.json");
      const image_rotate = res.data.image_rotate || 0;
      EcIrisWs.openIrisCamera({image_rotate},() => {
        this.collectMsg = "采集虹膜..."
        EcIrisWs.previewImg((data) => {
          this.previewImgData ='data:image/jpeg;base64,' +  data;
        })
        EcIrisWs.startRegisterCap((imagedata, feature) => {
          let bioData = {
            imageBase64: imagedata,
            feature: feature
          };
          console.log(bioData);
          this.collectMsg = "虹膜采集成功";
          this.bioLoginForm.bioData = JSON.stringify(bioData);
          this.bioLogin();
          EcIrisWs.closeIrisCamera()
        },(data)=> {
          this.collectMsg = data[3];
        });
      }, (errCode, errMsg) => {
        this.collectMsg = `${errCode}:${errMsg},请返回重新登录！`
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
    img {
        width: 100%;
        height: 280px;
    }
}
.tips {
    width: 100%;
    height: 44px;
    margin-top: 14px;
    background: #FBFBFB;
    text-align: center;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #F57821;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 44px;
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