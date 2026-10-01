<template>
    <el-card class="box" shadow="hover">
        <div class="box-card">
            <div class="left">
            <div class="top">通行人员</div>
            <div class="middle"><countTo :startVal='startVal' :endVal='endVal' :duration="2000"></countTo><div class="unit">人</div></div>
            <div class="bottom">员工<span>{{employee}}</span>访客<span>{{visitor}}</span></div>
        </div>
        <div class="progress">
            <div class="pro_text">
                <div class="unit">员工</div>
                <div class="pro_num">{{percentage}}%</div>
            </div>
             <el-progress type="circle" color="#FAD337" :percentage="percentage" :width="160" stroke-linecap="butt" :show-text="false" :stroke-width="28" :format="format"></el-progress>
        </div>
        </div>
    </el-card>
</template>
<script>
import { getPersonPass } from "@/api/home/home.js"
export default {
    props:{
        isSocket:{
            type:Boolean
        }
    },
    watch: {
       isSocket:{
           handler() {
               this.getList();
           }
       } 
    },
    data () {
        return {
            // count开始
            startVal:0,
            // 通行人员总数
            employee:0,
            visitor:0,
            endVal:0,
            percentage:0
        }
    },
    mounted () {
        this.getList();
    },
    methods: {
        getList() {
            getPersonPass().then(({data})=> {
               this.endVal = data.employee + data.visitor;
               this.employee = data.employee;
               this.visitor = data.visitor;
               if(this.employee) {
                   this.percentage = parseInt((this.employee/this.endVal)*100);
               }else {
                   this.percentage = 0;
               }
               
            })
        },
        /** 进度条内部信息 */
        format(percentage) {
            return percentage + '%'
        }
    }
}
</script>
<style lang="scss" scoped>
.box {
    padding: 30px;
}
.box-card {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;
    
    .left {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        .top {
            font-family: PingFangSC-Medium;
            font-size: 16px;
            color: #333333;
            font-weight: 500;
        }
        .middle {
            font-family: PingFangSC-Medium;
            font-size: 44px;
            color: #333333;
            font-weight: 500;
            display: flex;
            .unit {
                font-family: PingFangSC-Medium;
                font-size: 16px;
                color: #333333;
                font-weight: 500;
                margin-left: 12px;
                align-self: flex-end;
                margin-bottom: 5px;
            }
        }
        
        .bottom {
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: #858585;
            font-weight: 400;
           span {
               margin: 0 10px; 
           }
        }
    }
    .progress {
            position: relative;
            .pro_text {
                position: absolute;
                z-index: 1000;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                .unit {
                    font-family: PingFangSC-Regular;
                    font-size: 14px;
                    color: #858585;
                    font-weight: 400;
                }
                .pro_num {
                    font-family: PingFangSC-Regular;
                    font-size: 24px;
                    color: #333333;
                    font-weight: 400;
                    margin-top: 10px;
                }
            }
        }
   
}
/deep/.el-card__body {
    padding: 0px !important;
}
</style>