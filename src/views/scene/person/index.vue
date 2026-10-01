<template>
  <div class="containers">
    <el-row>
      <!-- 树形结构 -->
      <el-col :span="4" :xs="24">
        <PartmentTree @treeChangeTable="treeChangeTable" ref="tree"></PartmentTree>
      </el-col>
      <el-col :span="20" style="padding-left:10px;" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="选择场景" prop="channelId">
            <el-select size="small" class="ec-form-select" v-model="queryParams.channelId" clearable filterable reserve-keyword placeholder="请输入场景名称检索">
              <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="唯一标识" prop="uniqueId">
            <el-input v-model="queryParams.uniqueId" placeholder="请输入人员唯一标识" clearable size="small" @keyup.enter.native="handleQuery" />
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
            <el-button type="cyan" icon="el-icon-search" size="mini" v-hasPermi="['scene:channelBusi:query']" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['scene:channelBusi:add']">添加人员</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['scene:channelBusi:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['scene:channelBusi:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['scene:channelBusi:export']">导出</el-button>
          </el-col>
          <el-col v-if="type == 1" :span="1.5">
            <el-button type="default" icon="el-icon-upload" size="mini" @click="handleImport" v-hasPermi="['scene:channelBusi:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button title="同步场景人员到datamanager" type="info" icon="el-icon-refresh" size="mini" @click="handleSyncdata" v-hasPermi="['scene:channelBusi:syncdata']">一键同步</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-search" size="mini" @click="openAsyncTask=true" v-hasPermi="['scene:channelBusi:import','scene:channelBusi:syncdata']">异步任务</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" border :data="channelBusiList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="场景名称" align="center" prop="channelName" show-overflow-tooltip>
            <template slot-scope="scope">
              {{scope.row.subTreasuryName?scope.row.subTreasuryName:scope.row.channelName}}
            </template>
          </el-table-column>
          <el-table-column label="场景类型" align="center" prop="channelName" show-overflow-tooltip>
            <template>
              {{type == 1?"场景":"子场景"}}
            </template>
          </el-table-column>
          <el-table-column label="人员姓名" align="center" prop="personName" width="100" show-overflow-tooltip />
          <el-table-column label="人员标识" align="center" prop="uniqueId">
            <template slot-scope="scope">
              <router-link :to="{name:'Personinfo', params:{uniqueId: scope.row.uniqueId}}">
                <span class="link-type">{{scope.row.uniqueId}}</span>
              </router-link>
            </template>
          </el-table-column>
          <el-table-column label="开通人脸" align="center" prop="faceMode" width="105">
            <template slot-scope="scope">
              <el-switch v-if="type == 1" @change="handleChangeBioMode(scope.row, 'faceMode')" v-model="scope.row.faceMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
              </el-switch>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="开通指纹" align="center" prop="fingerMode" width="105">
            <template slot-scope="scope">
              <el-switch v-if="type == 1" @change="handleChangeBioMode(scope.row, 'fingerMode')" v-model="scope.row.fingerMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
              </el-switch>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="开通虹膜" align="center" prop="irisMode" width="105">
            <template slot-scope="scope">
              <el-switch v-if="type == 1" @change="handleChangeBioMode(scope.row, 'irisMode')" v-model="scope.row.irisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
              </el-switch>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="开通指静脉" align="center" prop="fveinMode" width="105">
            <template slot-scope="scope">
              <el-switch v-if="type == 1" @change="handleChangeBioMode(scope.row, 'fveinMode')" v-model="scope.row.fveinMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
              </el-switch>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="开通多模态" align="center" prop="faceIrisMode" width="105">
            <template slot-scope="scope">
              <el-switch v-if="type == 1" @change="handleChangeBioMode(scope.row, 'faceIrisMode')" v-model="scope.row.faceIrisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
              </el-switch>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column label="设备管理员" align="center" prop="deviceMgr" width="60">
            <template slot-scope="scope">
              <div>{{handleShowDeviceMgr(scope.row.deviceMgr)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="status" width="60">
            <template slot-scope="scope">
              <div>{{handleShowStatus(scope.row.status)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime">
            <template slot-scope="scope">
              {{scope.row.updateTime?scope.row.updateTime:scope.row.createTime}}
            </template>
          </el-table-column>
          <!-- <el-table-column label="修改时间" align="center" prop="updateTime" /> -->
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['scene:channelBusi:query']">详细</el-button>
              <el-button title="对该子场景下的所有设备生效" v-if="type == 2" size="mini" type="text" icon="el-icon-edit" @click="handleSetDeviceMgr(scope.row)" v-hasPermi="['scene:channelBusi:edit']">{{scope.row.deviceMgr=='Y'? '取消设备管理员':'设为设备管理员'}}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

        <!-- 添加或修改场景业务对话框 -->
        <el-dialog :title="title" :visible.sync="open" :width="form.id != null ? '900px' : '900px'" append-to-body :close-on-click-modal="false" :before-close="cancel" :fullscreen="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="100px" :disabled="isShowDetailDialog">
            <el-row :gutter="20" v-if="form.id == null">
              <el-col :span="12">
                <el-form ref="typeform" :model="typeforms" :rules="rules" label-width="100px" :disabled="isShowDetailDialog">
                  <el-form-item label="业务类型" prop="type">
                    <el-select class="ec-form-select" v-model="typeforms.type" @change="selectChange" filterable reserve-keyword placeholder="请选择业务类型">
                      <!-- <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option> -->
                      <el-option label="业务场景" :value="1"></el-option>
                      <el-option label="业务场景-子场景" :value="2"></el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-col>
              <el-col v-if="typeforms.type == 1" :span="12">
                <el-form-item label="业务场景" prop="channelId">
                  <el-select class="ec-form-select" v-model="form.channelId" filterable reserve-keyword placeholder="请输入场景名称检索">
                    <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col v-else :span="12">
                <el-form-item label="子场景" prop="subTreasuryId">
                  <el-cascader v-model="form.subTreasuryId" :props="subProps" clearable filterable class="ec-form-select"></el-cascader>
                </el-form-item>
              </el-col>
            </el-row>
            <h4>人员信息</h4>
            <div class="container">
              <el-row :gutter="20" v-if="form.id == null">
                <el-col :span="24">
                  <el-form-item label="添加类型" prop="bindType">
                    <div>
                      <el-radio v-model="form.bindType" label="1" border>全部添加</el-radio>
                      <el-radio v-model="form.bindType" label="2" border>按部门添加</el-radio>
                      <el-radio v-model="form.bindType" label="3" border>自定义添加</el-radio>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" v-if="form.id == null && form.bindType == '2'">
                <el-col :span="24">
                  <el-form-item label="选择部门" prop="deptId" :rules="[{ required: true, message: '部门不能为空', trigger: ['blur', 'change'] }]">
                    <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择部门" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20" v-if="form.id == null && form.bindType == '3'">
                <el-col :span="24">
                  <el-form-item label="选择人员" prop="uniqueId" :rules="[{ required: true, message: '人员不能为空', trigger: ['blur', 'change'] }]">
                    <el-input placeholder="请点击右侧图标选择人员" v-model="form.uniqueId" disabled>
                      <el-button slot="append" icon="el-icon-search" @click="handleSelectPerson"></el-button>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <template v-if="form.id != null">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人员标识" prop="uniqueId">
                      <el-input v-model="form.uniqueId" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="人员姓名" prop="personName">
                      <el-input v-model="form.personName" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="场景名称" prop="channelName">
                      <el-input v-model="form.channelName" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="场景编码" prop="channelCode">
                      <el-input v-model="form.channelCode" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-if="type == 2" :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="子场景名称" prop="subTreasuryName">
                      <el-input v-model="form.subTreasuryName" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="子场景编码" prop="subTreasuryCode">
                      <el-input v-model="form.subTreasuryCode" disabled />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-if="type == 1" :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="业务号1" prop="busiCodeFirst">
                      <el-input v-model="form.busiCodeFirst" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="业务号2" prop="busiCodeSecond">
                      <el-input v-model="form.busiCodeSecond" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="业务号3" prop="busiCodeThird">
                      <el-input v-model="form.busiCodeThird" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>
              <el-row v-if="typeforms.type == 1 && type == 1" :gutter="20">
                <el-col :span="4">
                  <el-form-item label="开通人脸" prop="faceMode">
                    <el-switch v-model="form.faceMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="开通虹膜" prop="irisMode">
                    <el-switch v-model="form.irisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="开通指纹" prop="fingerMode">
                    <el-switch v-model="form.fingerMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="开通指静脉" prop="fveinMode">
                    <el-switch v-model="form.fveinMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="开通多模态" prop="faceIrisMode">
                    <el-switch v-model="form.faceIrisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
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
              <el-form-item label="备注" prop="remark">
                <el-input v-model="form.remark" type="textarea" maxlength="150" :rows="4" />
              </el-form-item>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog" v-loading="formLoading">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
        <!-- 选择人员 -->
        <list-person :open="selectPersonOpen" :subTreasuryId="form.subTreasuryId" :channelId="form.channelId" @select-over="handleSelectOver" @close="personClose"></list-person>

        <!-- 人员基础信息导入对话框 -->
        <el-dialog :title="upload.title" :visible.sync="upload.open" width="600px" append-to-body :close-on-click-modal="false">
          <el-form ref="uploadForm" :model="upload" :rules="uploadFormRules" label-width="80px">
            <el-form-item label="选择场景" prop="channelId">
              <el-select class="ec-form-select" v-model="upload.channelId" clearable filterable reserve-keyword placeholder="请输入场景名称检索">
                <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="上传文件" prop="file">
              <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" accept=".xlsx, .xls" :uploadPath="upload.url + '?channelId='+ upload.channelId +'&updateSupport=' + upload.updateSupport" name="excelFile" @success="handleImportFileSuccess" @fail="handleImportFileFail" drag />
              <div>
                <el-checkbox v-model="upload.updateSupport" />更新已经存在的人员数据
                <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
              </div>
            </el-form-item>
            <div style="color:red; line-height: 18px; font-size: 12px;padding-left: 35px;">提示：1、仅允许导入“xls”或“xlsx”格式文件！
              <span style="padding-left: 36px; display: block;">
                2、“唯一标识”必填<br />
                3、开通人脸(指纹、虹膜、指静脉)等和场景保持一致
              </span>
            </div>
          </el-form>
          <div slot="footer" class="dialog-footer" v-loading="formLoading">
            <el-button type="primary" @click="submitFileForm">确 定</el-button>
            <el-button @click="cancelFileForm">取 消</el-button>
          </div>
        </el-dialog>
        <!--异步任务查询弹窗-->
        <async-task :open="openAsyncTask" @close="openAsyncTask=false"></async-task>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PartmentTree from '../module/PartmentTree';
import { mapGetters } from 'vuex'
import { asynctaskResult } from "@/api/common/asynctask";
import { listChannelBusi, getChannelBusi, delChannelBusi, addChannelBusi, updateChannelBusi, exportChannelBusi, importTemplate, syncdata } from "@/api/scene/channelBusi";
import { listAllChannel } from "@/api/scene/channel";
import { treeselect } from "@/api/system/dept";
import ListPerson from '@/views/components/scene/list-person.vue';
import Treeselect from "@riophae/vue-treeselect";
import UploadFile from '@/components/UploadFile';
import AsyncTask from "@/views/components/common/async-task";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { listByChannel } from "@/api/scene/subtreasury";
import hasLoading from '@/utils/loading.js'
import { listSubtreasuryBusi, getSubtreasuryBusi, delSubtreasuryBusi, addSubtreasuryBusi, updateSubtreasuryBusi, exportSubtreasuryBusi, clearSubData } from "@/api/scene/subtreasuryBusi";
export default {
  name: "ChannelBusi",
  components: {
    ListPerson,
    Treeselect,
    UploadFile,
    AsyncTask,
    PartmentTree
  },
  data () {
    return {
      // 场景类型
      type: 1,
      // 删除信息
      delName: "",
      // 删除人员名称
      personName: "",
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
      // 场景业务表格数据
      channelBusiList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        channelId: null,
        uniqueId: null,
        datasource: null,
        status: '0',
        tenantId: null,
        subTreasuryId: null,
      },
      // 部门树选项
      deptOptions: undefined,
      // 表单参数
      form: {},
      typeforms: {
        type: 1
      },
      // 保存表单遮罩
      formLoading: false,
      // 表单校验
      rules: {
        type: [
          { required: true, message: "业务类型不能为空", trigger: "change" }
        ],
        channelId: [
          { required: true, message: "场景不能为空", trigger: "change" }
        ],
        bindType: [
          { required: true, message: "添加类型不能为空", trigger: "change" }
        ],
        faceMode: [
          { required: true, message: "开通人脸不能为空", trigger: "change" }
        ],
        fingerMode: [
          { required: true, message: "开通指纹不能为空", trigger: "change" }
        ],
        irisMode: [
          { required: true, message: "开通虹膜不能为空", trigger: "change" }
        ],
        fveinMode: [
          { required: true, message: "开通指静脉不能为空", trigger: "change" }
        ],
        faceIrisMode: [
          { required: true, message: "开通人脸虹膜多模态不能为空", trigger: "change" }
        ],
        subTreasuryId: [
          { required: true, message: "子场景不能为空", trigger: "change" }
        ]
      },
      // 场景列表
      channelSelectOptions: [],
      // 表单选中场景的场景编码
      selectedChannelCode: null,
      // 查询场景遮罩
      queryChannelLoading: false,
      // 选择人员弹窗
      selectPersonOpen: false,
      // 数据来源数据字典
      datasourceOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 是否数据字典
      yesOrNoOptions: [],
      // 是否是详情弹窗
      isShowDetailDialog: false,
      // 上传文件列表 
      uploadLeftIrisFileList: [],
      uploadRightIrisFileList: [],
      uploadFaceFileList: [],
      uploadFingerFileList: [],
      // 人员基础信息导入参数
      upload: {
        // 文件（用于表单校验）
        file: null,
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
        // 是否覆盖更新
        updateSupport: false,
        // 上传的地址
        url: "/scene/channelBusi/import"
      },
      uploadFormRules: {
        channelId: [
          { required: true, message: "场景不能为空", trigger: "change" }
        ],
        file: [
          { required: true, message: "文件不能为空", trigger: ["change", "blur"] }
        ]
      },
      // 是否打开异步任务查询弹窗
      openAsyncTask: false,
      // 子场景级联查询属性配置
      subProps: {
        emitPath: false,
        lazy: true,
        lazyLoad (node, resolve) {
          const { level, value } = node;
          if (level == 0) {
            listAllChannel().then(response => {
              if (response.data && response.data.length) {
                const nodes = response.data.map(item => ({
                  value: item.id,
                  label: item.channelName,
                  leaf: false
                }));
                resolve(nodes);
              }
            })
          } else {
            listByChannel(value).then(response => {
              if (response.data && response.data.length) {
                const nodes = response.data.map(item => ({
                  value: item.id,
                  label: item.subTreasuryName,
                  leaf: true
                }));
                // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                resolve(nodes);
              }
            });
          }
        }
      },
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  watch: {
    'queryParams.tenantId': {
      handler (newVal, oldVal) {
        this.listAllChannel();
      }
    },
    'form.channelId': {
      handler (newVal, oldVal) {
        if (newVal && newVal.length) {
          if (this.$refs.form) {
            this.$refs.form.clearValidate();
          }
          if (this.form.id) {
            return;
          }
          let selectedChannel = this.channelSelectOptions.filter(item => item.value == newVal);
          if (selectedChannel && selectedChannel.length) {
            this.$set(this.form, 'faceMode', selectedChannel[0].faceMode);
            this.$set(this.form, 'irisMode', selectedChannel[0].irisMode);
            this.$set(this.form, 'fveinMode', selectedChannel[0].fveinMode);
            this.$set(this.form, 'faceIrisMode', selectedChannel[0].faceIrisMode);
            this.$set(this.form, 'fingerMode', selectedChannel[0].fingerMode);
          }
        }
      },
      immediate: false
    }
  },
  created () {
    this.getDicts("apply_data_source").then(response => {
      this.datasourceOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.yesOrNoOptions = response.data;
    });
    this.listAllChannel();
    this.getList();
    this.getTreeselect();
  },
  methods: {
    /** 新增人员的下拉选择 */
    selectChange (val) {
      this.reset();
    },
    /** 通过树形结构改变表格 */
    treeChangeTable (val) {
      console.log(val);
      if (!val.parentId) {
        this.type = 1;
        this.queryParams.channelId = val.id;
        this.queryParams.subTreasuryId = null;
      } else {
        this.type = 2;
        this.queryParams.channelId = null;
        this.queryParams.subTreasuryId = val.id;
      }
      this.getList();
    },
    /** 查询场景业务列表 */
    getList () {
      if (this.type == 1) {
        this.getSceneList()
      } else {
        this.getSubList()
      }
    },
    getSceneList () {
      this.loading = true;
      listChannelBusi(this.queryParams).then(response => {
        this.channelBusiList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询子场景信息列表 */
    getSubList () {
      this.loading = true;
      listSubtreasuryBusi(this.queryParams).then(response => {
        this.channelBusiList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询所有场景列表 */
    listAllChannel () {
      this.channelSelectOptions = []
      listAllChannel({ tenantId: this.queryParams.tenantId }).then(response => {
        if (response.data && response.data.length) {
          this.channelSelectOptions = response.data.map(item => {
            return {
              value: `${item.id}`,
              label: `${item.channelName}`,
              channelCode: `${item.channelCode}`,
              faceMode: `${item.faceMode}`,
              irisMode: `${item.irisMode}`,
              fveinMode: `${item.fveinMode}`,
              faceIrisMode: `${item.faceIrisMode}`,
              fingerMode: `${item.fingerMode}`
            };
          });
        }
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
      this.typeforms.type = 1;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        channelId: null,
        personId: null,
        uniqueId: null,
        busiCodeFirst: null,
        busiCodeSecond: null,
        busiCodeThird: null,
        faceMode: '0',
        fingerMode: '0',
        irisMode: '0',
        fveinMode: '0',
        faceIrisMode: '0',
        datasource: null,
        locked: null,
        lockTime: null,
        status: "0",
        remark: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        batchDate: null,
        tenantId: null,
        bindType: '3',
        deptId: null,
        subTreasuryId: null
      };
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
      console.log(selection);
      this.ids = selection.map(item => item.id)
      this.delName = selection.map(item => item.channelName)
      this.personName = selection.map(item => item.personName)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.queryParams.tenantId = null;
      this.isShowDetailDialog = false
      this.open = true;
      this.title = "新增人员";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      if (this.type == 2) {
        this.msgError("子场景人员无法修改");
        return
      }
      this.reset();
      this.queryParams.tenantId = null;
      this.isShowDetailDialog = false
      const id = row.id || this.ids;
      if (this.type == 1) {
        getChannelBusi(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改";
        });
      } else {
        getSubtreasuryBusi(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改";
        });
      }

    },
    /** 提交按钮 */
    submitForm () {
      this.formLoading = true
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false
          return;
        }
        switch (this.typeforms.type) {
          case 1:
            this.sceneSubmit();
            break;
          case 2:
            this.subSceneSubmit();
            break;
          default:
            break;
        }

      });
    },
    /** 场景人员提交 */
    sceneSubmit () {
      if (this.form.id != null) {
        updateChannelBusi(this.form).then(response => {
          this.msgSuccess("修改成功");
          this.open = false;
          this.formLoading = false;
          this.getList();
        }).catch(err => {
          this.formLoading = false
        });
      } else {
        addChannelBusi(this.form).then(response => {
          this.msgSuccess("新增成功");
          this.open = false;
          this.formLoading = false
          this.getList();
        }).catch(err => {
          this.formLoading = false
        });
      }
    },
    /** 子场景人员提交 */
    subSceneSubmit () {
      if (this.form.id != null) {
        updateSubtreasuryBusi(this.form).then(response => {
          this.msgSuccess("修改成功");
          this.open = false;
          this.formLoading = false
          this.getList();
        }).catch(err => {
          this.formLoading = false
        });
      } else {

        addSubtreasuryBusi(this.form).then(response => {
          this.msgSuccess("新增成功");
          this.open = false;
          this.formLoading = false
          this.getList();
        }).catch(err => {
          this.formLoading = false
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除场景名称为"' + this.delName + '"人员名称为"' + this.personName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if (this.type == 1) {
          return delChannelBusi(ids);
        } else {
          return delSubtreasuryBusi(ids);
        }

      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport () {
      const queryParams = this.queryParams;
      if (this.type == 1) {
        this.$confirm('是否确认导出所有场景业务数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportChannelBusi(queryParams);
        }).then(response => {
          hasLoading.start();
          let taskId = response.msg;
          this.checkExportTask(taskId, (filename) => {
            this.download(filename);
          });
        })
      } else {
        this.$confirm('是否确认导出所有子场景业务数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportSubtreasuryBusi(queryParams);
        }).then(response => {
          hasLoading.start();
          let taskId = response.msg;
          this.checkExportTask(taskId, (filename) => {
            this.download(filename);
          });
        })
      }

    },
    /**检测导出任务执行结果 */
    checkExportTask (taskId, callback) {
      this.getExportTaskResult(taskId).then(res => {
        let filename = res.msg;
        if (filename && filename.length) {
          hasLoading.end();
          callback(filename);
          return;
        }
        setTimeout(() => {
          this.checkExportTask(taskId, callback);
        }, 100);
      }).catch(() => hasLoading.end());
    },
    /**获取异步任务执行结果 */
    async getExportTaskResult (taskId) {
      return await asynctaskResult(taskId).then(res => {
        return res.data;
      });
    },
    /** 展示详情 */
    handleShowDetail (row) {
      this.reset();
      const id = row.id || this.ids;
      if (this.type == 1) {
        getChannelBusi(id).then(response => {
          this.form = response.data;
          this.title = "详细信息";
          this.isShowDetailDialog = true;
          this.open = true;
        });
      } else {
        getSubtreasuryBusi(id).then(response => {
          this.form = response.data;
          this.title = "详细信息";
          this.isShowDetailDialog = true;
          this.open = true;
        });
      }

    },
    /**选择人员弹窗 */
    handleSelectPerson () {
      if (this.typeforms.type == 1 && !this.form.channelId) {
        this.$refs.form.validateField('channelId');
        return;
      }
      if (this.typeforms.type == 2 && !this.form.subTreasuryId) {
        this.$refs.form.validateField('subTreasuryId');
        return;
      }
      this.selectPersonOpen = true;

    },
    /**
     * 关闭人员弹窗
     */
    personClose () {
      this.selectPersonOpen = false;
      console.log(this.selectPersonOpen);
    },
    /**选择人员确认回调 */
    handleSelectOver (personInfos) {
      if (!personInfos || !personInfos.length) {
        return;
      }
      const personIds = personInfos.map(item => item.id).join();
      const uniqueIds = personInfos.map(item => item.uniqueId).join();
      this.form.personId = personIds;
      this.form.uniqueId = uniqueIds;
    },
    /** 数据来源显示转换 */
    handleShowDatasource (val) {
      return this.selectDictLabel(this.datasourceOptions, val);
    },
    /** 状态显示转换 */
    handleShowStatus (val) {
      return this.selectDictLabel(this.statusOptions, val);
    },
    /** 设备管理员显示转换 */
    handleShowDeviceMgr (val) {
      return this.selectDictLabel(this.yesOrNoOptions, val);
    },
    /** 生物信息业务状态改变 */
    handleChangeBioMode (row, mode) {
      this.$confirm('是否确认修改开通状态?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return updateChannelBusi(row);
      }).then(response => {
        this.msgSuccess("修改成功");
      }).catch(() => {
        row[mode] = row[mode] === "0" ? "1" : "0";
      });
    },
    /**导入信息 */
    handleImport () {
      this.upload.title = "基础信息导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate () {
      importTemplate().then(response => {
        this.download(response.msg);
      });
    },
    /**导入文件上传成功处理 */
    handleImportFileSuccess (res) {
      this.upload.open = false;
      this.formLoading = false
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: '任务ID为：<br/><strong>' + res.msg + '</strong><br/>请复制任务ID点击[<strong>异步任务</strong>]查询结果',
        type: 'success',
        duration: 0
      });
    },
    /**导入文件上传成功处理 */
    handleImportFileFail (response) {
      this.formLoading = false
    },
    /**提交上传导入文件 */
    submitFileForm () {
      this.formLoading = true
      this.$refs["uploadForm"].validate(valid => {
        if (!valid) {
          this.formLoading = false
          return;
        }
        this.$refs.importUpload.submit()
      });
    },
    /**取消导入上传*/
    cancelFileForm () {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
    },
    /**同步数据到datamanager */
    handleSyncdata () {
      this.$confirm('是否确认同步所有场景人员到datamanager服务?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return syncdata();
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
    // 设置设备管理员
    handleSetDeviceMgr (row) {
      let data = JSON.parse(JSON.stringify(row));
      data.deviceMgr = row.deviceMgr == 'Y' ? 'N' : 'Y';
      updateSubtreasuryBusi(data).then(response => {
        this.msgSuccess("设置成功");
        this.getList();
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.containers {
  padding: 10px 20px;
}
/deep/.pagination-container {
  margin-top: 0 !important;
}
h4 {
  text-align: center;
}
.container {
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #eee;
  border-radius: 3px;
}
</style>