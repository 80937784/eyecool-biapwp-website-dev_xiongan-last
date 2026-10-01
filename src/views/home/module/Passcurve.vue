<template>
    <div>
        <el-card shadow="hover" class="box-card">
        <div slot="header" class="clearfix">
            <span class="title">通行人员时间曲线</span>
            <span class="right">今日通行人员：<countTo :startVal='startVal' :endVal='endVal' :duration="2000"></countTo>人</span>
        </div>
        <div class="body">
            <div class="units">单位：人</div>
            <div id="echart" style="width: 100%;height:560px;" class="text"></div>
        </div>
        
        </el-card>
    </div>    
</template>
<script>
import * as echarts from 'echarts';
import {mapState} from 'vuex';
import { getPeoplePassCurve,getPersonPass } from "@/api/home/home.js"
export default {
    props:{
        isSocket:{
            type:Boolean
        }
    },
    mounted () {
        // 初始化echarts
        this.getList();
        // 屏幕改变时进行echarts重绘
        window.addEventListener('resize',()=> {
            this.myChart.resize();
        });
    },
    watch: {
        /** 监听siderbar的折叠事件，实现echarts的重绘 */
        'sidebar.opened'(val){
          // 添加延时器保证在折叠完成后进行重绘，否则重绘先执行，无法改变echarts变形状态
          setTimeout(() => {
              this.myChart.resize();
          }, 200);
        },
        isSocket:{
            handler() {
                this.getList();
            }
        } 
    },
    computed: {
      ...mapState({
          sidebar:(state)=> state.app.sidebar
      }) 
    },
    data () {
        return {
            // count开始数据
            startVal:0,
            // 今日通行人员
            endVal:0,
            // echarts实例
            myChart:null,
            // echarts配置项
            option:{
                legend: {
                    data: ['员工']
                },
                xAxis: {
                    type: 'category',
                    data: ['0-2时', '2-4时', '4-6时', '6-8时', '8-10时', '10-12时', '12-14时', '14-16时', '16-18时', '18-20时', '20-22时', '22-24时'],
                    axisLine:{
                        lineStyle:{
                            color:"#858585",
                            type:"dotted"
                        }
                    },
                    axisLabel:{
                        textStyle:{
                            color:'#999'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    axisLine:{
                        show:false
                    },
                    axisTick:{
                        show:false
                    },
                    splitLine:{
                    lineStyle:{
                        type:"dotted"
                        }
                    },
                    minInterval:1
                },
                series: [{
                    name:"员工",
                    data: [],
                    type: 'line',
                    symbolSize:8,
                    itemStyle:{
                        normal:{
                            color:'#3AA0FF',
                            lineStyle:{
                                color:'#1890ff'
                            }
                        }
                    },
                    areaStyle: {
                        opacity:0.1
                    }
                }],
                grid:{
                    top:"20px",
                    left:"30px",
                    right:"30px",
                    bottom:"35px"
                },
                tooltip : {
                    trigger: 'axis',
                    backgroundColor:'#eee',
                    padding:15,
                    textStyle:{
                        color:'#858585'
                    },
                     formatter:(param)=> {
                         return param[0].marker + " " + param[0].seriesName + param[0].data + "人"
                     },
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                }
            }
        }
    },
    methods: {
        /** 初始化echarts */
        echartsInit() {
            var chartDom = document.getElementById('echart');
            this.myChart = echarts.init(chartDom);
            this.myChart.setOption(this.option)    
        },
        getList() {
            getPeoplePassCurve().then(({data})=> {
                this.option.series[0].data = Object.values(data);
                this.echartsInit();
            });
            getPersonPass().then(({data})=> {
                this.endVal = data.employee + data.visitor;
            })
        }
    }
}
</script>
<style lang="scss" scoped>
.box-card {
    padding: 24px;
}
/deep/ .el-card__header {
    border: none;
    padding: 0;
}
/deep/.el-card__body {
    padding: 0px !important;
}
.units {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #858585;
    text-align: left;
    font-weight: 400;
    margin-top: 8px;
}
.title {
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;
    font-weight: 500;
}
.right {
    float: right;
    margin-right: 20px;
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #858585;
    font-weight: 400;
}
</style>