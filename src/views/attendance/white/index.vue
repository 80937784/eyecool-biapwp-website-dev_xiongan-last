<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="姓名" prop="psnName">
        <el-input
          v-model="queryParams.psnName"
          placeholder="请输入姓名"
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
      <el-form-item label="部门" prop="deptId">
        
        <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width: 250px;" placeholder="请选择部门"  @keyup.enter.native="handleQuery" />
      </el-form-item> 
     
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['attendance:white:add']"
        >新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="openImportNoWhite" v-hasPermi="['attendance:white:import']">新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:white:edit']"
        >修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:white:remove']"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:white:export']"
        >导出</el-button>
      </el-col> -->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="whiteList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="psnUniqueId" />
      <el-table-column label="姓名" align="center" prop="psnName" />
      <el-table-column label="部门" align="center" prop="deptName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:white:edit']"
          >修改</el-button> -->
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:white:remove']"
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

    <!-- 添加或修改记录白名单人员对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="人员id" prop="psnId">
          <el-input v-model="form.psnId" placeholder="请输入人员id" />
        </el-form-item>
        <el-form-item label="人员标识" prop="psnUniqueId">
          <el-input v-model="form.psnUniqueId" placeholder="请输入人员标识" />
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
    <import-nowhite ref="import" @ok="handleQuery" :ruleForms="deptOptions" />
  </div>
</template>

<script>
import { listWhite, getWhite, delWhite, addWhite, updateWhite, exportWhite ,listNoWhite} from "@/api/attendance/white";
import importNowhite from "./importNowhite";
import Treeselect from "@riophae/vue-treeselect";
	import "@riophae/vue-treeselect/dist/vue-treeselect.css";
	import { treeselect } from "@/api/system/dept";
export default {
  name: "White",
  components: {importNowhite,Treeselect },
  data() {
    return {
      // 多选选中的行
      columns:[],
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
      // 记录白名单人员表格数据
      whiteList: [],
      deptIdOptionsSelect:[],
      deptOptions: undefined,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        psnName: null,
        psnUniqueId: null,
        deptId:null,
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
    /** 查询记录白名单人员列表 */
    getList() {
      this.loading = true;
      listWhite(this.queryParams).then(response => {
        this.whiteList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
      /** 打开导入表弹窗 */
      openImportNoWhite() {
      this.$refs.import.show();
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
        psnId: null,
        psnUniqueId: null,
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
      this.columns = selection;
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加记录白名单人员";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getWhite(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改记录白名单人员";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateWhite(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addWhite(this.form).then(response => {
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
      const names = this.columns.map(item=>item.psnName);
      const name = names.length > 0 ? names:null || row.psnName;
      this.$confirm('是否确认删除记录白名单人员姓名为"' + name + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delWhite(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有记录白名单人员数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportWhite(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
