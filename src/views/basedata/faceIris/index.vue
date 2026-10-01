<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="选择部门" prop="deptId">
        <treeselect v-model="queryParams.deptId" style="width:230px" :options="deptOptions" :show-count="true" placeholder="请选择部门" />
      </el-form-item>
      <el-form-item label="数据来源" prop="datasource">
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['basedata:faceIris:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['basedata:faceIris:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['basedata:faceIris:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['basedata:faceIris:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="faceIrisList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="uniqueId">
        <template slot-scope="scope">
          <router-link :to="{name:'Personinfo', params:{uniqueId: scope.row.uniqueId}}">
            <span class="link-type">{{scope.row.uniqueId}}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="人脸质量分数" align="center" prop="faceQuality" />
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
      <el-table-column label="有效期" align="center" prop="validityDate" width="180"></el-table-column>
      <el-table-column label="操作时间" align="center" prop="createTime">
        <template slot-scope="scope">
          {{scope.row.updateTime?scope.row.updateTime:scope.row.createTime}}
        </template>
      </el-table-column>
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="修改时间" align="center" prop="updateTime" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['basedata:faceIris:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改虹膜人脸多模态对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" :disabled="isShowDetailDialog">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="人员标识" prop="uniqueId">
              <!-- <el-input v-model="form.uniqueId" placeholder="请输入人员标识" :disabled="form.id!=null" /> -->
              <el-select v-model="form.uniqueId" style="width:100%" filterable remote reserve-keyword :disabled="form.id != null" placeholder="请输入人员标识" :remote-method="remoteMethod" @change="selectChange" :loading="selectLoading">
                <el-option v-for="item in uniqueIdOptions" :key="item.uniqueId" :label="'姓名:' + item.name + '--' + '人员标识:' + item.uniqueId" :value="item.uniqueId">
                </el-option>
              </el-select>
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
            <el-form-item label="有效期" prop="validityDate">
              <el-date-picker clearable size="small" style="width: 100%;" v-model="form.validityDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="选择有效期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据描述" prop="dataDescribe">
              <el-input v-model="form.dataDescribe" placeholder="请输入数据描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="isShowDetailDialog">
          <el-col :span="12">
            <el-form-item label="特征状态" prop="status">
              <el-select v-model="form.status" class="ec-form-select">
                <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
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
        <el-form-item label="图像信息">
          <el-tabs v-model="faceIrisCollectType" tab-position="top" type="card" v-if="!isShowDetailDialog">
            <el-tab-pane label="图像上传" name="faceIrisLocal">
            </el-tab-pane>
            <el-tab-pane label="图像采集" name="faceIrisCollect">
            </el-tab-pane>
          </el-tabs>
          <template v-if="faceIrisCollectType == 'faceIrisLocal'">
            <el-col :span="12">
              <el-form-item prop="faceImgBase64">
                <img :src="'data:image/jpeg;base64,' + form.faceImgBase64" width="120" height="160" v-if="isShowDetailDialog" />
                <upload-file v-else v-model="form.faceImgBase64" accept=".jpg,.jpeg,.png" tip="人脸图像" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="irisImgBase64">
                <img :src="'data:image/jpeg;base64,' + form.irisImgBase64" width="200" height="160" v-if="isShowDetailDialog" />
                <upload-file v-else v-model="form.irisImgBase64" accept=".bmp" tip="虹膜图像" />
              </el-form-item>
            </el-col>
          </template>
          <template v-else>
            <el-form-item prop="faceImgBase64">
              <face-iris-collect v-model="bioData"></face-iris-collect>
            </el-form-item>
          </template>
        </el-form-item>
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
              <el-input v-model="form.remark" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="ec-edit-tip" v-if="!isShowDetailDialog && form.id!=null">注意：本次操作如果上传图片是强制更新(不进行照片比对), 请谨慎使用！！！</div>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog" v-loading="formLoading">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UploadFile from '@/components/UploadFile';
import FaceIrisCollect from "@/components/BioCollect/faceiris";
import { listFaceIris, getFaceIris, getUniqueId, delFaceIris, addFaceIris, updateFaceIris, exportFaceIris } from "@/api/basedata/faceIris";
import Treeselect from "@riophae/vue-treeselect";
import { treeselect } from "@/api/system/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "FaceIris",
  components: {
    UploadFile,
    FaceIrisCollect,
    Treeselect
  },
  data () {
    return {
      // 多模态信息提交加载
      submitLoading: false,
      // uniquedId数组
      uniqueIdOptions: [],
      // 远程搜索加载
      selectLoading: false,
      // 删除信息
      delName: "",
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
      // 虹膜人脸多模态表格数据
      faceIrisList: [],
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
        status: '0',
        datasource: null,
        tenantId: null
      },
      // 数据来源数据字典
      datasourceOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 是否加密数据字典
      encryptedOptions: [],
      // 眼睛编码数据字典
      eyeCodeOptions: [],
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
          { required: true, message: "是否加密不能为空", trigger: "change" }
        ],
        validityDate: [
          { required: true, message: "有效期不能为空", trigger: ["change", "blur"] }
        ],
        faceImgBase64: [
          { required: true, message: "图像不能为空", trigger: ["change", "blur"] }
        ],
        irisImgBase64: [
          { required: true, message: "图像不能为空", trigger: ["change", "blur"] }
        ],
      },
      // 是否显示详情弹窗
      isShowDetailDialog: false,
      faceIrisCollectType: "faceIrisLocal",
      // 图像生物信息
      bioData: {
        irisImgBase64: null,
        faceImgBase64: null,
        irisFeature: null,
      },
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ]),
  },
  watch: {
    bioData: {
      handler (val, oldVal) {
        this.form.faceImgBase64 = val.faceImgBase64
        this.form.irisImgBase64 = val.irisImgBase64
        this.form.irisFeature = val.irisFeature
      },
      deep: true
    }
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
    this.getDicts("bio_eye_code").then(response => {
      this.eyeCodeOptions = response.data;
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
    /** 查询虹膜人脸多模态列表 */
    getList () {
      this.loading = true;
      listFaceIris(this.queryParams).then(response => {
        this.faceIrisList = response.rows;
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
        fusionFeature: null,
        fusionFeatureMd5: null,
        faceFeature: null,
        faceFeatureMd5: null,
        faceImageUrl: null,
        faceQuality: null,
        irisFeature: null,
        irisFeatureMd5: null,
        irisImageUrl: null,
        irisType: null,
        irisQuality: null,
        encrypted: null,
        status: "0",
        datasource: null,
        dataDescribe: null,
        validityDate: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        remark: null,
        tenantId: null,
        faceImgBase64: null,
        irisImgBase64: null
      };
      this.bioData = {
        irisImgBase64: null,
        faceImgBase64: null,
        irisFeature: null,
      }
      this.faceIrisCollectType = 'faceIrisLocal';
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
      this.delName = selection.map(item => item.uniqueId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加人脸虹膜多模态";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      this.isShowDetailDialog = false;
      const id = row.id || this.ids
      getFaceIris(id).then(response => {
        // 后端虹膜是有特征则不再提取，防止前端直接上传的图片和特征不一致，先置空后端返回的特征
        response.data.irisFeature = null;
        this.form = response.data;
        this.bioData = {
          irisImgBase64: this.form.irisImgBase64,
          faceImgBase64: this.form.faceImgBase64,
          irisFeature: this.form.irisFeature,
        }
        this.open = true;
        this.title = "修改人脸虹膜多模态";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.formLoading = true
      this.submitLoading = true;
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false
          this.submitLoading = false
          return
        }
        if (this.form.id != null) {
          updateFaceIris(this.form).then(response => {
            this.msgSuccess("修改成功");
            this.open = false;
            this.formLoading = false
            this.submitLoading = false
            this.getList();
          }).catch(err => {
            this.formLoading = false;
            this.submitLoading = false
          });
        } else {
          addFaceIris(this.form).then(response => {
            this.msgSuccess("新增成功");
            this.open = false;
            this.formLoading = false
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
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除人员标识为"' + this.delName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delFaceIris(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport () {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有人脸虹膜多模态数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportFaceIris(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**显示详情信息 */
    handleShowDetail (row) {
      this.reset();
      this.isShowDetailDialog = true;
      const id = row.id || this.ids
      getFaceIris(id).then(response => {
        this.form = response.data;
        this.title = "多模态详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
    /** 数据来源显示转换 */
    handleShowDatasource (val) {
      return this.selectDictLabel(this.datasourceOptions, val);
    },
    /** 状态显示转换 */
    handleShowStatus (val) {
      return this.selectDictLabel(this.statusOptions, val);
    },
    /** 眼睛编码显示转换 */
    handleShowEyeCode (val) {
      return this.selectDictLabel(this.eyeCodeOptions, val);
    },
    /**是否加密显示转换 */
    handleShowEncrypted (val) {
      return this.selectDictLabel(this.encryptedOptions, val);
    },
  }
};
</script>
<style lang="scss" scoped>
.ec-edit-tip {
  color: red;
  font-size: 12px;
  text-align: left;
  margin-left: 80px;
}
</style>