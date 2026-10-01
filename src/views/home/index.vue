<template>
    <div class="app-container containers">
        <div class="title">
            <span>系统概况</span>
        </div>
        <!-- 系统概述 -->
        <el-row :gutter="20">
            <el-col :span="24">
                <System />
            </el-col>
        </el-row>
        <div class="title">
            <span>今日数据</span><div class="time">{{nowTime}}</div>
        </div>
        <!-- 今日数据 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <PeoplePass :isSocket="isSocket" />
            </el-col>
            <el-col :span="8">
                <DeviceCard />
            </el-col>
            <el-col :span="8">
                <JournalCard :isSocket="isSocket"/>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="16">
                <Passcurve :isSocket="isSocket"/>
            </el-col>
            <el-col :span="8">
                <div class="container">
                    <Topdevice :isSocket="isSocket"/>
                    <DeviceType />
                </div>
            </el-col>
        </el-row>
        <!-- 通行日志 -->
        <el-row>
            <el-col :span="24">
                <AccessLog @handleSocket="handleSocket" />
            </el-col>
        </el-row>
    </div>
</template>
<script>
import System from './module/Systems.vue'
import PeoplePass from './module/PeoplePass.vue';
import DeviceCard from './module/DeviceCard.vue';
import JournalCard from './module/JournalCard.vue';
import Passcurve from './module/Passcurve.vue';
import Topdevice from './module/Topdevice.vue';
import DeviceType from './module/DeviceType.vue';
import AccessLog from './module/AccessLog.vue';
import moment from 'moment';
export default {
    components: {
        // 系统概况组件
        System,
        // 今日数据--通行人员组件
        PeoplePass,
        // 今日数据--设备情况组件
        DeviceCard,
        // 今日数据--通行日志组件
        JournalCard,
        // 通行人员曲线组件
        Passcurve,
        // 热力设备排行榜组件
        Topdevice,
        // 在线设备分析组件
        DeviceType,
        // 通行日志表格组件
        AccessLog
    },
    data () {
        return {
            // 当前时间
            nowTime:moment().format("yyyy-MM-DD"),
            isSocket:true
        }
    },
    methods: {
        handleSocket() {
            this.isSocket  = !this.isSocket;
        }
    }
}
</script>
<style lang="scss" scoped>
/deep/ .el-card {
    border: none;
}
.containers {
    background-color: rgb(247, 247, 247);
}
.el-row {
    margin: 20px 0;
  }
   .title {
        display: flex;
        align-items: center;
        font-family: PingFangSC-Medium;
        font-size: 20px;
        color: #333333;
        font-weight: 500;
       .rectangle {
           width: 5px;
           height: 20px;
           border-radius: 2px;
           background-color: #409EFF;
       }
       span {
           margin-left: 10px;
           font-weight: bold;
           color: #303133;
       }
       .time {
            margin-left: 34px;
            align-self: flex-end;
            color: #606266;
            font-family: PingFangSC-Regular;
            font-size: 14px;
            font-weight: 400;
       }
   } 
</style>