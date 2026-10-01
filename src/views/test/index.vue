<template>
    <div>
        <button @click="isShow">点我</button>
        <button @click="dialogTableVisible = true">点我</button>
        <TimePick :title="'编辑'" :ruleForms="ruleForms" :visible="visible" @close="isClose"/>
        <el-dialog title="编辑" :visible.sync="dialogTableVisible">
            <time-table :settingList="settingList" :gridData="gridData" @datas="datas" />
        </el-dialog>
        <div class="box">      
            <ul ref="ul">
                <transition-group name="fade">
                <li v-for="data in list" :key="data">{{data}}</li>
                </transition-group>
            </ul>
        </div>
        
    </div>
</template>
<script>
import TimePick from './TimePick.vue'
import TimeTable from './TimeTable.vue';
export default {
    components: {
        TimePick,
        TimeTable
    },
    mounted () {
        // setTimeout(() => {
        //     this.ruleForms = {
        //         timesName: "11111",
        //         signIn: "12:30",
        //         signOut: "12:30",
        //         lateNum: "",
        //         leaveNum: "",
        //         signInBegin: "",
        //         signInEnd: "",
        //         signOutBegin: "",
        //         signOutEnd: "",
        //         signInFlag: "",
        //         signOutFlag: "",
        //         // createBy: "",
        //         // updateBy: "",
        //         // createTime: "",
        //         // updateTime: "",
        //         // businessId: null,
        //         clockBegin: false,
        //         clockEnd: false,
        //         clockRef: ""
        //     }
        // }, 1000);
        setInterval(() => {
            this.list.unshift(this.list[this.list.length-1] + 1);
            this.list.pop();
            // const dom = document.querySelector('ul');
            // let topvalue = dom.style.transform;
            // dom.style.bottom = parseInt(topvalue)  + -50 + 'px';
            // setTimeout(() => {
            //    this.list.pop(); 
            // }, 500);
        }, 2000);
    },
   
    data () {
        return {
            list:[
                1,2,3,4
            ],
            dialogVisible:false,
            visible:false,
            ruleForms:{},
            checkList:[],
            dialogTableVisible:false,
              gridData: [
                {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: "203277172761920",
                    key: "Mon",
                    lateNum: null,
                    leaveNum: null,
                    parentId: "",
                    ruleId: null,
                    signIn: null,
                    signInBegin: null,
                    signInEnd: null,
                    signInFlag: null,
                    signOut: null,
                    signOutBegin: null,
                    signOutEnd: null,
                    signOutFlag: null,
                    timesName: null,
                    title: "周一",
                    week: "Mon",
                    weekFlag: true
                },
                {
                    clockBegin: "14:30",
                    clockEnd: "14:40",
                    clockRef: "0",
                    detailId: "203277172761920",
                    detailTimesId: "203277172761921",
                    id: "203277172761921",
                    key: "203277172761921",
                    lateNum: 1,
                    leaveNum: 1,
                    parentId: "203277172761920",
                    ruleId: null,
                    signIn: "08:00",
                    signInBegin: "07:30",
                    signInEnd: "08:30",
                    signInFlag: "T",
                    signOut: "09:00",
                    signOutBegin: "08:31",
                    signOutEnd: "08:59",
                    signOutFlag: "T",
                    timesName: "AAA",
                    title: "AAA",
                    week: "Mon",
                    weekFlag: false
                },
                {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: "203277172761920",
                    key: "Tue",
                    lateNum: null,
                    leaveNum: null,
                    parentId: "",
                    ruleId: null,
                    signIn: null,
                    signInBegin: null,
                    signInEnd: null,
                    signInFlag: null,
                    signOut: null,
                    signOutBegin: null,
                    signOutEnd: null,
                    signOutFlag: null,
                    timesName: null,
                    title: "周二",
                    week: "Tue",
                    weekFlag: true
                },
                {
                    clockBegin: "14:30",
                    clockEnd: "14:40",
                    clockRef: "0",
                    detailId: "212910030122309",
                    detailTimesId: "212910030122310",
                    id: "212910030122310",
                    key: "212910030122310",
                    lateNum: 1,
                    leaveNum: 1,
                    parentId: "212910030122309",
                    ruleId: null,
                    signIn: "08:00",
                    signInBegin: "07:30",
                    signInEnd: "08:30",
                    signInFlag: "T",
                    signOut: "09:00",
                    signOutBegin: "08:31",
                    signOutEnd: "08:59",
                    signOutFlag: "T",
                    timesName: "AAA",
                    title: "AAA",
                    week: "Tue",
                    weekFlag: false
                }
                
            ],
            // 选择时间段
            settingList:[{
                businessId: 1,
                clockBegin: "06:00",
                clockEnd: "08:30",
                clockRef: "0",
                createBy: "admin",
                createTime: "2021-04-08 10:33:46",
                id: "1379985790544728065",
                lateNum: 5,
                leaveNum: 5,
                signIn: "06:00",
                signInBegin: "06:00",
                signInEnd: "08:30",
                signInFlag: "T",
                signOut: "08:30",
                signOutBegin: "08:31",
                signOutEnd: "08:32",
                signOutFlag: "T",
                timesName: "早上上班",
                updateBy: "admin",
                updateTime: "2021-04-16 13:46:29"
                },
                {
                businessId: 2,
                clockBegin: "06:00",
                clockEnd: "08:30",
                clockRef: "0",
                createBy: "admin",
                createTime: "2021-04-08 10:33:46",
                id: "1379985790544728065",
                lateNum: 5,
                leaveNum: 5,
                signIn: "06:00",
                signInBegin: "06:00",
                signInEnd: "08:30",
                signInFlag: "T",
                signOut: "08:30",
                signOutBegin: "08:31",
                signOutEnd: "08:32",
                signOutFlag: "T",
                timesName: "晚上上班",
                updateBy: "admin",
                updateTime: "2021-04-16 13:46:29"
                }
            ]
        }
    },
    methods: {
        getColor() {
            return '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
        },
        isShow() {
            this.visible = true;
        },
        isClose(val) {
            this.visible = val;
        },
        open(val) {
            console.log(val);
            this.dialogVisible = val;
        },
        datas(val) {
            console.log(val);
        }
     
    }
  
}
</script>
<style lang="scss" scoped>
.box {
    position: relative;
    height: 160px;
    background-color: rgb(109, 114, 114);
    overflow: hidden;
    margin-top: 100px;
}
ul{
    width: 1200px;
    position: absolute;
    background-color: rgb(78, 112, 112);
    li {
        list-style: none;
        width: 100%;
        padding: 10px;
        background-color: antiquewhite;
        margin-top: 10px;
        height: 40px;
        transition: all .5s ;
        
    }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>