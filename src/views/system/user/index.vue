<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input v-model="deptName" placeholder="请输入部门名称" clearable size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode" ref="tree" default-expand-all @node-click="handleNodeClick" />
        </div>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="登录名称" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入登录名称" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable size="small" style="width: 240px">
              <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" :loading="loadingObj.searchLoading" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" :loading="loadingObj.resetLoading" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:user:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['system:user:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" icon="el-icon-upload2" size="mini" @click="handleImport" v-hasPermi="['system:user:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['system:user:export']">导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" border :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="用户编号" align="center" prop="userId" />
          <el-table-column label="登录名称" align="center" prop="userName" :show-overflow-tooltip="true" />
          <el-table-column label="用户昵称" align="center" prop="nickName" :show-overflow-tooltip="true" />
          <el-table-column label="部门" align="center" prop="dept.deptName" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" prop="phonenumber" width="120" />
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']">重置</el-button>
              <el-popover placement="left">
                <el-button style="margin-left:10px;" size="mini" type="text" icon="el-icon-arrow-right" slot="reference">更多</el-button>
                <div style="text-align: center">
                  <el-button v-if=" scope.row.userId !== 1 && (!isTenantUser || scope.row.tenantSuperUser !== true)" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']">删除</el-button>
                  <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEditBioDataDetail(scope.row)">生物信息</el-button>
                </div>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择归属部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="登录名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入登录名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="登录密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入登录密码" type="password" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择">
                <el-option v-for="dict in sexOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option v-for="item in postOptions" :key="item.postId" :label="item.postName" :value="item.postId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择">
                <el-option v-for="item in roleOptions" :key="item.roleId" :label="item.roleName" :value="item.roleId" :disabled="item.status == 1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="loadingObj.addLoading" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body :close-on-click-modal="false" @close="reset()">
      <upload-file ref="importUpload" :imgFile="false" v-model="upload.file" accept=".xlsx, .xls" :uploadPath="upload.url + '?updateSupport=' + upload.updateSupport" name="file" @success="handleFileSuccess" @fail="handleFileFail" drag />
      <div>
        <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据
        <el-link type="info" style="font-size: 12px" @click="importTemplate">下载模板</el-link>
      </div>
      <div class="tips">提示：用户编号必须是数字类型！</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="cancelFileForm">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户生物信息维护对话框 -->
    <el-dialog :title="title" :visible="bioOpen" width="900px" append-to-body :close-on-click-modal="false" @close="bioOpen = false" custom-class="ec-person-form-dialog">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-tabs ref="tabs" v-model="activeTabName" type="card" @tab-click="handleTabClick">
          <el-tab-pane label="人脸信息" name="face"></el-tab-pane>
          <el-tab-pane label="指纹信息" name="finger"></el-tab-pane>
          <el-tab-pane label="虹膜信息" name="iris"></el-tab-pane>
          <el-tab-pane label="多模态信息" name="irisface"></el-tab-pane>
        </el-tabs>
        <div v-if="activeTabName == 'face'" style="padding: 0 30px 0 0">
          <el-tabs v-model="faceCollectType" tab-position="left" @tab-click="handleCollectTypeTabClick">
            <el-tab-pane label="图像上传" name="faceLocal">
              <upload-file v-model="form.facePutInfo.imageBase64" accept=".jpg,.jpeg,.png" tip="只能上传jpg/png文件，且不超过5M" />
              <el-button @click="deleteFace(form.facePutInfo.id)" size="mini" type="danger" icon="el-icon-delete" v-if="form.facePutInfo.id">删除</el-button>
            </el-tab-pane>
            <el-tab-pane label="图像采集" name="faceCollect">
              <face-collect v-model="form.facePutInfo.imageBase64" v-if="faceCollectType == 'faceCollect'"></face-collect>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-if="activeTabName == 'finger'" style="padding: 0 30px 0 0">
          <el-tabs tab-position="left" @tab-click="handleCollectTypeTabClick" style="height: 300px" v-model="fingerCollectType">
            <el-tab-pane label="图像上传" name="fingerLocal">
              <el-form-item label="右手拇指" v-if="fingerCollectType == 'fingerLocal'">
                <upload-file v-model="fingerBioInfo.imageBase64" accept=".bmp" tip="只能上传bmp文件，且不超过1M" />
                <el-button @click="deleteFinger(fingerBioInfo.id)" size="mini" type="danger" icon="el-icon-delete" v-if="fingerBioInfo.id">删除</el-button>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="图像采集" name="fingerCollect">
              <el-form-item label="右手拇指" v-if="fingerCollectType == 'fingerCollect'">
                <finger-collect v-model="fingerBioInfo.imageBase64"></finger-collect>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-if="activeTabName == 'iris'" style="padding: 0 30px 0 0">
          <el-tabs tab-position="left" @tab-click="handleCollectTypeTabClick" v-model="irisCollectType">
            <el-tab-pane label="图像上传" name="irisLocal">
              <upload-file v-model="form.irisPutInfo.imageBase64" accept=".bmp" tip="只能上传bmp文件，且不超过1M" />
              <el-button @click="deleteIris(form.irisPutInfo.id)" size="mini" type="danger" icon="el-icon-delete" v-if="form.irisPutInfo.id">删除</el-button>
            </el-tab-pane>
            <el-tab-pane label="图像采集" name="irisCollect">
              <iris-collect v-model="form.irisPutInfo"></iris-collect>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-if="activeTabName == 'irisface'" style="padding: 0 30px 0 0">
          <el-tabs tab-position="left" @tab-click="handleCollectTypeTabClick" v-model="irisFaceCollectType">
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
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer" v-loading="bioLoading">
        <el-button type="primary" @click="submitBioDataForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  exportUser,
  resetUserPwd,
  changeUserStatus,
  importTemplate,
  submitUserBioData,
  delUserFace,
  delUserFinger,
  delUserIris,
  delUserIrisFace
} from "@/api/system/user";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import UploadFile from "@/components/UploadFile";
import FaceCollect from "@/components/BioCollect/face";
import FingerCollect from "@/components/BioCollect/finger";
import IrisCollect from "@/components/BioCollect/iris";
import FaceIrisCollect from "@/components/BioCollect/faceiris";

export default {
  name: "User",
  components: { Treeselect, UploadFile, FaceCollect, FingerCollect, IrisCollect, FaceIrisCollect },
  data() {
    return {
      // 防抖处理状态
      loadingObj:{
        searchLoading:false,
        resetLoading:false,
        addLoading:false
      },
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
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {
        facePutInfo: {
          imageBase64: null
        },
        fingerPutInfoList: [
          {
            fingerNo: '11',
            imageBase64: null
          }
        ],
        irisPutInfo: {
          imageBase64: null,
          feature: null,
        },
        irisFacePutInfo: {
          faceImgBase64: null,
          irisImgBase64: null,
          irisFeature: null
        },
      },
      fingerBioInfo: {
        fingerNo: '11',
        imageBase64: null,
      },
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 用户导入参数
      upload: {
        file: "",
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 上传的地址
        url: "/system/user/importData"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
        tenantId: undefined
      },
      // 表单校验
      rules: {
        userName: [
          { required: true, message: "登录名称不能为空", trigger: "blur" }
        ],
        nickName: [
          { required: true, message: "用户昵称不能为空", trigger: "blur" }
        ],
        deptId: [
          { required: true, message: "归属部门不能为空", trigger: "change" }
        ],
        password: [
          { required: true, message: "登录密码不能为空", trigger: "blur" }
        ],
        email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      },
      activeTabName: "face",
      fingerCodeOptions: [],
      faceCollectType: "faceLocal",
      fingerCollectType: "fingerLocal",
      irisCollectType: "irisLocal",
      irisFaceCollectType: "irisFaceLocal",
      bioLoading: false,
      bioOpen: false,
    };
  },
  computed: {
    ...mapGetters(["isTenantUser", "tenantEnabled"]),
    defaultImg() {
      return 'this.src="' + require("../../../assets/image/zpwcj.jpg") + '"';
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
    "queryParams.tenantId": {
      handler(newVal, oldVal) {
        this.queryParams.deptId = undefined;
        this.handleReloadDeptTree(newVal);
      }
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_user_sex").then(response => {
      this.sexOptions = response.data;
    });
    this.getConfigKey("sys.user.initPassword").then(response => {
      this.initPassword = response.msg;
    });
    this.getDicts("bio_finger_code").then(response => {
      this.fingerCodeOptions = response.data;
    });
  },
  methods: {
    /** 查询用户列表 */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
          this.loadingFalse();
        }
      );
    },
    /** 防抖清空 */
    loadingFalse() {
      this.loadingObj = {
        searchLoading:false,
        resetLoading:false,
        addLoading:false
      }
    },
    /** 查询部门下拉树结构 */
    getTreeselect(tenantId) {
      treeselect({ tenantId: tenantId }).then(response => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm(
        '确认要"' + text + '""' + row.userName + '"用户吗?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function () {
          return changeUserStatus(row.userId, row.status);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.bioOpen = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
        facePutInfo: {
          imageBase64: null
        },
        fingerPutInfoList: [
          {
            fingerNo: '11',
            imageBase64: null
          }
        ],
        irisPutInfo: {
          imageBase64: null,
          feature: null,
        },
        irisFacePutInfo: {
          faceImgBase64: null,
          irisImgBase64: null,
          irisFeature: null
        },
      };
      this.resetUserPutInfo();
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.loadingObj.searchLoading = true;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.loadingObj.resetLoading = true;
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.delName = selection.map(item => item.userName);
      this.ids = selection.map(item => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.queryParams.tenantId = undefined;
      getUser().then(response => {
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.open = true;
        this.title = "添加用户";
        this.form.password = this.initPassword;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.queryParams.tenantId = undefined;
      const userId = row.userId || this.ids;
      getUser(userId).then(response => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[a-zA-Z\d~\!@#\$%\^&\*\(\)_\-\+=\{\[\}\]\|\\:;\"\'\<,\>\.\?\/]+$/,
        inputErrorMessage: '密码格式不正确'
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then(response => {
            this.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => { });
    },
    /**Tab点击切换回调 */
    handleTabClick(tab, event) {
      this.activeTabName = tab.name;
    },
    handleCollectTypeTabClick(tab, event) {
    },
    /** 手指编号显示转换 */
    handleShowFingerCode(val) {
      return this.selectDictLabel(this.fingerCodeOptions, val);
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /**提交生物信息表单 */
    submitBioDataForm() {
      this.bioLoading = true
      if (!this.form.userId) {
        this.bioLoading = false
        return;
      }
      submitUserBioData({
        userId: this.form.userId,
        facePutInfo: this.form.facePutInfo,
        fingerPutInfoList: [this.fingerBioInfo],
        irisPutInfo: this.form.irisPutInfo,
        irisFacePutInfo: this.form.irisFacePutInfo
      }).then(response => {
        this.msgSuccess("修改成功");
        this.reset();
        this.bioLoading = false
        this.bioOpen = false
      }).catch((err) => {
        this.bioLoading = false
        console.log(err);
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$confirm(
        '是否确认删除用户名为"' + this.delName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有用户数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function () {
          return exportUser(queryParams);
        })
        .then(response => {
          this.download(response.msg);
        });
    },
    /**编辑生物信息 */
    handleEditBioDataDetail(row) {
      this.reset();
      const id = row.userId || this.userIds;
      this.fingerBioInfo = { fingerNo: '11', imageBase64: null }
      getUser(id).then(response => {
        // 后端虹膜是有特征则不再提取，防止前端直接上传的图片和特征不一致，先置空后端返回的特征
        response.data.irisFacePutInfo.irisFeature = null;
        response.data.irisPutInfo.feature = null;
        this.form = response.data
        if (response.data.fingerPutInfoList && response.data.fingerPutInfoList.length) {
          this.fingerBioInfo = response.data.fingerPutInfoList.filter(item => item.fingerNo == '11')[0];
        }
        this.title = "编辑人员生物信息";
        this.bioOpen = true;
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.download(response.msg);
      });
    },
    // 文件上传成功处理
    handleFileSuccess(response) {
      this.upload.open = false;
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 文件上传失败处理
    handleFileFail(response) {
      this.$alert(response.msg, "导入结果", { dangerouslyUseHTMLString: true });
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.importUpload.submit();
    },
    /**取消导入上传*/
    cancelFileForm() {
      this.$refs.importUpload.cancel();
      this.upload.open = false;
    },
    // 重新加载部门树
    handleReloadDeptTree() {
      this.getTreeselect(this.queryParams.tenantId);
    },
    resetUserPutInfo() {
      this.fingerBioInfo = { fingerNo: '11', imageBase64: null }
      this.faceCollectType = "faceLocal";
      this.fingerCollectType = "fingerLocal";
      this.irisCollectType = "irisLocal";
      this.irisFaceCollectType = "irisFaceLocal";
      this.activeTabName = "face";
      this.bioOpen = false;
    },
    deleteFinger(id) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delUserFinger(id).then(() => {
          this.fingerBioInfo = { fingerNo: '11', imageBase64: null }
          this.form.fingerPutInfoList = [this.fingerBioInfo]
        }).catch((err) => {
          console.log(err);
        });
      });
    },
    deleteFace(id) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delUserFace(id).then(() => {
          this.form.facePutInfo = {
            imageBase64: null
          };
        }).catch((err) => {
          console.log(err);
        });
      });
    },
    deleteIris(id) {
      this.$confirm('确定删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delUserIris(id).then(() => {
          this.form.irisPutInfo = {
            imageBase64: null,
            feature: null,
          };
        }).catch((err) => {
          console.log(err);
        });
      });
    },
    deleteIrisFace(id) {
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
  }
};
</script>
<style lang="scss">
.ec-person-form-dialog {
  .el-form {
    min-height: 400px;
  }
}
.tips {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}
</style>
