<template>
<el-card shadow="hover" class="box-card">
  <div slot="header" class="clearfix">
    <span>通行日志</span>
    <span class="time">{{nowDate}}</span>
  </div>
  <!-- 通行日志动态表格 -->
  <el-table
    :data="tableData"
    size="medium"
    :row-style="{'height':'50px'}"
    style="width: 100%;">
    <el-table-column prop="personName" align="center" label="人员姓名" width="180">
       <template slot-scope="scope">
        {{scope.row.tenantId?scope.row.personName? scope.row.personName:"陌生人":""}}
      </template>
    </el-table-column>
    <el-table-column prop="deviceName" label="设备名称" align="center" width="180"></el-table-column>
    <el-table-column prop="deviceAddr" align="center" label="地理位置">
       <template slot-scope="scope">
        {{scope.row.tenantId? scope.row.deviceAddr? scope.row.deviceAddr:"暂无位置" : ""}}
      </template>
    </el-table-column>
    <el-table-column prop="result" align="center" label="通过结果">
       <template slot-scope="scope">
         <div class="result">
           <div v-if="scope.row.result" :style="{'backgroundColor' : scope.row.result == '1'? '#FF6600':'#1890FF'}" class="circle"></div>
          <span>{{scope.row.result ? scope.row.result == "1"? "未通过":"通过" : ""}}</span>
         </div>
         
      </template>
    </el-table-column>
    <el-table-column prop="receivedTime" align="center" label="通行时间">
    </el-table-column>
  </el-table>
</el-card>    
</template>
<script>
import {mapGetters} from 'vuex';
import moment from 'moment';
import {getPassData} from '@/api/home/home.js'
export default {
    computed: {
      ...mapGetters(['tenantEnabled','tenant'])
    },
    mounted () {
      this.getList();
    },
    methods: {
      async getList() {
        const {data} = await getPassData();
        if( data.length < 10 ) {
          let index = 10 - data.length;
          for (let i = 0; i < index; i++) {
            data.push({});
          }
        }
        console.log(data);
        this.tableData = data;
        // this.handleWebsocket();
      },
      handleWebsocket() {
        if('WebSocket' in window) {
          let isHttps = location.protocol.indexOf('https') === 0;
          let socketProtocol = isHttps ? 'wss://' : 'ws://';
          let tenantId = this.tenantEnabled ? this.tenant.tenantId : 'common-cli';
          this.websocket = new WebSocket(socketProtocol +  location.host + '/websocket/' + tenantId);
          console.log(222);
          // websocket = new WebSocket(socketProtocol +  '192.168.60.126:8701' + '/websocket/' + tenantId)
        }else {
          this.msgError("该浏览器不支持websocket通信");
          return;
        };
        this.websocket.onopen = function() {
          console.log("建立连接");
        };
        this.websocket.onclose = ()=> {
        }
        this.websocket.onmessage = (event)=> {
          this.$emit("handleSocket");
          console.log("连接成功");
          if(event.data != "连接成功") {
            let obj = JSON.parse(event.data);
            obj.receivedTime = moment(event.data.receivedTime).format("yyyy-MM-DD HH:mm:ss")
            this.tableData.unshift(obj);
            this.tableData.pop();
          }
        }
        this.websocket.onerror = ()=> {
          this.msgError("websocket连接错误,请刷新页面重新连接")
        }
      }
    },
    destroyed () {
        this.websocket.close();
    },
    data () {
        return {
            nowDate:moment().format("yyyy-MM-DD"),
            tableData: [],
            websocket:null
        }
    }
}
</script>
<style lang="scss" scoped>
.result {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
}
.circle {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 12px;
}
.box-card {
  padding: 24px;
}
/deep/ .el-card__header {
  border: none;
  padding: 0;
}
/deep/ .el-card__body {
  padding: 0;
}
.clearfix {
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;
    font-weight: 500;
    .time {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: #858585;
        font-weight: 400;
        margin-left: 10px;
    }
}
.table {
  height: 80px;
}
</style>