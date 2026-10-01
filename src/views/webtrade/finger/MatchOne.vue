<template>
  <div class="ec-finger-matchone">
    <el-form ref="form" :model="form" :rules="rules" class="ec-match-form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="场景编码" prop="channelCode">
            <el-input v-model="form.channelCode" placeholder="场景编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="唯一标识" prop="uniqueId">
            <el-input v-model="form.uniqueId" placeholder="唯一标识" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="比对阈值" prop="compareThreshold">
            <el-input v-model="form.compareThreshold" placeholder="比对阈值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="图像信息" prop="sceneImage">
        <el-tabs v-model="collectType" tab-position="top" type="card">
          <el-tab-pane label="图像上传" name="localfile">
          </el-tab-pane>
          <el-tab-pane label="图像采集" name="collect">
          </el-tab-pane>
        </el-tabs>
        <upload-file v-if="collectType == 'localfile'" v-model="form.sceneImage" accept="bmp" tip="只能上传bmp文件，且不超过1M" />
        <finger-collect v-if="collectType == 'collect'" :isTemplateImg="false" v-model="form.sceneImage"></finger-collect>
      </el-form-item>
      <div class="ec-form-btn" v-loading="loading">
        <el-button type="primary" @click="submitFileForm">提交比对</el-button>
        <el-button @click="resetFileForm">重置表单</el-button>
      </div>
    </el-form>

    <div class="ec-match-result">
      <el-table :data="resultList" border>
        <el-table-column label="比对结果" align="center" prop="result">
          <template slot-scope="scope">
            <span>{{scope.row.result == '0' ? '通过' : '未通过'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="比对得分" align="center" prop="sceneStockScore" />
        <el-table-column label="底库照" align="center" prop="fingerImg">
          <template slot-scope="scope">
            <img :src="'data:jpg;base64,' + scope.row.fingerImg" :width="120" :height="160" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { fingerMatchOne } from "@/api/webtrade/fingertrade";
import UploadFile from '@/components/UploadFile';
import FingerCollect from "@/components/BioCollect/finger";
export default {
  components: {
    UploadFile,
    FingerCollect,
  },
  data () {
    return {
      // 表单
      form: {
        channelCode: null,
        uniqueId: null,
        compareThreshold: null,
        sceneImage: null
      },
      // 校验规则
      rules: {
        channelCode: [{ required: true, message: '场景编码不能为空', trigger: 'blur' }],
        uniqueId: [{ required: true, message: '唯一标识不能为空', trigger: 'blur' }],
        sceneImage: [{ required: true, message: '现场照不能为空', trigger: 'change' }]
      },
      // 采集方式
      collectType: 'localfile',
      // loading提示
      loading: false,
      // 比对结果
      resultList: []
    }
  },
  created () {
  },
  methods: {
    // 提交表单
    submitFileForm () {
      this.loading = true
      this.resultList = []
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.loading = false;
          return;
        }
        // 比对接口调用
        fingerMatchOne(this.form).then(res => {
          this.loading = false;
          const result = Object.assign(res.data.verifyVO, { fingerImg: res.data.fingerImg })
          this.resultList = [result]
        }).catch(err => {
          this.loading = false;
        })
      });
    },
    // 重置表单
    resetFileForm () {
      this.form = {
        channelCode: null,
        uniqueId: null,
        compareThreshold: null,
        sceneImage: null
      }
      this.resultList = []
      this.collectType = 'localfile';
      this.resetForm("form");
    },
  }
}
</script>
<style lang="scss" scoped>
.ec-finger-matchone {
  margin: 20px 30px;
  .ec-match-form {
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #eee;
    .ec-form-btn {
      text-align: center;
    }
  }
}
</style>