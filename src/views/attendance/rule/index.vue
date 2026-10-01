<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
       <!-- <el-form-item label="dept_id" prop="deptId">
        <el-input
          v-model="queryParams.deptId"
          placeholder="请输入dept_id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        /> 
      </el-form-item> -->
      <el-form-item label="部门" prop="deptId">
        
        <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width: 250px;" placeholder="请选择部门"  @keyup.enter.native="handleQuery" />
      </el-form-item> 
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
          v-hasPermi="['attendance:rule:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:rule:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:rule:remove']"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:rule:export']"
        >导出</el-button>
      </el-col> -->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="ruleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
   
      <el-table-column label="部门名称" align="center" prop="deptName" >
         </el-table-column>
      <el-table-column label="规则名称" align="center" prop="ruleName" />
    
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:rule:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:rule:remove']"
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

    <!-- 添加或修改部门考勤规则对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="部门" prop="deptId">
         
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择部门" :disabled="isShowDetailDialog" />
           
        </el-form-item>
        <el-form-item label="考勤规则" prop="ruleId">
          <!-- <el-input v-model="form.ruleId" placeholder="请输入rule_id" /> -->
          <el-select v-model="form.ruleId" placeholder="考勤规则" style="width: 100%" >
            <el-option v-for="item in ruleOptions" :key="item.id" :label="item.ruleName"  :value="item.id" >
            </el-option>
          </el-select>
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
 import Treeselect from "@riophae/vue-treeselect";
	import "@riophae/vue-treeselect/dist/vue-treeselect.css";
	import { treeselect } from "@/api/system/dept";
import { listRule, getRule, delRule, addRule, updateRule, exportRule,getRuleAllList } from "@/api/attendance/rule";

export default {
  name: "Rule",
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
      ruleOptions: [],
      deptIdOptionsSelect:[],
      deptOptions: undefined,
      isShowDetailDialog: false,
      // 总条数
      total: 0,
      // 部门考勤规则表格数据
      ruleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deptId: null,
        ruleId: null,
        ruleName:null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        ruleId: [
         { required: true, message: "请选择考勤规则", trigger: "blur" }]
        
      }
    };
  },
  created() {
    this.getList();
    this.initRuleAllList();
    this.initDeptAllList();
    this.getTreeselect();
  },
  methods: {
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    /** 查询部门考勤规则列表 */
    getList() {
      this.loading = true;
      listRule(this.queryParams).then(response => {
        this.ruleList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 获取规则
    initDeptAllList() {
       debugger;
        this.deptIdOptionsSelect = [];
        getRuleAllList().then(response => {
        this.deptIdOptionsSelect = response.data;
        });
      },
    
     // 获取规则
     initRuleAllList() {
       debugger;
        this.ruleOptions = [];
        getRuleAllList().then(response => {
        this.ruleOptions = response.data;
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
        deptId: null,
        ruleId: null,
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
      this.title = "添加部门考勤规则";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getRule(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改部门考勤规则";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateRule(this.form).then(response => {
            
              if(response.code ==200){
                this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              }else{
                this.msgSuccess(response.msg);
              }
            });
          } else {
            addRule(this.form).then(response => {
              debugger;
              if(response.code ==200){
                this.msgSuccess("新增成功");
                this.open = false;
              this.getList();
              }else{
                this.msgSuccess(response.msg);
              }
                         
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除部门考勤规则编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delRule(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有部门考勤规则数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportRule(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
    ,
      //压制 loadOptions 报错
      async loadOptions({ action/*, callback*/ }) {
                debugger ;
                if (action === LOAD_ROOT_OPTIONS) {
                    if (!called) {
                    // First try: simulate an exception.
                    await sleep(2000) // Simulate an async operation.
                    called = true
                    throw new Error('Failed to load options: test.')
                    } else {
                    // Second try: simulate a successful loading.
                    await sleep(2000)
                    this.options = [ 'a', 'b', 'c', 'd', 'e' ].map(id => ({
                        id,
                        label: `option-${id}`,
                    }))
                    }
                }
            },
  }
};
</script>
