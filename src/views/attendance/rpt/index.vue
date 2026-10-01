<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="考勤日期" prop="atdDate">
        <el-input
          v-model="queryParams.atdDate"
          placeholder="请输入考勤日期"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
     
      <el-form-item label="人员标识" prop="psnUniqueId">
        <el-input
          v-model="queryParams.psnUniqueId"
          placeholder="请输入人员标识"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="psnName">
        <el-input
          v-model="queryParams.psnName"
          placeholder="请输入姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
    
      <el-form-item label="选择部门" prop="deptId">
        <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width: 250px;" placeholder="请选择部门"  @keyup.enter.native="handleQuery" />
      </el-form-item>
   
      <el-form-item label="人员类型" prop="psnType">
        <el-select v-model="queryParams.psnType" placeholder="请选择人员类型" clearable size="small">
          <el-option label="全部" value="" />
          <el-option label="普通人员" value="0" />
          <el-option label="白名单" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="考勤结果" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择考勤结果" clearable size="small">
          <el-option label="全部" value="" />
          <el-option label="正常" value="T" />
          <el-option label="异常" value="F" />
          <el-option label="正常（智能）" value="A" />
        </el-select>
      </el-form-item>

      <el-form-item label="出勤情况" prop="attendance">
        <el-select v-model="queryParams.attendance" placeholder="请选择出勤情况" clearable size="small">
          <el-option label="全部" value="" />
          <el-option label="出勤" value="0" />
          <el-option label="缺勤" value="7" /> 
        </el-select>
      </el-form-item>
      <el-form-item label="请求时间">
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

    <el-table v-loading="loading" border :data="rptList" @selection-change="handleSelectionChange">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <!-- <el-table-column label="id" align="center" prop="id" /> -->
      <el-table-column label="考勤日期" align="center" prop="atdDate" />
      <!-- <el-table-column label="人员id" align="center" prop="psnId" /> -->
      <el-table-column label="人员标识" align="center" prop="psnUniqueId" />
      <el-table-column label="姓名" align="center" prop="psnName" />
      <!-- <el-table-column label="部门id" align="center" prop="deptId" /> -->
      <el-table-column label="部门名称" align="center" prop="deptName" />
      <!-- <el-table-column label="人员编号" align="center" prop="psnNo" />
      <el-table-column label="人员类型" align="center" prop="psnType" /> -->
      <el-table-column label="人员类型名称" align="center" prop="psnTypeName" />
      <!-- <el-table-column label="时间段id" align="center" prop="detailTimesId" /> -->
      <el-table-column label="打卡情况" align="center"  >
       <template slot-scope="scope"   >
         <div  style="color:green;" v-if="scope.row.color0">
           {{scope.row.resultScript0}}
         </div>
         <div style="color:red;" v-if="!scope.row.color0">
          {{scope.row.resultScript0}}
        </div>
        <div  style="color:green;" v-if="scope.row.color1">
          {{scope.row.resultScript1}}
        </div>
        <div style="color:red;" v-if="!scope.row.color1">
         {{scope.row.resultScript1}}
       </div>
       <div  style="color:green;" v-if="scope.row.color2">
        {{scope.row.resultScript2}}
       </div>
       <div style="color:red;" v-if="!scope.row.color2">
        {{scope.row.resultScript2}}
        </div>
        <div  style="color:green;" v-if="scope.row.color3">
         {{scope.row.resultScript3}}
         </div>
         <div style="color:red;" v-if="!scope.row.color3">
           {{scope.row.resultScript3}}
          </div>
          <div  style="color:green;" v-if="scope.row.color4">
          {{scope.row.resultScript4}}
          </div>
          <div style="color:red;" v-if="!scope.row.color4">
          {{scope.row.resultScript4}}
         </div>
         <div  style="color:green;" v-if="scope.row.color5">
          {{scope.row.resultScript5}}
          </div>
          <div style="color:red;" v-if="!scope.row.color5">
          {{scope.row.resultScript5}}
         </div>
        </template>  
      </el-table-column>

      <el-table-column label="出勤情况" align="center"  >
        <template slot-scope="scope"   >
          <div  style="color:green;" v-if="scope.row.attendance== '0' ">
               出勤
          </div>
          <div style="color:red;" v-if="scope.row.attendance =='7' ">
             缺勤
         </div>
        </template>
       </el-table-column>
       <el-table-column label="结果" align="center"  >
        <template slot-scope="scope"   >
          <div  style="color:green;" v-if="scope.row.status== 'T' ">
               正常
          </div>
          <div  style="color:green;" v-if="scope.row.status== 'A' ">
            正常(智能)
       </div>
          <div style="color:red;" v-if="scope.row.status =='F' ">
             异常
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
import { listRpt, getRpt, delRpt, addRpt, updateRpt, exportRpt } from "@/api/attendance/rpt";
import Treeselect from "@riophae/vue-treeselect";
	import "@riophae/vue-treeselect/dist/vue-treeselect.css";
	import { treeselect } from "@/api/system/dept";
export default {
  name: "Rpt",
  components: {Treeselect},
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
        status:null
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
  created() {
    this.getList();
    this.getTreeselect();
  },
  methods: {
    /** 查询个人考勤记录标识列表 */
    getList() {
      this.loading = true;
      //listRpt(this.queryParams).then(response => {
        debugger;
        listRpt( this.addDateRange(this.queryParams, this.dateRange)).then(response => {
       
        this.rptList = response.rows;
        this.total = response.total;
        this.loading = false;
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
      this.dateRange = [];
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
      const queryParams = this.addDateRange(this.queryParams, this.dateRange) ;//this.queryParams;
      this.$confirm('是否确认导出所有个人考勤记录标识数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          debugger;
          return exportRpt(queryParams);
        }).then(response => {
          debugger;
          this.download(response.msg);
        })
    }
  }
};
</script>
