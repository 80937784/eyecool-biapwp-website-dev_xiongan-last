<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
         
      <el-form-item label="选择部门" prop="deptId">
        <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width: 250px;" placeholder="请选择部门"  @keyup.enter.native="handleQuery" />
      </el-form-item>
   
        
      <el-form-item label="时间类型" prop="timeType">
        <treeselect v-model="queryParams.timeType" :options="timeTypeOptions" style="width: 250px;" >
        </treeselect>
      </el-form-item>
      <el-form-item label="选择季度"  v-if="sessionIf" prop="queryTime">
        <treeselect v-model="queryParams.queryTime" :options="seesionOptions" style="width: 250px;" >
        </treeselect> 
      </el-form-item> 
      <el-form-item label="选择月份"  v-if="monthIf" prop="queryTime" >
        <treeselect v-model="queryParams.queryTime" :options="monthOptions" style="width: 250px;" >
        </treeselect>
      </el-form-item>
      
      <el-form-item label="请求时间"  v-if="timesIf" >
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
 
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:rpt:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="rptList" >
    
 
      <el-table-column label="部门名称" align="center" prop="deptName" />
     
      

      <el-table-column label="考勤出勤率" align="center"  >
        <template slot-scope="scope"   >
          <div  style="color:green;" v-if="scope.row.color0 ">
               100%
          </div>
          <div style="color:red;" v-if="!scope.row.color0">
             {{scope.row.attendance}}
         </div>
         <div style="color:red;" v-if="!scope.row.color0">
          {{scope.row.resultScript0}}
         </div>
         
        </template>
       </el-table-column>
       <el-table-column label="考勤正常率" align="center"  >
        <template slot-scope="scope"   >
          
          <div  style="color:green;" v-if="scope.row.color1 ">
                100%
          </div>
         
          <div style="color:red;" v-if="!scope.row.color1 ">
            {{scope.row.status}} <br />  {{scope.row.resultScript1}}
         </div>
        
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

  </div>
</template>

<script>
import {listRptEveryOne, listRpt, getRpt, delRpt, addRpt, updateRpt, listRptDept,exportDeptRate } from "@/api/attendance/rpt";
import Treeselect from "@riophae/vue-treeselect";
	import "@riophae/vue-treeselect/dist/vue-treeselect.css";
	import { treeselect } from "@/api/system/dept";
export default {
  name: "Rpt",
  components: {Treeselect},
  data() {
    return {
      // column数组
      everyList:[],
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 个人考勤记录标识表格数据
      rptList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      deptOptions: undefined,
      timesIf:false,
      sessionIf:false,
       monthIf:true,  
      timeTypeOptions:[{'label':'按月查询','id':0},{'label':'按季度查询','id':1},{'label':'按时间段查询','id':2}],
      monthOptions:[{'label':'一月份','id':1},{'label':'二月份','id':2},{'label':'三月份','id':3},{'label':'四月份','id':4},{'label':'五月份','id':5},{'label':'六月份','id':6},
      {'label':'七月份','id':7},{'label':'八月份','id':8},{'label':'九月份','id':9},{'label':'十月份','id':10},{'label':'十一月份','id':11},{'label':'十二月份','id':12}],
      seesionOptions:[{'label':'第一季度','id':1},{'label':'第二季度','id':2},{'label':'第三季度','id':3},{'label':'第四季度','id':4}],
       // 日期范围
       dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        atdDate: null,
        psnId: null,
        psnUniqueId: null,
        psnName: null,
        deptId: null,
        deptName: null,
        psnNo: null,
        psnType: null,
        psnTypeName: null,
        detailTimesId: null,
        timesName: null,
        clockMark0: null,
        clockMark1: null,
        clockMark2: null,
        clockMark3: null,
        tenantId: null,
        attendance:null,
        status:null,
        timeType:0,
        queryTime:null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        psnId: [
          { required: true, message: "人员id不能为空", trigger: "blur" }
        ],
        psnUniqueId: [
          { required: true, message: "人员标识不能为空", trigger: "blur" }
        ],
      }
    };
  }, 
  watch:{
    'queryParams.timeType':"changeTimeTypeF"
  },
  created() {
    this.getList();
    this.getTreeselect();
  },
  methods: {
    changeTimeTypeF(timeType){
      this.queryParams.queryTime = null ;
     if(timeType==0){
      // monthIf sessionIf  timesIf
      this.monthIf = true;
      this.sessionIf = false;
      this.timesIf = false;
     }else if(timeType ==1){
      this.monthIf = false;
      this.sessionIf = true;
      this.timesIf = false;
     }else if(timeType == 2){
      this.monthIf = false;
      this.sessionIf = false;
      this.timesIf = true;
     }
    },
    /** 查询个人考勤记录标识列表 */
    getList() {
      this.loading = true;
      let _this = this ;
        debugger;
        listRptDept( this.addDateRange(this.queryParams, this.dateRange)).then(response => {
              debugger;
              console.log("_this.dateRange.length="+_this.dateRange.length);
          if(_this.dateRange.length == 0 && _this.timesIf ){
            // monthIf sessionIf  timesIf
            _this.dateRange.push(response.rows[0].start);
            _this.dateRange.push(response.rows[0].end);
          }
          debugger;
          if(_this.queryParams.queryTime == null){
            _this.queryParams.queryTime = response.rows[0].queryTime;
          }
        if(response.rows[0].atdDate ==null ){
          _this.total = 0;
          _this.rptList = [];
        }else{
          _this.rptList = response.rows;
          _this.total = response.total;
        }
               
        _this.loading = false;
      });
    },
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
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
        atdDate: null,
        psnId: null,
        psnUniqueId: null,
        psnName: null,
        deptId: null,
        deptName: null,
        psnNo: null,
        psnType: null,
        psnTypeName: null,
        detailTimesId: null,
        timesName: null,
        clockMark0: null,
        clockMark1: null,
        clockMark2: null,
        clockMark3: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        tenantId: null
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
      this.dateRange = [];
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
      this.open = true;
      this.title = "添加个人考勤记录标识";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRpt(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改个人考勤记录标识";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRpt(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRpt(this.form).then(response => {
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
      this.$confirm('是否确认删除个人考勤记录标识编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delRpt(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      debugger;
      const queryParams = this.addDateRange(this.queryParams, this.dateRange) ;//this.queryParams;
      // let  params = this.$qs.stringify(queryParams);
      this.$confirm('是否确认导出部门考勤率记录标识数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportDeptRate(queryParams);
        }).then(response => {
          debugger;
          this.download(response.msg);
        })
    }
  }
};
</script>
