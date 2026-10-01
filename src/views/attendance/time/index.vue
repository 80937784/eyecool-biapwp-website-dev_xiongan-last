<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="detail_id" prop="detailId">
        <el-input
          v-model="queryParams.detailId"
          placeholder="请输入detail_id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="时段名称" prop="timesName">
        <el-input
          v-model="queryParams.timesName"
          placeholder="请输入时段名称"
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
      <el-form-item label="记迟到时间" prop="lateNum">
        <el-input
          v-model="queryParams.lateNum"
          placeholder="请输入记迟到时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="记早退时间" prop="leaveNum">
        <el-input
          v-model="queryParams.leaveNum"
          placeholder="请输入记早退时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始签到时间" prop="signInBegin">
        <el-input
          v-model="queryParams.signInBegin"
          placeholder="请输入开始签到时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结束签到时间" prop="signInEnd">
        <el-input
          v-model="queryParams.signInEnd"
          placeholder="请输入结束签到时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始签退时间" prop="signOutBegin">
        <el-input
          v-model="queryParams.signOutBegin"
          placeholder="请输入开始签退时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结束签退时间结束签退时间" prop="signOutEnd">
        <el-input
          v-model="queryParams.signOutEnd"
          placeholder="请输入结束签退时间结束签退时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="必须签到" prop="signInFlag">
        <el-input
          v-model="queryParams.signInFlag"
          placeholder="请输入必须签到"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="必须签到" prop="signOutFlag">
        <el-input
          v-model="queryParams.signOutFlag"
          placeholder="请输入必须签到"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商户id" prop="businessId">
        <el-input
          v-model="queryParams.businessId"
          placeholder="请输入商户id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="打卡开始时间" prop="clockBegin">
        <el-input
          v-model="queryParams.clockBegin"
          placeholder="请输入打卡开始时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="打卡结束时间" prop="clockEnd">
        <el-input
          v-model="queryParams.clockEnd"
          placeholder="请输入打卡结束时间"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参考规则" prop="clockRef">
        <el-input
          v-model="queryParams.clockRef"
          placeholder="请输入参考规则"
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
          v-hasPermi="['attendance:time:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:time:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:time:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:time:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="timeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="detail_id" align="center" prop="detailId" />
      <el-table-column label="时段名称" align="center" prop="timesName" />
      <el-table-column label="上班时间" align="center" prop="signIn" />
      <el-table-column label="下班时间" align="center" prop="signOut" />
      <el-table-column label="记迟到时间" align="center" prop="lateNum" />
      <el-table-column label="记早退时间" align="center" prop="leaveNum" />
      <el-table-column label="开始签到时间" align="center" prop="signInBegin" />
      <el-table-column label="结束签到时间" align="center" prop="signInEnd" />
      <el-table-column label="开始签退时间" align="center" prop="signOutBegin" />
      <el-table-column label="结束签退时间结束签退时间" align="center" prop="signOutEnd" />
      <el-table-column label="必须签到" align="center" prop="signInFlag" />
      <el-table-column label="必须签到" align="center" prop="signOutFlag" />
      <el-table-column label="商户id" align="center" prop="businessId" />
      <el-table-column label="打卡开始时间" align="center" prop="clockBegin" />
      <el-table-column label="打卡结束时间" align="center" prop="clockEnd" />
      <el-table-column label="参考规则" align="center" prop="clockRef" />
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:time:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:time:remove']"
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

    <!-- 添加或修改每个考勤规则对应的详情时间段信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="detail_id" prop="detailId">
          <el-input v-model="form.detailId" placeholder="请输入detail_id" />
        </el-form-item>
        <el-form-item label="时段名称" prop="timesName">
          <el-input v-model="form.timesName" placeholder="请输入时段名称" />
        </el-form-item>
        <el-form-item label="上班时间" prop="signIn">
          <el-input v-model="form.signIn" placeholder="请输入上班时间" />
        </el-form-item>
        <el-form-item label="下班时间" prop="signOut">
          <el-input v-model="form.signOut" placeholder="请输入下班时间" />
        </el-form-item>
        <el-form-item label="记迟到时间" prop="lateNum">
          <el-input v-model="form.lateNum" placeholder="请输入记迟到时间" />
        </el-form-item>
        <el-form-item label="记早退时间" prop="leaveNum">
          <el-input v-model="form.leaveNum" placeholder="请输入记早退时间" />
        </el-form-item>
        <el-form-item label="开始签到时间" prop="signInBegin">
          <el-input v-model="form.signInBegin" placeholder="请输入开始签到时间" />
        </el-form-item>
        <el-form-item label="结束签到时间" prop="signInEnd">
          <el-input v-model="form.signInEnd" placeholder="请输入结束签到时间" />
        </el-form-item>
        <el-form-item label="开始签退时间" prop="signOutBegin">
          <el-input v-model="form.signOutBegin" placeholder="请输入开始签退时间" />
        </el-form-item>
        <el-form-item label="结束签退时间结束签退时间" prop="signOutEnd">
          <el-input v-model="form.signOutEnd" placeholder="请输入结束签退时间结束签退时间" />
        </el-form-item>
        <el-form-item label="必须签到" prop="signInFlag">
          <el-input v-model="form.signInFlag" placeholder="请输入必须签到" />
        </el-form-item>
        <el-form-item label="必须签到" prop="signOutFlag">
          <el-input v-model="form.signOutFlag" placeholder="请输入必须签到" />
        </el-form-item>
        <el-form-item label="商户id" prop="businessId">
          <el-input v-model="form.businessId" placeholder="请输入商户id" />
        </el-form-item>
        <el-form-item label="打卡开始时间" prop="clockBegin">
          <el-input v-model="form.clockBegin" placeholder="请输入打卡开始时间" />
        </el-form-item>
        <el-form-item label="打卡结束时间" prop="clockEnd">
          <el-input v-model="form.clockEnd" placeholder="请输入打卡结束时间" />
        </el-form-item>
        <el-form-item label="参考规则" prop="clockRef">
          <el-input v-model="form.clockRef" placeholder="请输入参考规则" />
        </el-form-item>
        <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
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
import { listTime, getTime, delTime, addTime, updateTime, exportTime } from "@/api/attendance/time";

export default {
  name: "Time",
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
      // 每个考勤规则对应的详情时间段信息表格数据
      timeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        detailId: null,
        timesName: null,
        signIn: null,
        signOut: null,
        lateNum: null,
        leaveNum: null,
        signInBegin: null,
        signInEnd: null,
        signOutBegin: null,
        signOutEnd: null,
        signInFlag: null,
        signOutFlag: null,
        businessId: null,
        clockBegin: null,
        clockEnd: null,
        clockRef: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询每个考勤规则对应的详情时间段信息列表 */
    getList() {
      this.loading = true;
      listTime(this.queryParams).then(response => {
        this.timeList = response.rows;
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
        detailId: null,
        timesName: null,
        signIn: null,
        signOut: null,
        lateNum: null,
        leaveNum: null,
        signInBegin: null,
        signInEnd: null,
        signOutBegin: null,
        signOutEnd: null,
        signInFlag: null,
        signOutFlag: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        businessId: null,
        clockBegin: null,
        clockEnd: null,
        clockRef: null,
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
      this.title = "添加每个考勤规则对应的详情时间段信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTime(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改每个考勤规则对应的详情时间段信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTime(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTime(this.form).then(response => {
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
      this.$confirm('是否确认删除每个考勤规则对应的详情时间段信息编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delTime(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有每个考勤规则对应的详情时间段信息数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportTime(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
