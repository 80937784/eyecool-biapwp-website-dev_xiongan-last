<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="85px" @submit.native.prevent>
      <el-form-item label="公众号名称" prop="officalAccountName">
        <el-input v-model="queryParams.officalAccountName" placeholder="请输入公众号名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['msg:weixinMenu:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['msg:weixinMenu:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['msg:weixinMenu:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['msg:weixinMenu:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="weixinMenuList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="公众号AppId" align="center" prop="appId" width="240"/>
      <el-table-column label="公众号名称" align="center" prop="officalAccountName" />
      <el-table-column label="菜单JSON" align="center" prop="menuJson">
        <template slot-scope="scope">
          {{scope.row.menuJson && scope.row.menuJson.length > 50 ? scope.row.menuJson.substring(0,50) + '...' : scope.row.menuJson}}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180"/>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改微信公众号菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="95px">
        <el-form-item label="微信公众号" prop="officalAccountId">
          <el-select v-model="form.officalAccountId" placeholder="请选择公众号" class="ec-form-select" :disabled="form.id!=null">
            <el-option v-for="item in officalAccountList" :key="item.id" :label="item.appName" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单JSON" prop="menuJson">
          <vue-json-editor v-if="open" v-model="menuJson" :showBtns="false" mode="code" lang="zh" @json-change="handleJsonChange" @json-save="handleJsonSave" @has-error="handleJsonError" />
        </el-form-item>
        <div style="margin-left:95px;color:#ccc;">具体格式参考微信开放文档<br /><a href="https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html" target="_blank">https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html</a></div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listWeixinMenu, getWeixinMenu, delWeixinMenu, addWeixinMenu, updateWeixinMenu, exportWeixinMenu } from "@/api/msg/wechat/menu";
import { listAllOfficalAccount } from '@/api/msg/wechat/officalAccount';
import vueJsonEditor from 'vue-json-editor'
export default {
  name: "WeixinMenu",
  components: {
    vueJsonEditor
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
      // 微信公众号菜单表格数据
      weixinMenuList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        officalAccountName: null,
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
        menuJson: [
          { required: true, message: "菜单JSON不能为空", trigger: "blur" }
        ],
      },
      // 公众号列表
      officalAccountList: [],
      // 菜单JSON
      menuJson: null,
      // 是否有正确的JSON
      hasJsonFlag: false
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
    /** 查询微信公众号菜单列表 */
    getList() {
      this.loading = true;
      listWeixinMenu(this.queryParams).then(response => {
        this.weixinMenuList = response.rows;
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
        menuJson: null,
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
      this.delName = selection.map(item => item.appId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.menuJson = null;
      this.hasJsonFlag = false;
      this.open = true;
      this.title = "添加微信公众号菜单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getWeixinMenu(id).then(response => {
        this.form = response.data;
        this.menuJson = JSON.parse(this.form.menuJson);
        this.hasJsonFlag = true;
        this.open = true;
        this.title = "修改微信公众号菜单";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.submitLoading = false;
          return
        }
        if (!this.hasJsonFlag) {
          this.msgError('JSON格式错误，请检查!');
          this.submitLoading = false;
          return
        }
        if (this.form.id != null) {
          updateWeixinMenu(this.form).then(response => {
            this.msgSuccess("修改成功");
            this.open = false;
            this.submitLoading = false;
            this.getList();
          });
        } else {
          addWeixinMenu(this.form).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.submitLoading = false;
            this.getList();
          });
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
        return delWeixinMenu(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有微信公众号菜单数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportWeixinMenu(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**JSON改变处理 */
    handleJsonChange(val) {
      // 实时保存
      this.handleJsonSave(val)
    },
    /**处理Json保存 */
    handleJsonSave(val) {
      this.menuJson = val
      this.hasJsonFlag = true
      this.form.menuJson = JSON.stringify(val)
    },
    /**JSON错误处理 */
    handleJsonError(val) {
      this.hasJsonFlag = false
    }
  }
};
</script>
<style lang="scss">
/* jsoneditor右上角默认有一个链接,加css去掉了 */
.jsoneditor-poweredBy {
  display: none;
}
</style>