<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="70px">
      <el-form-item label="APP名称" prop="appName">
        <el-input v-model="queryParams.appName" placeholder="请输入APP名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="APP版本" prop="version">
        <el-input v-model="queryParams.version" placeholder="请输入版本号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="源文件名" prop="filename">
        <el-input v-model="queryParams.filename" placeholder="请输入源文件名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:upgradeVersion:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['device:upgradeVersion:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5" v-if="!isTenantUser">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['device:upgradeVersion:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:upgradeVersion:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="versionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="APP名称" align="center" prop="appName" />
      <el-table-column label="APP版本" align="center" prop="version" />
      <el-table-column label="源文件名" align="center" prop="filename">
        <template slot-scope="scope">
          <span @click="handleDownload(scope.row)" class="link-type">{{scope.row.filename}}</span>
        </template>
      </el-table-column>
      <el-table-column label="版本大小(B)" align="center" prop="fileSize" />
      <el-table-column label="是否启用" align="center" prop="enabled" width="160">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.enabled" active-color="#13ce66" inactive-color="#ccc" :disabled="isTenantUser" @change="handleChangeVersionEnabled(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['device:upgradeVersion:query']">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改版本信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" :width="form.id ==null ? '500px' :'700px'" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" :disabled="isShowDetailDialog">
        <el-row :gutter="20">
          <el-col :span="form.id == null ? 24 : 12">
            <el-form-item label="APP名称" prop="appName">
              <el-input v-model="form.appName" placeholder="请输入APP名" :disabled="form.id!=null" />
            </el-form-item>
          </el-col>
          <el-col :span="form.id == null ? 24 : 12">
            <el-form-item label="APP版本" prop="version">
              <el-input v-model="form.version" placeholder="请输入版本号" :disabled="form.id!=null" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.id == null">
          <el-col :span="24">
            <el-form-item label="版本文件" prop="path">
              <upload-file ref="upload" :imgFile="false" :showFailInfo="false" v-model="form.path" :uploadPath="uploadUrl" @success="handleUploadFileSuccess" @fail="handleUploadFileFail" drag />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.id != null">
          <el-col :span="12">
            <el-form-item label="源文件名" prop="filename">
              <el-input v-model="form.filename" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="enabled">
              <el-switch v-model="form.enabled" active-color="#13ce66" inactive-color="#ccc">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <template v-if="isShowDetailDialog">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="版本大小" prop="fileSize">
                <el-input v-model="form.fileSize">
                  <template slot="append">字节</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="文件MD5" prop="md5">
                <el-input v-model="form.md5" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建人" prop="createBy">
                <el-input v-model="form.createBy" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间" prop="createTime">
                <el-input v-model="form.createTime" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="修改人" prop="updateBy">
                <el-input v-model="form.updateBy" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="修改时间" prop="updateTime">
                <el-input v-model="form.updateTime" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <el-form-item label="版本描述" prop="description">
          <el-input type="textarea" maxlength="100" v-model="form.description" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listVersion, getVersion, delVersion, updateVersion, exportVersion } from "@/api/device/upgrade/version";
import UploadFile from '@/components/UploadFile';
import { downLoadZip } from "@/utils/zipdownload";
export default {
  name: "Version",
  components: {
    UploadFile
  },
  data() {
    const nameValidator = (rule,value,callback)=> {
      if(value.length > 48) {
        callback(new Error("APP名称长度不能超过48个字符"))
      }else {
        callback();
      }
    };
    const codeValidator = (rule,value,callback)=> {
      if(value.length > 48) {
        callback(new Error("版本号长度不能超过48个字符"))
      }else {
        callback();
      }
    }
    return {
      // 提交加载
      submitLoading:false,
      // 遮罩层
      loading: true,
      // 删除名称
      appName: "",
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
      // 版本信息表格数据
      versionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appName: null,
        version: null,
        filename: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appName: [
          { required: true, message: "APP名不能为空", trigger: "blur" },
           {required: true, validator:nameValidator,trigger:"blur"}
        ],
        version: [
          { required: true, message: "版本号不能为空", trigger: "blur" },
          {required: true, validator:codeValidator,trigger:"blur"}
        ],
        path: [
          { required: true, message: "升级文件不能为空", trigger: "blur" }
        ]
      },
      // 是否显示详细信息
      isShowDetailDialog: false
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ]),
    uploadUrl() {
      return '/device/upgrade/version?appName=' + this.form.appName + '&version=' + this.form.version + '&description=' + (this.form.description == null?"无":this.form.description);
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询版本信息列表 */
    getList() {
      this.loading = true;
      listVersion(this.queryParams).then(response => {
        this.versionList = response.rows;
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
        appName: null,
        version: null,
        description: null,
        path: null,
        fileSize: null,
        filename: null,
        md5: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        batchDate: null,
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
      console.log(selection);
      this.ids = selection.map(item => item.id)
      this.appName = selection.map(item => item.version)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加版本信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isShowDetailDialog = false;
      const id = row.id || this.ids
      getVersion(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改版本信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          console.log(1212);
          if (this.form.id != null) {
            updateVersion(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.submitLoading = false;
              this.getList();
            }).catch(()=>this.submitLoading = false);
          }else{
            this.submitLoading = false;
            this.$refs.upload.submit();
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认APP名称为"' + this.appName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delVersion(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有版本信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportVersion(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**显示详情信息 */
    handleShowDetail(row) {
      this.reset();
      const id = row.id || this.ids
      getVersion(id).then(response => {
        this.form = response.data;
        if(this.form.description == "null") this.form.description = null;
        this.title = "版本详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
    /**上传成功回调 */
    handleUploadFileSuccess() {
      this.msgSuccess("新增成功");
      this.open = false;
      this.submitLoading = false
      this.getList();
    },
    /**上传失败回调 */
    handleUploadFileFail(res){
      this.submitLoading = false
      this.msgError(res.msg)
    },
    /**版本开启停用修改 */
    handleChangeVersionEnabled(row) {
      updateVersion({ id: row.id, enabled: row.enabled }).then(response => {
        this.msgSuccess(row.enabled ? "启用成功" : '停用成功');
      });
    },
    /**下载 */
    handleDownload(row) {
      downLoadZip('/device/upgrade/version/download/' + row.id, null);
    }
  }
};
</script>
