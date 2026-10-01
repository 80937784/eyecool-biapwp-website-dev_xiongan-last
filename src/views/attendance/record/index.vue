<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="考勤日期" prop="atdDate">
        <el-input
          v-model="queryParams.atdDate"
          placeholder="请输入考勤日期"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
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
 
        <el-form-item label="部门" prop="deptId">
          <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width: 250px;" placeholder="请选择部门"  @keyup.enter.native="handleQuery" />
        </el-form-item> 
     
     
     
      <el-form-item label="记录状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择记录状态" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
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
          v-hasPermi="['attendance:record:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="部门名称" align="center" prop="deptName" />
      <el-table-column label="姓名" align="center" prop="psnName" />
      <el-table-column label="考勤日期" align="center" prop="atdDate" />
      <el-table-column label="人员标识" align="center" prop="psnUniqueId" />
      <el-table-column label="规则名称" align="center" prop="timesName" />
      <el-table-column label="上班时间" align="center" prop="signIn" />
      <el-table-column label="下班时间" align="center" prop="signOut" />
      <el-table-column label="签到时间" align="center" prop="signInTime" />
      <el-table-column label="签退时间" align="center" prop="signOutTime" />
  
      <!-- <el-table-column label="打卡状态" align="center" prop="clockMark" />
      <el-table-column label="打卡状态名称" align="center" prop="clockMarkName" /> -->
      <!-- <el-table-column label="租户ID" align="center" prop="tenantId" /> -->
      <el-table-column label="记录状态" align="center" style="color: green;" prop="status" :formatter="statusFormat" />
      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:record:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:record:remove']"
          >删除</el-button>
        </template>
      </el-table-column> -->
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
   import Treeselect from "@riophae/vue-treeselect";
	import "@riophae/vue-treeselect/dist/vue-treeselect.css";
	import { treeselect } from "@/api/system/dept";
import { listRecord, getRecord, delRecord, addRecord, updateRecord, exportRecord } from "@/api/attendance/record";

export default {
  name: "Record",
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
      // 考勤记录表格数据
      recordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      deptIdOptionsSelect:[],
      deptOptions: undefined,
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
        signIn: null,
        signOut: null,
        signInTime: null,
        signOutTime: null,
        clockMark: null,
        clockMarkName: null,
        tenantId: null,
        status: null
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
    /** 查询考勤记录列表 */
    getList() {
      this.loading = true;
      listRecord(this.queryParams).then(response => {
        this.recordList = response.rows;
        this.total = response.total;
        this.loading = false;
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
        signIn: null,
        signOut: null,
        signInTime: null,
        signOutTime: null,
        clockMark: null,
        clockMarkName: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        tenantId: null,
        status: "0"
      };
      this.resetForm("form");
    },
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
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
      this.open = true;
      this.title = "添加考勤记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRecord(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改考勤记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRecord(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addRecord(this.form).then(response => {
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
      this.$confirm('是否确认删除考勤记录编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delRecord(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有考勤记录数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportRecord(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    },
    statusFormat(row, column){
      if(row.status =="T" || row.status =="A"){
        return '正常' ;
       }else if(row.status =="F"){
         return "异常";
       }else{
         return "";
       }
      
    },
  }
};
</script>
