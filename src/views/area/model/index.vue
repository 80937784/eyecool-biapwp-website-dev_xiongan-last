<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="区域名称" prop="areaName">
        <el-input v-model="queryParams.areaName" placeholder="请输入区域名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="区域类型" prop="areaType">
        <el-select v-model="queryParams.areaType" placeholder="请选择区域类型" clearable size="small">
          <el-option v-for="dict in areaTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="区域状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择区域类型" clearable size="small">
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['area:model:add']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="modelList" row-key="id" default-expand-all :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column label="区域名称" align="left" prop="areaName" />
      <el-table-column label="显示顺序" align="center" prop="orderNum" width="120"/>
      <el-table-column label="区域类型" align="center" prop="areaType" :formatter="areaTypeFormat" />
      <el-table-column label="区域状态" align="center" prop="status" :formatter="statusFormat" width="120"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasPermi="['area:model:add']">新增</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['area:model:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['area:model:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改区域对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级区域" prop="parentId" v-if="form.parentId !== 0">
          <treeselect v-model="form.parentId" :options="modelOptions" :normalizer="normalizer" placeholder="请选择上级区域" />
        </el-form-item>
        <el-form-item label="区域名称" prop="areaName">
          <el-input v-model="form.areaName" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number :step="1" :min="1" v-model="form.orderNum" placeholder="请输入显示顺序" />
        </el-form-item>
        <el-form-item label="区域类型" prop="areaType">
          <el-select v-model="form.areaType" placeholder="请选择区域类型" class="ec-form-select">
            <el-option v-for="dict in areaTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listModel, getModel, delModel, addModel, updateModel, listModelExcludeChild } from "@/api/area/model";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "AreaModel",
  components: {
    Treeselect
  },
  data() {
    return {
      // 提交加载
      formLoading:false,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 区域表格数据
      modelList: [],
      // 区域树选项
      modelOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 区域类型字典
      areaTypeOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        areaName: null,
        areaType: null,
        status: '0',
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        areaName: [
          {required: true, message:'区域名称能为空', trigger:'blur'},
        ],
        orderNum: [
          {required: true, message:'排序不能为空', trigger:['blur','change']},
        ]
      }
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser','tenantEnabled'
    ])
  },
  created() {
    this.getDicts("area_type").then(response => {
      this.areaTypeOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询区域列表 */
    getList() {
      this.loading = true;
      listModel(this.queryParams).then(response => {
        this.modelList = this.handleTree(response.data, "id", "parentId");
        this.loading = false;
      });
    },
    /** 转换区域数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.areaName,
        children: node.children
      };
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      listModel().then(response => {
        this.modelOptions = this.handleTree(response.data, "id", "parentId");
      });
    },
    // 区域类型字典翻译
    areaTypeFormat(row, column) {
      return this.selectDictLabel(this.areaTypeOptions, row.areaType);
    },
    // 状态格式化
    statusFormat(row, column){
      return this.selectDictLabel(this.statusOptions, row.status);
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
        parentId: null,
        ancestors: null,
        areaName: null,
        orderNum: null,
        areaType: null,
        status: "0",
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        tenantId: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row != undefined) {
        this.form.parentId = row.id;
      }
      this.open = true;
      this.title = "添加区域";
      listModel().then(response => {
        this.modelOptions = this.handleTree(response.data, "id", "parentId");
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      listModelExcludeChild(row.id).then(response => {
	        this.modelOptions = this.handleTree(response.data, "id");
      });
      getModel(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改区域";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.formLoading = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateModel(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.formLoading = false;
            });
          } else {
            addModel(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.formLoading = false;
              this.getList();
            });
          }
        }else {
          this.formLoading = false;
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm('是否确认删除区域编号为"' + row.id + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delModel(row.id);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
