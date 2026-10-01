<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="公众号名称" prop="officalAccountName">
        <el-input v-model="queryParams.officalAccountName" placeholder="请输入公众号名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="按钮KEY" prop="menuBtnKey">
        <el-input v-model="queryParams.menuBtnKey" placeholder="请输入菜单按钮Key" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:weixinMenuReply:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['msg:weixinMenuReply:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['msg:weixinMenuReply:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:weixinMenuReply:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="weixinMenuReplyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公众号名称" align="center" prop="officalAccountName" />
      <el-table-column label="公众号AppId" align="center" prop="appId" />
      <el-table-column label="菜单按钮Key" align="center" prop="menuBtnKey" />
      <el-table-column label="回复内容" align="center" prop="replyContent" min-width="150">
         <template slot-scope="scope">
          {{scope.row.replyContent && scope.row.replyContent.length > 50 ? scope.row.replyContent.substring(0,50) + '...' : scope.row.replyContent}}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改微信公众号菜单回复对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="公众号主键" prop="officalAccountId">
          <el-select v-model="form.officalAccountId" placeholder="请选择公众号" class="ec-form-select" :disabled="form.id != null">
            <el-option v-for="item in officalAccountList" :key="item.id" :label="item.appName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单按钮Key" prop="menuBtnKey">
          <el-input v-model="form.menuBtnKey" placeholder="请输入菜单按钮Key" :disabled="form.id != null"/>
        </el-form-item>
        <el-form-item label="回复内容">
          <editor v-model="form.replyContent" :min-height="192" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listWeixinMenuReply, getWeixinMenuReply, delWeixinMenuReply, addWeixinMenuReply, updateWeixinMenuReply, exportWeixinMenuReply } from "@/api/msg/wechat/menuReply";
import { listAllOfficalAccount } from '@/api/msg/wechat/officalAccount';
import Editor from '@/components/Editor';

export default {
  name: "WeixinMenuReply",
  components: {
    Editor,
  },
  data() {
    return {
      // 提交加载
      submitLoading:false,
      // 删除信息
      delName:"",
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
      // 微信公众号菜单回复表格数据
      weixinMenuReplyList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        officalAccountName: null,
        menuBtnKey: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        officalAccountId: [
          { required: true, message: "公众号主键不能为空", trigger: "blur" }
        ],
        appId: [
          { required: true, message: "公众号AppId不能为空", trigger: "blur" }
        ],
        menuBtnKey: [
          { required: true, message: "菜单按钮Key不能为空", trigger: "blur" }
        ]
      },
      // 公众号列表
      officalAccountList: [],
    };
  },
  watch: {
    'form.officalAccountId': {
      handler(newVal, oldVal) {
        if (!newVal) {
          this.$set(this.form, 'appId', null);
          return;
        }
        let officalAccount = this.officalAccountList.filter(item => item.id == newVal)[0];
        this.$set(this.form, 'appId', officalAccount.appId);
      }
    }
  },
  created() {
    this.getList();
    this.listAllOfficalAccount();
  },
  methods: {
    /** 查询微信公众号菜单回复列表 */
    getList() {
      this.loading = true;
      listWeixinMenuReply(this.queryParams).then(response => {
        this.weixinMenuReplyList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /**查询所有公众号 */
    listAllOfficalAccount() {
      listAllOfficalAccount().then(res => {
        this.officalAccountList = res.data
      })
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
        officalAccountId: null,
        appId: null,
        menuBtnKey: null,
        resType: null,
        replyContent: null,
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
      this.delName = selection.map(item => item.appId)
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加微信公众号菜单回复";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getWeixinMenuReply(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改微信公众号菜单回复";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateWeixinMenuReply(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            });
          } else {
            addWeixinMenuReply(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            });
          }
        }else {
          this.submitLoading = false;
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除微信公众号AppId为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delWeixinMenuReply(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有微信公众号菜单回复数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportWeixinMenuReply(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
