<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px">
      <el-form-item label="公众号名称" prop="officalAccountName">
        <el-input v-model="queryParams.officalAccountName" placeholder="请输入公众号名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="微信名称" prop="wxName">
        <el-input v-model="queryParams.wxName" placeholder="请输入微信名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="绑定手机" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入绑定手机" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:officalAccountUser:pull']">拉取</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:officalAccountUser:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="officalAccountUserList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公众号名称" align="center" prop="officalAccountName" />
      <el-table-column label="公众号AppId" align="center" prop="appId" />
      <el-table-column label="微信标识" align="center" prop="openId" show-overflow-tooltip />
      <el-table-column label="微信名称" align="center" prop="wxName" />
      <el-table-column label="微信头像" align="center" prop="headImgUrl" width="100">
        <template slot-scope="scope">
          <img :src="scope.row.headImgUrl" alt="img.png" style="width: 25px; height: 25px; display: inline-block; border-radius: 50%;" />
        </template>
      </el-table-column>
      <el-table-column label="绑定手机" align="center" prop="phone" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['msg:officalAccountUser:edit']">手机绑定</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改微信用户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="微信公众号" prop="appId" v-if="form.id == null">
          <el-select v-model="form.appId" placeholder="请选择公众号" class="ec-form-select">
            <el-option v-for="item in officalAccountList" :key="item.appId" :label="item.appName" :value="item.appId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公众号名称" prop="officalAccountName" v-if="form.id != null">
          <el-input v-model="form.officalAccountId" placeholder="请输入公众号名称" disabled />
        </el-form-item>
        <el-form-item label="微信名称" prop="wxName" v-if="form.id != null">
          <el-input v-model="form.wxName" placeholder="请输入微信名称" disabled />
        </el-form-item>
        <el-form-item label="绑定手机" prop="phone" v-if="form.id != null">
          <el-input v-model="form.phone" placeholder="请输入绑定手机" />
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
import { listOfficalAccountUser, getOfficalAccountUser, pullOfficalAccountUser, updateOfficalAccountUser, exportOfficalAccountUser } from "@/api/msg/wechat/officalAccountUser";
import { listAllOfficalAccount } from '@/api/msg/wechat/officalAccount';

export default {
  name: "OfficalAccountUser",
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
      // 微信用户表格数据
      officalAccountUserList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        officalAccountName: null,
        wxName: null,
        phone: null,
        tenantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appId: [
          { required: true, message: "公众号AppId不能为空", trigger: "blur" }
        ]
      },
      // 公众号列表
      officalAccountList: []
    };
  },
  created() {
    this.getList();
    this.listAllOfficalAccount();
  },
  methods: {
    /** 查询微信用户列表 */
    getList() {
      this.loading = true;
      listOfficalAccountUser(this.queryParams).then(response => {
        this.officalAccountUserList = response.rows;
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
        openId: null,
        wxName: null,
        headImgUrl: null,
        phone: null,
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "拉取用户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getOfficalAccountUser(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "手机绑定";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        let tmpLoading;
        if (valid) {
          if (this.form.id != null) {
            updateOfficalAccountUser(this.form).then(response => {
              this.msgSuccess("绑定成功");
              this.open = false;
              this.getList();
            });
          } else {
            tmpLoading = this.$loading({
              lock: true,
              text: "拉取中",
              background: "rgba(0, 0, 0, 0.7)",
            });
            pullOfficalAccountUser(this.form).then(response => {
              tmpLoading.close();
              this.msgSuccess("拉取成功");
              this.open = false;
              this.getList();
            }).catch(err => {
              tmpLoading.close();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除微信用户编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delOfficalAccountUser(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有微信用户数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportOfficalAccountUser(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    }
  }
};
</script>
