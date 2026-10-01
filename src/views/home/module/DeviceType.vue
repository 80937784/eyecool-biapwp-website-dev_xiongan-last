<template>
<el-card shadow="hover" class="box-card">
  <div slot="header" class="clearfix">
    <span class="text">在线设备分析</span>
    <el-button-group style="float: right; ">
        <el-button @click="getList" :class="isActive?'active':''" :autofocus="true" size="mini">型号</el-button>
        <el-button @click="getTypeList" :class="isActive?'':'active'" size="mini">类型</el-button>
    </el-button-group>
  </div>
    <div id="box" style="width:100%;height:240px"></div>
</el-card>    
</template>
<script>
import * as echarts from 'echarts';
import { getOnlineModelAnalysis,getOnlineTypeAnalysis } from "@/api/home/home.js"
export default {
    data () {
        const formatter = (name)=> {
            if(name.slice(0,5) == "Atlas"){
                return "Atlas" + "\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0" + getValue(name);
            }
           return name + "\xa0\xa0\xa0\xa0\xa0\xa0" + getValue(name);
        }
        const getValue = (name)=> {
            let arr = this.option.series[0].data;
            let str = "";
            arr.forEach(item=> {
                if(item.name == name) {
                    str = item.value
                }
            });
            return str;
        }
        return {
            isActive:true,
            deviceArr:{},
            type:[],
            // echarts实例
            myChart:null,
            // echarts配置项
            option: {
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    top: '30%',
                    left: '65%',
                    data:[],
                    formatter:formatter
                },
                series: [
                    {
                        name: '在线设备分析',
                        type: 'pie',
                        radius: ['55%', '90%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        center:['30%','50%'],
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '20'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: []
                    }
                ]
            }     
        }
    },
    mounted () {
        this.getDicts('client_device_type').then(({data})=> {
            this.type = data.map(item=>item.dictLabel);
        })
        this.getList();
    },
    methods: {
        /** echarts初始化并添加监听事件保证在浏览器可视范围改变时不会变形 */
        echartsInit() {
            var chartDom = document.getElementById('box');
            this.myChart = echarts.init(chartDom);
            this.myChart.setOption(this.option);
            window.addEventListener('resize',()=> {
                this.myChart.resize();
            }); 
        },
        getList() {
            this.isActive = true;
            getOnlineModelAnalysis().then(({data})=> {
                this.deviceArr = data;
                 let keys = Object.keys(data);
                 let values = Object.values(data);
                 let arr = [];
                 for (const key in data) {
                     arr.push({name:key,value:data[key],icon:'circle'})
                 }
                 this.option.legend.data = arr;
                 this.option.series[0].data = arr;
                 this.echartsInit();
            })
        },
        async getTypeList() {
            this.isActive = false;
            const type = await this.getDicts('client_device_type');
            const {data} = await getOnlineTypeAnalysis();

            let keys = Object.keys(data);
            type.data.forEach(item=> {
                keys.forEach(items=> {
                    if(item.dictSort == items) {
                        items = item.dictLabel
                    }
                })
            });
            
            let arr = [];
            for (const key in data) {
                arr.push({name:this.getDeciveName(key,type.data),value:data[key],icon:'circle'})
            };
            this.option.legend.data = arr;
            this.option.series[0].data = arr;
            this.echartsInit();
        },
        getDeciveName(index,obj) {
            for (const item of obj) {
               if(item.dictSort == index) {
                   return item.dictLabel
               }
            }
        }
    }
}
</script>
<style lang="scss" scoped>
.active {
    color: rgb(24, 144, 255);
    background-color: rgb(230, 243, 255);
    border-color: rgb(24, 144, 255);
}
.box-card {
    margin-top: 20px;
    height: 328px;
    padding: 24px;
}
.text {
    display: inline-block;
    padding-top: 3px;
    box-sizing: border-box;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;
    font-weight: 500;
}
/deep/ .el-card__header {
    border: none;
    padding: 0;
}
/deep/ .el-card__body {
    padding: 0;
}
</style>