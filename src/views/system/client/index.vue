<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" @submit.native.prevent label-width="68px">

      <el-form-item label="终端编号" prop="clientId">
        <el-input v-model="queryParams.clientId" placeholder="终端编号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8" v-if="!isTenantUser">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:client:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:client:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:client:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['system:client:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-refresh" size="mini" @click="handleClearCache" v-hasPermi="['system:client:remove']">清理缓存</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="clientList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="终端编号" align="center" prop="clientId">
        <template slot-scope="scope">
          <a target="_blank" :href="handleClientLink(scope.row)">{{scope.row.clientId}}</a>
        </template>
      </el-table-column>
      <el-table-column label="安全码" align="center" prop="originSecret">
        <template slot-scope="scope">
          <span>{{scope.row.originSecret ? scope.row.originSecret : '******'}}</span>
        </template>
      </el-table-column>
      <el-table-column label="授权范围" align="center" prop="scope" />
      <el-table-column label="服务器回调地址" align="center" prop="webServerRedirectUri" :show-overflow-tooltip="true" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改终端配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body v-if="!isTenantUser" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="终端编号" prop="clientId">
              <el-input v-model="form.clientId" :disabled="!isAddOper" placeholder="终端编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全码" prop="originSecret">
              <el-input v-model="form.originSecret" placeholder="终端安全码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="授权范围" prop="scope">
              <el-input v-model="form.scope" disabled placeholder="授权范围" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源权限" prop="authorities">
              <el-input v-model="form.authorities" placeholder="资源权限" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="回调地址" prop="webServerRedirectUri">
              <el-input v-model="form.webServerRedirectUri" placeholder="服务器回调地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="附加信息" prop="additionalInformation">
              <el-input v-model="form.additionalInformation" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listClient, getClient, delClient, addClient, updateClient, exportClient, clearCache } from "@/api/system/client";
export default {
  name: "Client",
  data() {
    return {
      // 提交加载
      submitLoading:false,
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
      // 终端配置表格数据
      clientList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 弹出层是否是新增操作（true：新增，false：编辑）
      isAddOper: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        clientId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        clientId: [
          { required: true, message: "终端编号不能为空", trigger: "blur" }
        ],
        scope: [
          { required: true, message: "授权范围不能为空", trigger: "blur" }
        ],
        originSecret: [
          { required: true, message: "终端安全码不能为空", trigger: "blur" }
        ]
      }
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser'
    ])
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询终端配置列表 */
    getList() {
      this.loading = true;
      listClient(this.queryParams).then(response => {
        this.clientList = response.rows;
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
        clientId: null,
        resourceIds: null,
        clientSecret: null,
        scope: 'server',
        webServerRedirectUri: null,
        authorities: null,
        additionalInformation: null,
        originSecret: null
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
      this.ids = selection.map(item => item.clientId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isAddOper = true;
      this.open = true;
      this.title = "添加终端配置";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const clientId = row.clientId || this.ids
      getClient(clientId).then(response => {
        this.form = response.data;
        this.isAddOper = false;
        this.open = true;
        this.title = "修改终端配置";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.isAddOper === false) {
            updateClient(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(()=>this.submitLoading = false);
          } else {
            addClient(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(()=>this.submitLoading = false);
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const clientIds = row.clientId || this.ids;
      this.$confirm('是否确认删除终端配置编号为"' + clientIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delClient(clientIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有终端配置数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportClient(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /** 清理缓存按钮操作 */
    handleClearCache() {
      clearCache().then(response => {
        this.msgSuccess("清理成功");
      });
    },
    /** 处理终端链接跳转地址*/
    handleClientLink(client) {
      let redirectUri = client.webServerRedirectUri;
      if (redirectUri && redirectUri.length) {
        let linkArr = redirectUri.split(',');
        return linkArr[0];
      }
      return "#";
    }
  }
};
</script>
