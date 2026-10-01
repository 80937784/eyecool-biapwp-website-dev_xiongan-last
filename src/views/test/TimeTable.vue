<template>
<div>
    <el-table :data="newGridData">
        <el-table-column property="title" label="时间段名称">
            <template  slot-scope="scope">
                <el-tag v-if="scope.row.weekFlag && (scope.row.week =='Mon' || scope.row.week =='Tue' || scope.row.week =='Wed' || scope.row.week =='Thu' || scope.row.week =='Fri')" type="success">{{scope.row.title}}</el-tag>
                <el-tag v-else-if="scope.row.weekFlag && (scope.row.week =='Sat' || scope.row.week =='Sun')">{{scope.row.title}}</el-tag>
                <span v-else>{{scope.row.title}}</span>
            </template>
        </el-table-column>
        <el-table-column property="signIn" label="上班时间"></el-table-column>
        <el-table-column property="signOut" label="下班时间"></el-table-column>
        <el-table-column property="signInBegin" label="开始签到"></el-table-column>
        <el-table-column property="signInEnd" label="结束签到"></el-table-column>
        <el-table-column property="signOutBegin" label="开始签退"></el-table-column>
        <el-table-column property="signOutEnd" label="结束签退"></el-table-column>
        <el-table-column property="confirm" width="200px" label="操作">
            <template v-if="scope.row.weekFlag" slot-scope="scope">
                <el-button @click="openSetting(scope.row)" type="text">设置</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button @click="clearSome(scope.row.week)" type="text">清除</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-switch
                v-model="week1EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'MON'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
                <el-switch
                v-model="week2EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'TUE'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
                <el-switch
                v-model="week3EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'WED'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
                <el-switch
                v-model="week4EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'THU'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
                <el-switch
                v-model="week5EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'FIR'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
                <el-switch
                v-model="week6EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'SAT'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
                <el-switch
                v-model="week7EnableSwitch"
                v-if=" scope.row.week.toUpperCase() == 'SUN'"
                class="switchStyle"
                :width="80"
                active-text="启用"
                inactive-text="停用">
                </el-switch>
            </template>
        </el-table-column>
    </el-table>
     <!-- 设置弹出框 -->
        <el-dialog
            title="选择时间段"
            :append-to-body="true"
            :visible.sync="dialogVisible"
            width="30%">
         <el-checkbox-group v-model="checkList">
            <el-checkbox v-for="(data,index) in list" :key="index" :label="data">{{`${data.timesName}-(${data.signIn}~${data.signOut})`}}</el-checkbox>
        </el-checkbox-group>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="checkSure">确 定</el-button>
        </span>
    </el-dialog>
</div>
</template>
<script>

export default {
    props:{
        settingList:{
            require:true,
            type:Array
        },
        gridData:{
            require:true,
            type:Array
        }
        
    },
    watch: {
        settingList:{
            handler(val) {
                this.list = val;
            },
            immediate:true
        },
        $data:{
            handler(val) {
                this.$emit('datas',val); 
            },
            deep:true 
        }
    },
    mounted () {
        // 获取表格数据
        this.newGridData = this.gridData;
        this.week1EnableSwitch = true;
        this.week2EnableSwitch = true;
        this.week3EnableSwitch = true;
        this.week4EnableSwitch = true;
        this.week5EnableSwitch = true;
        this.week6EnableSwitch = true;
        this.week7EnableSwitch = true; 
    },
    data () {
        return {
            // 多选框数据
            checkList:[],
            list:[],
            value1: true,
            week:null,
            // 表格数据
            // gridData: [],
            newGridData:[],
            // 设置弹出框的控制
            dialogVisible:false,
            week1EnableSwitch: true,
            week2EnableSwitch: true,
            week3EnableSwitch: true,
            week4EnableSwitch: true,
            week5EnableSwitch: true,
            week6EnableSwitch: true,
            week7EnableSwitch: true,
        }
    },
    methods: {
        // 清除
        clearSome(id) {
            this.newGridData = this.newGridData.filter(item=>item.weekFlag || item.week != id)
        },
        clearCheckbox() {
            this.checkList = [];
        },
        // 设置
        openSetting(data) {
            this.week = data.week;
            this.dialogVisible = true;
        },
        // 选择时间确定
        checkSure() {      
            if(!this.checkList.length){
                this.dialogVisible = false;
                return;
            }
            this.clearSome(this.week);
            this.changeList();
            this.clearCheckbox();
            this.dialogVisible = false;
        },
        // 通过checklist改变表格数据
        changeList() {
            let indexs;
            this.newGridData.forEach((item,index)=> {
                if(item.week == this.week) {
                    indexs = index
                }
            });
            let headArr = [];
            let footerArr = [];
            let arr = [];
            let parentObj = this.getObjByWeek(this.week); 
            headArr = this.newGridData.filter((item,index)=>index <= indexs);
            footerArr = this.newGridData.filter((item,index)=>index > indexs);
            arr = this.checkList.map(item=>{
                return {
                    id:this.randomn(8),
                    key:this.randomn(8),
                    title:item.timesName,
                    parentId:parentObj.id,
                    weekFlag:false,
                    week:parentObj.week,
                    ruleId:parentObj.ruleId,
                    detailId:'',
                    detailTimesId:'',
                    timesName:item.timesName,
                    signIn:item.signIn,
                    signOut:item.signOut,
                    lateNum:item.lateNum,
                    leaveNum:item.leaveNum,
                    signInBegin:item.signInBegin,
                    signInEnd:item.signInEnd,
                    signOutBegin:item.signOutBegin,
                    signOutEnd:item.signOutEnd,
                    signInFlag:item.signInFlag,
                    signOutFlag:item.signOutFlag,
                    clockBegin:item.clockBegin,
                    clockEnd:item.clockEnd,
                    clockRef:item.clockRef
                }
            })
            this.newGridData = [...headArr,...arr,...footerArr]
            console.log(headArr,footerArr);
        },
        // 随机数生成
        randomn(n) {
            let res = ''
            for (; res.length < n; res += Math.random().toString(36).substr(2).toUpperCase()) {}
            return res.substr(0, n)
        },
        // week获取obj
        getObjByWeek(week) {
        var obj = {};
        this.newGridData.forEach(item => {
          if (item.week == week) {
            obj = item;
          }
        });
        return obj;
      },
    }
}
</script>
<style scoped lang="scss">
/deep/ .el-dialog__wrapper {
    z-index: 100000 !important;
}
/deep/ .switchStyle .el-switch__label {
  position: absolute;
  display: none;
  color: #fff;
  
}
/deep/ .switchStyle .el-switch__label--left {
  z-index: 9;
  left: 6px;
  
}
/deep/ .switchStyle .el-switch__label--right {
  z-index: 9;
  left: -8px;
}
/deep/ .switchStyle .el-switch__label.is-active {
  display: block;
}
/deep/ .switchStyle.el-switch .el-switch__core,
.el-switch .el-switch__label {
  width: 50px !important;
  font-size: 10px !important;
}
/deep/ .cell{
    text-align: center;
}
</style>