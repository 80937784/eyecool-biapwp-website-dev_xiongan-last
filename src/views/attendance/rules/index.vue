<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="规则名称" prop="ruleName">
        <el-input
          v-model="queryParams.ruleName"
          placeholder="请输入规则名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['attendance:rules:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:rules:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:rules:remove']"
        >删除</el-button>
      </el-col>
   
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="rulesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="规则名称" align="center" prop="ruleName" />
      <el-table-column label="智能模式" align="center" prop="smartMode" width="110" >
      <template slot-scope="scope">
        <el-switch @change="handleChangeBioMode(scope.row, 'smartMode')" v-model="scope.row.smartMode" active-color="#13ce66" inactive-color="#ccc" active-value="T" inactive-value="F">
        </el-switch>
      </template>
      </el-table-column>
     
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:rules:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:rules:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改考勤规则对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1250px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="智能模式" prop="smartMode">
          <el-select v-model="form.smartMode" placeholder="请选择假期类型">
            <el-option v-for="item in availableOptions" :key="item.value" :label="item.label"
            :value="item.value" >
            </el-option>
          </el-select>
          <br/> 说明:启用后同一天相邻时间段签退和签到如无记录，且第一个时间段签到和最后一个时间段的签退正常，则全天正常。如不满足则还是按照时间段单独判断。
        </el-form-item>
         <!--  还是说 这这里引进你写的模板就可行了呢 -->
         <time-table :settingList="settingList" :gridData="gridData" @datas="datas" v-if="isRouterAlive" ></time-table>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listRules, getRules, delRules, addRules, updateRules, exportRules,updateSmartMode,getRulesAllTimesSetting } from "@/api/attendance/rules";
import TimeTable from './TimeTable'
export default {
  name: "Rules",
  components: {TimeTable},
  provide () {
    return {
      reload: this.reload
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      isRouterAlive: true,
      smartMode:'T', 
      // 自组件数据
      timeChildData:null,
      // 显示搜索条件
      showSearch: true,
      gridData:[],
         gridDataNew: [
                {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: null,
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
                    weekFlag: true,
                    weekCheck:true
                },
                {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id:  null,
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
                    weekFlag: true,
                    weekCheck:true
                },
                 {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: null,
                    key: "Wed",
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
                    title: "周三",
                    week: "Wed",
                    weekFlag: true,
                    weekCheck:true
                }, {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: null,
                    key: "Thu",
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
                    title: "周四",
                    week: "Thu",
                    weekFlag: true,
                    weekCheck:true
                }, {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id:  null,
                    key: "Fri",
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
                    title: "周五",
                    week: "Fri",
                    weekFlag: true,
                    weekCheck:true
                }, {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: null,
                    key: "Sat",
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
                    title: "周六",
                    week: "Sat",
                    weekFlag: false,
                    weekCheck:true
                }, {
                    clockBegin: null,
                    clockEnd: null,
                    clockRef: null,
                    detailId: null,
                    detailTimesId: null,
                    id: null,
                    key: "Sun",
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
                    title: "周日",
                    week: "Sun",
                    weekFlag: false,
                    weekCheck:true
                },
                
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
            ],
      // 总条数
      total: 0,
      // 考勤规则表格数据
      rulesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ruleName: null,
        smartMode: null,
        tenantId: null
      },
      availableOptions: [{
                    value: "T",
                    label: "启用"
                }, {
                    value: "F",
                    label: "禁用"
                }],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        ruleName: [
          { required: true, message: "请输入规则名称", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
    this.init_getRulesAllTimesSetting();
  },
  methods: {
    reload () {
      this.isRouterAlive = false
      this.$nextTick(function () {
        this.isRouterAlive = true
      })
    },
    /** 查询考勤规则列表 */
    getList() {
      this.loading = true;
      listRules(this.queryParams).then(response => {
        this.rulesList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
         // 随机数生成
         randomn(n) {
            let res = ''
            for (; res.length < n; res +=Math.random().toString(36).substr(2).toUpperCase()) {}
            return res.substr(0, n)
        },
    // 取消按钮
    cancel() {  
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        ruleName: null,
        smartMode: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        tenantId: null,
        atdRuleDetailsList:[]
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() { 
      this.reset();
      this.form.smartMode ="T";
      this.open = true;
      this.title = "添加考勤规则";
      this.gridData =[];
      this.gridDataNew.forEach( d=>{
          d.id = this.randomn(18);
      });
         
      this.gridData = this.gridDataNew;
      this.reload();
    },
    /** 修改按钮操作 */
    handleUpdate(row) { 
      this.gridData =[];
      this.reset();
      const id = row.id || this.ids
      getRules(id).then(response => {
        this.form = response.data;
        debugger;
        this.gridData = response.data.atdRuleDetailsList;
      //  debugger;
       // console.log(JSON.stringify(this.gridData));
       setTimeout(() => {
        this.open = true;
       }, 100);
       this.title = "修改考勤规则";
       this.reload();
      });
    },
    init_getRulesAllTimesSetting(){
      getRulesAllTimesSetting().then(response => {
        // debugger;
        this.settingList = response.data;
        
      });
    },
    datas(val) {
      this.timeChildData = val;
    },
    /** 提交按钮 */
    submitForm() { 
      // debugger;
     console.log(this.timeChildData);
     console.log(JSON.stringify(this.timeChildData));
      let data =this.timeChildData.newGridData;
           let week1EnableSwitch = false;
           let week2EnableSwitch = false;
           let week3EnableSwitch = false;
           let week4EnableSwitch = false;
           let week5EnableSwitch = false;
           let week6EnableSwitch = false;
           let week7EnableSwitch = false;
      data.forEach(d =>{
            debugger;
           if(d.weekCheck && d.week == 'Mon' ){
               if(this.timeChildData.week1EnableSwitch){
                   d.activeFlag ="T";
               }else{
                   d.activeFlag ="F";
               }
           }else if(d.weekCheck && d.week == 'Tue' ){
               if(this.timeChildData.week2EnableSwitch){
                d.activeFlag ="T";
               }else{
                d.activeFlag ="F";
               }
           }else if(d.weekCheck && d.week == 'Wed' ){
               if(this.timeChildData.week3EnableSwitch){
                d.activeFlag ="T";
               }else{
                d.activeFlag ="F";
               }
           }else if(d.weekCheck && d.week  == 'Thu' ){
               if(this.timeChildData.week4EnableSwitch){
                d.activeFlag ="T";
               }else{
                d.activeFlag ="F";
               }
           }else if(d.weekCheck && d.week  == 'Fri' ){
               if(this.timeChildData.week5EnableSwitch){
                d.activeFlag ="T";
               }else{
                d.activeFlag ="F";
               }
           }else if(d.weekCheck &&d.week == 'Sat' ){
               if(this.timeChildData.week6EnableSwitch){
                d.activeFlag ="T";
               }else{
                d.activeFlag ="F";
               }
           }else if(d.weekCheck && d.week  == 'Sun' ){
               if(this.timeChildData.week7EnableSwitch){
                d.activeFlag ="T";
               }else{
                d.activeFlag ="F";
               }
           }
           if(typeof d.weekCheck === 'undefined'){
                // debugger;
                d.weekCheck = false;
                // console.log(d);
           }

           if(!d.weekCheck){
                if(d.week == 'Mon'){ 
                  week1EnableSwitch = true;
                }else if (d.week == 'Tue'){ 
                  week2EnableSwitch = true;
                }else if (d.week == 'Wed'){ 
                  week3EnableSwitch = true;
                }else if (d.week == 'Thu'){ 
                  week4EnableSwitch = true;
                }else if (d.week == 'Fri'){ 
                  week5EnableSwitch = true;
                }else if (d.week == 'Sat'){ 
                  week6EnableSwitch = true;
                }else if (d.week == 'Sun'){ 
                  week7EnableSwitch = true;
                }
           }
        });
        if(!week1EnableSwitch){
          // 周一
          this.msgError("请设置周一考勤时间再提交");
          return false;
        }
        if(!week2EnableSwitch){
          // 周一
          this.msgError("请设置周二考勤时间再提交");
          return false;
        }
        if(!week3EnableSwitch){
          // 周一
          this.msgError("请设置周三考勤时间再提交");
          return false;
        }
        if(!week4EnableSwitch){
          // 周一
          this.msgError("请设置周四考勤时间再提交");
          return false;
        }
        if(!week5EnableSwitch){
          // 周一
          this.msgError("请设置周五考勤时间再提交");
          return false;
        }
        if(!week6EnableSwitch){
          // 周一
          this.msgError("请设置周六考勤时间再提交");
            return false;
        }
        if(!week7EnableSwitch){
          // 周一
          this.msgError("请设置周日考勤时间再提交");
          return false;
        }
        this.form.atdRuleDetailsList = data;
      //return
      // console.log(this.datas);
      // console.log(JSON.stringify(this.datas));
      
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRules(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRules(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除考勤规则编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delRules(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有考勤规则数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportRules(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    },
    handleChangeBioMode(row, mode) {
      this.$confirm('是否确认修改模式?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
      
        updateRules(row).then(response => {
            this.msgSuccess("修改成功");
              this.open = false;
              // setTimeout(() => {
              // this.getList();
              // }, 1000);
             
            });

      }).then(response => {
      //   setTimeout(() => {
      //   this.getList();
      //  }, 1000);
        this.msgSuccess("切换成功");
      }).catch(() => {
        row[mode] = row[mode] === "0" ? "1" : "0";
      });
    },
  }
};
</script>
