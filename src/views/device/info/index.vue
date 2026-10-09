<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--区域数据-->
      <el-col :span="foldNumber.tree" :xs="24">
        <div class="head-container">
          <el-input v-model="areaName" placeholder="请输入区域名称" clearable size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="areaOptions" :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" default-expand-all @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--设备数据-->
      <el-col style="position:relative" :span="foldNumber.table" :xs="24">
        <div @click="foldTree" class="extend">
          <el-button type="text" :icon="foldNumber.icon"></el-button>
        </div>
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="设备编号" prop="deviceNo">
            <el-input v-model="queryParams.deviceNo" placeholder="请输入设备编号(SN)" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="设备名称" prop="deviceName">
            <el-input v-model="queryParams.deviceName" placeholder="请输入设备名称" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="导入批次" prop="importBatchNum">
            <el-input v-model="queryParams.importBatchNum" placeholder="请输入导入批次" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="设备型号" prop="deviceModelCode">
            <el-select class="ec-form-select" size="small" v-model="queryParams.deviceModelCode" clearable filterable reserve-keyword placeholder="请输入型号名称检索">
              <el-option v-for="item in modelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属场景" prop="channelCode">
            <el-select size="small" class="ec-form-select" v-model="queryParams.channelCode" clearable filterable reserve-keyword placeholder="请输入场景名称检索">
              <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="租户ID" prop="tenantId" v-if="tenantEnabled && !isTenantUser">
            <el-input v-model="queryParams.tenantId" placeholder="请输入租户ID" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5" v-if="!isTenantUser">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['device:info:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['device:info:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5" v-if="!isTenantUser">
            <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['device:info:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['device:info:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" v-if="!tenantEnabled">
            <el-button type="info" icon="el-icon-upload" size="mini" @click="handleImport" v-hasPermi="['device:info:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5" v-if="!isTenantUser">
            <el-button type="danger" icon="el-icon-search" size="mini" @click="openAsyncTask=true" v-hasPermi="['device:info:import']">异步任务</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" border :data="infoList" @selection-change="handleSelectionChange" @sort-change="sortChange">
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column label="设备编号" align="center" prop="deviceNo" show-overflow-tooltip />
          <el-table-column label="设备名称" align="center" prop="deviceName"width="100" sortable="custom"/>
          <el-table-column label="型号编码" align="center" prop="deviceModelCode" width="100" />
          <el-table-column label="场景编码" align="center" prop="channelCode" />
          <el-table-column label="设备类型" align="center" prop="deviceType" :formatter="deviceTypeFormat" />
          <el-table-column label="设备方向" align="center" prop="deviceDirection" :formatter="deviceDirectionFormat" />
          <el-table-column label="在线状态" align="center" prop="deviceState" width="100">
            <template slot-scope="scope">
              <div :class="{'ec-online-status': true, 'online': scope.row.deviceState== '1', 'offline': scope.row.deviceState== '2'}" :title="deviceOnlineStateFormat(scope.row)"></div>
            </template>
          </el-table-column>
          <el-table-column label="租户ID" align="center" prop="tenantId" v-if="tenantEnabled && !isTenantUser" />
<!--          <el-table-column label="创建时间" align="center" prop="createTime" width="160" />-->
          <el-table-column label="server1数量" align="center" prop="countServer1"/>
          <el-table-column label="server2数量" align="center" prop="countServer2"/>
          <el-table-column label="修改时间" align="center" prop="updateTime" width="160" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['device:info:query']">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改设备信息对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="100px" :disabled="isShowDetailDialog">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设备编号" prop="deviceNo">
                  <el-input v-model="form.deviceNo" placeholder="请输入设备编号" :disabled="form.id!=null" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备名称" prop="deviceName">
                  <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设备类型" prop="deviceType">
                  <el-select v-model="form.deviceType" placeholder="请选择设备类型" class="ec-form-select">
                    <el-option v-for="item in deviceTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备型号" prop="deviceModelCode">
                  <el-select v-model="form.deviceModelCode" placeholder="请选择设备类型" class="ec-form-select">
                    <el-option v-for="item in modelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属场景" prop="channelCode">
                  <el-select v-model="form.channelCode" placeholder="请选择场景" clearable class="ec-form-select" @change="handleFormChannelCodeChange">
                    <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="绑定子场景" prop="subtreasuryCode">
                  <el-select v-model="form.subtreasuryCode" placeholder="请选择子场景" clearable multiple collapse-tags class="ec-form-select" v-if="!isShowDetailDialog" @change="handleFormSubtreasuryCodeChange">
                    <el-option v-for="item in subtreasurySelectOptions" :key="item.value" :label="item.label" :value="item.value">
                      <span style="float: left">{{ item.value }}</span>
                      <span style="float: left; color: #8492a6; font-size: 13px">【{{ item.label }}】</span>
                    </el-option>
                  </el-select>
                  <el-input v-else v-model="form.subtreasuryName" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="主子场景" prop="primarySubCode">
                  <el-select v-model="form.primarySubCode" placeholder="请选择主子场景" clearable class="ec-form-select" v-if="!isShowDetailDialog">
                    <el-option v-for="item in form.subtreasuryCode" :key="item" :label="item" :value="item">
                    </el-option>
                  </el-select>
                  <el-input v-else v-model="form.primarySubName" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="归属区域" prop="areaId">
                  <treeselect v-model="form.areaId" :options="areaOptions" :show-count="true" placeholder="请选择归属区域" :disabled="isShowDetailDialog" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设备IP" prop="deviceIp">
                  <el-input v-model="form.deviceIp" placeholder="请输入设备IP" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备Mac" prop="deviceMac">
                  <el-input v-model="form.deviceMac" placeholder="请输入设备Mac" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Server1数量" prop="countServer1">
                  <el-input v-model="form.countServer1" placeholder="请输入countServer1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Server2数量" prop="countServer2">
                  <el-input v-model="form.countServer2" placeholder="请输入countServer2" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="设备经度" prop="longitude">
                  <el-input type="number" v-model="form.longitude" placeholder="请输入设备经度" :controls="false" class="ec-form-select" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="设备纬度" prop="longitude">
                  <el-input type="number" v-model="form.latitude" placeholder="请输入设备纬度" :controls="false" class="ec-form-select" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否上传设备">
                  <el-radio-group v-model="form.isUpload">
                    <el-radio v-for="dict in isUploadOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                  <el-form-item label="apeId" prop="apeId">
                    <el-input v-model="form.apeId" placeholder="请输入apeId" />
                  </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="安装地点" prop="deviceAddr">
                  <el-input v-model="form.deviceAddr" placeholder="请输入安装地点" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="去重时长" prop="duplicateTime">
                  <el-input type="number" v-model="form.duplicateTime" title="后端比对去重时长(单位：ms)" placeholder="请输入后端比对去重时长(单位：ms)" :controls="false" class="ec-form-select" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20" v-if="isShowDetailDialog">
              <el-col :span="12">
                <el-form-item label="导入批次" prop="importBatchNum">
                  <el-input v-model="form.importBatchNum" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据更新" prop="pullAllFlag">
                  <el-input :value="form.pullAllFlag ? '全量更新':'增量更新'" />
                </el-form-item>
              </el-col>
            </el-row>
            <template v-if="isShowDetailDialog">
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
            <el-form-item label="设备方向" prop="deviceDirection">
              <el-select v-model="form.deviceDirection" placeholder="请选择设备方向" class="ec-form-select">
                <el-option v-for="item in deviceDirectionOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="扩展信息" prop="extInfo">
              <el-input v-model="form.extInfo" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog">
            <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>

        <!-- 设备批次导入对话框 -->
        <el-dialog :title="upload.title" :visible.sync="upload.open" width="600px" append-to-body :close-on-click-modal="false" v-if="!tenantEnabled">
          <el-form ref="uploadForm" :model="upload" :rules="uploadFormRules" label-width="80px">
            <el-form-item label="导入批次" prop="importBatchNum">
              <el-input v-model="upload.importBatchNum" disabled />
            </el-form-item>
            <el-form-item label="批次说明" prop="batchDesc">
              <el-input v-model="upload.batchDesc" />
            </el-form-item>
            <el-form-item label="设备类型" prop="deviceType">
              <el-select v-model="upload.deviceType" placeholder="请选择设备类型" class="ec-form-select">
                <el-option v-for="item in deviceTypeOptions" :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="上传文件" prop="file">
              <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" accept=".xlsx, .xls" :uploadPath="upload.url + '?updateSupport=' + upload.updateSupport + '&importBatchNum=' + upload.importBatchNum + '&deviceType=' + upload.deviceType + '&tenantId=' + upload.tenantId + '&batchDesc=' + upload.batchDesc" name="excelFile" @fail="handleUploadFileFail" @success="handleImportFileSuccess" drag />
              <div>
                <el-checkbox v-model="upload.updateSupport" />更新已经存在的数据
                <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
              </div>
            </el-form-item>
            <div style="color:red; line-height: 18px; font-size: 12px;padding-left: 35px;">提示：1、要导入的表格信息为从此处导出的模板上维护！
              <span style="padding-left: 36px; display: inline-block;">
                2、【设备编号SN】和【型号编码】必填<br />
              </span>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" :loading="exportLoading" @click="submitFileForm">确 定</el-button>
            <el-button @click="cancelFileForm">取 消</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
    <!--异步任务查询弹窗-->
    <async-task :open="openAsyncTask" @close="openAsyncTask=false"></async-task>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { listInfo, getInfo, delInfo, addInfo, updateInfo, exportInfo, generateImportBatchNum, importTemplate } from "@/api/device/info";
import { treeselect } from "@/api/area/model";
import { listAllChannel } from "@/api/scene/channel";
import { listAllModel } from "@/api/device/model";
import { listByChannel } from "@/api/scene/subtreasury";
import UploadFile from '@/components/UploadFile';
import Treeselect from "@riophae/vue-treeselect";
import AsyncTask from "@/views/components/common/async-task";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "DeviceInfo",
  components: {
    UploadFile,
    Treeselect,
    AsyncTask
  },
  data() {
    return {
      foldNumber: {
        tree: 4,
        table: 20,
        icon: "el-icon-arrow-left",
        foldIcon: "el-icon-arrow-right",
        text: "收起",
        foldText: "展开"
      },
      // 导入加载
      exportLoading: false,
      // 提交加载
      submitLoading: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 设备名称
      deviceName: "",
      // 选中数据的租户列表
      tenantIds: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 设备信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 创建方式
      createMethodOptions: [],
      // 设备类型
      deviceTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceNo: null,
        deviceName: null,
        deviceModelCode: null,
        channelCode: null,
        areaId: null,
        tenantId: null,
        importBatchNum: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        deviceNo: [
          { required: true, message: "设备编号不能为空", trigger: "blur" },
          { max: 40, message: "设备编号不能超过40", }
        ],
        deviceName: [
          { required: true, message: "设备名称不能为空", trigger: "blur" }
        ],
        deviceType: [
          { required: true, message: "设备类型不能为空", trigger: "change" }
        ],
        deviceModelCode: [
          { required: true, message: "设备型号不能为空", trigger: "change" }
        ],
        // longitude: [
        //   { pattern: /^([0-9]|[1-8]\d|90)$/, message: "设备经度必须在0-90之间" }
        // ],
        // latitude: [
        //   { pattern: /^([0-9]|[1-8]\d|90)$/, message: "设备纬度必须在0-90之间" }
        // ],
      },
      // 场景列表
      channelSelectOptions: [],
      // 子场景列表
      subtreasurySelectOptions: [],
      // 型号列表
      modelSelectOptions: [],
      // 设备在线状态
      deviceOnlineStateOptions: [],
      // 设备方向
      deviceDirectionOptions: [],
      //是否推送设备
      isUploadOptions: [],
      // 区域树选项
      areaOptions: null,
      // 区域名称
      areaName: null,
      // 区域树属性配置
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 是否是详情展示窗口
      isShowDetailDialog: false,
      // 证件导入参数
      upload: {
        // 设备类型
        deviceType: null,
        // 文件（用于表单校验）
        file: null,
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "设备导入",
        // 是否覆盖更新
        updateSupport: false,
        // 上传的地址
        url: "/device/info/import"
      },
      uploadFormRules: {
        deviceType: [
          { required: true, message: "设备类型不能为空", trigger: "change" }
        ],
        importBatchNum: [
          { required: true, message: "导入批次不能为空", trigger: "change" }
        ],
        batchDesc: [
          { required: true, message: "批次说明不能为空", trigger: "blur" }
        ],
        file: [
          { required: true, message: "文件不能为空", trigger: ["change", "blur"] }
        ]
      },
      // 租户列表
      tenantOptions: [],
      // 远程检索loading
      remoteSelectLoading: false,
      // 是否打开异步任务查询弹窗
      openAsyncTask: false
    };
  },
  watch: {
    // 根据名称筛选区域树
    areaName(val) {
      this.$refs.tree.filter(val);
    },
    'queryParams.tenantId': {
      handler(newVal, oldVal) {
        this.queryParams.areaId = null;
        this.getTreeselect();
        this.listAllChannel();
      }
    },
    '$route': {
      // val是改变之后的路由，oldVal是改变之前的val
      handler: function (val, oldVal) {
        if (val.name !== 'Info') {
          return;
        }
        if (val.params.tenantId) {
          this.queryParams.tenantId = val.params.tenantId;
        }
        if (val.params.importBatchNum) {
          this.queryParams.importBatchNum = val.params.importBatchNum;
        }
        this.getList();
      },
      // 深度观察监听
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  created() {
    this.getTreeselect();
    this.listAllChannel();
    this.listAllModel();
    this.getDicts("device_create_method").then(response => {
      this.createMethodOptions = response.data;
    });
    this.getDicts("client_device_type").then(response => {
      this.deviceTypeOptions = response.data;
    });
    this.getDicts("device_online_state").then(response => {
      this.deviceOnlineStateOptions = response.data;
    });
    this.getDicts("device_direction").then(response => {
      this.deviceDirectionOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.isUploadOptions = response.data;
    });
  },
  methods: {
    /** 收起或者展开 */
    foldTree() {
      if (this.foldNumber.tree == 4) {
        this.foldNumber = {
          tree: 0,
          table: 24,
          icon: "el-icon-arrow-right",
          text: "展开",
        }
      } else {
        this.foldNumber = {
          tree: 4,
          table: 20,
          icon: "el-icon-arrow-left",
          text: "合并",
        }
      }

    },
    /** 查询设备信息列表 */
    getList() {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有场景列表 */
    listAllChannel() {
      this.channelSelectOptions = []
      listAllChannel({ tenantId: this.queryParams.tenantId }).then(response => {
        if (response.data && response.data.length) {
          this.channelSelectOptions = response.data.map(item => {
            return {
              value: `${item.channelCode}`,
              label: `${item.channelName}`,
              channelId: `${item.id}`,
            };
          });
        }
      });
    },
    /** 查询所有型号列表 */
    listAllModel() {
      listAllModel().then(response => {
        if (response.data && response.data.length) {
          this.modelSelectOptions = response.data.map(item => {
            return {
              value: `${item.modelCode}`,
              label: `${item.modelName}`
            };
          });
        }
      });
    },
    /** 查询区域下拉树结构 */
    getTreeselect() {
      treeselect({ tenantId: this.queryParams.tenantId }).then(response => {
        this.areaOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.areaId = data.id;
      this.getList();
    },
    // 创建方式字典翻译
    createMethodFormat(row, column) {
      return this.selectDictLabel(this.createMethodOptions, row.createMethod);
    },
    // 在线状态字典翻译
    deviceOnlineStateFormat(row, column) {
      return this.selectDictLabel(this.deviceOnlineStateOptions, row.deviceState);
    },
    // 设备类型字典翻译
    deviceTypeFormat(row, column) {
      return this.selectDictLabel(this.deviceTypeOptions, row.deviceType);
    },
    // 设备方向字典翻译
    deviceDirectionFormat(row, column) {
      return this.selectDictLabel(this.deviceDirectionOptions, row.deviceDirection);
    },
    /** 表单场景变化 */
    async handleFormChannelCodeChange(newVal) {
      this.subtreasurySelectOptions = [];
      this.form.subtreasuryCode = "";// 此处不允许为null,必须是空串
      this.form.primarySubCode = "";// 此处不允许为null,必须是空串
      if (newVal) {
        let selectedChannel = this.channelSelectOptions.filter(item => item.value == newVal);
        if(selectedChannel.length){
          const res = listByChannel(selectedChannel[0].channelId).then(response => {
          if (response.data && response.data.length) {
            this.subtreasurySelectOptions = response.data.map(item => {
              return {
                value: `${item.subTreasuryCode}`,
                label: `${item.subTreasuryName}`
              };
            });
          }
          return this.subtreasurySelectOptions;
        })
        return res;
        }
      }
      return '';
    },
    /**表单子场景变化 */
    handleFormSubtreasuryCodeChange(newVal) {
      if (this.isShowDetailDialog) return;
      this.form.primarySubCode = "";
      if (newVal && newVal.length) {
        this.form.primarySubCode = newVal[0];
      }
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
        deviceNo: null,
        deviceName: null,
        deviceAddr: null,
        deviceModelCode: null,
        deviceIp: null,
        deviceMac: null,
        deviceDirection: null,
        longitude: null,
        latitude: null,
        channelCode: null,
        areaId: null,
        subtreasuryCode: null,
        deviceState: null,
        importBatchNum: null,
        createMethod: null,
        pullAllFlag: null,
        primarySubCode: null,
        duplicateTime: null,
        deviceType: null,
        mqttPwd: null,
        mqttSalt: null,
        extInfo: null,
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
      this.queryParams.areaId = null;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.tenantIds = selection.map(item => item.tenantId)
      this.ids = selection.map(item => item.id)
      this.deviceName = selection.map(item => item.deviceName);
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.queryParams.tenantId = null;
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加设备信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.queryParams.tenantId = null;
      this.isShowDetailDialog = false;
      const id = row.id || this.ids;
      getInfo(id).then(response => {
        this.handleUpdateFormShow(response.data)
      });
    },
    /**处理修改操作表单回显 */
    async handleUpdateFormShow(data) {
      if (data.subtreasuryCode) {
        data.subtreasuryCode = data.subtreasuryCode.split(",");
      }
      await this.handleFormChannelCodeChange(data.channelCode);
      this.form = data;
      this.open = true;
      this.title = "修改设备信息";
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          let data = JSON.parse(JSON.stringify(this.form))
          if (data.subtreasuryCode && data.subtreasuryCode.length) {
            data.subtreasuryCode = data.subtreasuryCode.join();
          } else if (JSON.stringify(data.subtreasuryCode) == '[]') {
            data.subtreasuryCode = "";
          }
          if (this.form.id != null) {
            updateInfo(data).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(() => this.submitLoading = false);
          } else {
            addInfo(data).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              this.submitLoading = false;
            }).catch(() => this.submitLoading = false);
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const tenantId = row.tenantId || this.tenantIds[0]
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除设备名称为"' + this.deviceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delInfo(ids, tenantId);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(() => {

      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有设备信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportInfo(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    /**显示详情信息 */
    handleShowDetail(row) {
      this.reset();
      this.queryParams.tenantId = null;
      const id = row.id || this.ids
      let tenantId = null
      if (this.tenantEnabled && !this.isTenantUser) {
        tenantId = row.tenantId
      }
      getInfo(id, tenantId).then(response => {
        this.form = response.data;
        this.title = "设备详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
    /**导入设备操作 */
    handleImport() {
      generateImportBatchNum().then(res => {
        this.$set(this.upload, 'importBatchNum', res)
      })
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg);
      });
    },
    /**文件上传成功处理 */
    handleImportFileSuccess(res) {
      this.upload.open = false;
      this.exportLoading = false;
      this.resetUploadForm();
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: '任务ID为：<br/><strong>' + res.msg + '</strong><br/>请复制任务ID点击[<strong>异步任务</strong>]查询结果',
        type: 'success',
        duration: 0
      });
    },
    handleUploadFileFail() {
      this.exportLoading = false;
    },
    /**提交上传文件 */
    submitFileForm() {
      this.exportLoading = true;
      this.$refs["uploadForm"].validate(valid => {
        if (!valid) {
          this.exportLoading = false;
          return;
        }
        this.exportLoading = false;
        this.$refs.importUpload.submit();
      });
    },
    /**取消上传 */
    cancelFileForm() {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
      this.resetUploadForm()
    },
    /**重置导入上传表单 */
    resetUploadForm() {
      this.upload.importBatchNum = null;
      this.upload.updateSupport = false;
      this.upload.deviceType = null;
      this.upload.tenantId = null;
      this.upload.batchDesc = null;
      this.resetForm("uploadForm");
    },
    // 排序触发
    sortChange(column) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order === 'ascending' ? 'asc' : 'desc';
      this.getList(); // 重新请求后端接口
    },
  }
};
</script>
<style lang="scss" scoped>
.ec-online-status {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  position: relative;
  float: left;
  left: calc(50% - 8px);
  &.online {
    background-color: #05f570;
  }
  &.offline {
    background-color: red;
  }
}
.extend {
  position: absolute;
  left: -5px;
  z-index: 100;
  top: 50%;
  width: 12px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: aliceblue;
  transition: all 0.3s;
}
.extend:hover {
  background-color: rgb(216, 224, 231);
}
</style>
