<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文件名称" prop="fileName">
        <el-input v-model="queryParams.fileName" placeholder="请输入文件名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="Sdk类型" prop="sdkType">
        <el-select v-model="queryParams.sdkType" placeholder="状态" clearable size="small" style="width: 200px">
          <el-option v-for="dict in sdkTypes" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8" v-if="!isTenantUser">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['tool:sdkFile:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['tool:sdkFile:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['tool:sdkFile:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" border :data="sdkFileList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文件名称" align="center" prop="fileName" show-overflow-tooltip />
      <el-table-column label="文件MD5" align="center" prop="md5" show-overflow-tooltip />
      <el-table-column label="Sdk类型" align="center" prop="sdkType" width="180">
        <template slot-scope="scope">
          <el-tag type="success" size="medium">{{
            selectDictLabel(sdkTypes, scope.row.sdkType)
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="版本排序" align="center" prop="sortedNo" width="140">
        <template slot-scope="scope">
          <el-tag type="warning" size="medium">{{ scope.row.sortedNo }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['tool:sdkFile:query']">详细</el-button>
          <el-button size="mini" type="text" icon="el-icon-download" @click="handleDownloadSdkFile(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改SDK信息信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false" @close="cancel()">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" :disabled="isShowDetailDialog">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本排序" prop="sortedNo">
              <el-input v-model="form.sortedNo" placeholder="请输入版本排序" :disabled="form.id != null" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="SDK类型" prop="sdkType">
              <el-select v-model="form.sdkType" placeholder="请选择" class="ec-form-select">
                <el-option v-for="dict in sdkTypes" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="isShowDetailDialog">
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
        <el-row>
          <el-form-item label="上传文件" prop="sdkFile" :disabled="isShowDetailDialog">
            <upload-file ref="uploadFile" :imgFile="false" v-model="form.sdkFile" accept=".zip,.rar,.gz" :uploadPath="uploadUrl" name="sdkFile" @success="handleImportFileSuccess" drag :data="{
                sortedNo: form.sortedNo,
                sdkType: form.sdkType,
                id: form.id == null ? '' : form.id,
              }" />
          </el-form-item>
          <div class="ec-edit-tip" v-if="form.id != null && !isShowDetailDialog">
            注意：更新操作下，若不上传附件则使用原有附件。
          </div>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog">
        <el-button type="primary" @click="submitFileForm()">确 定</el-button>
        <el-button @click="cancel()">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  listSdkFile,
  getSdkFile,
  delSdkFile,
  exportSdkFile,
} from "@/api/tool/sdkFile";
import UploadFile from "@/components/UploadFile";
import { downLoadZip } from "@/utils/zipdownload";
export default {
  name: "SdkFile",
  components: {
    UploadFile
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
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tenantId: null,
        fileName: null,
        sdkType: null,
      },
      drag: true,
      // 上传的地址
      url: "/tool/sdkFile/addFileForm",
      sdkFileList: [],
      // 表单参数
      form: {},
      rules: {
        sortedNo: [
          { required: true, message: "sdk排序不能为空", trigger: "blur" },
        ],
        sdkType: [
          { required: true, message: "sdk类型不能为空", trigger: "blur" },
        ],
        sdkFile: [
          {
            required: true,
            message: "文件不能为空",
            trigger: ["blur", "change"],
          },
        ],
      },
      // 是否是详情展示
      isShowDetailDialog: false,
      sdkTypes: [],
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ]),
    uploadUrl() {
      return this.url + '?sortedNo=' + this.form.sortedNo + '&sdkType=' + this.form.sdkType
    }
  },
  created() {
    this.getDicts("sys_sdk_type").then((response) => {
      this.sdkTypes = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询SDK信息信息列表 */
    getList() {
      this.loading = true;
      listSdkFile(this.queryParams).then((response) => {
        this.sdkFileList = response.rows;
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
        fileName: null,
        filePath: null,
        md5: null,
        sdkType: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        tenantId: null,
        sortedNo: null,
        sdkFileList: [],
        sdkFile: null,
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
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加SDK信息";
    },
    submitFileForm() {
      this.$refs["form"].validate((valid) => {
        if (!valid) {
          return;
        }
        this.$refs.uploadFile.submit();
      });
    },
    handleImportFileSuccess(response) {
      this.open = false;
      this.$alert(response.msg, { dangerouslyUseHTMLString: true });
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        '是否确认删除SDK信息信息编号为"' + ids + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delSdkFile(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有SDK信息信息数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportSdkFile(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    /**显示详情信息 */
    handleShowDetail(row) {
      this.reset();
      const id = row.id || this.ids;
      getSdkFile(id).then((response) => {
        this.form = response.data;
        this.title = "SDK信息详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
    handleDownloadSdkFile(row) {
      downLoadZip('/tool/sdkFile/download/' + row.id, null);
    },
    sdkTypeFormat(row, column) {
      return this.selectDictLabel(this.sdkTypes, row.sdkType);
    },
  },
};
</script> 
<style lang="scss" scoped>
.ec-edit-tip {
  color: red;
  font-size: 12px;
  padding-left: 12%;
}
</style>