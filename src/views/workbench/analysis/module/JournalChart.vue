<template>
  <el-card shadow="hover" class="card">
    <div slot="header" class="clearfix">
        <div class="box">
            <span class="title">通行日志统计</span>
        <div class="time">
            <div class="date">{{lastTime}}---{{nowTime}}</div>
            <span>|</span>
            <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
                {{downName}}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="week">最近七天</el-dropdown-item>
                <el-dropdown-item command="halfMonth">最近半月</el-dropdown-item>
                <el-dropdown-item command="month">最近一月</el-dropdown-item>
            </el-dropdown-menu>
            </el-dropdown>
        </div>
        </div> 
    </div>
    <div class="boxs">
        <div class="head">单位：次</div>
      <!-- echarts图表 -->
       <div id="journa"></div>
    </div>
  </el-card>
</template>
<script>
import * as echarts from 'echarts';
import {mapState} from 'vuex';
import {getTradelog} from '@/api/wookbench/index.js';
export default {
    watch: {
        /** 通过监控完成因sidebar折叠而变形的echarts问题 */
        'sidebar.opened'(val){
            setTimeout(() => {
                this.myChart.resize();
            }, 200);
        }  
    },
  computed: {
     ...mapState({
          sidebar:(state)=> state.app.sidebar
      })  
  },
  mounted() {
    this.selectDaysChange("最近半月",16);
    window.addEventListener('resize',()=> {
        this.myChart.resize();
    })
  },
    data () {
      return {
        downName:"",
        nowTime:this.moment().subtract(1,'d').format("yyyy-MM-DD"),
        lastTime:this.moment().subtract(8,'d').format("yyyy-MM-DD"),
        // echarts实例
        myChart:null,
        // echarts配置项
        option: {
            grid:{
                top:"40px",
                left:"40px",
                right:"40px",
                bottom:"40px"
            },
            legend:{
                data:['总数','通过','未通过'],
            },
            tooltip : {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            xAxis: {
                type: 'category',
                data: [],
                boundaryGap: false,
                axisLine:{
                    lineStyle:{
                        color:"#858585",
                        type:"dashed"
                    }
                },
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
                        type:"dashed"
                    }
                }
            },
            series: [
                {
                    data: [],
                    type: 'line',
                    barGap:'0%',
                    name:'总数',
                    symbolSize:8,
                    itemStyle:{
                        normal:{
                            color:'#409EFF'
                        }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    areaStyle: {
                        opacity:0.1
                    }
               },
                {
                    data: [],
                    type: 'line',
                    name:'通过',
                    symbolSize:8,
                    itemStyle:{
                        normal:{
                            color:'#67C23A'
                        }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    areaStyle: {
                        opacity:0.1
                    }
               },
               {
                    data: [],
                    type: 'line',
                    name:'未通过',
                    symbolSize:8,
                    itemStyle:{
                    normal:{
                        color:'orange'
                    }
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    areaStyle: {
                        opacity:0.1
                    }
               },            
               ]
        }
      }
    },
    methods: {
        /** 获取数据 */
        async getList(days,arr) {
            let newArr = arr.map(item=> {
                return {
                    statisticDate:item,
                    tradeNum:0,
                    notpassNum:0,
                    passNum:0
                }
            });
            const {data} = await getTradelog({statisticUnit:'day',startDate:this.lastTime,endDate:this.nowTime});
            console.log(data);
            newArr.forEach(item=> {
                data.forEach(day=> {
                    if(item.statisticDate == day.statisticDate) {
                        item.tradeNum = day.tradeNum;
                        item.notpassNum = day.notpassNum;
                        item.passNum = day.passNum;
                    }
                })
            });
            this.option.series[0].data = newArr.map(item=>item.tradeNum);
            this.option.series[1].data = newArr.map(item=>item.passNum);
            this.option.series[2].data = newArr.map(item=>item.notpassNum);
            this.getEcharts();
        },
        /** echarts初始化 */
        getEcharts() {
            this.$nextTick(()=> {
                var chartDom = document.getElementById('journa');
                this.myChart = echarts.init(chartDom);
                this.myChart.setOption(this.option);
            })     
        },
        /** 下拉选择事件范围 */
        selectDaysChange(name,days) {
            this.downName = name;
            this.lastTime = this.moment().subtract(days,'d').format("YYYY-MM-DD");
            let arr = [];
            for (let i = 0; i < days; i++) {
               arr.push(this.moment().subtract(i+1,'d').format("YYYY-MM-DD"));
            }
            console.log(arr);
            this.option.xAxis.data = arr.reverse();
            this.getList(days,arr);
        },
        /** 下拉选择 */
        handleCommand(command) {
           switch (command) {
                case 'week':
                    this.selectDaysChange("最近七天",8);
                    break;
                case 'halfMonth':
                    this.selectDaysChange("最近半月",16);
                    break;
                case 'month':
                    this.selectDaysChange("最近一月",31);
                    break;
                default:
                    break;
           }
        }
    }
};
</script>
<style lang="scss" scoped>
#journa {
  width: 100%;
  height: 400px;
}
.card {
    padding: 24px;
}
/deep/ .el-card__header {
  border: none;
  padding: 0;
}
/deep/ .el-card__body {
  padding: 0;
}
.title {
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;
    font-weight: 500;
}
.box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
}
.time {
    display: flex;
    align-items: center;
    font-family: PingFangSC-Regular;
    font-size: 16px;
    color: #858585;
    font-weight: 400;
    cursor: pointer;
    
    span{
        margin: 0 10px;
    }
    i {
        margin-left: 5px;
    }
}
.head {
    font-family: PingFangSC-Regular;
    font-size: 12px;
    color: #858585;
    text-align: left;
    font-weight: 400;
    padding: 0 10px;
    box-sizing: border-box;
}
</style>
