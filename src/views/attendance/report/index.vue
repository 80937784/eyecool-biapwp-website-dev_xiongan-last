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
      <el-form-item label="人员id" prop="psnId">
        <el-input
          v-model="queryParams.psnId"
          placeholder="请输入人员id"
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
      <el-form-item label="部门id" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入部门id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入部门名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="证件号" prop="psnNo">
        <el-input
          v-model="queryParams.psnNo"
          placeholder="请输入证件号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="人员类型" prop="psnType">
        <el-select v-model="queryParams.psnType" placeholder="请选择人员类型" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="人员类型名称" prop="psnTypeName">
        <el-input
          v-model="queryParams.psnTypeName"
          placeholder="请输入人员类型名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时间段id" prop="detailTimesId">
        <el-input
          v-model="queryParams.detailTimesId"
          placeholder="请输入时间段id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="对应时段名称" prop="timesName">
        <el-input
          v-model="queryParams.timesName"
          placeholder="请输入对应时段名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上班时间" prop="signIn">
        <el-input
          v-model="queryParams.signIn"
          placeholder="请输入上班时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="下班时间" prop="signOut">
        <el-input
          v-model="queryParams.signOut"
          placeholder="请输入下班时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="签到时间" prop="signInTime">
        <el-input
          v-model="queryParams.signInTime"
          placeholder="请输入签到时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="签退时间" prop="signOutTime">
        <el-input
          v-model="queryParams.signOutTime"
          placeholder="请输入签退时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="打卡状态" prop="clockMark">
        <el-input
          v-model="queryParams.clockMark"
          placeholder="请输入打卡状态"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="打卡状态名称" prop="clockMarkName">
        <el-input
          v-model="queryParams.clockMarkName"
          placeholder="请输入打卡状态名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="租户ID" prop="tenantId">
        <el-input
          v-model="queryParams.tenantId"
          placeholder="请输入租户ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="allStatus">
        <el-select v-model="queryParams.allStatus" placeholder="请选择状态" clearable size="small">
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
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['attendance:report:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:report:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:report:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:report:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="reportList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="考勤日期" align="center" prop="atdDate" />
      <el-table-column label="人员id" align="center" prop="psnId" />
      <el-table-column label="人员标识" align="center" prop="psnUniqueId" />
      <el-table-column label="姓名" align="center" prop="psnName" />
      <el-table-column label="部门id" align="center" prop="deptId" />
      <el-table-column label="部门名称" align="center" prop="deptName" />
      <el-table-column label="证件号" align="center" prop="psnNo" />
      <el-table-column label="人员类型" align="center" prop="psnType" />
      <el-table-column label="人员类型名称" align="center" prop="psnTypeName" />
      <el-table-column label="时间段id" align="center" prop="detailTimesId" />
      <el-table-column label="对应时段名称" align="center" prop="timesName" />
      <el-table-column label="上班时间" align="center" prop="signIn" />
      <el-table-column label="下班时间" align="center" prop="signOut" />
      <el-table-column label="签到时间" align="center" prop="signInTime" />
      <el-table-column label="签退时间" align="center" prop="signOutTime" />
      <el-table-column label="打卡状态" align="center" prop="clockMark" />
      <el-table-column label="打卡状态名称" align="center" prop="clockMarkName" />
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="状态" align="center" prop="allStatus" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:report:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:report:remove']"
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

    <!-- 添加或修改个人考勤记录详情对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="考勤日期" prop="atdDate">
          <el-input v-model="form.atdDate" placeholder="请输入考勤日期" />
        </el-form-item>
        <el-form-item label="人员id" prop="psnId">
          <el-input v-model="form.psnId" placeholder="请输入人员id" />
        </el-form-item>
        <el-form-item label="人员标识" prop="psnUniqueId">
          <el-input v-model="form.psnUniqueId" placeholder="请输入人员标识" />
        </el-form-item>
        <el-form-item label="姓名" prop="psnName">
          <el-input v-model="form.psnName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门id" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入部门id" />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="证件号" prop="psnNo">
          <el-input v-model="form.psnNo" placeholder="请输入证件号" />
        </el-form-item>
        <el-form-item label="人员类型" prop="psnType">
          <el-select v-model="form.psnType" placeholder="请选择人员类型">
            <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>
        <el-form-item label="人员类型名称" prop="psnTypeName">
          <el-input v-model="form.psnTypeName" placeholder="请输入人员类型名称" />
        </el-form-item>
        <el-form-item label="时间段id" prop="detailTimesId">
          <el-input v-model="form.detailTimesId" placeholder="请输入时间段id" />
        </el-form-item>
        <el-form-item label="对应时段名称" prop="timesName">
          <el-input v-model="form.timesName" placeholder="请输入对应时段名称" />
        </el-form-item>
        <el-form-item label="上班时间" prop="signIn">
          <el-input v-model="form.signIn" placeholder="请输入上班时间" />
        </el-form-item>
        <el-form-item label="下班时间" prop="signOut">
          <el-input v-model="form.signOut" placeholder="请输入下班时间" />
        </el-form-item>
        <el-form-item label="签到时间" prop="signInTime">
          <el-input v-model="form.signInTime" placeholder="请输入签到时间" />
        </el-form-item>
        <el-form-item label="签退时间" prop="signOutTime">
          <el-input v-model="form.signOutTime" placeholder="请输入签退时间" />
        </el-form-item>
        <el-form-item label="打卡状态" prop="clockMark">
          <el-input v-model="form.clockMark" placeholder="请输入打卡状态" />
        </el-form-item>
        <el-form-item label="打卡状态名称" prop="clockMarkName">
          <el-input v-model="form.clockMarkName" placeholder="请输入打卡状态名称" />
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.allStatus">
            <el-radio label="1">请选择字典生成</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listReport, getReport, delReport, addReport, updateReport, exportReport } from "@/api/attendance/report";

export default {
  name: "Report",
  components: {
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
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 个人考勤记录详情表格数据
      reportList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
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
        allStatus: null
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
  },
  methods: {
    /** 查询个人考勤记录详情列表 */
    getList() {
      this.loading = true;
      listReport(this.queryParams).then(response => {
        this.reportList = response.rows;
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
        allStatus: "0"
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
      this.open = true;
      this.title = "添加个人考勤记录详情";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getReport(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改个人考勤记录详情";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateReport(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addReport(this.form).then(response => {
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
      this.$confirm('是否确认删除个人考勤记录详情编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delReport(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有个人考勤记录详情数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportReport(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
