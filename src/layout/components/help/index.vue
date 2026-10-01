<template>
 <transition name="el-zoom-in-center">
    <div v-if="show" class="container">
        <div class="help-header">帮助引导 <i class="el-icon-close" @click="handleClose"></i></div>
        <div class="help-body">
            <div class="help-step">
                <div class="step-left">
                    <img src="@/assets/image/guide-first.png"/>
                    <div class="step-line"></div>
                </div>
                <div class="step-right">
                     <div class="title">第1步：人员管理</div>
                     <div class="content">
                        <div class="content-item"><img src="@/assets/image/guide-one.png" /><span>在【基础数据】→【人员信息】菜单下，新增人员，并录入人员基础信息。</span></div>
                        <div class="content-item margin"><img src="@/assets/image/guide-two.png" /><span>同时，采集人员的生物信息（人脸、指纹、虹膜、多模态等）。</span></div>
                     </div>
                     <div class="tips">说明：需要实现一个完整的业务流程，需先创建人员基础信息和生物信息。</div>
                </div>
            </div>
            <div class="help-step">
                <div class="step-left">
                    <img src="@/assets/image/guide-scend.png"/>
                    <div class="step-line" style="height:282px"></div>
                </div>
                <div class="step-right">
                     <div class="title">第2步：场景管理</div>
                     <div class="content">
                        <div class="content-item"><img src="@/assets/image/guide-one.png" /><span>在【场景接入】→【场景管理】菜单下，依次新增场景、子场景。</span></div>
                        <div class="content-item margin"><img src="@/assets/image/guide-two.png" /><span>场景、子场景创建好之后，在【场景人员】菜单下，将人员先加入到业务场景下，保存之后，再将人员加入到业务场景-子场景下。</span></div>
                     </div>
                     <div class="tips">说明：场景、子场景代表实际区域的虚拟名称；虚拟场景的设置目的，是为了把【人员】和【设备】关联到一个场景下，让【该场景下的人员】有权限通行【该场景下的设备】。</div>
                </div>
            </div>
            <div class="help-step">
                <div class="step-left">
                    <img src="@/assets/image/guide-third.png"/>
                </div>
                <div class="step-right">
                     <div class="title">第3步：设备管理</div>
                     <div class="content">
                        <div class="content-item"><img src="@/assets/image/guide-one.png" /><span>添加设备：在【眼神智慧云】微信小程序里把设备添加到平台。</span></div>
                        <div class="content-item margin"><img src="@/assets/image/guide-two.png" /><span>添加应用：在平台【应用系统】→【应用信息】菜单下，新增一个应用，并给该应用授权所需接口（建议全量接口授权）；此应用会同步生成一对【Appkey和AppSecrect】。</span></div>
                        <div class="content-item margin"><img src="@/assets/image/guide-three.png" /><span>参数下发：在【设备管理】→【设备参数】→【参数下发】菜单下，先选择设备，再选择参数【Appkey和AppSecrect】，将第②步生成的【Appkey和AppSecrect】值复制粘贴到参数输入框中，保存完成参数下发。</span></div>
                     </div>
                     <div class="tips">说明：在平台创建场景和子场景后，使用小程序往平台添加设备，并在添加设备时选择设备需要加入的场景和子场景；把【Appkey和AppSecrect】参数下发给设备的目的，是为了给平台和设备建立通讯桥梁，平台的人员可以下发给设备，设备的识别日志可以回传给平台。</div>
                </div>
            </div>
        </div>
    </div>
</transition>
</template>
<script>
export default {
    props:["open"],
    watch:{
       open(val) {
        this.show = val;
       } 
    },
    data() {
        return {
           show:false, 
        }
    },
    methods: {
        handleClose() {
            this.show = false;
            this.$emit("close");
        }
    },
}
</script>
<style lang="scss" scoped>
.container {
    position: fixed;
    right: 10px;
    top: 26px;
    bottom: 26px;
    width: 378px;
    background: #FFFFFF;
    box-shadow: 0px 0px 10px 0px rgba(184,177,177,0.46);
    border-radius: 16px;
    z-index: 1000;
    overflow: hidden;
    .help-header {
        height: 70px;
        line-height: 70px;
        text-align: center;
        position: relative;
        font-family: PingFangSC-Medium;
        font-size: 22px;
        color: #FFFFFF;
        border-radius: 16px 16px 0 0;
        background-image: linear-gradient(-39deg, #45BEFF 0%, #2189FF 100%);
        font-weight: 500;
        i {
            color: white;
            right: 22px;
            top: 18px;
            position: absolute;
            font-size: 16px;
            cursor: pointer;
            &:hover {
                color: rgb(235, 235, 235);
            }
        }
    }
    .help-body {
        height: 800px;
        overflow: auto;
        padding: 30px;
        box-sizing: border-box;
        .help-step {
            display: flex;
            .step-left {
                display: flex;
                flex-direction: column;
                align-items: center;
                img {
                    width: 30px;
                    height: 30px;
                }
                .step-line {
                    height: 213px;
                    border-left: 1px dashed #E8F1FF;
                }
            }
            .step-right {
                margin-left: 21px;
                width: 100%;
                .title {
                    font-family: PingFangSC-Semibold;
                    font-size: 18px;
                    color: #515A6E;
                    font-weight: 600;
                    margin-top: 4px;
                }
                .content {
                    width: 100%;
                    // height: 118px;
                    background: rgba(243,244,246,0.5);
                    border-radius: 8px;
                    margin-top: 16px;
                    padding: 18px 14px;
                    box-sizing: border-box;
                    .margin {
                        margin-top: 14px;
                    }
                    .content-item {
                        display: flex;
                        img {
                        width: 16px;
                        height: 16px;
                        margin-top: 4px;
                        }
                        span {
                            font-family: PingFangSC-Regular;
                            font-size: 12px;
                            color: #636B7C;
                            text-align: justify;
                            font-weight: 400;
                            margin-left: 10px;
                            white-space: pre-wrap;
                            line-height: 18px;
                        }
                    }
                    
                }
                .tips {
                    opacity: 0.6;
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: #636B7C;
                    text-align: justify;
                    font-weight: 400;
                    margin-top: 16px;
                    line-height: 18px;
                }
            }
        }
    }
}
/** 浏览器滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 10px;
  background: rgb(247, 247, 247);
}
::-webkit-scrollbar-button {
  width: 0px;
  height: 0px;
}
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border: none !important;
  -webkit-border-radius: 4px;
          border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0,0,0,0.1);
}
::-webkit-scrollbar-track {
  background-color: transparent;
//   border: none !important;
}
::-webkit-scrollbar-track:hover {
  background-color: rgba(0,0,0,0.1);
}
::-webkit-scrollbar-track:active {
  background-color: rgba(0,0,0,0.1);
}
::-webkit-scrollbar-corner {
  background: transparent;
}
</style>