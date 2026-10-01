<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机" clearable size="small" @keyup.enter.native="handleQuery" />
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
      <el-form-item label="卡号" prop="cardNo">
        <el-input v-model="queryParams.cardNo" placeholder="请输入卡号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['basedata:person:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" @click="handleUpdate" v-hasPermi="['basedata:person:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['basedata:person:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-edit" size="mini" :disabled="multiple" @click="handleStatusChange('0')">启用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleStatusChange('1')">停用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['basedata:person:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="default" icon="el-icon-upload" size="mini" @click="handleImport" v-hasPermi="['basedata:person:import']">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button title="同步所有数据到datamanager" type="info" icon="el-icon-refresh" size="mini" @click="handleSyncdata" v-hasPermi="['basedata:person:syncdata']">一键同步</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-search" size="mini" @click="openAsyncTask=true" v-hasPermi="['basedata:person:import','basedata:person:syncdata']">异步任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="personList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="uniqueId" />
      <el-table-column label="姓名" align="center" prop="name">
        <!-- <template slot-scope="scope">
          <el-button type="text" @click="handleShowDetail(scope.row)">{{scope.row.name}}</el-button>
        </template> -->
      </el-table-column>
      <el-table-column label="部门" align="center" prop="deptName" />
      <el-table-column label="性别" align="center" prop="sex">
        <template slot-scope="scope">
          <div>{{handleShowSex(scope.row.sex)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="手机" align="center" prop="phone" />
      <el-table-column label="生物信息" align="center">
        <template slot-scope="scope">
          <i :class="{'feature-icon iconfont icon-renlian1':true, 'feature-active':scope.row.hasFace}" title="人脸"></i>
          <i :class="{'feature-icon iconfont icon-hongmo1':true, 'feature-active':scope.row.hasIris}" title="虹膜"></i>
          <i :class="{'feature-icon iconfont icon-zhiwen1':true,'feature-active':scope.row.hasFinger}" title="指纹"></i>
          <i :class="{'feature-icon iconfont icon-zhijingmai1':true, 'feature-active':scope.row.hasFvein}" title="指静脉"></i>
          <i :class="{'feature-icon iconfont icon-duomotai1':true, 'feature-active':scope.row.hasFaceIris}" title="人脸虹膜多模态"></i>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" prop="datasource">
        <template slot-scope="scope">
          <div>{{handleShowDatasource(scope.row.datasource)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="通行开始时间" align="center" prop="effectiveBeginTime" />
      <el-table-column label="通行结束时间" align="center" prop="effectiveEndTime" />
      <el-table-column label="卡号" align="center" prop="cardNo" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <div>{{handleShowStatus(scope.row.status)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作日期" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          {{scope.row.updateTime?scope.row.updateTime:scope.row.createTime}}
        </template>
      </el-table-column>
      <!-- <el-table-column label="更新时间" align="center" prop="updateTime" width="180" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-info" @click="handleShowDetail(scope.row)" v-hasPermi="['basedata:person:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改人员基础信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body :close-on-click-modal="false" custom-class="ec-person-form-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" :disabled="isShowDetailDialog">
        <el-tabs ref="tabs" v-model="activeTabName" type="card" @tab-click="handleTabClick">
          <el-tab-pane label="基本信息" name="base"></el-tab-pane>
          <el-tab-pane label="人脸信息" name="face"></el-tab-pane>
          <el-tab-pane label="指纹信息" name="finger"></el-tab-pane>
          <el-tab-pane label="虹膜信息" name="iris"></el-tab-pane>
          <el-tab-pane label="多模态信息" name="faceIris"></el-tab-pane>
        </el-tabs>
        <div v-show="activeTabName=='base'">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="人员标识" prop="uniqueId">
                <el-input v-model="form.uniqueId" placeholder="请输入人员标识" :disabled="form.id != null" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="归属部门" prop="deptId">
                <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择归属部门" :disabled="isShowDetailDialog" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="人员标记" prop="flag">
                <el-select v-model="form.flag" placeholder="请选择" class="ec-form-select">
                  <el-option v-for="dict in personFlagOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="sex">
                <el-select v-model="form.sex" placeholder="请选择" class="ec-form-select">
                  <el-option v-for="dict in sexOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="卡号" prop="cardNo">
                <el-col :span="20">
                  <el-input v-model="form.cardNo" placeholder="请输入卡号" />
                </el-col>
                <el-col :span="4">
                  <el-button type="text" @click="readCard">读卡</el-button>
                </el-col>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="账号" prop="account">
                <el-input v-model="form.account" placeholder="请输入账号" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="isShowDetailDialog">
              <el-form-item label="数据来源" prop="datasource">
                <el-select v-model="form.datasource" placeholder="请选择" class="ec-form-select">
                  <el-option v-for="dict in datasourceOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="业务场景" prop="channels">
                <el-cascader v-model="form.channels" :options="channelOptions" :props="{ multiple: true, checkStrictly: true, emitPath: false }" clearable @change="handleChannelChange"></el-cascader>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="effectiveBeginTime">
                <el-date-picker clearable size="small" style="width: 100%" v-model="form.effectiveBeginTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="effectiveEndTime">
                <el-date-picker clearable size="small" style="width: 100%" v-model="form.effectiveEndTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss">
                </el-date-picker>
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
                <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="150" placeholder="请输入备注" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <!-- <template v-if="isShowDetailDialog || form.id==null"> -->
        <div v-show="activeTabName == 'face'" style="padding: 0 30px 0 0;">
          <el-form-item label="人脸图像" v-if="isShowDetailDialog && form.facePutInfo">
            <img :src="'data:image/jpeg;base64,' + form.facePutInfo.imageBase64" width="150" height="200" />
          </el-form-item>
          <el-form-item label="人脸图像" v-if="!isShowDetailDialog">
            <upload-file v-if="!isShowDetailDialog" v-model="form.facePutInfo.imageBase64" accept=".jpg,.jpeg,.png" tip="只能上传jpg/png文件，且不超过5M" />
          </el-form-item>
        </div>
        <div v-show="activeTabName=='finger'">
          <template v-for="(finger,index) in form.fingerPutInfoList">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="手指编号">
                  <el-select v-model="finger.fingerNo" class="ec-form-select">
                    <el-option v-for="dict in fingerCodeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="指纹图像">
                  <img :src="'data:image/jpeg;base64,' + finger.imageBase64" width="150" height="150" v-if="isShowDetailDialog" />
                  <upload-file v-if="!isShowDetailDialog" v-model="finger.imageBase64" accept=".bmp" tip="只能上传bmp文件，且不超过500k" />
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </div>
        <div v-show="activeTabName=='iris'" style="padding: 0 30px 0 0;">
          <el-form-item label="虹膜图像" v-if="isShowDetailDialog && form.irisPutInfo">
            <img :src="'data:image/jpeg;base64,' + form.irisPutInfo.imageBase64" width="200" height="150" />
          </el-form-item>
          <el-form-item label="虹膜图像" v-if="!isShowDetailDialog">
            <upload-file v-if="!isShowDetailDialog" v-model="form.irisPutInfo.imageBase64" accept=".bmp" tip="只能上传bmp文件，且不超过1M" />
          </el-form-item>
        </div>
        <div v-show="activeTabName=='faceIris'" style="padding: 0 30px 0 0;">
          <el-tabs tab-position="left" v-if="!isShowDetailDialog" @tab-click="handleCollectTypeTabClick" v-model="irisFaceCollectType">
            <el-tab-pane label="图像上传" name="irisFaceLocal">
              <el-col :span="12">
                <upload-file v-model="form.irisFacePutInfo.faceImgBase64" accept=".jpg,.jpeg,.png" tip="人脸图像" />
              </el-col>
              <el-col :span="12">
                <upload-file v-model="form.irisFacePutInfo.irisImgBase64" accept=".bmp" tip="虹膜图像" />
              </el-col>
              <el-button @click="deleteIrisFace(form.irisFacePutInfo.id)" size="mini" type="danger" icon="el-icon-delete" v-if="form.irisFacePutInfo.id">删除</el-button>
            </el-tab-pane>
            <el-tab-pane label="图像采集" name="irisFaceCollect">
              <face-iris-collect v-model="form.irisFacePutInfo"></face-iris-collect>
            </el-tab-pane>
          </el-tabs>
          <el-form-item label="多模态图像" v-if="isShowDetailDialog && form.irisFacePutInfo">
            <img :src="'data:image/jpeg;base64,' + form.irisFacePutInfo.faceImgBase64" width="120" height="160" />
            <img :src="'data:image/jpeg;base64,' + form.irisFacePutInfo.irisImgBase64" width="200" height="160" style="margin-left:20px" />
          </el-form-item>
        </div>
        <!-- </template> -->
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="!isShowDetailDialog" v-loading="formLoading">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 人员基础信息导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="uploadForm" :model="upload" :rules="uploadFormRules" label-width="80px">
        <el-form-item label="上传文件" prop="file">
          <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" accept=".xlsx, .xls" :uploadPath="upload.url + '?updateSupport=' + upload.updateSupport" name="excelFile" @success="handleImportFileSuccess" drag />
          <div>
            <el-checkbox v-model="upload.updateSupport" />更新已经存在的人员数据
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
          </div>
        </el-form-item>
        <div style="color:red; line-height: 18px; font-size: 12px;padding-left: 35px;">提示：1、仅允许导入“xls”或“xlsx”格式文件！
          <span style="padding-left: 36px; display: block;">
            2、“唯一标识”和“姓名”必填<br />
            3、“人员标记”、"性别"导入需要使用“字典标签”
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
import { mapGetters, mapMutations } from 'vuex'
import { asynctaskResult } from "@/api/common/asynctask";
import { listPerson, getPerson, delPerson, addPerson, updatePerson, exportPerson, importTemplate, syncdata, listChannel,changeStatus } from "@/api/basedata/person";
import UploadFile from '@/components/UploadFile';
import Treeselect from "@riophae/vue-treeselect";
import AsyncTask from "@/views/components/common/async-task";
import { treeselect } from "@/api/system/dept";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import FaceIrisCollect from "@/components/BioCollect/faceiris";
import hasLoading from '@/utils/loading.js'
export default {
  name: "Personinfo",
  components: { Treeselect, UploadFile, AsyncTask, FaceIrisCollect },

  data () {
    const cartValidator = (rule, value, callback) => {
      if (value) {
        if (value.length > 40) {
          callback(new Error("卡号名称长度不能超过40个字符"))
        } else {
          callback();
        }
      } else {
        callback();
      }

    };
    const codeValidator = (rule, value, callback) => {
      if (value) {
        if (value.length > 40) {
          callback(new Error("账号长度不能超过40个字符"))
        } else {
          callback();
        }
      } else {
        callback();
      }

    }
    return {
      // 加载框
      loadingInstance: false,
      // 导入加载
      exportLoading: false,
      // 新增修改人员加载
      submitLoading: false,
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
      // 人员基础信息表格数据
      personList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uniqueId: null,
        name: null,
        cardNo:null,
        phone: null,
        datasource: null,
        status: '0',
        tenantId: null
      },
      // 数据来源数据字典
      datasourceOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 人员标记状态字典
      personFlagOptions: [],
      // 部门树选项
      deptOptions: undefined,
      // 场景选项
      channelOptions: [],
      // 表单参数
      form: {
        id: null,
        uniqueId: null,
        name: null,
        sex: null,
        phone: null,
        cardNo: null,
        account: null,
        email: null,
        deptId: null,
        datasource: null,
        flag: null,
        status: "0",
        remark: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        channels: [],
        facePutInfo: {
          imageBase64: null
        },
        fingerPutInfoList: [
          {
            fingerNo: null,
            imageBase64: null
          }
        ],
        irisPutInfo: {
          imageBase64: null
        },
        irisFacePutInfo: {
          faceImgBase64: null,
          irisImgBase64: null,
          irisFeature: null
        },
      },
      // 保存表单遮罩
      formLoading: false,
      // 表单校验
      rules: {
        uniqueId: [
          { required: true, message: "人员标识不能为空", trigger: "blur" },
          { max: 48, message: "人员标识不能超过48位", trigger: "blur" },
        ],
        name: [
          { required: true, message: "人员姓名不能为空", trigger: "blur" },
          { pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+$/, message: "姓名格式不能包含特殊字符", trigger: "blur" }
        ],
        deptId: [
          { required: true, message: "所属部门不能为空", trigger: "change" }
        ],
        effectiveBeginTime:[
        { required: true, message: "开始时间不能为空", trigger: "blur" }
        ],
        effectiveEndTime:[
        { required: true, message: "结束时间不能为空", trigger: "blur" }
        ],
        // phone: [
        //    { required: true, message: "手机号不能为空", trigger: "change" },
        //   {
        //     pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        //     message: "请输入正确的手机号码",
        //     trigger: "blur"
        //   }
        // ],
        cardNo: [
          { pattern: /^([A-Z]|[a-z]|[\d])*$/, message: "卡号只能是数字和英文字母", trigger: "blur" },
          { validator: cartValidator, trigger: "blur" }
        ],
        account: [
          { validator: codeValidator, trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
      },
      // 激活Tab页
      activeTabName: 'base',
      // 手指编号数据字典
      fingerCodeOptions: [],
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
        url: "/basedata/person/import"
      },
      uploadFormRules: {
        file: [
          { required: true, message: "文件不能为空", trigger: ["change", "blur"] }
        ]
      },
      // 弹窗是否是详情展示
      isShowDetailDialog: false,
      // 是否打开异步任务查询弹窗
      openAsyncTask: false,
      irisFaceCollectType: "irisFaceLocal",
      // 读卡器Websocket连接地址
      wsUrl: 'ws://127.0.0.1:8089',
    };
  },
  computed: {
    ...mapGetters([
      'isTenantUser', 'tenantEnabled'
    ])
  },
  watch: {
    '$route': {
      // val是改变之后的路由，oldVal是改变之前的val
      handler: function (val, oldVal) {
        console.log(val);
        if (val.name !== 'Personinfo') {
          return;
        }
        if (val.params.uniqueId) {
          this.queryParams.uniqueId = val.params.uniqueId;
        }
        this.getList();
      },
      // 深度观察监听
      deep: true,
      immediate: true
    }
  },
  created () {
    this.getDicts("apply_data_source").then(response => {
      this.datasourceOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_user_sex").then(response => {
      this.sexOptions = response.data;
    });
    this.getDicts("apply_person_flag").then(response => {
      this.personFlagOptions = response.data;
    });
    this.getDicts("bio_finger_code").then(response => {
      this.fingerCodeOptions = response.data;
    });
    this.getTreeselect();
    this.getList();
    this.listChannelInfo();
    this.webSocketLink();
  },
  methods: {
    ...mapMutations({
      'OPEN_PROGRESS': 'app/OPEN_PROGRESS',
      'CHANGE_PERCENTAGE': 'app/CHANGE_PERCENTAGE'
    }),
    handleCollectTypeTabClick (tab, event) {
    },
    deleteIrisFace (id) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delUserIrisFace(id).then(() => {
          this.form.irisFacePutInfo = {
            faceImgBase64: null,
            irisImgBase64: null,
            irisFeature: null
          };
        }).catch((err) => {
          console.log(err);
        });
      });
    },
    /** 查询人员基础信息列表 */
    getList () {
      this.loading = true;
      listPerson(this.queryParams).then(response => {
        this.personList = response.rows;
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
    /** 查询场景列表 */
    listChannelInfo () {
      listChannel({ cascade: true }).then(response => {
        let transStr = JSON.stringify(response.data).replace(/channelCode/g, "value").replace(/channelName/g, "label").replace(/subList/g, "children").replace(/subTreasuryCode/g, "value").replace(/subTreasuryName/g, "label");
        this.channelOptions = JSON.parse(transStr)
      })
    },
    // 场景选择改变
    handleChannelChange (channels) {
      let subChannels = channels.filter(item => item.indexOf('ZCJ') != -1)
      if (subChannels && subChannels.length) {
        let parentChannels = subChannels.map(item => item.split("_")[0])
        let resultChannels = [...channels, ...parentChannels];  //合并数组
        let arrNew = new Set(resultChannels); //通过set集合去重
        this.form.channels = Array.from(arrNew)
      }
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
        uniqueId: null,
        name: null,
        sex: null,
        phone: null,
        cardNo: null,
        account: null,
        email: null,
        deptId: null,
        datasource: null,
        flag: null,
        status: "0",
        remark: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        channels: [],
        facePutInfo: {
          imageBase64: null
        },
        fingerPutInfoList: [
          {
            fingerNo: null,
            imageBase64: null
          }
        ],
        irisPutInfo: {
          imageBase64: null
        },
        irisFacePutInfo: {
          faceImgBase64: null,
          irisImgBase64: null,
          irisFeature: null
        },
      };
      this.activeTabName = 'base';
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        uniqueId: null,
        name: null,
        phone: null,
        datasource: null,
        status: '0',
        tenantId: null
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleStatusChange(type) {
      const ids = this.ids.join(',');
      changeStatus(ids,{type}).then(res=> {
        this.msgSuccess("修改状态成功")
      })
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.personName = selection.map(item => item.name)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.isShowDetailDialog = false;
      this.open = true;
      this.title = "添加人员基础信息";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      if (this.ids.length > 1) {
        this.msgError("只能选择一条记录进行数据修改!")
        return
      }
      if (this.ids.length == 0) {
        this.msgError("请选择一条记录进行数据修改!")
        return
      }
      this.reset();
      this.isShowDetailDialog = false;
      const id = row.id || this.ids
      getPerson(id).then(response => {
        this.form = response.data;
        if (response.data.channels && response.data.channels.length) {
          this.form.channels = response.data.channels.split(',')
        }
        if (!this.form.facePutInfo) {
          this.form.facePutInfo = {
            imageBase64: null
          }
        }
        if (!this.form.fingerPutInfoList || !this.form.fingerPutInfoList.length) {
          this.form.fingerPutInfoList = [
            {
              fingerNo: null,
              imageBase64: null
            }
          ]
        }
        if (!this.form.irisPutInfo) {
          this.form.irisPutInfo = {
            imageBase64: null
          }
        }
        if (!this.form.irisFacePutInfo) {
          this.form.irisFacePutInfo = {
            faceImgBase64: null,
            irisImgBase64: null,
            irisFeature: null
          }
        }
        this.open = true;
        this.title = "修改人员基础信息";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false
          this.submitLoading = false
          this.activeTabName = 'base'
          return
        } else {
          this.formLoading = true
          this.submitLoading = true
          if (this.form.fingerPutInfoList && this.form.fingerPutInfoList.length) {
            if (this.form.fingerPutInfoList[0].imageBase64 && !this.form.fingerPutInfoList[0].fingerNo) {
              this.activeTabName = 'finger'
              this.msgError("请选择手指号")
              this.formLoading = false
              this.submitLoading = false
              return
            }
          }
          let requestData = JSON.parse(JSON.stringify(this.form))
          console.error(requestData)
          if (this.form.channels && this.form.channels.length) {
            requestData.channels = requestData.channels.join()
          }
          if (this.form.id != null) {
            updatePerson(requestData).then(response => {
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
            addPerson(requestData).then(response => {
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
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除人员姓名为"' + this.personName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delPerson(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport () {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有人员基础信息数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportPerson(queryParams);
      }).then(response => {
        hasLoading.start();
        // this.OPEN_PROGRESS();
        let taskId = response.msg;
        this.checkExportTask(taskId, (filename) => {
          this.download(filename);
        });
      })
    },
    /**检测导出任务执行结果 */
    checkExportTask (taskId, callback) {
      this.getExportTaskResult(taskId).then(res => {
        let filename = res.msg;
        if (filename && filename.length) {
          // this.CHANGE_PERCENTAGE();
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
    /**显示详情信息 */
    handleShowDetail (row) {
      this.reset();
      const id = row.id || this.ids
      getPerson(id).then(response => {
        this.form = response.data;
        if (response.data.channels && response.data.channels.length) {
          this.form.channels = response.data.channels.split(',')
        }
        this.title = "人员详细信息";
        this.isShowDetailDialog = true;
        this.open = true;
      });
    },
    /** 性别显示转换 */
    handleShowSex (val) {
      return this.selectDictLabel(this.sexOptions, val);
    },
    /** 数据来源显示转换 */
    handleShowDatasource (val) {
      return this.selectDictLabel(this.datasourceOptions, val);
    },
    /** 人员标记显示转换 */
    handleShowFlag (val) {
      return this.selectDictLabel(this.personFlagOptions, val);
    },
    /** 状态显示转换 */
    handleShowStatus (val) {
      return this.selectDictLabel(this.statusOptions, val);
    },
    /** 手指编号显示转换 */
    handleShowFingerCode (val) {
      return this.selectDictLabel(this.fingerCodeOptions, val);
    },
    /**Tab点击切换回调 */
    handleTabClick (tab, event) {
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
      this.exportLoading = false;
      this.$notify({
        title: '成功',
        dangerouslyUseHTMLString: true,
        message: '任务ID为：<br/><strong>' + res.msg + '</strong><br/>请复制任务ID点击[<strong>异步任务</strong>]查询结果',
        type: 'success',
        duration: 0
      });
    },
    /**提交上传导入文件 */
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
    /**取消导入上传*/
    cancelFileForm () {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
    },
    /**同步数据到datamanager */
    handleSyncdata () {
      this.$confirm('是否确认同步所有人员信息到datamanager服务?', "警告", {
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
    // 建立和读卡器SDK的websocket链接
    webSocketLink () {
      let _this = this;
      let heartCheck = {
        timeout: 5000,
        timeoutObj: null,
        reset: function () {
          clearInterval(this.timeoutObj);
          return this;
        },
        start: function () {
          this.timeoutObj = setInterval(
            function () {
              _this.websocket.send("HeartBeat");
              console.log("HeartBeat");
            }, this.timeout)
        }
      };
      if ('WebSocket' in window) {
        this.websocket = new WebSocket(this.wsUrl);
      } else if ('MozWebSocket' in window) {
        this.websocket = new MozWebSocket(this.wsUrl);
      } else {
        this.websocket = new SockJs(this.wsUrl);
      }
      this.websocket.onopen = function () {
        heartCheck.reset().start();
      };
      this.websocket.onmessage = function (event) {
        console.log(event.data);
        let tmp = event.data;
        tmp = tmp.replace("ca:", "");
        if (tmp != '-28' && tmp != "command is not supoort") {
          var newDate = _this.endianConv(tmp);
          var cardnum = parseInt(newDate, 16);
          _this.form.cardNo = cardnum;
        }
      };
    },
    //大小端转换
    endianConv (num) {
      return num.toString('hex').match(/.{2}/g).reverse().join("")
    },
    //读卡
    readCard () {
      this.websocket.send("82");
    }
  }
};
</script>
<style lang="scss">
.ec-person-form-dialog {
  .el-form {
    min-height: 400px;
  }
  .el-cascader--medium {
    width: 100%;
  }
}
.feature-icon {
  margin-right: 5px;
  &.feature-active {
    color: #46a6ff;
  }
}
</style>