<template>
    <el-card shadow="hover" class="box-card">
        <el-row :gutter="20">
            <el-col :span="6">
                <div class="message"><div class="left"><img :src="require('@/assets/homeimg/scene.png')" alt=""></div><div class="right"><div class="name">场景总数</div> <div class="span"><countTo :startVal='startVal' :endVal='sceneNum' :duration="2000"></countTo></div></div></div>
            </el-col>
            <el-col :span="6">
                <div class="message"><div class="left"><img :src="require('@/assets/homeimg/device.png')" alt=""></div><div class="right"><div class="name">设备总数</div> <div class="span"><countTo :startVal='startVal' :endVal='deviceNum' :duration="2000"></countTo></div></div></div>
            </el-col>
            <el-col :span="6">
                <div class="message"><div class="left"><img :src="require('@/assets/homeimg/person.png')" alt=""></div><div class="right"><div class="name">人员总数</div> <div class="span"><countTo :startVal='startVal' :endVal='personNum' :duration="2000"></countTo></div></div></div>
            </el-col>
            <el-col :span="6">
                <div class="message"><div class="left"><img :src="require('@/assets/homeimg/user.png')" alt=""></div><div class="right"><div class="name">用户总数</div> <div class="span"><countTo :startVal='startVal' :endVal='peopleNum' :duration="2000"></countTo></div></div></div>
            </el-col>
        </el-row>
    </el-card>
</template>
<script>
import {getSceneAll,getDeviceAll,getPersonAll,getUserAll} from "@/api/home/home.js"
export default {
    data () {
        return {
            // count开始时数据
            startVal:0,
            // 场景总数
            sceneNum:0,
            // 设备总数
            deviceNum:0,
            // 人员总数
            personNum:0,
            // 用户总数
            peopleNum:0
        }
    },
    mounted() {
        this.getList();
    },
    methods: {
        getList() {
            getSceneAll().then(({data})=> {
                this.sceneNum = data;
            })
            getDeviceAll().then(({data})=> {
                this.deviceNum = data;
            })
            getPersonAll().then(({data})=> {
                this.personNum = data;
            })
            getUserAll().then(({data})=> {
                this.peopleNum = data;
            })         
        }
    }
}
</script>
<style lang="scss" scoped>
.box-card {
    padding: 33px 90px;
    box-sizing: border-box;
    color: #606266;
}
/deep/.el-card__body {
    padding: 0px !important;
}
.message {
    display: flex;
    align-items: center;
    .left {
        img{
            width: 54px;
            height: 54px;
        }
    }
    .right {
        margin-left: 26px;
        .name {
            font-family: PingFangSC-Regular;
            font-size: 16px;
            color: #858585;
            font-weight: 400;
        }
        .span {
            font-family: PingFangSC-Medium;
            font-size: 32px;
            color: #333333;
            font-weight: 500;
            margin-top: 5px;
        }
    }
    
}
</style>