<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="假期名称" prop="vacationName">
        <el-input
          v-model="queryParams.vacationName"
          placeholder="请输入假期名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
       <el-form-item label="假期类型" prop="vacationType">
        <el-select v-model="queryParams.vacationType" placeholder="请选择假期类型" clearable size="small">
          <el-option v-for="item in availableOptions" :key="item.value" :label="item.label"
          :value="item.value" >
          </el-option>
        </el-select>
      </el-form-item>
      <!--<el-form-item label="开始日期" prop="beginDate">
        <el-date-picker clearable size="small" style="width: 200px"
          v-model="queryParams.beginDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker clearable size="small" style="width: 200px"
          v-model="queryParams.endDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="租户ID" prop="tenantId">
        <el-input
          v-model="queryParams.tenantId"
          placeholder="请输入租户ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        /> -->
      <!-- </el-form-item> -->
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
          v-hasPermi="['attendance:vacation:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:vacation:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:vacation:remove']"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:vacation:export']"
        >导出</el-button>
      </el-col> -->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="vacationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="假期管理id" align="center" prop="id" /> -->
      <el-table-column label="假期名称" align="center" prop="vacationName" />
      <el-table-column label="假期类型" align="center" prop="vacationTypeName" />
      <el-table-column label="开始日期" align="center" prop="beginDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.beginDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="租户ID" align="center" prop="tenantId" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:vacation:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:vacation:remove']"
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

    <!-- 添加或修改假期管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="假期名称" prop="vacationName">
          <el-input v-model="form.vacationName" placeholder="请输入假期名称" />
        </el-form-item>
        <el-form-item label="假期类型" prop="vacationType">
          <el-select v-model="form.vacationType" placeholder="请选择假期类型">
            <el-option v-for="item in availableOptions" :key="item.value" :label="item.label"
            :value="item.value" >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="beginDate">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.beginDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.endDate"
            type="date"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            placeholder="选择结束日期">
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="租户ID" prop="tenantId">
          <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listVacation, getVacation, delVacation, addVacation, updateVacation, exportVacation } from "@/api/attendance/vacation";
import moment from "moment"
export default {
  name: "Vacation",
  components: {
  },
  data() {
    return {
      startTime:"2021-11-10",
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
      // 假期管理表格数据
      vacationList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        vacationName: null,
        vacationType: null,
        beginDate: null,
        endDate: null,
        tenantId: null
      },
      availableOptions: [{
                    value: "0",
                    label: "法定节假日"
                }, {
                    value: "1",
                    label: "工作日"
                }],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        vacationName: [
          {required:true,message:"请输入假期名称",trigger:"blur"}
        ],
        vacationType: [
          {required:true,message:"请选择假期类型",trigger:"blur"}
        ],
        beginDate: [
          {required:true,message:"请选择开始日期",trigger:"blur"}
        ],
        endDate: [
          {required:true,message:"请选择结束日期",trigger:"blur"}
        ],
      },
      // 时间选择器
      pickerOptions:{
        disabledDate:(time)=> {
          return time.getTime() < moment(this.form.beginDate).valueOf() ;
        }
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询假期管理列表 */
    getList() {
      this.loading = true;
      listVacation(this.queryParams).then(response => {
        this.vacationList = response.rows;
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
        vacationName: null,
        vacationType: null,
        beginDate: null,
        endDate: null,
        createTime: null,
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
      this.title = "添加假期管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getVacation(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改假期管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateVacation(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addVacation(this.form).then(response => {
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
      this.$confirm('是否确认删除该数据?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delVacation(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有假期管理数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportVacation(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
