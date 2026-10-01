<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="选择部门" prop="deptId">
        <treeselect v-model="queryParams.deptId" style="width:230px" :options="deptOptions" :show-count="true" placeholder="请选择部门" />
      </el-form-item>
      <el-form-item label=" 数据来源" prop="datasource">
        <el-select v-model="queryParams.datasource" placeholder="数据来源" clearable size="small" style="width: 200px">
          <el-option v-for="dict in datasourceOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="small" style="width: 200px">
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['basedata:face:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['basedata:face:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['basedata:face:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['basedata:face:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="default" icon="el-icon-upload" size="mini" @click="handleImport" v-hasPermi="['basedata:face:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-download" size="mini" @click="handleDownloadImg" v-hasPermi="['basedata:face:download']">下载</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" icon="el-icon-refresh" size="mini" @click="handleUpdateFeature" v-hasPermi="['basedata:face:updatefeature']">一键更新</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-search" size="mini" @click="openAsyncTask=true" v-hasPermi="['basedata:cert:import','basedata:face:updatefeature']">异步任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="faceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="uniqueId">
        <template slot-scope="scope">
          <router-link :to="{name:'Personinfo', params:{uniqueId: scope.row.uniqueId}}">
            <span class="link-type">{{scope.row.uniqueId}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="质量得分" align="center" prop="qualityScore" />
      <el-table-column label="是否加密" align="center" prop="encrypted">
        <template slot-scope="scope">
          <div>{{handleShowEncrypted(scope.row.encrypted)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" prop="datasource">
        <template slot-scope="scope">
          <div>{{handleShowDatasource(scope.row.datasource)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <div>{{handleShowStatus(scope.row.status)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="createTime">
        <template slot-scope="scope">
          {{scope.row.updateTime?scope.row.updateTime:scope.row.createTime}}
        </template>
      </el-table-column>
      <!-- <el-table-column label="修改时间" align="center" prop="updateTime" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['basedata:face:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人脸图像信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="人员标识" prop="uniqueId">
          <!-- <el-input v-model="form.uniqueId" placeholder="请输入人员标识" :disabled="form.id!=null" /> -->
          <el-select v-model="form.uniqueId" style="width:100%" filterable remote reserve-keyword :disabled="form.id != null" placeholder="请输入人员标识" :remote-method="remoteMethod" @change="selectChange" :loading="selectLoading">
            <el-option v-for="item in uniqueIdOptions" :key="item.uniqueId" :label="'姓名:' + item.name + '--' + '人员标识:' + item.uniqueId" :value="item.uniqueId">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="是否加密" prop="encrypted">
          <el-select v-model="form.encrypted" placeholder="请选择" class="ec-form-select" :disabled="form.id!=null">
            <el-option v-for="dict in encryptedOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="人脸图像" prop="imgBase64">
          <el-tabs v-model="faceCollectType" tab-position="top" type="card">
            <el-tab-pane label="图像上传" name="faceLocal">
            </el-tab-pane>
            <el-tab-pane label="图像采集" name="faceCollect">
            </el-tab-pane>
          </el-tabs>
          <upload-file v-if="faceCollectType == 'faceLocal'" v-model="form.imgBase64" accept=".jpg,.jpeg,.png" tip="只能上传jpg/png文件，且不超过5M" />
          <face-collect v-else v-model="form.imgBase64"></face-collect>
        </el-form-item>
        <el-divider />
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="150" placeholder="请输入备注" />
        </el-form-item>
        <div class="ec-edit-tip" v-if="form.id!=null">注意：本次操作为强制更新图片(不进行照片比对), 请谨慎使用！！！</div>
      </el-form>
      <div slot="footer" class="dialog-footer" v-loading="formLoading">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 人脸图像详细展示对话框 -->
    <el-dialog title="人脸详细信息" :visible.sync="openDetail" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="80px" :disabled="true">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人员标识" prop="uniqueId">
              <el-input v-model="form.uniqueId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据来源" prop="datasource">
              <el-select v-model="form.datasource" class="ec-form-select">
                <el-option v-for="dict in datasourceOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="特征MD5" prop="featureMd5">
              <el-input v-model="form.featureMd5" :title="form.featureMd5" />
            </el-form-item>
            <el-form-item label="质量得分" prop="qualityScore">
              <el-input v-model="form.qualityScore" />
            </el-form-item>
            <el-form-item label="人脸状态" prop="status">
              <el-select v-model="form.status" class="ec-form-select">
                <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="是否加密" prop="encrypted">
              <el-select v-model="form.encrypted" class="ec-form-select">
                <el-option v-for="dict in encryptedOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="人脸图像" prop="imgBase64">
              <el-image :src="'data:image/jpeg;base64,' + form.imgBase64" style="width: 150px; height: 200px"></el-image>
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
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>

    <!-- 人脸导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="uploadForm" :model="upload" :rules="uploadFormRules" label-width="80px">
        <el-form-item label="上传文件" prop="file">
          <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" accept=".zip" :uploadPath="upload.url" name="zipFile" @success="handleImportFileSuccess" drag />
        </el-form-item>
        <div style="color:red; line-height: 18px; font-size: 12px;padding-left: 35px;">提示：1、仅允许导入“zip”格式文件！
          <span style="padding-left: 36px; display: inline-block;">
            2、图片使用唯一标识命名（唯一标识.jpg），例如20190001.jpg<br />
            3、ZIP包内不能包含文件夹，上传文件大小需要&lt;=500M
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
import { listFace, getFace, delFace, addFace, updateFace, exportFace, updateFaceFeature, downloadImages, getUniqueId } from "@/api/basedata/face";
import UploadFile from '@/components/UploadFile';
import { download } from "@/utils/eyecool";
import FaceCollect from "@/components/BioCollect/face";
import AsyncTask from "@/views/components/common/async-task";
import Treeselect from "@riophae/vue-treeselect";
import { treeselect } from "@/api/system/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "Face",
  components: {
    UploadFile,
    FaceCollect,
    AsyncTask,
    Treeselect
  },
  data () {
    return {
      // 导入加载
      exportLoading: false,
      // 人脸信息提交加载
      submitLoading: false,
      // uniquedId数组
      uniqueIdOptions: [],
      // 远程搜索加载
      selectLoading: false,
      // 信息删除标识
      faceName: "",
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
      // 人脸图像信息表格数据
      faceList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 部门树选项
      deptOptions: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uniqueId: null,
        datasource: null,
        status: '0',
        tenantId: null
      },
      // 数据来源数据字典
      datasourceOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 是否加密数据字典
      encryptedOptions: [],
      // 表单参数
      form: {},
      // 保存表单遮罩
      formLoading: false,
      // 表单校验
      rules: {
        uniqueId: [
          { required: true, message: "人员标识不能为空", trigger: "blur" }
        ],
        encrypted: [
          { required: true, message: "是否加密不能为空", trigger: ["change", "blur"] }
        ],
        imgBase64: [
          { required: true, message: "人脸图像不能为空", trigger: ["change", "blur"] }
        ],
      },
      // 是否显示详情弹窗
      openDetail: false,
      // 人脸导入参数
      upload: {
        // 文件（用于表单校验）
        file: null,
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
        // 上传的地址
        url: "/basedata/face/import"
      },
      uploadFormRules: {
        file: [
          { required: true, message: "文件不能为空", trigger: ["change", "blur"] }
        ]
      },
      faceCollectType: "faceLocal",
      // 是否打开异步任务查询弹窗
      openAsyncTask: false
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  created () {
    this.getDicts("apply_data_source").then(response => {
      this.datasourceOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("apply_encrypted").then(response => {
      this.encryptedOptions = response.data;
    });
    this.getList();
    this.getTreeselect();
  },
  methods: {
    selectChange (val) {
      console.log(this.form.uniqueId);
      console.log(val);
    },
    /** 过滤人员标识远程搜索 */
    remoteMethod (query) {
      if (query !== '') {
        this.selectLoading = true;
        getUniqueId({ name: query }).then(res => {
          console.log(res);
          this.selectLoading = false;
          this.uniqueIdOptions = res.rows;
        })
      } else {
        this.uniqueIdOptions = [];
      }
    },
    /** 查询人脸图像信息列表 */
    getList () {
      this.loading = true;
      listFace(this.queryParams).then(response => {
        this.faceList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询部门下拉树结构 */
    getTreeselect () {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        personId: null,
        uniqueId: null,
        featureMd5: null,
        qualityScore: null,
        imageUrl: null,
        encrypted: null,
        datasource: null,
        remark: null,
        status: "0",
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        tenantId: null,
        imgBase64: null
      };
      this.faceCollectType = 'faceLocal';
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.faceName = selection.map(item => item.uniqueId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加人脸图像信息";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      getFace(id).then(response => {
        this.form = response.data;
        // this.form.imgBase64 = null;
        this.open = true;
        this.title = "修改人脸图像信息";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.submitLoading = true;
      this.formLoading = true
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false;
          this.submitLoading = false;
          return;
        }
        if (this.form.id != null) {
          updateFace(this.form).then(response => {
            this.msgSuccess("修改成功");
            this.open = false;
            this.submitLoading = false;
            this.formLoading = false;
            this.getList();
          }).catch(err => {
            this.submitLoading = false;
            this.formLoading = false;
          });
        } else {
          addFace(this.form).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.formLoading = false;
            this.submitLoading = false;
            this.getList();
          }).catch(err => {
            this.formLoading = false;
            this.submitLoading = false;
          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除人员标识为"' + this.faceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delFace(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport () {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有人脸图像信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportFace(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**一键更新人脸特征 */
    handleUpdateFeature () {
      this.$confirm('是否确认更新所有人脸图像特征?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return updateFaceFeature();
      }).then((res) => {
        this.$notify({
          title: '成功',
          dangerouslyUseHTMLString: true,
          message: '任务ID为：<br/><strong>' + res.msg + '</strong><br/>请复制任务ID点击[<strong>异步任务</strong>]查询结果',
          type: 'success',
          duration: 0
        });
      })
    },
    /**下载图片 */
    handleDownloadImg () {
      let ids = this.ids && this.ids.length ? this.ids.join() : null;
      let params = Object.assign({ ids: ids }, this.queryParams);
      downloadImages(params).then(response => {
        download(response.msg);
      })
    },
    /** 数据来源显示转换 */
    handleShowDatasource (val) {
      return this.selectDictLabel(this.datasourceOptions, val);
    },
    /** 状态显示转换 */
    handleShowStatus (val) {
      return this.selectDictLabel(this.statusOptions, val);
    },
    /**是否加密显示转换 */
    handleShowEncrypted (val) {
      return this.selectDictLabel(this.encryptedOptions, val);
    },
    // 显示详情信息
    handleShowDetail (row) {
      this.reset();
      const id = row.id || this.ids
      getFace(id).then(response => {
        this.form = response.data;
        this.openDetail = true;
      });
    },
    /**导入人脸信息 */
    handleImport () {
      this.upload.title = "人脸图片导入";
      this.upload.open = true;
    },
    /**文件上传成功处理 */
    handleImportFileSuccess (res) {
      this.upload.open = false;
      this.exportLoading = false;
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: '任务ID为：<br/><strong>' + res.msg + '</strong><br/>请复制任务ID点击[<strong>异步任务</strong>]查询结果',
        type: 'success',
        duration: 0
      });
    },
    /**提交上传文件 */
    submitFileForm () {
      this.exportLoading = true;
      this.$refs["uploadForm"].validate(valid => {
        if (!valid) {
          this.exportLoading = false;
          return;
        }
        this.$refs.importUpload.submit();
      });
    },
    /**取消上传 */
    cancelFileForm () {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
    },
  }
};
</script>
<style lang="scss" scoped>
.ec-edit-tip {
  color: red;
  font-size: 12px;
  text-align: center;
}
</style>