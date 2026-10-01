<template>
  <div>
    <el-dialog :close-on-click-modal="false" :title="title" width="1000px" :before-close="cancel" :visible.sync="open">
      <el-form :model="forms" label-position="right" :disabled="title == '修改' || !isShowDetailDialog" :rules="topRules">
        <el-form-item prop="type" label="业务类型:">
          <el-select v-model="forms.type" @change="change" placeholder="请选择业务类型">
            <el-option label="场景" value="1"></el-option>
            <el-option label="子场景" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="top">{{sceneName}}</div>
      <el-form v-loading="loading" :disabled="!isShowDetailDialog" :model="form" ref="form" label-position="right" :rules="rules">
        <!-- 场景 -->
        <div v-if="forms.type == '1'" class="center">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="场景编码:" label-width="100px" prop="channelCode">
                <el-input v-model="form.channelCode" disabled style="width:300px"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="searchN" label-width="100px" label="识别方式:">
                <el-select v-model="form.searchN" style="width:300px" placeholder="请选择识别方式">
                  <el-option v-for="dict in searchNTypeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="场景名称:" label-width="100px" prop="channelName">
                <el-input v-model="form.channelName" style="width:300px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="24">
              <p>开通生物识别:</p>
            </el-col>
          </el-row>
          <el-row style="margin-left:50px" :gutter="20">
            <el-col :span="5">
              <el-form-item label="人脸" prop="faceMode">
                <el-switch v-model="form.faceMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="指纹" prop="fingerMode">
                <el-switch v-model="form.fingerMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0"></el-switch>
              </el-form-item>
            </el-col>

            <el-col :span="5">
              <el-form-item label="虹膜" prop="irisMode">
                <el-switch v-model="form.irisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="指静脉" prop="fveinMode">
                <el-switch v-model="form.fveinMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0"></el-switch>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="多模态" prop="faceIrisMode">
                <el-switch v-model="form.faceIrisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0"></el-switch>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row style="padding-left:30px" :gutter="20" v-if="!isShowDetailDialog">
            <el-col :span="12">
              <el-form-item label="创建人" prop="createBy">
                <el-input v-model="form.createBy" style="width:300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间" prop="createTime">
                <el-input v-model="form.createTime" style="width:300px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row style="padding-left:30px" :gutter="20" v-if="!isShowDetailDialog">
            <el-col :span="12">
              <el-form-item label="修改人" prop="updateBy">
                <el-input v-model="form.updateBy" style="width:300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="修改时间" prop="updateTime">
                <el-input v-model="form.updateTime" style="width:300px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注:" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
          </el-form-item>
        </div>
        <!-- 子场景 -->
        <div v-else class="center">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item prop="channelId" label-width="100px" label="所属场景:">
                <el-select v-model="form.channelId" :disabled="title == '修改'" @change="channelChange" style="width:300px" placeholder="请选择业务场景">
                  <el-option v-for="item in channelSelectOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="子场景编码:" label-width="100px" prop="subTreasuryCode">
                <el-input v-model="form.subTreasuryCode" disabled style="width:300px"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="子场景名称:" label-width="100px" prop="subTreasuryName">
                <el-input v-model="form.subTreasuryName" style="width:300px"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row style="padding-left:40px" :gutter="20" v-if="!isShowDetailDialog">
            <el-col :span="12">
              <el-form-item label="创建人:" prop="createBy">
                <el-input v-model="form.createBy" style="width:300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间:" prop="createTime">
                <el-input v-model="form.createTime" style="width:300px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row style="padding-left:40px" :gutter="20" v-if="!isShowDetailDialog">
            <el-col :span="12">
              <el-form-item label="修改人:" prop="updateBy">
                <el-input v-model="form.updateBy" style="width:300px" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="修改时间:" prop="updateTime">
                <el-input v-model="form.updateTime" style="width:300px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注:" prop="remark">
            <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="请输入备注" />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" v-if="isShowDetailDialog" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getSubsceneCode, addSubtreasury, getSubtreasury, getChannel, updateChannel, updateSubtreasury, listAllChannel, addChannel, getSceneCode } from '@/api/scene/addscene.js';
export default {
  props: {
    title: {
      require: true,
      type: String
    },
    type: {
      require: true,
      type: String
    }
  },
  watch: {
    'forms.type': {
      handler (val) {
        switch (val) {
          case '1':
            this.sceneName = "场景信息";
            this.form = this.sceneForm;
            this.rules = this.sceneRules;
            this.$refs.form.resetFields();
            break;
          case '2':
            this.sceneName = "子场景信息";
            this.form = this.subForm;
            this.rules = this.subSceneRules;
            this.$refs.form.resetFields();
            break;
          default:
            break;
        }
      },
      deep: true
    },
    type: {
      handler (val) {
        this.forms.type = val;
      },
      immediate: true
    }
  },
  data () {
    return {
      // 弹出层控制
      open: false,
      // 加载
      loading: false,
      // 场景初始化数据
      sceneForm: {
        id: null,
        channelCode: "",
        channelName: "",
        searchN: "",
        faceMode: "",
        faceIrisMode: "",
        irisMode: "",
        fveinMode: "",
        fingerMode: "",
        remark: ""
      },
      // 子场景初始化数据
      subForm: {
        id: null,
        subTreasuryCode: "",
        subTreasuryName: "",
        channelId: "",
        remark: ""
      },
      // 表单数据
      form: {},
      // 顶部选择下拉表单
      forms: { type: '1' },
      // 顶部选择下拉表单验证规则
      topRules: {
        type: [
          { required: true, message: "业务场景不能为空", trigger: "blur" },
        ]
      },
      // 场景表单验证
      sceneRules: {
        searchN: [
          { required: true, message: "识别方式不能为空", trigger: "change" },
        ],
        channelCode: [
          { required: true, message: "场景编码不能为空", trigger: "blur" },
        ],
        channelName: [
          { required: true, message: "场景名称不能为空", trigger: "blur" },
          { required: true, max: 48, message: "场景名称不能超过48个字符", trigger: "blur" },
        ],
        remark: [
          { max: 150, message: "备注内容不能超过150个字符", trigger: "blur" }
        ]
      },
      // 子场景表单验证
      subSceneRules: {
        channelId: [
          { required: true, message: "所属场景不能为空", trigger: "change" },
        ],
        subTreasuryName: [
          { required: true, message: "子场景名称不能为空", trigger: "blur" },
          { required: true, max: 48, message: "子场景名称不能超过48个字符", trigger: "blur" },
        ],
        subTreasuryCode: [
          { required: true, message: "子场景编码不能为空", trigger: "blur" },
        ],
        remark: [
          { max: 150, message: "备注内容不能超过150个字符", trigger: "blur" },
        ]
      },
      // 表单验证规则
      rules: {},
      sceneName: "场景信息",
      //1vN识别方式数据字典
      searchNTypeOptions: [],
      // 表单加载状态
      formLoading: false,
      // 所有场景列表
      channelSelectOptions: [],
      // 详情的打开状态
      isShowDetailDialog: true
    }
  },
  mounted () {
    this.sceneName = "场景信息";
    this.form = this.sceneForm;
    this.rules = this.sceneRules;
    this.getDicts("search_n_type").then(response => {
      this.searchNTypeOptions = response.data;
    });
    // 获取所有场景列表
    // this.listAllChannel();
  },
  methods: {
    /** 打开场景 */
    openModel () {
      this.getCode();
      this.listAllChannel();
      this.open = true;
    },
    /** 打开编辑场景 */
    openEditModel () {
      this.open = true;
    },
    /** 打开详情 */
    openDetailModel () {
      this.isShowDetailDialog = false;
      this.open = true;
    },
    /** 下拉改变 */
    change (val) {
      if (val == '1') {
        this.getCode();
      }
    },
    /** 获取场景编码 */
    async getCode () {
      this.loading = true;
      const { data } = await getSceneCode();
      this.form.channelCode = data.sceneCode;
      this.loading = false;
    },
    /** 表单取消 */
    cancel () {
      this.$refs.form.resetFields();
      this.open = false;
      this.forms.type = '1';
      this.form.id = null;
      this.isShowDetailDialog = true;
    },
    /** 查询所有场景列表 */
    listAllChannel () {
      this.channelSelectOptions = []
      listAllChannel().then(response => {
        if (response.data && response.data.length) {
          this.channelSelectOptions = response.data.map(item => {
            return { value: `${item.id}`, label: `${item.channelName}`, channelCode: `${item.channelCode}` };
          });
        }
      });
    },
    /** 场景选择change */
    async channelChange (id) {
      let ids = this.channelSelectOptions.filter(item => item.value == id)[0].channelCode;
      const { data } = await getSubsceneCode(ids);
      this.form.subTreasuryCode = data.subSceneCode;
    },
    /** 场景详情 */
    async handleUpdateDetail (row) {
      this.openDetailModel();
      const id = row.id;
      this.loading = true;
      const { data } = await getChannel(id);
      Object.assign(this.form, data);
      console.log(this.form);
      this.loading = false;
    },
    /** 场景修改操作 */
    async handleUpdate (row) {
      this.openEditModel();
      const id = row.id;
      this.loading = true;
      const { data } = await getChannel(id);
      Object.assign(this.form, data);
      console.log(this.form);
      this.loading = false;
    },
    /** 子场景详情 */
    async modifyFormDetail (row) {
      this.openDetailModel();
      const id = row.id;
      this.loading = true;
      const { data } = await getSubtreasury(id);
      Object.assign(this.form, data);
      this.loading = false;
    },
    /** 子场景修改 */
    async modifyForm (row) {
      this.openEditModel();
      const id = row.id;
      this.loading = true;
      const { data } = await getSubtreasury(id);
      Object.assign(this.form, data);
      this.loading = false;
    },
    /** 提交表单 */
    submitForm () {
      this.formLoading = true;
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.formLoading = false
          return
        }
        if (this.forms.type == '1') {
          this.sceneSubmit();
        } else {
          this.subSceneSubmit();
        }

      });
    },
    /** 场景表单提交 */
    sceneSubmit () {
      if (this.form.id != null) {
        updateChannel(this.form).then(response => {
          this.msgSuccess("修改成功");
          this.formLoading = false;
          this.cancel();
          this.$emit('reflash');
          this.form.id = null;
        }).catch(err => {
          this.cancel();
          this.form.id = null;
          this.formLoading = false;
        });
      } else {
        addChannel(this.form).then(response => {
          this.msgSuccess("新增成功");
          this.formLoading = false;
          this.cancel();
          this.$emit('reflash');
        }).catch(err => {
          this.cancel();
          this.formLoading = false;
        });
      }
    },
    /** 子场景表单提交 */
    subSceneSubmit () {
      if (this.form.id != null) {
        updateSubtreasury(this.form).then(response => {
          this.msgSuccess("修改成功");
          this.formLoading = false;
          this.cancel();
          this.$emit('reflash');
          this.form.id = null;
        }).catch(err => {
          this.cancel();
          this.form.id = null;
          this.formLoading = false;
        });
      } else {
        addSubtreasury(this.form).then(response => {
          this.msgSuccess("新增成功");
          this.formLoading = false;
          this.cancel();
          this.$emit('reflash');
        }).catch(err => {
          this.cancel();
          this.formLoading = false;
        });
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.top {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
}
.center {
  width: 100%;
  margin-top: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 20px;
  box-sizing: border-box;
}
p {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
p::before {
  content: '*';
  color: #ff4949;
  margin-right: 4px;
}
</style>