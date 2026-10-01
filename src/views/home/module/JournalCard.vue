<template>
    <el-card class="box" shadow="hover">
        <div class="box-card">
            <div class="left">
            <div class="top">通行日志</div>
            <div class="middle"><countTo :startVal='startVal' :endVal='endVal' :duration="2000"></countTo><div class="unit">次</div></div>
            <div class="bottom">通过<span>{{passCount}}</span>未通过<span>{{unPassCount}}</span></div>
        </div>
        <div class="progress">
            <div class="pro_text">
                <div class="unit">通过</div>
                <div class="pro_num">{{percentage}}%</div>
            </div>
            <el-progress type="circle" color="#3AA0FF" :percentage="percentage" :width="160" stroke-linecap="butt" :show-text="false" :stroke-width="28" :format="format"></el-progress>
        </div>
        </div>
    </el-card>
</template>
<script>
import { getTradelog } from "@/api/home/home.js"
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
    methods: {
        /** 进度条内部信息 */
        format(percentage) {
            return percentage + '%'
        },
       getList() {
            getTradelog().then(({data})=> {
              this.endVal = data.count;
              this.passCount = data.passCount;
              this.unPassCount = data.unPassCount;
              if(this.passCount) {
                  this.percentage = parseInt((this.passCount/this.endVal)*100);
              }else {
                  this.percentage = 0;
              }
              
            })
        }, 
    },
    mounted () {
      this.getList();  
    },
    data () {
        return {
            startVal:0,
            // 通行日志数量
            endVal:0,
            passCount:0,
            unPassCount:0,
            percentage:0
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