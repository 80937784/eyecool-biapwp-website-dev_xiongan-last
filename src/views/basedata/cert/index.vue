<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="证件类型" prop="certType">
        <el-select v-model="queryParams.certType" placeholder="请选择" clearable size="small" style="width: 200px">
          <el-option v-for="dict in certTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="证件号码" prop="certNum">
        <el-input v-model="queryParams.certNum" placeholder="请输入证件号码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="证件姓名" prop="certName">
        <el-input v-model="queryParams.certName" placeholder="请输入证件姓名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['basedata:cert:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['basedata:cert:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['basedata:cert:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['basedata:cert:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="default" icon="el-icon-download" size="mini" @click="handleDownload" v-hasPermi="['basedata:cert:download']">下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" icon="el-icon-upload" size="mini" @click="handleImport" v-hasPermi="['basedata:cert:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-search" size="mini" @click="openAsyncTask=true" v-hasPermi="['basedata:cert:import']">异步任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="certList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="uniqueId">
        <template slot-scope="scope">
          <router-link :to="{name:'Person', params:{uniqueId: scope.row.uniqueId}}">
            <span class="link-type">{{scope.row.uniqueId}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="证件类型" align="center" prop="certType">
        <template slot-scope="scope">
          <div>{{handleShowCertType(scope.row.certType)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="证件号码" align="center" prop="certNum" :show-overflow-tooltip="true" />
      <el-table-column label="证件姓名" align="center" prop="certName" />
      <el-table-column label="证件有效期" align="center" prop="certValidity" :show-overflow-tooltip="true" />
      <el-table-column label="性别" align="center" prop="gender">
        <template slot-scope="scope">
          <div>{{handleShowSex(scope.row.gender)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="修改时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['basedata:cert:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人员证件信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" :disabled="isShowDetailDialog">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人员标识" prop="uniqueId">
              <el-input v-model="form.uniqueId" placeholder="请输入人员标识" :disabled="form.id!=null" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件类型" prop="certType">
              <el-select v-model="form.certType" placeholder="请选择" class="ec-form-select" :disabled="form.id!=null">
                <el-option v-for="dict in certTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="证件号码" prop="certNum">
              <el-input v-model="form.certNum" placeholder="请输入证件号码" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="是否加密" prop="encrypted">
              <el-select v-model="form.encrypted" placeholder="请选择" class="ec-form-select" :disabled="form.id!=null">
                <el-option v-for="dict in encryptedOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="证件姓名" prop="certName">
              <el-input v-model="form.certName" placeholder="请输入证件姓名" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择" class="ec-form-select">
                <el-option v-for="dict in sexOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="民族" prop="nation">
              <el-select v-model="form.nation" placeholder="请选择" class="ec-form-select">
                <el-option v-for="dict in nationOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人脸图像" prop="imgBase64">
              <img :src="'data:image/jpeg;base64,' + form.imgBase64" width="120" height="160" v-if="isShowDetailDialog" />
              <upload-file v-else v-model="form.imgBase64" accept=".jpg,.jpeg,.png" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="有效期" prop="certValidity">
              <el-input v-model="form.certValidity" placeholder="例如 2014.06.09-2034.06.09" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="bthDate">
              <el-input v-model="form.bthDate" placeholder="例如 2014.06.09" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="家庭住址" prop="address">
              <el-input v-model="form.address" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发证机关" prop="certAuthority">
              <el-input v-model="form.certAuthority" />
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
        <el-row :gutter="20" v-if="isShowDetailDialog">
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
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog" v-loading="formLoading">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改人员证件信息对话框 -->
    <el-dialog title="证件照片下载" :visible.sync="downloadDialogOpen" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="downloadForm" :model="downloadForm" :rules="downloadFormRules" label-width="80px">
        <el-form-item label="照片类型" prop="photoType">
          <el-radio-group v-model="downloadForm.photoType">
            <el-radio v-for="dict in certPhotoTypeOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirDownload">确 定</el-button>
        <el-button @click="cancelDownload">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 证件导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="uploadForm" :model="upload" :rules="uploadFormRules" label-width="80px">
        <el-form-item label="导入类型" prop="importType">
          <el-radio-group v-model="upload.importType" @change="radioChange">
            <el-radio key="data" label="data">证件数据</el-radio>
            <el-radio key="img" label="img">证件照片</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="证件类型" prop="certType" v-if="upload.importType=='img'">
          <el-select v-model="upload.certType" placeholder="请选择" class="ec-form-select">
            <el-option v-for="dict in certTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="照片类型" prop="photoType" v-if="upload.importType=='img'">
          <el-radio-group v-model="upload.photoType">
            <el-radio v-for="dict in certPhotoTypeOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" :accept="upload.importType=='img' ? '.zip' : '.xlsx, .xls'" :uploadPath="upload.url + '?updateSupport=' + upload.updateSupport + '&certType=' + upload.certType + '&photoType=' + upload.photoType" :name="upload.importType=='img' ? 'zipFile' : 'excelFile'" @success="handleImportFileSuccess" @fail="handleImportFileFail" drag />
          <div v-if="upload.importType=='data'">
            <el-checkbox v-model="upload.updateSupport" />更新已经存在的数据
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
          </div>
        </el-form-item>
        <div style="color:red; line-height: 18px; font-size: 12px;padding-left: 35px;">提示：1、仅允许导入“xls”、“xlsx”或“zip”格式文件！
          <span style="padding-left: 36px; display: inline-block;">
            2、要导入的图片命名格式须与表格中人员唯一标识对应<br />
            3、“证件类型”、"性别"和“民族”导入需要使用“字典标签”<br />
            4、“唯一标识”、“证件号”和“证件类型”必填<br />
            5、ZIP包内不能包含文件夹，上传文件大小需要&lt;=500M
          </span>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="exportLoading" @click="submitFileForm">确 定</el-button>
        <el-button @click="cancelFileForm">取 消</el-button>
      </div>
    </el-dialog>

    <!--异步任务查询弹窗-->
    <async-task :open="openAsyncTask" @close="openAsyncTask=false"></async-task>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listCert, getCert, delCert, addCert, updateCert, exportCert, downloadCert, importTemplate } from "@/api/basedata/cert";
import UploadFile from '@/components/UploadFile';
import { download } from "@/utils/eyecool";
import AsyncTask from "@/views/components/common/async-task";
export default {
  name: "Cert",
  components: {
    UploadFile,
    AsyncTask
  },
  data() {
    return {
      // 导入加载
      exportLoading:false,
      // 提交加载
      submitLoading:false,
      // 删除人员标识
      cardName:"",
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
      // 人员证件信息表格数据
      certList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uniqueId: null,
        certType: null,
        certNum: null,
        certName: null,
        tenantId: null
      },
      // 证件类型数据字典
      certTypeOptions: [],
      // 性别数据字典
      sexOptions: [],
      // 民族数据字典
      nationOptions: [],
      // 是否加密数据字典
      encryptedOptions: [],
      // 证件照片类型数据字典
      certPhotoTypeOptions: [],
      // 表单参数
      form: {},
      // 保存表单遮罩
      formLoading: false,
      // 表单校验
      rules: {
        uniqueId: [
          { required: true, message: "人员标识不能为空", trigger: "blur" }
        ],
        certType: [
          { required: true, message: "证件类型不能为空", trigger: "change" }
        ],
        certNum: [
          { required: true, message: "证件号码不能为空", trigger: "blur" }
        ],
        encrypted: [
          { required: true, message: "是否加密不能为空", trigger: "change" }
        ],
      },
      // 弹窗是否是详情展示
      isShowDetailDialog: false,
      // 是否显示证件照片下载弹窗
      downloadDialogOpen: false,
      // 下载弹窗表单
      downloadForm: {
        photoType: null
      },
      // 下载弹窗表单校验
      downloadFormRules: {
        photoType: [
          { required: true, message: "照片类型不能为空", trigger: "change" }
        ]
      },
      // 证件导入参数
      upload: {
        // 导入类型 data-数据 img-图片
        importType: "data",
        // 证件类型
        certType: null,
        // 照片类型
        photoType: null,
        // 文件（用于表单校验）
        file: null,
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
        // 是否覆盖更新
        updateSupport: false,
        // 上传的地址
        url: "/basedata/cert/import"
      },
      uploadFormRules: {
        importType: [
          { required: true, message: "导入类型不能为空", trigger: "change" }
        ],
        certType: [
          { required: true, message: "证件类型不能为空", trigger: "change" }
        ],
        photoType: [
          { required: true, message: "照片类型不能为空", trigger: "change" }
        ],
        file: [
          { required: true, message: "文件不能为空", trigger: ["change", "blur"] }
        ]
      },
      // 是否打开异步任务查询弹窗
      openAsyncTask: false
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  created() {
    this.getDicts("sys_cert_type").then(response => {
      this.certTypeOptions = response.data;
    });
    this.getDicts("sys_nation").then(response => {
      this.nationOptions = response.data;
    });
    this.getDicts("sys_user_sex").then(response => {
      this.sexOptions = response.data;
    });
    this.getDicts("apply_encrypted").then(response => {
      this.encryptedOptions = response.data;
    });
    this.getDicts("cert_photo_type").then(response => {
      this.certPhotoTypeOptions = response.data;
    });
    this.getList();
  },
  methods: {
    /** 查询人员证件信息列表 */
    getList() {
      this.loading = true;
      listCert(this.queryParams).then(response => {
        this.certList = response.rows;
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
        uniqueId: null,
        certType: null,
        certNum: null,
        certName: null,
        certValidity: null,
        gender: null,
        bthDate: null,
        nation: null,
        address: null,
        certAuthority: null,
        certImg: null,
        encrypted: null,
        enterschoolImg: null,
        inschoolImg: null,
        graduateImg: null,
        remark: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        tenantId: null,
        imgBase64: null
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
      this.cardName = selection.map(item => item.uniqueId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加人员证件信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.isShowDetailDialog = false;
      const id = row.id || this.ids
      getCert(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改人员证件信息";
      });
    },
    
    /** 提交按钮 */
    submitForm() {
      this.submitLoading = true
      this.formLoading = true
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false;
          this.submitLoading = false
          return;
        }
        if (this.form.id != null) {
          updateCert(this.form).then(response => {
            this.msgSuccess("修改成功");
            this.open = false;
            this.formLoading = false;
            this.submitLoading = false
            this.getList();
          }).catch(err => {
            this.formLoading = false;
            this.submitLoading = false
          });
        } else {
          addCert(this.form).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.formLoading = false;
            this.submitLoading = false
            this.getList();
          }).catch(err => {
            this.formLoading = false;
            this.submitLoading = false
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除人员标识为"' + this.cardName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delCert(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有人员证件信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportCert(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /** 性别显示转换 */
    handleShowSex(val) {
      return this.selectDictLabel(this.sexOptions, val);
    },
    /** 民族显示转换 */
    handleShowNation(val) {
      return this.selectDictLabel(this.nationOptions, val);
    },
    /**是否加密显示转换 */
    handleShowEncrypted(val) {
      return this.selectDictLabel(this.encryptedOptions, val);
    },
    handleShowCertType(val) {
      return this.selectDictLabel(this.certTypeOptions, val);
    },
    /**显示详情信息 */
    handleShowDetail(row) {
      this.reset();
      const id = row.id || this.ids
      getCert(id).then(response => {
        this.form = response.data;
        this.title = "证件详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
    /**下载证件照片 */
    handleDownload() {
      this.downloadDialogOpen = true;
    },
    /**导入证件信息 */
    handleImport() {
      this.upload.title = "证件导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg);
      });
    },
    /** 文件上传失败处理 */
    handleImportFileFail() {
      this.upload.open = false;
      this.exportLoading = false;
    },
    /**文件上传成功处理 */
    handleImportFileSuccess(res) {
      this.upload.open = false;
      this.exportLoading = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: '任务ID为：<br/><strong>' + res.msg + '</strong><br/>请复制任务ID点击[<strong>异步任务</strong>]查询结果',
        type: 'success',
        duration: 0
      });
    },
    /**提交上传文件 */
    submitFileForm() {
      this.exportLoading = true
      this.$refs["uploadForm"].validate(valid => {
        if (!valid) {
          this.exportLoading = false
          return;
        }
        this.$refs.importUpload.submit();
      });
    },
    /** 文件上传多选框改变事件 */
    radioChange() {
      this.$refs.importUpload.cancel();
    },
    /**取消上传 */
    cancelFileForm() {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
    },
    /**确认下载 */
    confirDownload() {
      this.$refs["downloadForm"].validate(valid => {
        if (!valid) {
          return;
        }
        let params = Object.assign({}, this.queryParams, this.downloadForm);
        delete params.pageNum
        delete params.pageSize
        downloadCert(params).then(response => {
          download(response.msg);
          this.restDownlodForm();
          this.downloadDialogOpen = false;
        })
      });
    },
    /**取消下载 */
    cancelDownload() {
      this.restDownlodForm();
      this.downloadDialogOpen = false;
    },
    /**重置下载表单 */
    restDownlodForm() {
      this.downloadForm = {
        photoType: null
      };
      this.resetForm("downloadForm");
    }
  }
};
</script>