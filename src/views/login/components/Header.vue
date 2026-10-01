<template>
    <div class="logos">
        <div class="logo">
            <img src="config/logo.png" @click="pushOfficialWebsite" alt="">
            <span v-if="titleShow">|</span>
            <div v-if="titleShow" class="logo_name" @click="pushReception">{{title}}</div>
        </div>
    </div>
</template>
<script>
/**
 * 该组件是登录头部组件
 */

export default {
    props:{
        title:{
            require:true,
            type:String,
            default:"多模态智慧管理云平台"
        },
        titleShow:{
            type:Boolean,
            default:true
        }
    },
    methods: {
        pushOfficialWebsite() {
            if(navigator.onLine) {
                window.open('https://eyecool.cn', '_blank');
            }
            
        },
        pushReception() {
            if(navigator.onLine) {
                window.open('https://trial.eyecool.cn/index', '_blank');
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.logos {
    display: flex;
    justify-content: center;
    height: 70px;
    background: #FFFFFF;
    box-shadow: 0px 6px 90px 0px rgba(0,0,0,0.08);
    .logo {
        width: 1200px;
        display: flex;
        align-items: center;
        img {
            cursor: pointer;
        }
        span {
            margin: 0 14px;
            font-size: 14px;
        }
        .logo_name {
            font-family: PingFangSC-Regular;
            font-size: 16px;
            color: #333333;
            letter-spacing: 0;
            font-weight: 400;
            cursor: pointer;
            transition: all .3s;
        }
        .logo_name:hover {
            color: rgb(245, 103, 4);
        }
}
}
</style>