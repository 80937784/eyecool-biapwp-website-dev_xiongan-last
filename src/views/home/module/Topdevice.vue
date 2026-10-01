<template>
<el-card shadow="hover" class="box-card">
  <div slot="header" class="clearfix">
    <span>热门设备排行榜</span>
    <span style="margin-left:10px;color:#FF6700;font-weight:bold">TOP5</span>
  </div>
  <el-table
      :row-style="{'height':'30px'}"
      size="mini"
      :data="tableData"
      style="width: 100%">
      <el-table-column
        prop="date"
        label="排名"
        align="center"
        width="100">
       <template slot-scope="scope">
         <div class="rank" :style="getStyle(scope.$index)">
           {{scope.$index+1}}
         </div>
       </template>
      </el-table-column>
      <el-table-column
        prop="deviceName"
        label="设备名称"
        align="center">
      </el-table-column>
      <el-table-column
        prop="logNum"
        align="center"
        label="日志数量">
      </el-table-column>
    </el-table>
  <!-- <div class="title"><span>设备名称</span><span>日志数量</span></div>
  <div v-for="(item,index) in list" :key="index" class="item" :style="getBackground(index)">
    <span><i>{{index+1}}</i> {{item.deviceName}}</span><span class="item_right"><countTo :startVal='startVal' :endVal="parseInt(item.logNum)" :duration="2000"></countTo></span>
  </div> -->
</el-card>    
</template>
<script>
import { getHotDevice } from "@/api/home/home.js"
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
        // count开始数据
        startVal:0,
        // 日志数量
        endVal:18,
        tableData:[]
      }
    },
    mounted () {
        this.getList();
    },
    methods: {
      getList() {
        getHotDevice().then(({data})=> {
          this.tableData = data;
        })
      },
      getStyle(index) {
        switch (index) {
          case 0:
            return {
              'backgroundColor':'#FF6700',
              'color':'#fff'
            }
            break;
          case 1:
            return {
              'backgroundColor':'#FCAB02',
              'color':'#fff'
            }
            break;
          case 2:
            return {
              'backgroundColor':'#E5E6E7',
              'color':'#fff'
            }
            break;
          default:
            return {
              'backgroundColor':'#FFFFFF',
              'color':' #333333'
            }
            break;
        }
      },
      /** 根据热力排行渲染不同颜色数据 */
      getBackground(item) {
        switch (item) {
          case 0:
            return {
              "color":"#fd5959"
            }
            break;
          case 1:
            return {
              "color":"#fc6b6b"
            }
            break;
          case 2:
            return {
              "color":"#ff8888"
            }
            break;
          case 3:
            return {
              "color":"#ff9a9a"
            }
            break;
          case 4:
            return {
              "color":"#faafaf"
            }
            break;
          default:
            break;
        }
      }
    }
}
</script>
<style lang="scss" scoped>
/deep/ .el-table__header-wrapper {
  background-color: #FAFAFA ;
  height: 38px;
}
/deep/.el-card__header {
  padding-bottom: 0px;
  padding: 0;
}
/deep/ .el-card__body {
  padding: 0;
}
.box-card {
    height: 320px;
    padding: 24px;
}
/deep/ .el-card__header {
    border: none;
}
.rank {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  line-height: 20px;
  text-align: center;
  margin-left: 30px;
}
.table {
  height: 38px;
}
.title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    box-sizing: border-box;
    color:#909399;
    font-size: 14px;
}
.clearfix {
  font-family: PingFangSC-Medium;
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}
.item {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    padding: 2px 10px;
    box-sizing: border-box;
    font-weight: 600;
    border-radius: 5px;
    font-size: 14px;
    i {
        font-style: normal;
        margin-right: 10px;
    }
    .item_right {
        padding-right: 20px;
        box-sizing: border-box;
    }
}
</style>